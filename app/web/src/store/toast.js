import { create } from "zustand"

export const useToastStore = create((set) => ({
    current: null, // { message, key }

    show: (message) => set({ current: { message, key: Date.now() + Math.random() } }),

    clear: () => set({ current: null })
}))
