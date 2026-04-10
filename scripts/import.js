// One-shot import: backup/*.json + old/web/videos/* → data/mtv.sqlite + data/videos/
//
// Idempotent-ish: drops and recreates tables every run. Never touches old/.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { generateList } from "./legacy-filters.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const backupDir = path.join(repoRoot, "backup")
const legacyMediaDir = path.join(repoRoot, "old", "web", "videos")
const dataDir = path.join(repoRoot, "data")
const mediaDir = path.join(dataDir, "videos")
const dbPath = path.join(dataDir, "mtv.sqlite")
const remapPath = path.join(repoRoot, "config", "handle-remap.json")

const dryRun = process.argv.includes("--dry-run")

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"))

const log = (...args) => console.log(...args)
const warn = (...args) => console.warn("⚠ ", ...args)

// --- Load everything up front ------------------------------------------------

log(`reading backup from ${backupDir}`)
const playlist = readJson(path.join(backupDir, "playlist.json")) // video library
const opinions = readJson(path.join(backupDir, "opinions.json"))
const userplaylists = readJson(path.join(backupDir, "userplaylists.json"))
const nicknames = readJson(path.join(backupDir, "nicknames.json"))
const companies = readJson(path.join(backupDir, "companies.json"))
const remap = readJson(remapPath)

const dropOrphanRefs = new Set(remap.dropOrphanMediaRefs || [])

// --- User reconciliation -----------------------------------------------------

// Collect every legacy tag that appears anywhere in the backup.
const seenTags = new Set()
for (const v of Object.values(playlist)) if (v.user) seenTags.add(v.user)
for (const votes of Object.values(opinions)) for (const t of Object.keys(votes)) seenTags.add(t)
for (const t of Object.keys(userplaylists)) seenTags.add(t)
for (const t of Object.keys(nicknames)) seenTags.add(t)
for (const t of Object.keys(companies)) seenTags.add(t)

const canonicalTagFor = (tag) => {
    let current = tag
    const visited = new Set()
    while (remap.merges?.[current] && !visited.has(current)) {
        visited.add(current)
        current = remap.merges[current]
    }
    return current
}

