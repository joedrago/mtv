import { useCallback, useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import InputAdornment from "@mui/material/InputAdornment"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SearchIcon from "@mui/icons-material/Search"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import { fetchJson, setOpinion } from "../api.js"
import { usePlayerStore } from "../store/player.js"
import { useUserStore } from "../store/user.js"
import { SortableTable } from "../components/SortableTable.jsx"
import { buildVideoColumns } from "../components/videoColumns.jsx"
import { DestinationPicker } from "../components/DestinationPicker.jsx"

const shuffled = (arr) => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

export const BrowsePage = () => {
    const [videos, setVideos] = useState([])
    const [displayVideos, setDisplayVideos] = useState([])
    const [queryInput, setQueryInput] = useState("")
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setQuery(queryInput), 180)
        return () => clearTimeout(t)
    }, [queryInput])
    const user = useUserStore((s) => s.user)
    const openQueue = usePlayerStore((s) => s.openQueue)

    useEffect(() => {
        fetchJson("/api/videos")
            .then((d) => {
                setVideos(d.videos)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleRate = useCallback((videoId, value) => {
        setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, my_opinion: value } : v)))
        setOpinion(videoId, value)
    }, [])

    const columns = useMemo(() => buildVideoColumns({ signedIn: !!user, onRate: handleRate }), [user, handleRate])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return videos
        return videos.filter((v) => v.artist.toLowerCase().includes(q) || v.title.toLowerCase().includes(q))
    }, [videos, query])

    const playAll = (shuffle = false) => {
        if (!displayVideos.length) return
        const queue = shuffle ? shuffled(displayVideos) : displayVideos
        openQueue(queue, { startAt: 0 })
    }

    const handleRowClick = useCallback(
        (_row, index, sortedRows) => {
            openQueue(sortedRows, { startAt: index })
        },
        [openQueue]
    )

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" rowGap={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    browse
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <TextField
                    size="small"
                    placeholder="search artist or title…"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    sx={{ minWidth: 280 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" rowGap={1.5}>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => playAll(false)}>
                    play all
                </Button>
                <Button variant="outlined" startIcon={<ShuffleIcon />} onClick={() => playAll(true)}>
                    shuffle
                </Button>
                <Typography variant="body2" color="text.secondary">
                    {filtered.length} of {videos.length}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <DestinationPicker visibleVideos={displayVideos} />
            </Stack>

            <Paper variant="outlined">
                {loading ? (
                    <Box sx={{ px: 2, py: 2 }}>
                        <Typography color="text.secondary" variant="body2">
                            loading…
                        </Typography>
                    </Box>
                ) : (
                    <SortableTable
                        columns={columns}
                        rows={filtered}
                        rowKey={(r) => r.id}
                        onRowClick={handleRowClick}
                        onSortedRowsChange={setDisplayVideos}
                    />
                )}
            </Paper>
        </Stack>
    )
}
