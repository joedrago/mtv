import { useEffect, useState } from "react"
import { useParams, Link as RouterLink } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import { fetchJson } from "../api.js"
import { usePlayerStore } from "../store/player.js"

const shuffled = (arr) => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

export const PlaylistPage = () => {
    const { owner, slug } = useParams()
    const [playlist, setPlaylist] = useState(null)
    const [items, setItems] = useState([])
    const [error, setError] = useState(null)
    const openQueue = usePlayerStore((s) => s.openQueue)

    useEffect(() => {
        setPlaylist(null)
        setItems([])
        setError(null)
        fetchJson(`/api/playlists/${encodeURIComponent(owner)}/${encodeURIComponent(slug)}`)
            .then((d) => {
                setPlaylist(d.playlist)
                setItems(d.items)
            })
            .catch((e) => setError(String(e)))
    }, [owner, slug])

    const playAll = (shuffle = false) => {
        if (!items.length) return
        const queue = shuffle ? shuffled(items) : items
        openQueue(queue, { playlistName: playlist?.name, startAt: 0 })
    }

    const playFrom = (i) => {
        openQueue(items, { playlistName: playlist?.name, startAt: i })
    }

    if (error) {
        return (
            <Stack spacing={2}>
                <Typography color="error">{error}</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ alignSelf: "start" }}>
                    back
                </Button>
            </Stack>
        )
    }

    if (!playlist) return <Typography color="text.secondary">loading…</Typography>

    return (
        <Stack spacing={3}>
            <Box>
                <Button component={RouterLink} to="/" size="small" sx={{ mb: 1 }}>
                    ← back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {playlist.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip size="small" label={`by ${playlist.owner}`} />
                    <Chip size="small" label={`${items.length} items`} />
                    {!playlist.is_public && <Chip size="small" label="private" />}
                </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => playAll(false)}>
                    play all
                </Button>
                <Button variant="outlined" startIcon={<ShuffleIcon />} onClick={() => playAll(true)}>
                    shuffle
                </Button>
            </Stack>

            <Paper variant="outlined">
                <List dense disablePadding>
                    {items.map((v, i) => (
                        <ListItemButton key={`${v.id}-${i}`} onClick={() => playFrom(i)}>
                            <ListItemText
                                primary={`${v.artist} — ${v.title}`}
                                secondary={v.source === "self" ? "self-hosted" : null}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Paper>
        </Stack>
    )
}
