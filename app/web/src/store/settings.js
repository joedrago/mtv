import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useSettingsStore = create(
    persist(
        (set) => ({
            quickRating: false,
            setQuickRating: (v) => set({ quickRating: v }),
        }),
        { name: "mtv-settings" }
    )
)
