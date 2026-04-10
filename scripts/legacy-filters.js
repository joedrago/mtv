// Direct port of src/filters.coffee from the old tree. Run ONCE at import time
// to flatten each saved filterString into an ordered list of video ids, then
// this file dies along with the filter concept.
//
// Differences from the original:
//   - No remote fetch; callers pass in the full video map, opinions index, and
//     a nickname→tag resolver up front.
//   - `parseDuration` is a small inline ISO-8601 duration parser (days-based
//     approximation) instead of pulling in the iso8601-duration dep.
//   - Returns { entries, ordered, unlisted, unknownCommands } so the caller
//     can report on fidelity and promote unlisted refs to real video rows.

const SECONDS_PER_DAY = 86400
const APPROX = { Y: 365.25, M: 30, W: 7, D: 1 }

const parseIsoDuration = (s) => {
    const match =
        /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
            s.trim()
        )
    if (!match) return NaN
    const [, y, mo, w, d, h, mi, se] = match.map((v) => (v === undefined ? 0 : Number(v)))
    const days = y * APPROX.Y + mo * APPROX.M + w * APPROX.W + d * APPROX.D
    return days * SECONDS_PER_DAY + h * 3600 + mi * 60 + se
}

const now = () => Math.floor(Date.now() / 1000)

// videoMap: { [legacyId]: videoEntry }   (entries mutated with allowed/skipped flags — copies are made)
// opinions: { [legacyId]: { [tag]: opinionString } }
// resolveTag: (nickname) => legacyTag | null
export const generateList = (videoMap, filterString, { opinions, resolveTag, sortByArtist = true } = {}) => {
    const db = {}
    for (const [id, v] of Object.entries(videoMap)) db[id] = { ...v, allowed: false, skipped: false }

    let ordered = false
    const unknownCommands = []
    const unlisted = {}

    const rawFilters = (filterString || "").split(/\r?\n/)
    const filters = []
    for (const raw of rawFilters) {
        const trimmed = raw.trim()
        if (trimmed.length === 0) continue
        if (trimmed.startsWith("#")) continue // treat '# ...' lines as comments
        filters.push(trimmed)
    }

    if (filters.length === 0) {
        // No filters → whole library
        return { entries: Object.values(db), ordered: false, unlisted: {}, unknownCommands: [] }
    }

    // Clear flags when a filter file is present.
    for (const id of Object.keys(db)) {
        db[id].allowed = false
        db[id].skipped = false
    }

    let allAllowed = true

    for (const filter of filters) {
        let pieces = filter.split(/ +/)
        if (pieces[0] === "private") continue
        if (pieces[0] === "ordered") {
            ordered = true
            continue
        }

        let property = "allowed"
        let negated = false
        if (pieces[0] === "skip") {
            property = "skipped"
            pieces.shift()
        } else if (pieces[0] === "and") {
            property = "skipped"
            negated = !negated
            pieces.shift()
        }
        if (pieces.length === 0) continue
        if (property === "allowed") allAllowed = false

        let substring = pieces.slice(1).join(" ")
        let idLookup = null
        let filterFunc = null

        const bangMatch = /^!(.+)$/.exec(pieces[0])
        if (bangMatch) {
            negated = !negated
            pieces[0] = bangMatch[1]
        }

        const command = pieces[0].toLowerCase()
        switch (command) {
            case "artist":
            case "band":
                substring = substring.toLowerCase()
                filterFunc = (e, s) => e.artist.toLowerCase().indexOf(s) !== -1
                break
            case "title":
            case "song":
                substring = substring.toLowerCase()
                filterFunc = (e, s) => e.title.toLowerCase().indexOf(s) !== -1
                break
            case "added":
                filterFunc = (e, s) => e.nickname === s
                break
            case "untagged":
                filterFunc = (e) => Object.keys(e.tags || {}).length === 0
                break
            case "tag":
                substring = substring.toLowerCase()
                filterFunc = (e, s) => (e.tags || {})[s] === true
                break
            case "recent":
            case "since": {
                const durationSeconds = parseIsoDuration(substring)
                if (Number.isNaN(durationSeconds)) {
                    unknownCommands.push(`bad duration: ${filter}`)
                    continue
                }
                const since = now() - durationSeconds
                filterFunc = (e) => e.added > since
                break
            }
            case "love":
            case "like":
            case "meh":
            case "bleh":
            case "hate": {
                const wanted = command
                const tag = resolveTag ? resolveTag(substring) : substring
                filterFunc = (e) => opinions?.[e.id]?.[tag] === wanted
                break
            }
            case "none": {
                const tag = resolveTag ? resolveTag(substring) : substring
                filterFunc = (e) => opinions?.[e.id]?.[tag] === undefined
                break
            }
            case "full":
                substring = substring.toLowerCase()
                filterFunc = (e, s) => `${e.artist.toLowerCase()} - ${e.title.toLowerCase()}`.indexOf(s) !== -1
                break
            case "id":
            case "ids": {
                idLookup = {}
                for (const id of pieces.slice(1)) {
                    if (id.startsWith("#")) break
                    idLookup[id] = true
                }
                filterFunc = (e) => idLookup[e.id]
                break
            }
            case "un":
            case "ul":
            case "unlisted": {
                idLookup = {}
                for (let id of pieces.slice(1)) {
                    if (id.startsWith("#")) break
                    if (!id.startsWith("youtube_") && !id.startsWith("mtv_")) id = `youtube_${id}`
                    const pipeSplit = id.split("|")
                    id = pipeSplit.shift()
                    let start = -1
                    let end = -1
                    if (pipeSplit.length > 0) start = parseInt(pipeSplit.shift(), 10)
                    if (pipeSplit.length > 0) end = parseInt(pipeSplit.shift(), 10)
                    let title = id
                    const ytMatch = /^youtube_(.+)/.exec(title)
                    const mtvMatch = /^mtv_(.+)/.exec(title)
                    if (ytMatch) title = ytMatch[1]
                    else if (mtvMatch) title = mtvMatch[1]
                    unlisted[id] = {
                        id,
                        artist: "Unlisted Videos",
                        title,
                        tags: {},
                        nickname: "Unlisted",
                        company: "Unlisted",
                        thumb: "unlisted.png",
                        start,
                        end,
                        unlisted: true
                    }
                    if (db[id]) db[id].skipped = true
                }
                continue
            }
            default:
                unknownCommands.push(filter)
                continue
        }

        if (idLookup) {
            for (const id of Object.keys(idLookup)) {
                const e = db[id]
                if (!e) continue
                let isMatch = true
                if (negated) isMatch = !isMatch
                if (isMatch) e[property] = true
            }
        } else {
            for (const e of Object.values(db)) {
                let isMatch = filterFunc(e, substring)
                if (negated) isMatch = !isMatch
                if (isMatch) e[property] = true
            }
        }
    }

    const result = []
    for (const e of Object.values(db)) {
        if ((e.allowed || allAllowed) && !e.skipped) result.push(e)
    }
    for (const u of Object.values(unlisted)) result.push(u)

    if (sortByArtist && !ordered) {
        result.sort((a, b) => {
            const aa = a.artist.toLowerCase()
            const ba = b.artist.toLowerCase()
            if (aa < ba) return -1
            if (aa > ba) return 1
            const at = a.title.toLowerCase()
            const bt = b.title.toLowerCase()
            if (at < bt) return -1
            if (at > bt) return 1
            return 0
        })
    }

    return { entries: result, ordered, unlisted, unknownCommands }
}
