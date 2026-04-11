// In-memory mirror sessions. Server-authoritative state inspired by the
// ~/work/movienight room model: the server stores { video, pos, updated,
// playing } and any participant can send pause/play/seek commands.
// The server computes an "effective position" at broadcast time so clients
// can sync tightly. next/prev still have to go through the host (only it
// knows the queue), so those are relayed.

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I/O/0/1
const CODE_LEN = 4

const mirrors = new Map() // code -> { hostSocketId, video, pos, updated, playing, createdAt }

const generateCode = () => {
    for (let tries = 0; tries < 100; tries++) {
        let code = ""
        for (let i = 0; i < CODE_LEN; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
        if (!mirrors.has(code)) return code
    }
    throw new Error("mirror: code space exhausted")
}

const roomFor = (code) => `mirror:${code}`

const snapshot = (m) => ({
    video: m.video,
    pos: m.playing ? m.pos + (Date.now() - m.updated) / 1000 : m.pos,
    playing: m.playing
})

export const attachMirror = (io) => {
    io.on("connection", (socket) => {
        let hostingCode = null
        const watching = new Set()

        socket.on("mirror:start", ({ requestedCode } = {}, cb) => {
            if (hostingCode) {
                cb?.({ ok: true, code: hostingCode })
                return
            }
            const isValid =
                requestedCode &&
                typeof requestedCode === "string" &&
                /^[A-Za-z0-9_-]{1,32}$/.test(requestedCode)
            const code = isValid ? requestedCode : generateCode()
            if (mirrors.has(code)) {
                // Take over an existing session (e.g. host reconnecting after crash)
                mirrors.get(code).hostSocketId = socket.id
            } else {
                mirrors.set(code, {
                    hostSocketId: socket.id,
                    video: null,
                    pos: 0,
                    updated: Date.now(),
                    playing: false,
                    createdAt: Date.now()
                })
            }
            socket.join(roomFor(code))
            hostingCode = code
            cb?.({ ok: true, code })
        })

        socket.on("mirror:setVideo", ({ code, video, pos = 0, playing = true }) => {
            const m = mirrors.get(code)
            if (!m || m.hostSocketId !== socket.id) return
            // Strip user-specific fields so viewers never see the host's rating
            const { my_opinion: _drop, ...videoData } = video ?? {}
            m.video = videoData
            m.pos = typeof pos === "number" ? pos : 0
            m.updated = Date.now()
            m.playing = !!playing
            io.to(roomFor(code)).emit("mirror:state", snapshot(m))
        })

        socket.on("mirror:setPlaying", ({ code, playing, pos }) => {
            const m = mirrors.get(code)
            if (!m) return
            if (typeof pos === "number" && pos >= 0) m.pos = pos
            m.playing = !!playing
            m.updated = Date.now()
            io.to(roomFor(code)).emit("mirror:state", snapshot(m))
        })

        socket.on("mirror:next", ({ code }) => {
            const m = mirrors.get(code)
            if (!m) return
            io.to(m.hostSocketId).emit("mirror:control", { action: "next" })
        })

        socket.on("mirror:prev", ({ code }) => {
            const m = mirrors.get(code)
            if (!m) return
            io.to(m.hostSocketId).emit("mirror:control", { action: "prev" })
        })

        socket.on("mirror:stop", ({ code } = {}) => {
            const targetCode = code ?? hostingCode
            if (!targetCode) return
            const m = mirrors.get(targetCode)
            if (!m || m.hostSocketId !== socket.id) return
            io.to(roomFor(targetCode)).emit("mirror:ended", { code: targetCode })
            mirrors.delete(targetCode)
            if (hostingCode === targetCode) hostingCode = null
        })

        socket.on("mirror:join", ({ code }, cb) => {
            const m = mirrors.get(code)
            if (!m) {
                cb?.({ ok: false })
                return
            }
            socket.join(roomFor(code))
            watching.add(code)
            cb?.({ ok: true, state: snapshot(m) })
        })

        socket.on("mirror:leave", ({ code }) => {
            socket.leave(roomFor(code))
            watching.delete(code)
        })

        socket.on("disconnect", () => {
            if (hostingCode) {
                const code = hostingCode
                const m = mirrors.get(code)
                if (m && m.hostSocketId === socket.id) {
                    io.to(roomFor(code)).emit("mirror:ended", { code })
                    mirrors.delete(code)
                }
                hostingCode = null
            }
            watching.clear()
        })
    })
}
