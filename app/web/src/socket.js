import { io } from "socket.io-client"

// Single shared socket instance for the app. Vite dev-server proxies /socket.io
// to the express port so this works uniformly in dev and prod.
export const socket = io({ autoConnect: true, transports: ["websocket", "polling"] })
