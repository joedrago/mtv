import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { createVideo, queryYoutube } from "../api.js"
import { useToastStore } from "../store/toast.js"
import { useUserStore } from "../store/user.js"
import { fmtDuration } from "../components/videoColumns.jsx"

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
                    onChange={(e) => setArtist(e.target.value)}
                    fullWidth
                    disabled={!queried}
                />
                <TextField
                    size="small"
                    label="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                <TextField size="small" label="artist" value={artist} onChange={(e) => setArtist(e.target.value)} fullWidth />
                <TextField size="small" label="title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
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
                    <Tab label="self-hosted" />
                </Tabs>
                {tab === 0 ? <YoutubeTab /> : <SelfHostedTab />}
            </Paper>
        </Stack>
    )
}
