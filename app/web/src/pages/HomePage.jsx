import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
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
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        fetchJson("/api/me")
            .then((d) => setUser(d.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
        fetchJson("/api/playlists")
            .then((d) => setPlaylists(d.playlists))
            .catch(() => setPlaylists([]))
    }, [])

    const signOut = async () => {
        await fetch("/auth/logout", { method: "POST", credentials: "same-origin" })
        setUser(null)
    }

    return (
        <Stack spacing={3}>
            <Box
                sx={{
                    fontFamily: '"Kabel Black"',
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "primary.main",
                    letterSpacing: "-0.02em"
                }}
            >
                mtv
            </Box>

            <Paper variant="outlined" sx={{ p: 3 }}>
                {loading ? (
                    <Typography color="text.secondary">loading…</Typography>
                ) : user ? (
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6">hello, {user.display_name}</Typography>
                        <Chip size="small" label={`@${user.discord_handle}`} />
                        {user.is_administrator && <Chip size="small" color="primary" label="admin" />}
                        {user.is_contributor && <Chip size="small" color="secondary" label="contributor" />}
                        <Box sx={{ flexGrow: 1 }} />
                        <Button size="small" variant="outlined" onClick={signOut}>
                            sign out
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography color="text.secondary">not signed in</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button variant="contained" href="/auth/discord">
                            sign in with discord
                        </Button>
                    </Stack>
                )}
            </Paper>

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
