import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(__dirname, "..", "..", "..")

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"))

const configPath = path.join(repoRoot, "config", "config.json")
const secretsPath = path.join(repoRoot, "config", "secrets.json")

if (!fs.existsSync(configPath)) {
    console.error(`missing config: ${configPath}`)
    console.error(`copy config/config.example.json and fill it in`)
    process.exit(1)
}
if (!fs.existsSync(secretsPath)) {
    console.error(`missing secrets: ${secretsPath}`)
    console.error(`copy config/secrets.example.json and fill it in`)
    process.exit(1)
}

export const config = readJson(configPath)
export const secrets = readJson(secretsPath)

export const dbPath = path.resolve(repoRoot, config.database ?? "./data/mtv.sqlite")
export const mediaDir = path.resolve(repoRoot, config.mediaDir ?? "./data/videos")
export const webDistDir = path.join(repoRoot, "app", "web", "dist")
