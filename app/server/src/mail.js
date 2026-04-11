import nodemailer from "nodemailer"
import { config } from "./config.js"

// Nightly digest tracking — reset each day after sending
let lastDigestDate = null

const isMailConfigured = () => {
    const m = config.mail
    if (!m?.transport || !m.from || !m.to) return false
    const auth = m.transport?.auth
    if (!auth?.user || !auth?.pass) return false
    return true
}

const createTransport = () => nodemailer.createTransport(config.mail.transport)

export const sendMail = async (subject, text) => {
    if (!isMailConfigured()) return
    const transporter = createTransport()
    await transporter.sendMail({ from: config.mail.from, to: config.mail.to, subject, text })
}

const section = (title, items) => {
    if (!items.length) return `${title}: (none)`
    return `${title}:\n${items.map((s) => `  ${s}`).join("\n")}`
}

const videoUrl = (v) => {
    if (v.source === "youtube") return `https://www.youtube.com/watch?v=${v.source_ref}`
    return `/videos/${v.source_ref}`
}

const runNightlyDigest = (db) => {
    const today = new Date().toISOString().slice(0, 10)
    if (lastDigestDate === today) return
    lastDigestDate = today

    const since = Math.floor(Date.now() / 1000) - 86400

    const newUsers = db
        .prepare(`SELECT display_name, discord_handle FROM users WHERE created_at > ? ORDER BY display_name COLLATE NOCASE`)
        .all(since)

    const newVideos = db
        .prepare(`SELECT source, source_ref, artist, title FROM videos WHERE added_at > ? ORDER BY artist COLLATE NOCASE, title COLLATE NOCASE`)
        .all(since)

    const newPlaylists = db
        .prepare(
            `SELECT p.name, u.display_name AS owner FROM playlists p
             JOIN users u ON u.id = p.owner_id
             WHERE p.created_at > ? ORDER BY p.name COLLATE NOCASE`
        )
        .all(since)

    const hasActivity = newUsers.length > 0 || newVideos.length > 0 || newPlaylists.length > 0
    if (!hasActivity && !config.mail.digestEvenIfEmpty) return

    const lines = [
        `mtv nightly digest — ${today}`,
        "",
        section(
            `New accounts (${newUsers.length})`,
            newUsers.map((u) => `${u.display_name} (@${u.discord_handle})`)
        ),
        "",
        section(
            `New videos (${newVideos.length})`,
            newVideos.map((v) => `${v.artist} — ${v.title}  ${videoUrl(v)}`)
        ),
        "",
        section(
            `New playlists (${newPlaylists.length})`,
            newPlaylists.map((p) => `${p.name} (by ${p.owner})`)
        )
    ]

    sendMail(`mtv digest ${today}`, lines.join("\n")).catch((e) => {
        console.error("mail: nightly digest failed:", e.message)
    })
}

// Schedule nightly digest to fire at midnight local time. Polls every minute
// and fires once per calendar day.
export const initMail = (db) => {
    if (!isMailConfigured()) return
    if (!config.mail.nightlyDigest) return

    // Check immediately in case server started right at midnight
    runNightlyDigest(db)

    const interval = setInterval(() => {
        const now = new Date()
        if (now.getHours() === 0) runNightlyDigest(db)
    }, 60_000)
    interval.unref()

    console.log(`mail: nightly digest enabled → ${config.mail.to}`)
}
