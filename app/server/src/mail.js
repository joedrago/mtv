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

const runNightlyDigest = (db) => {
    const today = new Date().toISOString().slice(0, 10)
    if (lastDigestDate === today) return
    lastDigestDate = today

    const since = Math.floor(Date.now() / 1000) - 86400

    const newUsers = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE created_at > ?`).get(since).c
    const newVideos = db.prepare(`SELECT COUNT(*) AS c FROM videos WHERE added_at > ?`).get(since).c
    const newPlaylists = db.prepare(`SELECT COUNT(*) AS c FROM playlists WHERE created_at > ?`).get(since).c

    const hasActivity = newUsers > 0 || newVideos > 0 || newPlaylists > 0
    if (!hasActivity && !config.mail.digestEvenIfEmpty) return

    const lines = [
        `mtv nightly digest — ${today}`,
        "",
        `New accounts:  ${newUsers}`,
        `New videos:    ${newVideos}`,
        `New playlists: ${newPlaylists}`
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
