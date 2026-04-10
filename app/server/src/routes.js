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
