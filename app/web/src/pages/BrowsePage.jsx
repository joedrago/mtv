import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
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
import { bucketShuffle } from "../lastWatched.js"
import { usePlayerStore } from "../store/player.js"
import { useUserStore } from "../store/user.js"
import { SortableTable } from "../components/SortableTable.jsx"
import { buildVideoColumns } from "../components/videoColumns.jsx"
import { DestinationPicker } from "../components/DestinationPicker.jsx"
import { EditVideoDialog } from "../components/EditVideoDialog.jsx"
import { FilterButton } from "../components/FilterButton.jsx"

export const BrowsePage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQ = searchParams.get("q") ?? ""
    const initialR = useMemo(() => searchParams.get("r")?.split(",").filter(Boolean) ?? [], [])
    const [videos, setVideos] = useState([])
    const [displayVideos, setDisplayVideos] = useState([])
    const [queryInput, setQueryInput] = useState(initialQ)
    const [query, setQuery] = useState(initialQ)
    const [opinions, setOpinions] = useState(initialR)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => {
            setQuery(queryInput)
            // mirror into the URL so refresh/back preserves the search
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    if (queryInput) next.set("q", queryInput)
                    else next.delete("q")
                    return next
                },
                { replace: true }
            )
        }, 180)
        return () => clearTimeout(t)
    }, [queryInput, setSearchParams])

    const handleOpinionFilterChange = useCallback(
        (newOpinions) => {
            setOpinions(newOpinions)
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    if (newOpinions.length) next.set("r", newOpinions.join(","))
                    else next.delete("r")
                    return next
                },
                { replace: true }
            )
        },
        [setSearchParams]
    )
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

    const [editVideo, setEditVideo] = useState(null)
    const handleEdit = useCallback((video) => setEditVideo(video), [])
    const handleSaved = useCallback((updated) => {
        setVideos((prev) => prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)))
    }, [])

    const columns = useMemo(
        () => buildVideoColumns({ signedIn: !!user, onRate: handleRate, canEdit: !!user?.is_contributor, onEdit: handleEdit }),
        [user, handleRate, handleEdit]
    )

    const filtered = useMemo(() => {
        let result = videos
        const q = query.trim().toLowerCase()
        if (q) {
            const terms = q
                .split("|")
                .map((t) => t.trim())
                .filter(Boolean)
            if (terms.length) {
                result = result.filter((v) => {
                    const a = v.artist.toLowerCase()
                    const t = v.title.toLowerCase()
                    return terms.some((term) => a.includes(term) || t.includes(term))
                })
            }
        }
        if (opinions.length) {
            result = result.filter((v) => (v.my_opinion ? opinions.includes(v.my_opinion) : opinions.includes("none")))
        }
        return result
    }, [videos, query, opinions])

    const playAll = (shuffle = false) => {
        if (!displayVideos.length) return
        const queue = shuffle ? bucketShuffle(displayVideos) : displayVideos
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
                {user && <FilterButton activeOpinions={opinions} onChange={handleOpinionFilterChange} />}
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

            <EditVideoDialog video={editVideo} open={!!editVideo} onClose={() => setEditVideo(null)} onSaved={handleSaved} />

            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
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
