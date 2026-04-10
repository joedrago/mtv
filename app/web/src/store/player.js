import { create } from "zustand"

export const usePlayerStore = create((set, get) => ({
    queue: [], // array of video objects
    index: 0,
    isOpen: false,
    paused: false,
    playlistName: null,

    openQueue: (items, { playlistName = null, startAt = 0 } = {}) => {
        if (!items?.length) return
        set({
            queue: items,
            index: Math.max(0, Math.min(startAt, items.length - 1)),
            isOpen: true,
            paused: false,
            playlistName
        })
    },

    close: () => set({ isOpen: false, paused: false }),

    next: () => {
        const { queue, index } = get()
        if (index + 1 >= queue.length) {
            set({ isOpen: false })
            return
        }
        set({ index: index + 1, paused: false })
    },

    prev: () => {
        const { index } = get()
        if (index <= 0) return
        set({ index: index - 1, paused: false })
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
