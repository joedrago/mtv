import { create } from "zustand"
import { socket } from "../socket.js"
import { usePlayerStore } from "./player.js"

export const useMirrorStore = create((set, get) => ({
    hostCode: null,
    viewerCode: null,
    sessionState: null, // { video, pos, playing, receivedAt }
    djCode: sessionStorage.getItem("mtv:djCode") ?? null,

    setDjCode: (code) => {
        sessionStorage.setItem("mtv:djCode", code)
        set({ djCode: code })
    },

    clearDjMode: () => {
        get().stopHost()
        sessionStorage.removeItem("mtv:djCode")
        set({ djCode: null })
    },

    startHost: (requestedCode) =>
        new Promise((resolve) => {
            if (get().hostCode) {
                resolve(get().hostCode)
                return
            }
            socket.emit("mirror:start", requestedCode ? { requestedCode } : {}, (reply) => {
                if (reply?.ok) {
                    set({ hostCode: reply.code })
                    resolve(reply.code)
                } else resolve(null)
            })
        }),

    stopHost: () => {
        const { hostCode } = get()
        if (!hostCode) return
        socket.emit("mirror:stop", { code: hostCode })
        set({ hostCode: null })
    },

    sendVideo: (video, { pos = 0, playing = true } = {}) => {
        const { hostCode } = get()
        if (!hostCode || !video) return
        socket.emit("mirror:setVideo", { code: hostCode, video, pos, playing })
    },

    sendPlaying: (playing, pos) => {
        const code = get().hostCode ?? get().viewerCode
        if (!code) return
        socket.emit("mirror:setPlaying", { code, playing, pos })
    },

    sendNext: () => {
        const code = get().hostCode ?? get().viewerCode
        if (!code) return
        socket.emit("mirror:next", { code })
    },

    sendPrev: () => {
        const code = get().hostCode ?? get().viewerCode
        if (!code) return
        socket.emit("mirror:prev", { code })
    },

    joinViewer: (code) =>
        new Promise((resolve) => {
            socket.emit("mirror:join", { code }, (reply) => {
                if (reply?.ok) {
                    set({
                        viewerCode: code,
                        sessionState: reply.state ? { ...reply.state, receivedAt: Date.now() } : null
                    })
                    resolve(true)
                } else resolve(false)
            })
        }),

    leaveViewer: () => {
        const { viewerCode } = get()
        if (!viewerCode) return
        socket.emit("mirror:leave", { code: viewerCode })
        set({ viewerCode: null, sessionState: null })
    }
}))

socket.on("mirror:state", (state) => {
    useMirrorStore.setState({ sessionState: { ...state, receivedAt: Date.now() } })
})

socket.on("mirror:ended", () => {
    useMirrorStore.setState({ viewerCode: null, sessionState: null })
})

// The host receives control commands relayed from viewers.
socket.on("mirror:control", ({ action }) => {
    const { hostCode } = useMirrorStore.getState()
    if (!hostCode) return
    const player = usePlayerStore.getState()
    if (action === "next") player.next()
    else if (action === "prev") player.prev()
})
