import express from "express"
import { db } from "./db.js"
import { AUTH_COOKIE } from "./auth.js"
import { getUserById, isAdministrator, listAllUsers, setUserContributor, userPublicView } from "./users.js"
import { downloadSelfHostedVideo } from "./hosting.js"
import {
    fetchYoutubeMetadata,
    fetchYoutubePlaylistItems,
    fetchYoutubeVideos,
    parseYoutubeInput,
    parseYoutubePlaylistInput,
    splitArtistTitle
} from "./youtube.js"
import { secrets } from "./config.js"

const router = express.Router()

const currentUser = (req) => {
    const id = req.signedCookies?.[AUTH_COOKIE]
    if (!id) return null
    return getUserById(Number(id)) ?? null
}

const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "list"

// Clamp a freeform user-provided string. Strips control characters, collapses
// whitespace, and enforces a max length. Returns "" if input is null/blank.
const sanitizeFreeform = (input, max) => {
    if (input == null) return ""
    return (
        String(input)
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, max)
    )
}

const LIMITS = {
    playlistName: 80,
    videoTitle: 200,
    videoArtist: 120,
    userLabel: 128
}

const nowEpoch = () => Math.floor(Date.now() / 1000)

const requireUser = (req, res) => {
    const me = currentUser(req)
    if (!me) {
        res.status(401).json({ error: "not signed in" })
        return null
    }
    return me
}

const requireAdmin = (req, res) => {
    const me = requireUser(req, res)
    if (!me) return null
    if (!isAdministrator(me)) {
        res.status(403).json({ error: "administrator only" })
        return null
    }
    return me
}

const requireContributor = (req, res) => {
    const me = requireUser(req, res)
    if (!me) return null
    if (!me.is_contributor) {
        res.status(403).json({ error: "contributor only" })
        return null
    }
    return me
}

router.get("/health", (_req, res) => {
    res.json({ ok: true })
})

router.get("/me", (req, res) => {
    res.json({ user: userPublicView(currentUser(req)) })
})

const DISPLAY_NAME_RE = /^[A-Za-z0-9_]{2,32}$/
const updateUser = db.prepare(`UPDATE users SET display_name = ?, label = ? WHERE id = ?`)
const displayNameTaken = db.prepare(`SELECT id FROM users WHERE LOWER(display_name) = LOWER(?) AND id != ?`)

router.patch("/me", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return

    let displayName = me.display_name
    let label = me.label

    if (req.body?.display_name != null) {
        const name = String(req.body.display_name).trim()
        if (!DISPLAY_NAME_RE.test(name)) {
            res.status(400).json({ error: "display name must be 2-32 letters, digits, or underscores" })
            return
        }
        if (displayNameTaken.get(name, me.id)) {
            res.status(409).json({ error: "that display name is already in use" })
            return
        }
        displayName = name
    }

    if (req.body?.label !== undefined) {
        const clean = sanitizeFreeform(req.body.label, LIMITS.userLabel)
        label = clean || null
    }

    updateUser.run(displayName, label, me.id)
    res.json({ user: userPublicView(getUserById(me.id)) })
})

// --- Admin ------------------------------------------------------------------

router.get("/users", (req, res) => {
    const me = requireAdmin(req, res)
    if (!me) return
    const users = listAllUsers().map((u) => ({
        id: u.id,
        display_name: u.display_name,
        discord_handle: u.discord_handle,
        label: u.label,
        is_contributor: !!u.is_contributor,
        is_administrator: isAdministrator(u)
    }))
    res.json({ users })
})

router.patch("/users/:id", (req, res) => {
    const me = requireAdmin(req, res)
    if (!me) return
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
        res.status(400).json({ error: "bad id" })
        return
    }
    if (req.body?.is_contributor != null) {
        setUserContributor(id, !!req.body.is_contributor)
    }
    res.json({ ok: true })
})

router.get("/me/stats", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const videos_added = db.prepare(`SELECT COUNT(*) AS c FROM videos WHERE added_by = ?`).get(me.id).c
    const opinions = db.prepare(`SELECT COUNT(*) AS c FROM opinions WHERE user_id = ?`).get(me.id).c
    const playlists = db.prepare(`SELECT COUNT(*) AS c FROM playlists WHERE owner_id = ?`).get(me.id).c
    res.json({ stats: { videos_added, opinions, playlists } })
})

