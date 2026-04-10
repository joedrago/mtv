export const fetchJson = async (url, opts) => {
    const res = await fetch(url, { credentials: "same-origin", ...opts })
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    return res.json()
}