const stripDiscriminator = (tag) => tag.replace(/#\d+$/, "").replace(/#0$/, "")

// For each canonical tag, build the user row.
const canonicalTags = new Set()
for (const tag of seenTags) canonicalTags.add(canonicalTagFor(tag))

const usedDisplayNames = new Set()
const uniqueDisplayName = (proposed) => {
    let name = proposed || "user"
    if (!usedDisplayNames.has(name)) {
        usedDisplayNames.add(name)
        return name
    }
    let i = 2
    while (usedDisplayNames.has(`${name}${i}`)) i++
    const out = `${name}${i}`
    usedDisplayNames.add(out)
    return out
}

const userRows = [] // { canonical_tag, discord_handle, display_name, label, is_contributor }
const userByCanonicalTag = new Map()

for (const canonical of canonicalTags) {
    const override = remap.users?.[canonical]
    const baseHandle = override?.discord_handle ?? stripDiscriminator(canonical)
    const baseDisplay = override?.display_name ?? nicknames[canonical] ?? baseHandle
    const baseLabel = override?.label ?? companies[canonical] ?? null
    const row = {
        canonical_tag: canonical,
        discord_handle: baseHandle,
        display_name: uniqueDisplayName(baseDisplay),
        label: baseLabel,
        is_contributor: 0 // filled in below once we know who added videos
    }
    userRows.push(row)
    userByCanonicalTag.set(canonical, row)
}

const userIdForTag = (tag) => {
    const canonical = canonicalTagFor(tag)
    return userByCanonicalTag.get(canonical)
}

// Contributor seed: anyone who has added at least one video.
for (const v of Object.values(playlist)) {
    if (!v.user) continue
    const u = userIdForTag(v.user)
    if (u) u.is_contributor = 1
}

// --- Video reconciliation ----------------------------------------------------

const parseLegacyVideoId = (legacyId) => {
    const m = /^(youtube|mtv)_(.+)$/.exec(legacyId)
    if (!m) return null
    return { source: m[1] === "mtv" ? "self" : "youtube", ref: m[2] }
}

const videoRows = [] // { legacy_id, source, source_ref, title, artist, duration_s, start_s, end_s, thumb, added_by_tag, added_at, tags:[] }
const videosByLegacyId = new Map()

for (const [legacyId, v] of Object.entries(playlist)) {
    const parsed = parseLegacyVideoId(legacyId)
    if (!parsed) {
        warn(`unparseable video id: ${legacyId}`)
        continue
    }
    if (parsed.source === "self" && dropOrphanRefs.has(parsed.ref)) continue

    const row = {
        legacy_id: legacyId,
        source: parsed.source,
        source_ref: parsed.ref,
        title: (v.title ?? "").trim(),
        artist: (v.artist ?? "").trim(),
        duration_s: v.duration ?? null,
        start_s: v.start ?? -1,
        end_s: v.end ?? -1,
        thumb: v.thumb ?? null,
        added_by_tag: v.user ?? null,
        added_at: v.added ?? null,
        tags: Object.keys(v.tags || {}).filter((k) => v.tags[k] === true)
    }
    videoRows.push(row)
    videosByLegacyId.set(legacyId, row)
}

// --- Opinions reconciliation -------------------------------------------------

const opinionRows = [] // { legacy_id, canonical_tag, value }
for (const [legacyId, votes] of Object.entries(opinions)) {
    if (!videosByLegacyId.has(legacyId)) continue
    for (const [tag, value] of Object.entries(votes)) {
        if (!["love", "like", "meh", "bleh", "hate"].includes(value)) continue
        const canonical = canonicalTagFor(tag)
        if (!userByCanonicalTag.has(canonical)) continue
        opinionRows.push({ legacy_id: legacyId, canonical_tag: canonical, value })
    }
}

// --- Playlist flattening via the legacy filter engine -----------------------

// Build the video map the way the old engine expects (with `id`, `nickname`, etc.).
const legacyVideoMap = {}
for (const [legacyId, v] of Object.entries(playlist)) {
    const parsed = parseLegacyVideoId(legacyId)
    if (!parsed) continue
    if (parsed.source === "self" && dropOrphanRefs.has(parsed.ref)) continue
    legacyVideoMap[legacyId] = {
        id: legacyId,
        title: v.title ?? "",
        artist: v.artist ?? "",
        nickname: v.nickname ?? "",
        tags: v.tags || {},
        added: v.added ?? 0,
        duration: v.duration ?? 0,
        start: v.start ?? -1,
        end: v.end ?? -1
    }
}

const tagByNickname = {}
for (const [tag, nick] of Object.entries(nicknames)) tagByNickname[nick] = tag

const resolveNicknameToTag = (nick) => tagByNickname[nick] ?? nick

const playlistRows = [] // { owner_tag, name, is_public, items: [legacy_id] }
const playlistFilterReports = []
let droppedUnlistedItems = 0

for (const [ownerTag, lists] of Object.entries(userplaylists)) {
    for (const [name, entry] of Object.entries(lists)) {
        const filterString = typeof entry === "string" ? entry : (entry?.filters ?? "")
        const { entries, ordered, unknownCommands } = generateList(legacyVideoMap, filterString, {
            opinions,
            resolveTag: resolveNicknameToTag,
            sortByArtist: true
        })
        const items = []
        for (const e of entries) {
            if (!videosByLegacyId.has(e.id)) {
                droppedUnlistedItems++
                continue
            }
            items.push(e.id)
        }
        const isPrivate = filterString.split(/\r?\n/).some((l) => l.trim() === "private")
        playlistRows.push({
            owner_tag: ownerTag,
            name,
            is_public: isPrivate ? 0 : 1,
            items
        })
        if (unknownCommands.length > 0) {
            playlistFilterReports.push({ ownerTag, name, unknownCommands })
        }
        void ordered
    }
}

// --- Report ------------------------------------------------------------------

log("")
log("═══ import report ═══")
log(`users:       ${userRows.length}  (contributors: ${userRows.filter((u) => u.is_contributor).length})`)
log(
    `videos:      ${videoRows.length}  (youtube: ${videoRows.filter((v) => v.source === "youtube").length}, self: ${videoRows.filter((v) => v.source === "self").length})`
)
log(`  dropped unlisted playlist refs: ${droppedUnlistedItems}`)
log(`opinions:    ${opinionRows.length}`)
log(`playlists:   ${playlistRows.length}`)
log(`  total items: ${playlistRows.reduce((a, p) => a + p.items.length, 0)}`)
if (playlistFilterReports.length > 0) {
    log(`unknown filter commands in ${playlistFilterReports.length} playlists:`)
    for (const r of playlistFilterReports.slice(0, 10)) {
        log(
            `  ${r.ownerTag} / ${r.name}: ${r.unknownCommands.slice(0, 3).join(" | ")}${r.unknownCommands.length > 3 ? " …" : ""}`
        )
    }
}

// --- Self-hosted media: verify + copy ---------------------------------------

const selfHostedRefsNeeded = new Set(videoRows.filter((v) => v.source === "self").map((v) => v.source_ref))
const mediaPresent = new Set()
const mediaMissing = []
if (fs.existsSync(legacyMediaDir)) {
    for (const f of fs.readdirSync(legacyMediaDir)) {
        if (f.endsWith(".mp4")) mediaPresent.add(f.slice(0, -4))
    }
    for (const ref of selfHostedRefsNeeded) {
        if (!mediaPresent.has(ref)) mediaMissing.push(ref)
    }
} else {
    warn(`legacy media dir not found: ${legacyMediaDir}`)
}
log(`media: ${selfHostedRefsNeeded.size} self-hosted refs needed, ${mediaMissing.length} missing on disk`)
if (mediaMissing.length > 0) for (const r of mediaMissing) warn(`  missing: ${r}.mp4`)

if (dryRun) {
    log("")
    log("dry run — no database or files written.")
    process.exit(0)
}

// --- Write sqlite ------------------------------------------------------------

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(mediaDir, { recursive: true })

if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
const db = new Database(dbPath)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        discord_id TEXT UNIQUE,
        discord_handle TEXT NOT NULL,
        display_name TEXT NOT NULL UNIQUE,
        label TEXT,
        is_contributor INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
    );

    CREATE TABLE videos (
        id INTEGER PRIMARY KEY,
        source TEXT NOT NULL CHECK (source IN ('youtube', 'self')),
        source_ref TEXT NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        duration_s INTEGER,
        start_s INTEGER NOT NULL DEFAULT -1,
        end_s INTEGER NOT NULL DEFAULT -1,
        thumb TEXT,
        added_by INTEGER REFERENCES users(id),
        added_at INTEGER,
        UNIQUE (source, source_ref)
    );

    CREATE TABLE tags (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE video_tags (
        video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (video_id, tag_id)
    );

    CREATE TABLE opinions (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        value TEXT NOT NULL CHECK (value IN ('love','like','meh','bleh','hate')),
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, video_id)
    );
    CREATE INDEX opinions_by_video ON opinions (video_id);

    CREATE TABLE playlists (
        id INTEGER PRIMARY KEY,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 1,
        cover_video_id INTEGER REFERENCES videos(id),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE (owner_id, name)
    );

    CREATE TABLE playlist_items (
        playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        PRIMARY KEY (playlist_id, position)
    );
    CREATE INDEX playlist_items_by_video ON playlist_items (video_id);
