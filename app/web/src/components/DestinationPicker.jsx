import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"
import { addToPlaylistBulk, createPlaylist } from "../api.js"
import { useDestinationStore } from "../store/destination.js"
import { useToastStore } from "../store/toast.js"
import { useUserStore } from "../store/user.js"
import { CreatePlaylistDialog } from "./CreatePlaylistDialog.jsx"

export const DestinationPicker = ({ visibleVideos = null }) => {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const myPlaylists = useDestinationStore((s) => s.myPlaylists)
    const destinationId = useDestinationStore((s) => s.destinationId)
    const setDestinationId = useDestinationStore((s) => s.setDestinationId)
    const loadMyPlaylists = useDestinationStore((s) => s.loadMyPlaylists)
    const addPlaylist = useDestinationStore((s) => s.addPlaylist)
    const showToast = useToastStore((s) => s.show)
    const [createOpen, setCreateOpen] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (user) loadMyPlaylists(user.display_name)
    }, [user, loadMyPlaylists])

    if (!user) return null

    const handleCreate = async (name, isPublic) => {
        const { playlist } = await createPlaylist(name, isPublic)
        addPlaylist(playlist)
        setDestinationId(playlist.id)
        setCreateOpen(false)
    }

    const destination = myPlaylists.find((p) => p.id === destinationId)
    const destName = destination?.name
    const canBulk = !!destinationId && Array.isArray(visibleVideos) && visibleVideos.length > 0

    const goToDestination = () => {
        if (!destination) return
        const path = `/p/${destination.owner}/${destination.slug}`
        setDestinationId(null)
        navigate(path)
    }

    const handleAddAllVisible = async () => {
        if (!canBulk || busy) return
        setBusy(true)
        try {
            const ids = visibleVideos.map((v) => v.id)
            const result = await addToPlaylistBulk(destinationId, ids)
            const parts = []
            if (result.added) parts.push(`added ${result.added}`)
            if (result.skipped) parts.push(`${result.skipped} already there`)
            showToast(`${parts.join(", ") || "nothing to add"} → ${destName}`)
        } catch (e) {
            showToast(`failed: ${String(e?.message ?? e)}`)
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                    add to
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Select
                        value={destinationId ?? ""}
                        displayEmpty
                        onChange={(e) => setDestinationId(e.target.value || null)}
                        renderValue={(v) => {
                            if (!v)
                                return (
                                    <Typography variant="body2" color="text.disabled">
                                        (none)
                                    </Typography>
                                )
                            const p = myPlaylists.find((x) => x.id === v)
                            return <Typography variant="body2">{p?.name ?? "?"}</Typography>
                        }}
                    >
                        <MenuItem value="">
                            <em>(none)</em>
                        </MenuItem>
                        {myPlaylists.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.name}
                                {!p.is_public && (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontStyle: "italic" }}>
                                        private
                                    </Typography>
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: "none" }}>
                    new
                </Button>
                {visibleVideos != null && (
                    <Stack direction="column" spacing={0.5} alignItems="flex-start">
                        <Button
                            size="small"
                            startIcon={<PlaylistAddCheckIcon />}
                            onClick={handleAddAllVisible}
                            disabled={!canBulk || busy}
                            sx={{ textTransform: "none" }}
                        >
                            add all visible ({visibleVideos?.length ?? 0})
                        </Button>
                        {destination && (
                            <Button
                                size="small"
                                onClick={goToDestination}
                                sx={{ textTransform: "none", color: "text.secondary" }}
                            >
                                go to {destName}
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
            <CreatePlaylistDialog open={createOpen} onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
        </>
    )
}
