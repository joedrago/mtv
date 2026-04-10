import express from "express"
import { db } from "./db.js"
import { AUTH_COOKIE } from "./auth.js"
import { getUserById, userPublicView } from "./users.js"

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

const nowEpoch = () => Math.floor(Date.now() / 1000)

const requireUser = (req, res) => {
    const me = currentUser(req)
    if (!me) {
        res.status(401).json({ error: "not signed in" })
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
    const name = String(req.body?.name ?? "").trim()
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
        const name = String(req.body.name).trim()
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
