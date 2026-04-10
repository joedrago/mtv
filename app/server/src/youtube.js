// YouTube helpers:
//   - fetchYoutubeMetadata: wraps the YouTube Data API v3 videos.list endpoint
//   - parseYoutubeInput:    accepts a raw id OR any YouTube URL, pulls the id
//                            and any t/start/end trim parameters
//   - splitArtistTitle:     the old coffeescript splitArtist() logic that
//                            guesses an artist/title from a video's raw title

// -- time helpers ported from the old getLetterTime / getColonTime / getTime -

const parseLetterTime = (s) => {
    const values = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 }
    const expanded = s.replace(/([smhdw])/g, " $1 ").trim()
    const parts = expanded.split(/\s+/)
    let total = 0
    for (let i = 0; i < parts.length; i += 2) {
        const n = parseInt(parts[i], 10)
        const unit = parts[i + 1] || "s"
        if (!Number.isFinite(n)) return 0
        total += n * (values[unit] ?? 1)
    }
    return total
}

const parseColonTime = (s) => {
    const parts = s.split(":").map((p) => parseInt(p, 10))
    const weights = [1, 60, 3600, 86400, 604800]
    let total = 0
    for (let i = 0; i < parts.length; i++) {
        if (!Number.isFinite(parts[i])) return 0
        total += parts[i] * weights[parts.length - i - 1]
    }
    return total
}

const parseTimeString = (s) => {
    if (!s) return 0
    if (/^(\d+[smhdw]?)+$/.test(s)) return parseLetterTime(s)
    if (/^(\d+:?)+$/.test(s)) return parseColonTime(s)
    return 0
}

// Accepts a bare 11-char id or any YouTube URL. Returns
// { source_ref, start_s, end_s } or null.
export const parseYoutubeInput = (input) => {
    const raw = String(input ?? "").trim()
    if (!raw) return null

    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
        return { source_ref: raw, start_s: -1, end_s: -1 }
    }

    let url
    try {
        url = new URL(raw)
    } catch (_e) {
        return null
    }

    let ref = null
    if (url.hostname.endsWith("youtu.be")) {
        ref = url.pathname.replace(/^\//, "").split("/")[0]
    } else if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
        ref = url.searchParams.get("v")
        if (!ref) {
            const m = url.pathname.match(/^\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/)
            if (m) ref = m[1]
        }
    }
    if (!ref || !/^[A-Za-z0-9_-]{11}$/.test(ref)) return null

    let start = -1
    let end = -1
    const t = url.searchParams.get("t") ?? url.searchParams.get("start")
    if (t) {
        const v = parseTimeString(t)
        if (v > 0) start = v
    }
    const eParam = url.searchParams.get("end")
    if (eParam) {
        const v = parseTimeString(eParam)
        if (v > 0) end = v
    }

    return { source_ref: ref, start_s: start, end_s: end }
}

// Port of the old coffeescript splitArtist() heuristic. Takes a raw YouTube
// title and returns a guessed { artist, title }.
export const splitArtistTitle = (rawTitle) => {
    let artist = "Unknown"
    let title = String(rawTitle ?? "")
    let m

    if ((m = title.match(/^(.+)\s[–-]\s(.+)$/))) {
        artist = m[1]
        title = m[2]
    } else if ((m = title.match(/^([^"]+)\s"([^"]+)"/))) {
        artist = m[1]
        title = m[2]
    }

    title = title.replace(/[([](Official)?\s?(HD)?\s?(Music)?\sVideo[)\]]/i, "")
    title = title.trim()
    if (/^".+"$/.test(title)) {
        title = title.replace(/^"/, "").replace(/"$/, "")
    }

    if ((m = title.match(/^(.+)\s+\(f(?:ea)?t\. (.+)\)$/i))) {
        title = m[1]
        artist += ` ft. ${m[2]}`
    } else if ((m = title.match(/^(.+)\s+f(?:ea)?t\. (.+)$/i))) {
        title = m[1]
        artist += ` ft. ${m[2]}`
    }

    if ((m = artist.match(/^(.+)\s+\(with ([^)]+)\)$/))) {
        artist = `${m[1]} ft. ${m[2]}`
    }

    return { artist: artist.trim(), title: title.trim() }
}

// -- iso8601 duration (PT#H#M#S) -----------------------------------

const parseIsoSeconds = (s) => {
    if (typeof s !== "string") return null
    const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(s)
    if (!m) return null
    const [, h, mi, se] = m
    return (Number(h) || 0) * 3600 + (Number(mi) || 0) * 60 + (Number(se) || 0)
}

export const fetchYoutubeMetadata = async (videoId, apiKey) => {
    if (!apiKey) throw new Error("no youtube api key configured")
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`youtube api: HTTP ${res.status}`)
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) throw new Error("video not found on youtube")

    const duration_s = parseIsoSeconds(item.contentDetails?.duration)
    const title = item.snippet?.title ?? null
    const thumbs = item.snippet?.thumbnails ?? {}
    const thumb = thumbs.medium?.url ?? thumbs.default?.url ?? thumbs.high?.url ?? null
    return { duration_s, title, thumb }
}
