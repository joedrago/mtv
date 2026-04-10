import { useEffect, useRef, useState } from "react"
import { useParams, Link as RouterLink } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { useMirrorStore } from "../store/mirror.js"
import { usePlayerStore } from "../store/player.js"

export const MirrorPage = () => {
    const { code } = useParams()
    const [status, setStatus] = useState("idle") // idle, connecting, ok, notfound
    const viewerCode = useMirrorStore((s) => s.viewerCode)
    const sessionState = useMirrorStore((s) => s.sessionState)
    const joinViewer = useMirrorStore((s) => s.joinViewer)
    const leaveViewer = useMirrorStore((s) => s.leaveViewer)
    const openQueue = usePlayerStore((s) => s.openQueue)

    const openedRef = useRef(false)

    useEffect(() => () => leaveViewer(), [leaveViewer])

    // Initial "open the player" when we have a first video to show.
    // PlayerOverlay handles all subsequent state updates (video changes,
    // pause, drift correction) via its own effect on sessionState.
    useEffect(() => {
        if (status !== "ok" || openedRef.current) return
        const v = sessionState?.video
        if (!v) return
        openedRef.current = true
        const expected = sessionState.playing
            ? sessionState.pos + (Date.now() - sessionState.receivedAt) / 1000
            : sessionState.pos
        openQueue([v], {
            playlistName: `mirror ${code}`,
            isMirror: true,
            initialPosition: Math.max(0, expected)
        })
    }, [status, sessionState, code, openQueue])

    const join = async () => {
        setStatus("connecting")
        const ok = await joinViewer(code)
        setStatus(ok ? "ok" : "notfound")
    }

    const v = sessionState?.video

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    mirror {code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    watching what someone else is playing
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 3 }}>
                {status === "idle" && (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography color="text.secondary">press play to join the mirror.</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={join}>
                            join mirror
                        </Button>
                    </Stack>
                )}
                {status === "connecting" && <Typography color="text.secondary">connecting…</Typography>}
                {status === "notfound" && (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography color="error">mirror {code} is not active</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button component={RouterLink} to="/" variant="outlined">
                            home
                        </Button>
                    </Stack>
                )}
                {status === "ok" && viewerCode && (
                    <Stack spacing={1}>
                        <Typography variant="overline" color="text.secondary">
                            now playing
                        </Typography>
                        {v ? (
                            <Typography variant="h6">
                                {v.artist} — {v.title}
                            </Typography>
                        ) : (
                            <Typography color="text.secondary">host isn&apos;t playing anything right now</Typography>
                        )}
                    </Stack>
                )}
            </Paper>
        </Stack>
    )
}
