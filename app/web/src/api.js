export const fetchJson = async (url, opts) => {
    const res = await fetch(url, { credentials: "same-origin", ...opts })
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    return res.json()
}

export const setOpinion = async (videoId, value) => {
    try {
        if (value == null) {
            await fetch(`/api/opinions/${videoId}`, { method: "DELETE", credentials: "same-origin" })
        } else {
            await fetch(`/api/opinions/${videoId}`, {
                method: "POST",
                credentials: "same-origin",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ value })
            })
        }
    } catch (_e) {
        // swallow; callers update UI optimistically
    }
}
