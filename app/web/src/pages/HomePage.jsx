import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { fetchJson } from "../api.js"
import { SortableTable } from "../components/SortableTable.jsx"

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

export const HomePage = () => {
    const navigate = useNavigate()
    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        fetchJson("/api/playlists")
            .then((d) => setPlaylists(d.playlists))
            .catch(() => setPlaylists([]))
    }, [])

    return (
        <Stack spacing={3}>
            <Paper variant="outlined">
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
        </Stack>
    )
}