const listVisiblePlaylists = db.prepare(
    `SELECT p.id, p.name, p.slug, p.is_public, u.display_name AS owner,
            (SELECT COUNT(*) FROM playlist_items WHERE playlist_id = p.id) AS item_count
     FROM playlists p
     JOIN users u ON u.id = p.owner_id
     WHERE p.is_public = 1 OR p.owner_id = ?
     ORDER BY (p.owner_id = ? AND p.is_public = 0) DESC, p.name COLLATE NOCASE ASC`
)

router.get("/playlists", (req, res) => {
    const me = currentUser(req)
    const myId = me?.id ?? -1
    res.json({ playlists: listVisiblePlaylists.all(myId, myId) })
})

const getPlaylistBySlug = db.prepare(
    `SELECT p.id, p.name, p.slug, p.is_public, u.display_name AS owner, u.id AS owner_id
     FROM playlists p
     JOIN users u ON u.id = p.owner_id
     WHERE u.display_name = ? AND p.slug = ?`
)

const getPlaylistItems = db.prepare(
    `SELECT v.id, v.source, v.source_ref, v.title, v.artist, v.duration_s, v.start_s, v.end_s, v.thumb,
            u.display_name AS owner_display_name, u.label AS owner_label,
            o.value AS my_opinion
     FROM playlist_items pi
     JOIN videos v ON v.id = pi.video_id
     LEFT JOIN users u ON u.id = v.added_by
     LEFT JOIN opinions o ON o.video_id = v.id AND o.user_id = ?
     WHERE pi.playlist_id = ?
     ORDER BY pi.position ASC`
)

router.get("/playlists/:owner/:slug", (req, res) => {
    const playlist = getPlaylistBySlug.get(req.params.owner, req.params.slug)
    if (!playlist) {
        res.status(404).json({ error: "not found" })
        return
    }
    const me = currentUser(req)
    if (!playlist.is_public) {
        if (!me || me.id !== playlist.owner_id) {
            res.status(404).json({ error: "not found" })
            return
        }
    }
    const items = getPlaylistItems.all(me?.id ?? -1, playlist.id)
    res.json({ playlist, items })
})

const OPINION_VALUES = ["love", "like", "meh", "bleh", "hate"]

const getOpinion = db.prepare(`SELECT value FROM opinions WHERE user_id = ? AND video_id = ?`)

router.get("/opinions/:videoId", (req, res) => {
    const me = currentUser(req)
    if (!me) {
        res.json({ value: null })
        return
    }
    const videoId = Number(req.params.videoId)
    const row = getOpinion.get(me.id, videoId)
    res.json({ value: row?.value ?? null })
})

const upsertOpinion = db.prepare(
    `INSERT INTO opinions (user_id, video_id, value, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, video_id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
)
const deleteOpinion = db.prepare(`DELETE FROM opinions WHERE user_id = ? AND video_id = ?`)

router.post("/opinions/:videoId", (req, res) => {
    const me = currentUser(req)
    if (!me) {
        res.status(401).json({ error: "not signed in" })
        return
    }
    const videoId = Number(req.params.videoId)
    const value = req.body?.value
    if (!OPINION_VALUES.includes(value)) {
        res.status(400).json({ error: "bad value" })
        return
    }
    upsertOpinion.run(me.id, videoId, value, Math.floor(Date.now() / 1000))
    res.json({ ok: true, value })
})

// --- Playlist CRUD ----------------------------------------------------------

const findPlaylistById = db.prepare(
    `SELECT p.id, p.owner_id, p.name, p.slug, p.is_public, u.display_name AS owner
     FROM playlists p
     JOIN users u ON u.id = p.owner_id
     WHERE p.id = ?`
)
const insertPlaylist = db.prepare(
    `INSERT INTO playlists (owner_id, name, slug, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
)
const deletePlaylistStmt = db.prepare(`DELETE FROM playlists WHERE id = ?`)
const playlistNameTaken = db.prepare(`SELECT id FROM playlists WHERE owner_id = ? AND name = ? AND id != ?`)
const maxItemPosition = db.prepare(`SELECT COALESCE(MAX(position), -1) AS p FROM playlist_items WHERE playlist_id = ?`)
const insertPlaylistItem = db.prepare(`INSERT INTO playlist_items (playlist_id, position, video_id) VALUES (?, ?, ?)`)
const deletePlaylistItemsByVideo = db.prepare(`DELETE FROM playlist_items WHERE playlist_id = ? AND video_id = ?`)

router.post("/playlists", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const name = sanitizeFreeform(req.body?.name, LIMITS.playlistName)
    const isPublic = req.body?.is_public !== false
    if (!name) {
        res.status(400).json({ error: "name required" })
        return
    }
    if (playlistNameTaken.get(me.id, name, -1)) {
        res.status(409).json({ error: "name already in use" })
        return
    }
    const t = nowEpoch()
    const info = insertPlaylist.run(me.id, name, slugify(name), isPublic ? 1 : 0, t, t)
    const playlist = findPlaylistById.get(info.lastInsertRowid)
    res.json({ playlist })
})

