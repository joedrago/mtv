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
import { useSettingsStore } from "../store/settings.js"
import { useUserStore } from "../store/user.js"
import { SortableTable } from "../components/SortableTable.jsx"
import { buildVideoColumns } from "../components/videoColumns.jsx"
import { DestinationPicker } from "../components/DestinationPicker.jsx"
import { EditVideoDialog } from "../components/EditVideoDialog.jsx"
import { FilterButton } from "../components/FilterButton.jsx"

const AGE_CUTOFF_S = {
    week: 7 * 86400,
    month: 30 * 86400,
    year: 365 * 86400,
}

export const BrowsePage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQ = searchParams.get("q") ?? ""
    const initialR = useMemo(() => searchParams.get("r")?.split(",").filter(Boolean) ?? [], [])
    const initialBy = useMemo(() => searchParams.get("by")?.split(",").filter(Boolean) ?? [], [])
    const initialAge = searchParams.get("age") ?? null
    const [videos, setVideos] = useState([])
    const [displayVideos, setDisplayVideos] = useState([])
    const [queryInput, setQueryInput] = useState(initialQ)
    const [query, setQuery] = useState(initialQ)
    const [opinions, setOpinions] = useState(initialR)
    const [activeContributors, setActiveContributors] = useState(initialBy)
    const [activeAge, setActiveAge] = useState(initialAge)
    const [loading, setLoading] = useState(true)

    const quickRating = useSettingsStore((s) => s.quickRating)

    useEffect(() => {
        const t = setTimeout(() => {
            setQuery(queryInput)
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

    const handleOpinionsChange = useCallback(
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

    const handleContributorsChange = useCallback(
        (names) => {
            setActiveContributors(names)
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    if (names.length) next.set("by", names.join(","))
                    else next.delete("by")
                    return next
                },
                { replace: true }
            )
        },
        [setSearchParams]
    )

    const handleAgeChange = useCallback(
        (age) => {
            setActiveAge(age)
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    if (age) next.set("age", age)
                    else next.delete("age")
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

    const contributors = useMemo(() => {
        const names = new Set(videos.map((v) => v.owner_display_name).filter(Boolean))
        return [...names].sort((a, b) => a.localeCompare(b))
    }, [videos])

    const columns = useMemo(
        () => buildVideoColumns({ signedIn: !!user, onRate: handleRate, canEdit: !!user?.is_contributor, onEdit: handleEdit, quickRating }),
        [user, handleRate, handleEdit, quickRating]
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
        if (activeContributors.length) {
            result = result.filter((v) => activeContributors.includes(v.owner_display_name))
        }
        if (activeAge) {
            const nowS = Date.now() / 1000
            if (activeAge === "older") {
                result = result.filter((v) => v.added_at != null && v.added_at < nowS - AGE_CUTOFF_S.year)
            } else {
                const cutoff = nowS - AGE_CUTOFF_S[activeAge]
                result = result.filter((v) => v.added_at != null && v.added_at >= cutoff)
            }
        }
        return result
    }, [videos, query, opinions, activeContributors, activeAge])

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
                {user && (
                    <FilterButton
                        activeOpinions={opinions}
                        onOpinionsChange={handleOpinionsChange}
                        contributors={contributors}
                        activeContributors={activeContributors}
                        onContributorsChange={handleContributorsChange}
                        activeAge={activeAge}
                        onAgeChange={handleAgeChange}
                    />
                )}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" rowGap={1.5}>
                <Button variant="contained" startIcon={<ShuffleIcon />} onClick={() => playAll(true)}>
                    shuffle
                </Button>
                <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={() => playAll(false)}>
                    play
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
