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
            u.display_name AS owner_display_name, u.label AS owner_label
     FROM playlist_items pi
     JOIN videos v ON v.id = pi.video_id
     LEFT JOIN users u ON u.id = v.added_by
     WHERE pi.playlist_id = ?
     ORDER BY pi.position ASC`
)

router.get("/playlists/:owner/:slug", (req, res) => {
    const playlist = getPlaylistBySlug.get(req.params.owner, req.params.slug)
    if (!playlist) {
        res.status(404).json({ error: "not found" })
        return
    }
    if (!playlist.is_public) {
        const current = currentUser(req)
        if (!current || current.id !== playlist.owner_id) {
            res.status(404).json({ error: "not found" })
            return
        }
    }
    const items = getPlaylistItems.all(playlist.id)
    res.json({ playlist, items })
})

export const apiRouter = router
