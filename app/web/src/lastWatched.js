// Bucket-based shuffle that deprioritises recently-watched videos.
// Mirrors the algorithm from the old mtv coffeescript play.coffee.
//
// Videos are sorted into time buckets by how long ago they were last played,
// each bucket is shuffled independently, then the buckets are concatenated
// oldest-first so unplayed / long-unseen videos appear near the front and
// recently-played videos are pushed to the back.

const LS_KEY = "mtv:lastwatched"

// Each bucket catches videos whose "seconds since last watched" is less than
// `since`. The final { since: 0 } entry is the never-watched catchall.
const TIME_BUCKETS = [
    { since: 1200 },       // < 20 min ago
    { since: 3600 },       // < 1 hour ago
    { since: 10800 },      // < 3 hours ago
    { since: 28800 },      // < 8 hours ago
    { since: 86400 },      // < 1 day ago
    { since: 259200 },     // < 3 days ago
    { since: 604800 },     // < 1 week ago
    { since: 2419200 },    // < 4 weeks ago
    { since: 31536000 },   // < 1 year ago
    { since: 315360000 },  // < 10 years ago
    { since: 3153600000 }, // < 100 years ago
    { since: 0 },          // never watched (catchall)
]

// A "since" value that falls past every real threshold, so never-watched
// videos reach the catchall bucket rather than the largest time bucket.
const NEVER_WATCHED_SINCE = TIME_BUCKETS[TIME_BUCKETS.length - 2].since + 1

// In-memory map, mirrored to localStorage.
let lastWatched = {}
try {
    const raw = localStorage.getItem(LS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        lastWatched = parsed
    }
} catch (_e) {}

const persist = () => {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(lastWatched))
    } catch (_e) {}
}

// Call this when playback of a video begins.
export const recordWatched = (videoId) => {
    lastWatched[videoId] = Math.floor(Date.now() / 1000)
    persist()
}

// Wipe the entire watch history (e.g. from account settings).
export const clearWatchHistory = () => {
    lastWatched = {}
    persist()
}

const fisherYates = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
}

// Shuffle `videos` using watch-history buckets.
// Returns a new array; does not mutate the input.
export const bucketShuffle = (videos) => {
    const now = Math.floor(Date.now() / 1000)
    const buckets = TIME_BUCKETS.map((tb) => ({ since: tb.since, list: [] }))

    for (const v of videos) {
        const watchedAt = lastWatched[v.id]
        const since = watchedAt != null ? now - watchedAt : NEVER_WATCHED_SINCE

        for (const bucket of buckets) {
            if (bucket.since === 0) {
                // Catchall — never watched, or outlived every threshold
                bucket.list.push(v)
                break
            }
            if (since < bucket.since) {
                bucket.list.push(v)
                break
            }
        }
    }

    // Reverse so never-watched comes first, most-recently-watched comes last
    buckets.reverse()

    const result = []
    for (const bucket of buckets) {
        fisherYates(bucket.list)
        result.push(...bucket.list)
    }
    return result
}
