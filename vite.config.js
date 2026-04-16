import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
    root: path.resolve(import.meta.dirname, "app/web"),
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000",
            "/auth": "http://localhost:3000",
            "/videos": "http://localhost:3000",
            "/socket.io": { target: "http://localhost:3000", ws: true }
        }
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000
    }
})