router.patch("/playlists/:id", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const pl = findPlaylistById.get(id)
    if (!pl) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (pl.owner_id !== me.id) {
        res.status(403).json({ error: "not your playlist" })
        return
    }

    const sets = []
    const values = []
    if (req.body?.name != null) {
        const name = sanitizeFreeform(req.body.name, LIMITS.playlistName)
        if (!name) {
            res.status(400).json({ error: "name cannot be empty" })
            return
        }
        if (playlistNameTaken.get(me.id, name, id)) {
            res.status(409).json({ error: "name already in use" })
            return
        }
        sets.push("name = ?", "slug = ?")
        values.push(name, slugify(name))
    }
    if (req.body?.is_public != null) {
        sets.push("is_public = ?")
        values.push(req.body.is_public ? 1 : 0)
    }
    if (sets.length === 0) {
        res.json({ playlist: pl })
        return
    }
    sets.push("updated_at = ?")
    values.push(nowEpoch())
    values.push(id)
    db.prepare(`UPDATE playlists SET ${sets.join(", ")} WHERE id = ?`).run(...values)
    res.json({ playlist: findPlaylistById.get(id) })
})

router.delete("/playlists/:id", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const pl = findPlaylistById.get(id)
    if (!pl) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (pl.owner_id !== me.id) {
        res.status(403).json({ error: "not your playlist" })
        return
    }
    deletePlaylistStmt.run(id)
    res.json({ ok: true })
})

const playlistItemExists = db.prepare(`SELECT 1 FROM playlist_items WHERE playlist_id = ? AND video_id = ?`)

router.post("/playlists/:id/items", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const videoId = Number(req.body?.video_id)
    if (!videoId) {
        res.status(400).json({ error: "video_id required" })
        return
    }
    const pl = findPlaylistById.get(id)
    if (!pl) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (pl.owner_id !== me.id) {
        res.status(403).json({ error: "not your playlist" })
        return
    }
    const video = db.prepare(`SELECT id FROM videos WHERE id = ?`).get(videoId)
    if (!video) {
        res.status(404).json({ error: "video not found" })
        return
    }
    if (playlistItemExists.get(id, videoId)) {
        res.json({ ok: true, alreadyPresent: true })
        return
    }
    const pos = maxItemPosition.get(id).p + 1
    insertPlaylistItem.run(id, pos, videoId)
    res.json({ ok: true, position: pos, alreadyPresent: false })
})

const videoExists = db.prepare(`SELECT 1 FROM videos WHERE id = ?`)

router.post("/playlists/:id/items/bulk", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const videoIds = Array.isArray(req.body?.video_ids)
        ? req.body.video_ids.map(Number).filter((n) => Number.isFinite(n) && n > 0)
        : []
    if (!videoIds.length) {
        res.status(400).json({ error: "video_ids required" })
        return
    }
    const pl = findPlaylistById.get(id)
    if (!pl) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (pl.owner_id !== me.id) {
        res.status(403).json({ error: "not your playlist" })
        return
    }

    let added = 0
    let skipped = 0
    const insertInTxn = db.transaction((ids) => {
        let pos = maxItemPosition.get(id).p + 1
        for (const vid of ids) {
            if (playlistItemExists.get(id, vid)) {
                skipped++
                continue
            }
            if (!videoExists.get(vid)) {
                skipped++
                continue
            }
            insertPlaylistItem.run(id, pos, vid)
            pos++
            added++
        }
    })
    insertInTxn(videoIds)
    res.json({ ok: true, added, skipped })
})

