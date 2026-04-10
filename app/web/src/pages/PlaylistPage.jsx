import { useEffect, useMemo, useState } from "react"
import { useParams, Link as RouterLink } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import { fetchJson, setOpinion } from "../api.js"
import { usePlayerStore } from "../store/player.js"
import { useUserStore } from "../store/user.js"
import { SortableTable } from "../components/SortableTable.jsx"
import { buildVideoColumns } from "../components/videoColumns.jsx"

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
    const [displayItems, setDisplayItems] = useState([])
    const [error, setError] = useState(null)
    const user = useUserStore((s) => s.user)
    const openQueue = usePlayerStore((s) => s.openQueue)

    useEffect(() => {
        setPlaylist(null)
        setItems([])
        setDisplayItems([])
        setError(null)
        fetchJson(`/api/playlists/${encodeURIComponent(owner)}/${encodeURIComponent(slug)}`)
            .then((d) => {
                setPlaylist(d.playlist)
                setItems(d.items)
                setDisplayItems(d.items)
            })
            .catch((e) => setError(String(e)))
    }, [owner, slug])

    const handleRate = (videoId, value) => {
        setItems((prev) => prev.map((i) => (i.id === videoId ? { ...i, my_opinion: value } : i)))
        setOpinion(videoId, value)
    }

    const columns = useMemo(() => buildVideoColumns({ signedIn: !!user, onRate: handleRate }), [user])

    const playAll = (shuffle = false) => {
        if (!displayItems.length) return
        const queue = shuffle ? shuffled(displayItems) : displayItems
        openQueue(queue, { playlistName: playlist?.name, startAt: 0 })
    }

    const handleRowClick = (_row, index, sortedRows) => {
        openQueue(sortedRows, { playlistName: playlist?.name, startAt: index })
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
                <SortableTable
                    columns={columns}
                    rows={items}
                    rowKey={(r) => r.id}
                    onRowClick={handleRowClick}
                    onSortedRowsChange={setDisplayItems}
                />
            </Paper>
        </Stack>
    )
}
