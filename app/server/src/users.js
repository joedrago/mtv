import { db } from "./db.js"
import { config } from "./config.js"

const selectByDiscordId = db.prepare(`SELECT * FROM users WHERE discord_id = ?`)
const selectByHandle = db.prepare(`SELECT * FROM users WHERE discord_handle = ? AND discord_id IS NULL`)
const selectByHandleAny = db.prepare(`SELECT * FROM users WHERE discord_handle = ?`)
const selectById = db.prepare(`SELECT * FROM users WHERE id = ?`)
const insertUser = db.prepare(
    `INSERT INTO users (discord_id, discord_handle, display_name, is_contributor, created_at) VALUES (?, ?, ?, 0, ?)`
)
const updateDiscordId = db.prepare(`UPDATE users SET discord_id = ?, discord_handle = ? WHERE id = ?`)
const updateHandle = db.prepare(`UPDATE users SET discord_handle = ? WHERE id = ?`)

const uniqueDisplayName = (proposed) => {
    const base = proposed || "user"
    const check = db.prepare(`SELECT 1 FROM users WHERE display_name = ?`)
    if (!check.get(base)) return base
    let i = 2
    while (check.get(`${base}${i}`)) i++
    return `${base}${i}`
}

// Returns true if a user row already exists for this Discord identity (either
// by discord_id or as a migrated row claimable by handle). Used by the
// allowlist check so pre-existing accounts are never blocked.
export const discordUserExists = (discordId, handle) => {
    if (selectByDiscordId.get(discordId)) return true
    if (selectByHandle.get(handle)) return true
    return false
}

// Given a Discord OAuth @me payload, return the local user row (creating or
// claiming the row for a migrated user on first login).
export const upsertDiscordUser = (discordMe) => {
    const nowEpoch = Math.floor(Date.now() / 1000)
    const discordId = String(discordMe.id)
    const handle = discordMe.username

    const existing = selectByDiscordId.get(discordId)
    if (existing) {
        if (existing.discord_handle !== handle) updateHandle.run(handle, existing.id)
        return selectById.get(existing.id)
    }

    const migrated = selectByHandle.get(handle)
    if (migrated) {
        updateDiscordId.run(discordId, handle, migrated.id)
        return selectById.get(migrated.id)
    }

    // Handle already in use by someone with a different discord_id — don't
    // collide. This shouldn't happen in practice, but fall through to create a
    // fresh user with a suffixed display_name.
    if (selectByHandleAny.get(handle)) {
        const displayName = uniqueDisplayName(handle)
        const info = insertUser.run(discordId, `${handle}_${discordId.slice(-4)}`, displayName, nowEpoch)
        return selectById.get(info.lastInsertRowid)
    }

    const displayName = uniqueDisplayName(handle)
    const info = insertUser.run(discordId, handle, displayName, nowEpoch)
    return selectById.get(info.lastInsertRowid)
}

export const getUserById = (id) => selectById.get(id)

export const isAdministrator = (user) => {
    if (!user?.discord_id) return false
    return (config.administrators ?? []).includes(user.discord_id)
}

export const userPublicView = (user) => {
    if (!user) return null
    return {
        id: user.id,
        display_name: user.display_name,
        discord_handle: user.discord_handle,
        label: user.label,
        is_contributor: !!user.is_contributor,
        is_administrator: isAdministrator(user)
    }
}

const selectAllUsers = db.prepare(
    `SELECT id, discord_id, discord_handle, display_name, label, is_contributor FROM users ORDER BY display_name COLLATE NOCASE ASC`
)
export const listAllUsers = () => selectAllUsers.all()

const updateContributor = db.prepare(`UPDATE users SET is_contributor = ? WHERE id = ?`)
export const setUserContributor = (id, flag) => updateContributor.run(flag ? 1 : 0, id)

// Returns (creating if needed) the special "Unknown" tombstone user that
// receives ownership of videos when their original contributor is deleted.
// Uses discord_id '__unknown__' which can never match a real Discord login.
export const getOrCreateUnknownUser = () => {
    const existing = selectByDiscordId.get("__unknown__")
    if (existing) return existing
    const info = insertUser.run("__unknown__", "unknown", "Unknown", Math.floor(Date.now() / 1000))
    return selectById.get(info.lastInsertRowid)
}

export const deleteUser = (id) => {
    const unknown = getOrCreateUnknownUser()
    db.transaction(() => {
        // Reassign their videos to Unknown rather than orphaning them
        db.prepare(`UPDATE videos SET added_by = ? WHERE added_by = ?`).run(unknown.id, id)
        // Delete their playlist contents, then playlists, opinions, and finally the user
        const playlists = db.prepare(`SELECT id FROM playlists WHERE owner_id = ?`).all(id)
        for (const pl of playlists) {
            db.prepare(`DELETE FROM playlist_items WHERE playlist_id = ?`).run(pl.id)
        }
        db.prepare(`DELETE FROM playlists WHERE owner_id = ?`).run(id)
        db.prepare(`DELETE FROM opinions WHERE user_id = ?`).run(id)
        db.prepare(`DELETE FROM users WHERE id = ?`).run(id)
    })()
}
