export const parseLegacyId = (legacyId) => {
    const match = /^([a-z]+)_(.+)$/.exec(legacyId)
    if (!match) return null
    const [, prefix, ref] = match
    if (prefix === "youtube") return { source: "youtube", ref }
    if (prefix === "mtv") return { source: "self", ref }
    return null
}

export const toLegacyId = (source, ref) => {
    if (source === "youtube") return `youtube_${ref}`
    if (source === "self") return `mtv_${ref}`
    return null
}

export const videoUrl = (video) => {
    if (video.source === "youtube") return `https://youtu.be/${video.source_ref}`
    if (video.source === "self") return `/videos/${video.source_ref}.mp4`
    return null
}
