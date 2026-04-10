import express from "express"
import crypto from "node:crypto"
import { secrets } from "./config.js"
import { upsertDiscordUser } from "./users.js"

const router = express.Router()

const AUTH_COOKIE = "mtv_sid"
const COOKIE_OPTS = {
    httpOnly: true,
    sameSite: "lax",
    signed: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}

const pendingStates = new Map() // state → expiresAt
const STATE_TTL_MS = 10 * 60 * 1000

const newState = () => {
    const s = crypto.randomBytes(16).toString("hex")
    pendingStates.set(s, Date.now() + STATE_TTL_MS)
    return s
}

const consumeState = (s) => {
    const expires = pendingStates.get(s)
    if (!expires) return false
    pendingStates.delete(s)
    return expires > Date.now()
}

setInterval(() => {
    const now = Date.now()
    for (const [s, exp] of pendingStates) if (exp <= now) pendingStates.delete(s)
}, 60_000).unref()

router.get("/discord", (req, res) => {
    const state = newState()
    const params = new URLSearchParams({
        client_id: secrets.discord.clientId,
        response_type: "code",
        redirect_uri: secrets.discord.redirectUri,
        scope: "identify",
        state
    })
    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
})

router.get("/discord/callback", async (req, res) => {
    const { code, state } = req.query
    if (!code || !state || !consumeState(String(state))) {
        res.status(400).send("invalid state")
        return
    }

    try {
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: secrets.discord.clientId,
                client_secret: secrets.discord.clientSecret,
                grant_type: "authorization_code",
                code: String(code),
                redirect_uri: secrets.discord.redirectUri
            })
        })
        if (!tokenRes.ok) {
            console.error("discord token exchange failed", tokenRes.status, await tokenRes.text())
            res.status(502).send("discord token exchange failed")
            return
        }
        const token = await tokenRes.json()

        const meRes = await fetch("https://discord.com/api/users/@me", {
            headers: { authorization: `Bearer ${token.access_token}` }
        })
        if (!meRes.ok) {
            console.error("discord /@me failed", meRes.status, await meRes.text())
            res.status(502).send("discord @me failed")
            return
        }
        const me = await meRes.json()

        const user = upsertDiscordUser(me)
        res.cookie(AUTH_COOKIE, String(user.id), COOKIE_OPTS)
        res.redirect("/")
    } catch (e) {
        console.error("auth callback error", e)
        res.status(500).send("auth error")
    }
})

router.post("/logout", (req, res) => {
    res.clearCookie(AUTH_COOKIE, { ...COOKIE_OPTS, maxAge: undefined })
    res.json({ ok: true })
})

export const authRouter = router
export { AUTH_COOKIE }