router.delete("/playlists/:id/items/:videoId", (req, res) => {
    const me = requireUser(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const videoId = Number(req.params.videoId)
    const pl = findPlaylistById.get(id)
    if (!pl) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (pl.owner_id !== me.id) {
        res.status(403).json({ error: "not your playlist" })
        return
    }
    deletePlaylistItemsByVideo.run(id, videoId)
    res.json({ ok: true })
})

// --- Video library ----------------------------------------------------------

const listAllVideos = db.prepare(
    `SELECT v.id, v.source, v.source_ref, v.title, v.artist, v.duration_s, v.start_s, v.end_s, v.thumb,
            v.added_at,
            u.display_name AS owner_display_name, u.label AS owner_label,
            o.value AS my_opinion
     FROM videos v
     LEFT JOIN users u ON u.id = v.added_by
     LEFT JOIN opinions o ON o.video_id = v.id AND o.user_id = ?
     ORDER BY v.artist COLLATE NOCASE ASC, v.title COLLATE NOCASE ASC`
)

router.get("/videos", (req, res) => {
    const me = currentUser(req)
    res.json({ videos: listAllVideos.all(me?.id ?? -1) })
})

const existingVideoBySource = db.prepare(`SELECT id FROM videos WHERE source = ? AND source_ref = ?`)
const insertVideo = db.prepare(
    `INSERT INTO videos (source, source_ref, title, artist, duration_s, start_s, end_s, thumb, added_by, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
)

// Parse a raw YouTube URL (or id), fetch metadata from the API, and return a
// pre-filled form payload: id, guessed artist/title, duration, thumb, and any
// t/start/end trim hints extracted from the URL. Used by the contribute page.
router.post("/videos/query-youtube", async (req, res) => {
    const me = requireContributor(req, res)
    if (!me) return
    const parsed = parseYoutubeInput(req.body?.input)
    if (!parsed) {
        res.status(400).json({ error: "couldn't parse a YouTube URL or id" })
        return
    }
    if (existingVideoBySource.get("youtube", parsed.source_ref)) {
        res.status(409).json({ error: "this video is already in the library" })
        return
    }
    try {
        const meta = await fetchYoutubeMetadata(parsed.source_ref, secrets?.youtube)
        const { artist, title } = splitArtistTitle(meta.title ?? "")
        res.json({
            source_ref: parsed.source_ref,
            start_s: parsed.start_s,
            end_s: parsed.end_s,
            duration_s: meta.duration_s,
            thumb: meta.thumb,
            artist,
            title
        })
    } catch (e) {
        res.status(502).json({ error: String(e?.message ?? e) })
    }
})

// Pull a YouTube / YouTube Music playlist, bulk-fetch the videos, strip out
// audio-only "- Topic" tracks and anything already in the library, and return
// an ordered list of pre-filled rows for the contribute page. Contributors
// only. No persistence happens here — the UI calls POST /api/videos per row.
router.post("/videos/query-youtube-playlist", async (req, res) => {
    const me = requireContributor(req, res)
    if (!me) return
    const listId = parseYoutubePlaylistInput(req.body?.input)
    if (!listId) {
        res.status(400).json({ error: "couldn't parse a YouTube playlist URL or id" })
        return
    }
    try {
        const entries = await fetchYoutubePlaylistItems(listId, secrets?.youtube)
        if (entries.length === 0) {
            res.json({ playlist_id: listId, items: [], skipped: { audio_only: 0, unavailable: 0, already_in_library: 0 } })
            return
        }
        const ids = entries.map((e) => e.videoId)
        const videos = await fetchYoutubeVideos(ids, secrets?.youtube)

        const items = []
        const skipped = { audio_only: 0, unavailable: 0, already_in_library: 0 }
        for (const { videoId } of entries) {
            const v = videos.get(videoId)
            if (!v) {
                skipped.unavailable++
                continue
            }
            if (/-\s*Topic$/i.test(v.channelTitle ?? "")) {
                skipped.audio_only++
                continue
            }
            if (existingVideoBySource.get("youtube", videoId)) {
                skipped.already_in_library++
                continue
            }
            const { artist, title } = splitArtistTitle(v.title)
            items.push({
                source_ref: videoId,
                raw_title: v.title,
                channel: v.channelTitle,
                artist,
                title,
                duration_s: v.duration_s,
                thumb: v.thumb
            })
        }
        res.json({ playlist_id: listId, items, skipped })
    } catch (e) {
        res.status(502).json({ error: String(e?.message ?? e) })
    }
})

router.post("/videos", async (req, res) => {
    const me = requireContributor(req, res)
    if (!me) return
    const { source, source_ref: rawRef, url, duration_s } = req.body || {}
    const title = sanitizeFreeform(req.body?.title, LIMITS.videoTitle)
    const artist = sanitizeFreeform(req.body?.artist, LIMITS.videoArtist)
    if (!title || !artist) {
        res.status(400).json({ error: "title and artist required" })
        return
    }
    if (source !== "youtube" && source !== "self") {
        res.status(400).json({ error: "source must be 'youtube' or 'self'" })
        return
    }

    let finalRef
    let finalDuration = Number.isFinite(Number(duration_s)) ? Number(duration_s) : null
    let finalThumb = null

    if (source === "youtube") {
        const ref = String(rawRef ?? "").trim()
        if (!/^[A-Za-z0-9_-]{11}$/.test(ref)) {
            res.status(400).json({ error: "invalid youtube video id (expected 11 chars)" })
            return
        }
        finalRef = ref
        finalThumb = `https://i.ytimg.com/vi/${ref}/mqdefault.jpg`
    } else {
        if (!url) {
            res.status(400).json({ error: "url required for self-hosted videos" })
            return
        }
        finalRef = `${slugify(`${artist}-${title}`)}-${Date.now().toString(36)}`
        try {
            const result = await downloadSelfHostedVideo(String(url), finalRef)
            finalDuration = result.duration_s
            finalThumb = result.thumb
        } catch (e) {
            res.status(500).json({ error: String(e?.message ?? e) })
            return
        }
    }

    if (existingVideoBySource.get(source, finalRef)) {
        res.status(409).json({ error: "video already in the library" })
        return
    }

    const startS = Number.isFinite(Number(req.body?.start_s)) ? Number(req.body.start_s) : -1
    const endS = Number.isFinite(Number(req.body?.end_s)) ? Number(req.body.end_s) : -1
    const info = insertVideo.run(source, finalRef, title, artist, finalDuration, startS, endS, finalThumb, me.id, nowEpoch())
    res.json({ ok: true, id: info.lastInsertRowid })
})