`)

const nowEpoch = Math.floor(Date.now() / 1000)

const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "list"

const insertUser = db.prepare(
    `INSERT INTO users (discord_handle, display_name, label, is_contributor, created_at) VALUES (?, ?, ?, ?, ?)`
)
const canonicalTagToUserId = new Map()
const tx = db.transaction(() => {
    for (const u of userRows) {
        const info = insertUser.run(u.discord_handle, u.display_name, u.label, u.is_contributor, nowEpoch)
        canonicalTagToUserId.set(u.canonical_tag, info.lastInsertRowid)
    }

    const insertVideo = db.prepare(
        `INSERT INTO videos (source, source_ref, title, artist, duration_s, start_s, end_s, thumb, added_by, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const legacyIdToVideoId = new Map()
    for (const v of videoRows) {
        const addedBy = v.added_by_tag ? (canonicalTagToUserId.get(canonicalTagFor(v.added_by_tag)) ?? null) : null
        const info = insertVideo.run(
            v.source,
            v.source_ref,
            v.title,
            v.artist,
            v.duration_s,
            v.start_s,
            v.end_s,
            v.thumb,
            addedBy,
            v.added_at
        )
        legacyIdToVideoId.set(v.legacy_id, info.lastInsertRowid)
    }

    const insertTag = db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (?)`)
    const selectTag = db.prepare(`SELECT id FROM tags WHERE name = ?`)
    const insertVideoTag = db.prepare(`INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)`)
    for (const v of videoRows) {
        if (!v.tags.length) continue
        const videoId = legacyIdToVideoId.get(v.legacy_id)
        for (const tagName of v.tags) {
            insertTag.run(tagName)
            const tagId = selectTag.get(tagName).id
            insertVideoTag.run(videoId, tagId)
        }
    }

    const insertOpinion = db.prepare(`INSERT OR REPLACE INTO opinions (user_id, video_id, value, updated_at) VALUES (?, ?, ?, ?)`)
    for (const o of opinionRows) {
        const userId = canonicalTagToUserId.get(o.canonical_tag)
        const videoId = legacyIdToVideoId.get(o.legacy_id)
        if (!userId || !videoId) continue
        insertOpinion.run(userId, videoId, o.value, nowEpoch)
    }

    const insertPlaylist = db.prepare(
        `INSERT INTO playlists (owner_id, name, slug, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
    )
    const insertPlaylistItem = db.prepare(`INSERT INTO playlist_items (playlist_id, position, video_id) VALUES (?, ?, ?)`)
    const skippedPlaylists = []
    let skippedEmpty = 0
    for (const p of playlistRows) {
        const ownerId = canonicalTagToUserId.get(canonicalTagFor(p.owner_tag))
        if (!ownerId) {
            skippedPlaylists.push(`${p.owner_tag}/${p.name}`)
            continue
        }
        const resolvedItems = p.items.map((legacyId) => legacyIdToVideoId.get(legacyId)).filter((v) => v != null)
        if (resolvedItems.length === 0) {
            skippedEmpty++
            continue
        }
        const info = insertPlaylist.run(ownerId, p.name, slugify(p.name), p.is_public, nowEpoch, nowEpoch)
        const playlistId = info.lastInsertRowid
        for (let pos = 0; pos < resolvedItems.length; pos++) {
            insertPlaylistItem.run(playlistId, pos, resolvedItems[pos])
        }
    }
    if (skippedPlaylists.length) warn(`skipped ${skippedPlaylists.length} playlists with unknown owner:`, skippedPlaylists)
    if (skippedEmpty) log(`skipped ${skippedEmpty} empty playlists (no resolvable items)`)
})
tx()

// --- Copy self-hosted media --------------------------------------------------

let copiedMedia = 0
if (fs.existsSync(legacyMediaDir)) {
    for (const ref of selfHostedRefsNeeded) {
        for (const ext of [".mp4", ".jpg"]) {
            const src = path.join(legacyMediaDir, ref + ext)
            if (!fs.existsSync(src)) continue
            const dst = path.join(mediaDir, ref + ext)
            fs.copyFileSync(src, dst)
            if (ext === ".mp4") copiedMedia++
        }
    }
}
log(`copied ${copiedMedia} self-hosted video files into ${mediaDir}`)

db.close()
log("")
log(`✓ wrote ${dbPath}`)
