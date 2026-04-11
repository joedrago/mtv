import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import DeleteIcon from "@mui/icons-material/Delete"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { createVideo, queryYoutube, queryYoutubePlaylist } from "../api.js"
import { useToastStore } from "../store/toast.js"
import { useUserStore } from "../store/user.js"
import { fmtDuration } from "../components/videoColumns.jsx"
import { LIMITS } from "../limits.js"

const parseOptionalSeconds = (s) => {
    if (s == null || String(s).trim() === "" || String(s).trim() === "-1") return -1
    const n = Number(s)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : -1
}

// Effective playback length given a raw video duration and trim points.
const computeEffective = (rawDuration, startS, endS) => {
    if (!Number.isFinite(rawDuration) || rawDuration <= 0) return null
    const start = startS > 0 ? Math.min(startS, rawDuration) : 0
    const end = endS > 0 ? Math.min(endS, rawDuration) : rawDuration
    return Math.max(0, end - start)
}

const YoutubeTab = () => {
    const showToast = useToastStore((s) => s.show)
    const navigate = useNavigate()

    const [input, setInput] = useState("")
    const [querying, setQuerying] = useState(false)
    const [error, setError] = useState(null)

    // populated after a successful query
    const [sourceRef, setSourceRef] = useState(null)
    const [rawDuration, setRawDuration] = useState(null)
    const [artist, setArtist] = useState("")
    const [title, setTitle] = useState("")
    const [startS, setStartS] = useState("")
    const [endS, setEndS] = useState("")
    const [busy, setBusy] = useState(false)

    const queried = !!sourceRef

    const reset = () => {
        setInput("")
        setSourceRef(null)
        setRawDuration(null)
        setArtist("")
        setTitle("")
        setStartS("")
        setEndS("")
        setError(null)
    }

    const runQuery = async () => {
        if (!input.trim() || querying) return
        setQuerying(true)
        setError(null)
        try {
            const r = await queryYoutube(input.trim())
            setSourceRef(r.source_ref)
            setInput(r.source_ref)
            setRawDuration(r.duration_s)
            setArtist(r.artist ?? "")
            setTitle(r.title ?? "")
            setStartS(r.start_s > 0 ? String(r.start_s) : "")
            setEndS(r.end_s > 0 ? String(r.end_s) : "")
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setQuerying(false)
        }
    }

    const submit = async () => {
        if (!queried || busy) return
        if (!artist.trim() || !title.trim()) {
            setError("artist and title are required")
            return
        }
        setBusy(true)
        setError(null)
        try {
            await createVideo({
                source: "youtube",
                source_ref: sourceRef,
                artist: artist.trim(),
                title: title.trim(),
                start_s: parseOptionalSeconds(startS),
                end_s: parseOptionalSeconds(endS),
                duration_s: rawDuration
            })
            showToast(`added ${artist.trim()} — ${title.trim()}`)
            reset()
            navigate(`/browse?q=${encodeURIComponent(title.trim())}`)
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setBusy(false)
        }
    }

    const startNum = parseOptionalSeconds(startS)
    const endNum = parseOptionalSeconds(endS)
    const effective = computeEffective(rawDuration, startNum, endNum)
    const trimmed = effective != null && rawDuration != null && effective !== rawDuration
    const durationLabel =
        effective == null
            ? "—"
            : trimmed
              ? `${fmtDuration(effective)}  (full: ${fmtDuration(rawDuration)})`
              : fmtDuration(rawDuration)

    return (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                    size="small"
                    label="youtube URL or video id"
                    placeholder="https://youtu.be/dQw4w9WgXcQ"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") runQuery()
                    }}
                    fullWidth
                    disabled={querying}
                    helperText="start/end in the URL's ?t= / ?end= will be picked up automatically"
                />
                <Button variant="contained" onClick={runQuery} disabled={!input.trim() || querying} sx={{ whiteSpace: "nowrap" }}>
                    {querying ? "querying…" : "query"}
                </Button>
                <Button onClick={reset} disabled={querying}>
                    reset
                </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value.slice(0, LIMITS.videoArtist))}
                    slotProps={{ htmlInput: { maxLength: LIMITS.videoArtist } }}
                    fullWidth
                    disabled={!queried}
                />
                <TextField
                    size="small"
                    label="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.videoTitle))}
                    slotProps={{ htmlInput: { maxLength: LIMITS.videoTitle } }}
                    fullWidth
                    disabled={!queried}
                />
            </Stack>

            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="start (seconds)"
                    value={startS}
                    onChange={(e) => setStartS(e.target.value)}
                    sx={{ width: 160 }}
                    placeholder="—"
                    disabled={!queried}
                />
                <TextField
                    size="small"
                    label="end (seconds)"
                    value={endS}
                    onChange={(e) => setEndS(e.target.value)}
                    sx={{ width: 160 }}
                    placeholder="—"
                    disabled={!queried}
                />
                <TextField
                    size="small"
                    label="duration"
                    value={durationLabel}
                    sx={{ width: 260 }}
                    InputProps={{ readOnly: true }}
                    disabled={!queried}
                />
            </Stack>

            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}

            <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={submit} disabled={!queried || busy || !artist.trim() || !title.trim()}>
                    {busy ? "adding…" : "add to library"}
                </Button>
            </Stack>
        </Stack>
    )
}

