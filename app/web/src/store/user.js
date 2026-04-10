import { create } from "zustand"
import { fetchJson } from "../api.js"

export const useUserStore = create((set) => ({
    user: null,
    loaded: false,

    load: async () => {
        try {
            const d = await fetchJson("/api/me")
            set({ user: d.user, loaded: true })
        } catch (_e) {
            set({ user: null, loaded: true })
        }
    },

    setUser: (user) => set({ user }),

    signOut: async () => {
        try {
            await fetch("/auth/logout", { method: "POST", credentials: "same-origin" })
        } catch (_e) {
            /* ignore */
        }
        set({ user: null })
    }
}))
