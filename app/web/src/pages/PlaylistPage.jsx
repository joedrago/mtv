import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import FormControlLabel from "@mui/material/FormControlLabel"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import { deletePlaylist, fetchJson, removeFromPlaylist, setOpinion, updatePlaylist } from "../api.js"
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

export const PlaylistPage = () => {
    const { owner, slug } = useParams()
    const navigate = useNavigate()
    const [playlist, setPlaylist] = useState(null)
    const [items, setItems] = useState([])
    const [displayItems, setDisplayItems] = useState([])
    const [error, setError] = useState(null)
    const user = useUserStore((s) => s.user)
    const openQueue = usePlayerStore((s) => s.openQueue)

    const [menuAnchor, setMenuAnchor] = useState(null)
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameValue, setRenameValue] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false)

    const isOwner = user && playlist && user.display_name === playlist.owner

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

    const handleRate = useCallback((videoId, value) => {
        setItems((prev) => prev.map((i) => (i.id === videoId ? { ...i, my_opinion: value } : i)))
        setOpinion(videoId, value)
    }, [])

    const handleRemoveItem = useCallback(
        async (videoId) => {
            if (!playlist) return
            setItems((prev) => prev.filter((i) => i.id !== videoId))
            try {
                await removeFromPlaylist(playlist.id, videoId)
            } catch (_e) {
                const d = await fetchJson(`/api/playlists/${encodeURIComponent(owner)}/${encodeURIComponent(slug)}`)
                setItems(d.items)
            }
        },
        [playlist, owner, slug]
    )

    const columns = useMemo(
        () => buildVideoColumns({ signedIn: !!user, onRate: handleRate, canRemove: !!isOwner, onRemove: handleRemoveItem }),
        [user, isOwner, handleRate, handleRemoveItem]
    )

    const playAll = (shuffle = false) => {
        if (!displayItems.length) return
        const queue = shuffle ? shuffled(displayItems) : displayItems
        openQueue(queue, { playlistName: playlist?.name, startAt: 0 })
    }

    const handleRowClick = useCallback(
        (_row, index, sortedRows) => {
            openQueue(sortedRows, { playlistName: playlist?.name, startAt: index })
        },
        [openQueue, playlist?.name]
    )

    const openRename = () => {
        setRenameValue(playlist?.name ?? "")
        setRenameOpen(true)
        setMenuAnchor(null)
    }
    const submitRename = async () => {
        const name = renameValue.trim()
        if (!name || name === playlist.name) {
            setRenameOpen(false)
            return
        }
        try {
            const { playlist: updated } = await updatePlaylist(playlist.id, { name })
            setRenameOpen(false)
            navigate(`/p/${updated.owner}/${updated.slug}`, { replace: true })
        } catch (e) {
            alert(String(e?.message ?? e))
        }
    }

    const togglePublic = async () => {
        setMenuAnchor(null)
        try {
            const { playlist: updated } = await updatePlaylist(playlist.id, { is_public: !playlist.is_public })
            setPlaylist((prev) => ({ ...prev, ...updated }))
        } catch (e) {
            alert(String(e?.message ?? e))
        }
    }

    const confirmDelete = async () => {
        try {
            await deletePlaylist(playlist.id)
            setDeleteOpen(false)
            navigate("/")
        } catch (e) {
            alert(String(e?.message ?? e))
        }
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
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
                        {playlist.name}
                    </Typography>
                    {isOwner && (
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                            <MoreVertIcon />
                        </IconButton>
                    )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip size="small" label={`by ${playlist.owner}`} />
                    <Chip size="small" label={`${items.length} items`} />
                    {!playlist.is_public && <Chip size="small" label="private" />}
                </Stack>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" rowGap={1.5}>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => playAll(false)}>
                    play all
                </Button>
                <Button variant="outlined" startIcon={<ShuffleIcon />} onClick={() => playAll(true)}>
                    shuffle
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <DestinationPicker visibleVideos={displayItems} />
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

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={openRename}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    rename
                </MenuItem>
                <MenuItem onClick={togglePublic}>
                    <FormControlLabel
                        control={<Switch size="small" checked={!!playlist.is_public} onChange={togglePublic} />}
                        label="public"
                        sx={{ m: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMenuAnchor(null)
                        setDeleteOpen(true)
                    }}
                    sx={{ color: "error.main" }}
                >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    delete…
                </MenuItem>
            </Menu>

            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>rename playlist</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submitRename()
                        }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)}>cancel</Button>
                    <Button variant="contained" onClick={submitRename}>
                        rename
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>delete playlist?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        delete “{playlist.name}”? this cannot be undone. the videos themselves are not affected.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}
