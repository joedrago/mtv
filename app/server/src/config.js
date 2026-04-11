import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(__dirname, "..", "..", "..")

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"))

const configPath = path.join(repoRoot, "config", "config.json")

if (!fs.existsSync(configPath)) {
    console.error(`missing config: ${configPath}`)
    console.error(`copy config/config.example.json and fill it in`)
    process.exit(1)
}

export const config = readJson(configPath)

// Backwards compat: merge legacy secrets.json if still present
const secretsPath = path.join(repoRoot, "config", "secrets.json")
if (fs.existsSync(secretsPath)) {
    console.warn("config: secrets.json is deprecated — merge its contents into config.json and delete it")
    Object.assign(config, readJson(secretsPath))
}

// secrets is an alias for config — all fields now live in one file
export const secrets = config

export const dbPath = path.resolve(repoRoot, config.database ?? "./data/mtv.sqlite")
export const mediaDir = path.resolve(repoRoot, config.mediaDir ?? "./data/videos")
export const webDistDir = path.join(repoRoot, "app", "web", "dist")