const SelfHostedTab = () => {
    const showToast = useToastStore((s) => s.show)
    const navigate = useNavigate()
    const [artist, setArtist] = useState("")
    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    const [startS, setStartS] = useState("")
    const [endS, setEndS] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState(null)

    const reset = () => {
        setArtist("")
        setTitle("")
        setUrl("")
        setStartS("")
        setEndS("")
        setError(null)
    }

    const submit = async () => {
        setError(null)
        if (!artist.trim() || !title.trim()) {
            setError("artist and title are required")
            return
        }
        if (!url.trim()) {
            setError("download URL is required")
            return
        }
        setBusy(true)
        try {
            await createVideo({
                source: "self",
                url: url.trim(),
                artist: artist.trim(),
                title: title.trim(),
                start_s: parseOptionalSeconds(startS),
                end_s: parseOptionalSeconds(endS)
            })
            showToast(`added ${artist.trim()} — ${title.trim()}`)
            reset()
            navigate(`/browse?q=${encodeURIComponent(title.trim())}`)
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value.slice(0, LIMITS.videoArtist))}
                    slotProps={{ htmlInput: { maxLength: LIMITS.videoArtist } }}
                    fullWidth
                />
                <TextField
                    size="small"
                    label="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.videoTitle))}
                    slotProps={{ htmlInput: { maxLength: LIMITS.videoTitle } }}
                    fullWidth
                />
            </Stack>
            <TextField
                size="small"
                label="download URL (direct to .mp4)"
                placeholder="https://example.com/video.mp4"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                helperText="server will download, run ffprobe for duration, and generate a thumbnail"
            />
            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="start (seconds)"
                    value={startS}
                    onChange={(e) => setStartS(e.target.value)}
                    sx={{ width: 200 }}
                    placeholder="—"
                />
                <TextField
                    size="small"
                    label="end (seconds)"
                    value={endS}
                    onChange={(e) => setEndS(e.target.value)}
                    sx={{ width: 200 }}
                    placeholder="—"
                />
            </Stack>
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    {busy ? "adding…" : "add to library"}
                </Button>
                <Button onClick={reset} disabled={busy}>
                    reset
                </Button>
            </Stack>
        </Stack>
    )
}

