import Database from "better-sqlite3"
import fs from "node:fs"
import { dbPath } from "./config.js"

if (!fs.existsSync(dbPath)) {
    console.error(`missing database: ${dbPath}`)
    console.error(`run \`npm run import\` first`)
    process.exit(1)
}

export const db = new Database(dbPath)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")
