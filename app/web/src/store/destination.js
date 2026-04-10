import { create } from "zustand"
import { fetchJson } from "../api.js"

// Tracks the user's currently-selected "add to playlist" destination plus
// a cache of their own playlists. Persisted across page navigation in memory
// (intentionally not localStorage — fresh per session is what you want).
export const useDestinationStore = create((set) => ({
    destinationId: null,
    myPlaylists: [],

    setDestinationId: (id) => set({ destinationId: id || null }),

    loadMyPlaylists: async (displayName) => {
        if (!displayName) {
            set({ myPlaylists: [] })
            return
        }
        try {
            const d = await fetchJson("/api/playlists")
            set({ myPlaylists: d.playlists.filter((p) => p.owner === displayName) })
        } catch (_e) {
            set({ myPlaylists: [] })
        }
    },

    addPlaylist: (playlist) =>
        set((s) => {
            if (s.myPlaylists.some((p) => p.id === playlist.id)) return {}
            return { myPlaylists: [...s.myPlaylists, playlist] }
        }),

    removePlaylist: (id) =>
        set((s) => ({
            myPlaylists: s.myPlaylists.filter((p) => p.id !== id),
            destinationId: s.destinationId === id ? null : s.destinationId
        }))
}))