router.patch("/videos/:id", (req, res) => {
    const me = requireContributor(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const video = db.prepare(`SELECT * FROM videos WHERE id = ?`).get(id)
    if (!video) {
        res.status(404).json({ error: "not found" })
        return
    }
    const sets = []
    const values = []
    const fieldLimits = { title: LIMITS.videoTitle, artist: LIMITS.videoArtist }
    for (const field of ["title", "artist"]) {
        if (req.body?.[field] != null) {
            const v = sanitizeFreeform(req.body[field], fieldLimits[field])
            if (v) {
                sets.push(`${field} = ?`)
                values.push(v)
            }
        }
    }
    // duration_s is immutable via the UI — it's the raw source length from
    // YouTube or ffprobe, never user-edited. start/end are the trim points.
    if (req.body?.start_s != null) {
        let n = Number(req.body.start_s)
        if (!Number.isFinite(n) || n <= 0) n = -1
        sets.push("start_s = ?")
        values.push(n)
    }
    if (req.body?.end_s != null) {
        let n = Number(req.body.end_s)
        if (!Number.isFinite(n) || n <= 0) n = -1
        if (video.duration_s != null && n >= video.duration_s) n = -1
        sets.push("end_s = ?")
        values.push(n)
    }
    if (!sets.length) {
        res.json({ ok: true })
        return
    }
    values.push(id)
    db.prepare(`UPDATE videos SET ${sets.join(", ")} WHERE id = ?`).run(...values)
    res.json({ ok: true })
})

router.delete("/videos/:id", (req, res) => {
    const me = requireContributor(req, res)
    if (!me) return
    const id = Number(req.params.id)
    const video = db.prepare(`SELECT * FROM videos WHERE id = ?`).get(id)
    if (!video) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (!isAdministrator(me) && video.added_by !== me.id) {
        res.status(403).json({ error: "not your video" })
        return
    }
    db.transaction(() => {
        db.prepare(`DELETE FROM playlist_items WHERE video_id = ?`).run(id)
        db.prepare(`DELETE FROM opinions WHERE video_id = ?`).run(id)
        db.prepare(`DELETE FROM videos WHERE id = ?`).run(id)
    })()
    res.json({ ok: true })
})

router.delete("/opinions/:videoId", (req, res) => {
    const me = currentUser(req)
    if (!me) {
        res.status(401).json({ error: "not signed in" })
        return
    }
    const videoId = Number(req.params.videoId)
    deleteOpinion.run(me.id, videoId)
    res.json({ ok: true })
})

export const apiRouter = router
