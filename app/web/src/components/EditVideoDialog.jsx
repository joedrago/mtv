import { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { updateVideo } from "../api.js"
import { fmtDuration } from "./videoColumns.jsx"

// Clamp a form value the way the server does: non-numeric or <=0 becomes -1.
const normalizeSeconds = (s) => {
    if (s == null || String(s).trim() === "" || String(s).trim() === "-1") return -1
    const n = Number(s)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : -1
}

const computeEffective = (rawDuration, startS, endS) => {
    if (!Number.isFinite(rawDuration) || rawDuration <= 0) return null
    const start = startS > 0 ? Math.min(startS, rawDuration) : 0
    const end = endS > 0 ? Math.min(endS, rawDuration) : rawDuration
    return Math.max(0, end - start)
}

export const EditVideoDialog = ({ video, open, onClose, onSaved }) => {
    const [artist, setArtist] = useState("")
    const [title, setTitle] = useState("")
    const [startS, setStartS] = useState("")
    const [endS, setEndS] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!video) return
        setArtist(video.artist ?? "")
        setTitle(video.title ?? "")
        setStartS(video.start_s > 0 ? String(video.start_s) : "")
        setEndS(video.end_s > 0 ? String(video.end_s) : "")
        setError(null)
    }, [video])

    const save = async () => {
        if (!video) return
        setBusy(true)
        setError(null)
        const startNum = normalizeSeconds(startS)
        const endNum = normalizeSeconds(endS)
        const patch = {
            artist: artist.trim(),
            title: title.trim(),
            start_s: startNum,
            end_s: endNum
        }
        try {
            await updateVideo(video.id, patch)
            onSaved?.({ ...video, ...patch })
            onClose()
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setBusy(false)
        }
    }

    const rawDuration = video?.duration_s
    const startNum = normalizeSeconds(startS)
    const endNum = normalizeSeconds(endS)
    const effective = computeEffective(rawDuration, startNum, endNum)
    const trimmed = effective != null && rawDuration != null && effective !== rawDuration
    const durationLabel =
        effective == null
            ? "—"
            : trimmed
              ? `${fmtDuration(effective)}  (full: ${fmtDuration(rawDuration)})`
              : fmtDuration(rawDuration)

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>edit video</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            size="small"
                            label="artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            size="small"
                            label="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
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
                        />
                        <TextField
                            size="small"
                            label="end (seconds)"
                            value={endS}
                            onChange={(e) => setEndS(e.target.value)}
                            sx={{ width: 160 }}
                            placeholder="—"
                        />
                        <TextField
                            size="small"
                            label="duration"
                            value={durationLabel}
                            InputProps={{ readOnly: true }}
                            sx={{ flexGrow: 1 }}
                        />
                    </Stack>
                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    cancel
                </Button>
                <Button variant="contained" onClick={save} disabled={busy || !artist.trim() || !title.trim()}>
                    save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
