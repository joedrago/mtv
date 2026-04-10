export const fetchJson = async (url, opts) => {
    const res = await fetch(url, { credentials: "same-origin", ...opts })
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    return res.json()
}

const jsonOpts = (method, body) => ({
    method,
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
})

export const createVideo = (video) => fetchJson("/api/videos", jsonOpts("POST", video))

export const queryYoutube = (input) => fetchJson("/api/videos/query-youtube", jsonOpts("POST", { input }))

export const updateVideo = (id, patch) => fetchJson(`/api/videos/${id}`, jsonOpts("PATCH", patch))

export const updateMe = (patch) => fetchJson("/api/me", jsonOpts("PATCH", patch))

export const fetchMyStats = () => fetchJson("/api/me/stats")

export const fetchAllUsers = () => fetchJson("/api/users")

export const updateUserContributor = (id, is_contributor) => fetchJson(`/api/users/${id}`, jsonOpts("PATCH", { is_contributor }))

export const createPlaylist = (name, is_public = true) => fetchJson("/api/playlists", jsonOpts("POST", { name, is_public }))

export const updatePlaylist = (id, patch) => fetchJson(`/api/playlists/${id}`, jsonOpts("PATCH", patch))

export const deletePlaylist = (id) => fetchJson(`/api/playlists/${id}`, { method: "DELETE", credentials: "same-origin" })

export const addToPlaylist = (playlistId, videoId) =>
    fetchJson(`/api/playlists/${playlistId}/items`, jsonOpts("POST", { video_id: videoId }))

export const addToPlaylistBulk = (playlistId, videoIds) =>
    fetchJson(`/api/playlists/${playlistId}/items/bulk`, jsonOpts("POST", { video_ids: videoIds }))

export const removeFromPlaylist = (playlistId, videoId) =>
    fetchJson(`/api/playlists/${playlistId}/items/${videoId}`, { method: "DELETE", credentials: "same-origin" })

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