const PlaylistTab = () => {
    const showToast = useToastStore((s) => s.show)
    const [input, setInput] = useState("")
    const [querying, setQuerying] = useState(false)
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState(null)
    const [rows, setRows] = useState([])
    const [skipped, setSkipped] = useState(null)

    const runQuery = async () => {
        if (!input.trim() || querying) return
        setQuerying(true)
        setError(null)
        setRows([])
        setSkipped(null)
        try {
            const r = await queryYoutubePlaylist(input.trim())
            setSkipped(r.skipped)
            setRows(
                r.items.map((it, i) => ({
                    key: `${it.source_ref}-${i}`,
                    source_ref: it.source_ref,
                    raw_title: it.raw_title,
                    artist: it.artist ?? "",
                    title: it.title ?? "",
                    startS: "",
                    endS: "",
                    duration_s: it.duration_s,
                    thumb: it.thumb,
                    status: "pending",
                    error: null
                }))
            )
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setQuerying(false)
        }
    }

    const patchRow = (key, patch) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
    const dropRow = (key) => setRows((rs) => rs.filter((r) => r.key !== key))

    const addAll = async () => {
        if (adding) return
        setAdding(true)
        setError(null)
        let ok = 0
        let fail = 0
        // Walk rows sequentially so we don't hammer the server; also lets the
        // user watch progress fill in row by row.
        for (const row of rows) {
            if (row.status === "done") continue
            if (!row.artist.trim() || !row.title.trim()) {
                patchRow(row.key, { status: "error", error: "artist and title required" })
                fail++
                continue
            }
            patchRow(row.key, { status: "adding", error: null })
            try {
                await createVideo({
                    source: "youtube",
                    source_ref: row.source_ref,
                    artist: row.artist.trim(),
                    title: row.title.trim(),
                    start_s: parseOptionalSeconds(row.startS),
                    end_s: parseOptionalSeconds(row.endS),
                    duration_s: row.duration_s
                })
                patchRow(row.key, { status: "done" })
                ok++
            } catch (e) {
                patchRow(row.key, { status: "error", error: String(e?.message ?? e) })
                fail++
            }
        }
        setAdding(false)
        showToast(`added ${ok}${fail ? `, failed ${fail}` : ""}`)
    }

    const pendingCount = rows.filter((r) => r.status !== "done").length

    return (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                    size="small"
                    label="youtube / youtube music playlist URL"
                    placeholder="https://www.youtube.com/playlist?list=PL..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") runQuery()
                    }}
                    fullWidth
                    disabled={querying}
                />
                <Button variant="contained" onClick={runQuery} disabled={!input.trim() || querying} sx={{ whiteSpace: "nowrap" }}>
                    {querying ? "querying…" : "query"}
                </Button>
            </Stack>

            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}

            {skipped && (
                <Typography variant="body2" color="text.secondary">
                    {rows.length} ready
                    {skipped.audio_only > 0 && ` · ${skipped.audio_only} skipped (audio-only)`}
                    {skipped.unavailable > 0 && ` · ${skipped.unavailable} skipped (unavailable)`}
                    {skipped.already_in_library > 0 && ` · ${skipped.already_in_library} already in library`}
                </Typography>
            )}

            {rows.length > 0 && (
                <Stack spacing={1}>
                    {rows.map((row) => {
                        const done = row.status === "done"
                        const busy = row.status === "adding"
                        const errored = row.status === "error"
                        return (
                            <Paper
                                key={row.key}
                                variant="outlined"
                                sx={{
                                    p: 1,
                                    opacity: done ? 0.55 : 1,
                                    borderColor: errored ? "error.main" : undefined
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {row.thumb && (
                                        <Box
                                            component="img"
                                            src={row.thumb}
                                            alt=""
                                            sx={{ width: 80, height: 45, objectFit: "cover", borderRadius: 0.5, flexShrink: 0 }}
                                        />
                                    )}
                                    <TextField
                                        size="small"
                                        label="artist"
                                        value={row.artist}
                                        onChange={(e) => patchRow(row.key, { artist: e.target.value.slice(0, LIMITS.videoArtist) })}
                                        sx={{ flex: 1, minWidth: 160 }}
                                        disabled={busy || done}
                                    />
                                    <TextField
                                        size="small"
                                        label="title"
                                        value={row.title}
                                        onChange={(e) => patchRow(row.key, { title: e.target.value.slice(0, LIMITS.videoTitle) })}
                                        sx={{ flex: 2, minWidth: 200 }}
                                        disabled={busy || done}
                                    />
                                    <TextField
                                        size="small"
                                        label="start"
                                        value={row.startS}
                                        onChange={(e) => patchRow(row.key, { startS: e.target.value })}
                                        sx={{ width: 80 }}
                                        disabled={busy || done}
                                    />
                                    <TextField
                                        size="small"
                                        label="end"
                                        value={row.endS}
                                        onChange={(e) => patchRow(row.key, { endS: e.target.value })}
                                        sx={{ width: 80 }}
                                        disabled={busy || done}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ width: 48, textAlign: "right" }}>
                                        {row.duration_s ? fmtDuration(row.duration_s) : "—"}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        component={Link}
                                        href={`https://www.youtube.com/watch?v=${row.source_ref}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="open on youtube"
                                    >
                                        <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => dropRow(row.key)}
                                        disabled={busy}
                                        title="remove from list"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                                {errored && (
                                    <Typography variant="caption" color="error" sx={{ display: "block", pl: row.thumb ? 11 : 0, pt: 0.5 }}>
                                        {row.error}
                                    </Typography>
                                )}
                                {done && (
                                    <Typography variant="caption" color="success.main" sx={{ display: "block", pl: row.thumb ? 11 : 0, pt: 0.5 }}>
                                        added
                                    </Typography>
                                )}
                            </Paper>
                        )
                    })}

                    <Box sx={{ position: "sticky", bottom: 0, pt: 1, bgcolor: "background.default" }}>
                        <Button variant="contained" onClick={addAll} disabled={adding || pendingCount === 0}>
                            {adding ? "adding…" : `add ${pendingCount} to library`}
                        </Button>
                    </Box>
                </Stack>
            )}
        </Stack>
    )
}

export const ContributePage = () => {
    const user = useUserStore((s) => s.user)
    const loaded = useUserStore((s) => s.loaded)
    const [tab, setTab] = useState(0)

    if (loaded && (!user || !user.is_contributor)) {
        return (
            <Stack spacing={2}>
                <Typography color="error">contributors only.</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    home
                </Button>
            </Stack>
        )
    }
    if (!user) return <Typography color="text.secondary">loading…</Typography>

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    contribute
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    add a new video to the library.
                </Typography>
            </Box>

            <Paper variant="outlined">
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab label="youtube" />
                    <Tab label="playlist" />
                    <Tab label="self-hosted" />
                </Tabs>
                {tab === 0 && <YoutubeTab />}
                {tab === 1 && <PlaylistTab />}
                {tab === 2 && <SelfHostedTab />}
            </Paper>
        </Stack>
    )
}
