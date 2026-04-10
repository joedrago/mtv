import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import { createPlaylist, fetchJson } from "../api.js"
import { SortableTable } from "../components/SortableTable.jsx"
import { CreatePlaylistDialog } from "../components/CreatePlaylistDialog.jsx"
import { useUserStore } from "../store/user.js"

const playlistColumns = [
    {
        key: "name",
        label: "playlist",
        sortWith: "owner",
        render: (r) => <Typography variant="body2">{r.name}</Typography>
    },
    {
        key: "owner",
        label: "owner",
        sortWith: "name",
        render: (r) => (
            <Typography variant="body2" color="text.secondary">
                {r.owner}
            </Typography>
        )
    },
    {
        key: "is_public",
        label: "",
        sortWith: "name",
        sortValue: (r) => (r.is_public ? 1 : 0),
        align: "right",
        width: "70px",
        render: (r) =>
            r.is_public ? null : (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    private
                </Typography>
            )
    },
    {
        key: "item_count",
        label: "items",
        sortWith: "name",
        align: "right",
        width: "80px",
        cellSx: { fontVariantNumeric: "tabular-nums", color: "text.secondary" }
    }
]

export const PlaylistsPage = () => {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const [playlists, setPlaylists] = useState([])
    const [createOpen, setCreateOpen] = useState(false)

    const load = useCallback(() => {
        fetchJson("/api/playlists")
            .then((d) => setPlaylists(d.playlists))
            .catch(() => setPlaylists([]))
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const handleCreate = async (name, isPublic) => {
        const { playlist } = await createPlaylist(name, isPublic)
        setCreateOpen(false)
        navigate(`/p/${playlist.owner}/${playlist.slug}`)
    }

    return (
        <Stack spacing={3}>
            {user && (
                <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        new playlist
                    </Button>
                </Stack>
            )}
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                {playlists.length === 0 ? (
                    <Box sx={{ px: 2, py: 2 }}>
                        <Typography color="text.secondary" variant="body2">
                            (none)
                        </Typography>
                    </Box>
                ) : (
                    <SortableTable
                        columns={playlistColumns}
                        rows={playlists}
                        rowKey={(r) => r.id}
                        onRowClick={(r) => navigate(`/p/${r.owner}/${r.slug}`)}
                    />
                )}
            </Paper>
            <CreatePlaylistDialog open={createOpen} onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
        </Stack>
    )
}
