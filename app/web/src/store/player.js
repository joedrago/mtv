import { create } from "zustand"

const VOLUME_KEY = "mtv_volume"
const SHOW_QUEUE_KEY = "mtv_show_queue"

const loadInitialVolume = () => {
    try {
        const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "")
        if (Number.isFinite(v) && v >= 0 && v <= 1) return v
    } catch (_e) {
        /* localStorage blocked */
    }
    return 1.0
}

const loadInitialShowQueue = () => {
    try {
        return localStorage.getItem(SHOW_QUEUE_KEY) === "1"
    } catch (_e) {
        return false
    }
}

export const usePlayerStore = create((set, get) => ({
    queue: [], // array of video objects
    index: 0,
    isOpen: false,
    paused: false,
    playlistName: null,
    isMirror: false, // true = we're watching someone else's mirror
    initialPosition: 0, // seconds to seek to when the current surface becomes ready
    volume: loadInitialVolume(), // 0..1
    showQueue: loadInitialShowQueue(), // right-stripe queue panel toggle (persisted)

    toggleShowQueue: () => {
        set((s) => {
            const next = !s.showQueue
            try {
                localStorage.setItem(SHOW_QUEUE_KEY, next ? "1" : "0")
            } catch (_e) {
                /* ignore */
            }
            return { showQueue: next }
        })
    },

    setVolume: (v) => {
        const clamped = Math.max(0, Math.min(1, v))
        try {
            localStorage.setItem(VOLUME_KEY, String(clamped))
        } catch (_e) {
            /* ignore */
        }
        set({ volume: clamped })
    },

    setPaused: (p) => set({ paused: !!p }),

    openQueue: (items, { playlistName = null, startAt = 0, isMirror = false, initialPosition = 0 } = {}) => {
        if (!items?.length) return
        set({
            queue: items,
            index: Math.max(0, Math.min(startAt, items.length - 1)),
            isOpen: true,
            paused: false,
            playlistName,
            isMirror,
            initialPosition
        })
    },

    replaceMirrorVideo: (video, { initialPosition = 0, paused = false } = {}) => {
        if (!video) {
            set({ queue: [], isOpen: false })
            return
        }
        set({ queue: [video], index: 0, paused, initialPosition })
    },

    close: () => set({ isOpen: false, paused: false, isMirror: false, initialPosition: 0 }),

    next: () => {
        const { queue, index } = get()
        if (index + 1 >= queue.length) {
            set({ isOpen: false })
            return
        }
        set({ index: index + 1, paused: false, initialPosition: 0 })
    },

    prev: () => {
        const { index } = get()
        if (index <= 0) return
        set({ index: index - 1, paused: false, initialPosition: 0 })
    },

    jumpTo: (i) => {
        const { queue, index } = get()
        if (!queue.length) return
        const target = Math.max(0, Math.min(i, queue.length - 1))
        if (target === index) return
        set({ index: target, paused: false, initialPosition: 0 })
    },

    togglePause: () => set((s) => ({ paused: !s.paused })),

    setOpinionForCurrent: (value) => {
        set((s) => {
            const q = s.queue.slice()
            if (!q[s.index]) return {}
            q[s.index] = { ...q[s.index], my_opinion: value }
            return { queue: q }
        })
    },

    current: () => {
        const { queue, index } = get()
        return queue[index] ?? null
    }
}))
