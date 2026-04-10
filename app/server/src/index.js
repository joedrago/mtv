import express from "express"
import cookieParser from "cookie-parser"
import http from "node:http"
import fs from "node:fs"
import { Server as IOServer } from "socket.io"
import { config, secrets, mediaDir, webDistDir } from "./config.js"
import { authRouter } from "./auth.js"
import { apiRouter } from "./routes.js"
import { attachMirror } from "./mirror.js"

const app = express()
app.use(express.json())
app.use(cookieParser(secrets.sessionSecret))

app.use("/auth", authRouter)
app.use("/api", apiRouter)

if (fs.existsSync(mediaDir)) {
    app.use("/videos", express.static(mediaDir, { fallthrough: true, maxAge: "7d" }))
}

if (fs.existsSync(webDistDir)) {
    app.use(express.static(webDistDir))
    app.get("*", (_req, res) => res.sendFile(`${webDistDir}/index.html`))
} else {
    app.get("/", (_req, res) => {
        res.type("text/plain").send("mtv server running. Start the web dev server with `npm run web` (or just `npm run dev`).")
    })
}

const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: true, credentials: true } })

attachMirror(io)

const port = config.port ?? 3000
server.listen(port, () => {
    console.log(`mtv server listening on http://localhost:${port}`)
})
