const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const cleanLine = (s) => (s ?? "").replace(/^\s+|\s+$/g, "")

export const buildChyron = (video, owner, { mode = null } = {}) => {
    const lines = []
    const artist = cleanLine(video.artist)
    const title = cleanLine(video.title)
    if (artist) lines.push(artist)
    if (title) lines.push(`\u201C${title}\u201D`)

    const label = owner?.label || (owner?.display_name ? `${capitalize(owner.display_name)} Records` : null)
    if (label) lines.push(label)

    if (mode === "solo") lines.push("Solo Mode")
    else if (mode === "mirror") lines.push("Mirror Mode")

    return lines
}
