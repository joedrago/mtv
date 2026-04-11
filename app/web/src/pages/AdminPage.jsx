import { useCallback, useEffect, useMemo, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Typography from "@mui/material/Typography"
import DeleteIcon from "@mui/icons-material/Delete"
import { fetchAllUsers, updateUserContributor, deleteUserAccount } from "../api.js"
import { useUserStore } from "../store/user.js"
import { useToastStore } from "../store/toast.js"
import { SortableTable } from "../components/SortableTable.jsx"

export const AdminPage = () => {
    const me = useUserStore((s) => s.user)
    const loaded = useUserStore((s) => s.loaded)
    const showToast = useToastStore((s) => s.show)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null) // user to confirm deletion of

    useEffect(() => {
        if (!me?.is_administrator) return
        fetchAllUsers()
            .then((d) => {
                setUsers(d.users)
                setLoading(false)
            })
            .catch((e) => {
                setError(String(e?.message ?? e))
                setLoading(false)
            })
    }, [me?.is_administrator])

    const toggleContributor = useCallback(
        async (u) => {
            const next = !u.is_contributor
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_contributor: next } : x)))
            try {
                await updateUserContributor(u.id, next)
                showToast(`${u.display_name} is ${next ? "now" : "no longer"} a contributor`)
            } catch (e) {
                // revert on failure
                setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_contributor: !next } : x)))
                showToast(`failed: ${String(e?.message ?? e)}`)
            }
        },
        [showToast]
    )

    const confirmDelete = useCallback(
        async () => {
            if (!deleteTarget) return
            const u = deleteTarget
            setDeleteTarget(null)
            try {
                await deleteUserAccount(u.id)
                setUsers((prev) => prev.filter((x) => x.id !== u.id))
                showToast(`${u.display_name} has been deleted`)
            } catch (e) {
                showToast(`delete failed: ${String(e?.message ?? e)}`)
            }
        },
        [deleteTarget, showToast]
    )

    const columns = useMemo(
        () => [
            {
                key: "display_name",
                label: "display name",
                sortWith: "discord_handle",
                render: (r) => <Typography variant="body2">{r.display_name}</Typography>
            },
            {
                key: "discord_handle",
                label: "discord",
                sortWith: "display_name",
                render: (r) => (
                    <Typography variant="body2" color="text.secondary">
                        @{r.discord_handle}
                    </Typography>
                )
            },
            {
                key: "is_administrator",
                label: "admin",
                sortWith: "display_name",
                sortValue: (r) => (r.is_administrator ? 1 : 0),
                align: "center",
                width: "80px",
                render: (r) =>
                    r.is_administrator ? (
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                            admin
                        </Typography>
                    ) : null
            },
            {
                key: "is_contributor",
                label: "contributor",
                sortWith: "display_name",
                sortValue: (r) => (r.is_contributor ? 1 : 0),
                align: "center",
                width: "120px",
                render: (r) => (
                    <Switch
                        size="small"
                        checked={!!r.is_contributor}
                        onChange={() => toggleContributor(r)}
                        onClick={(e) => e.stopPropagation()}
                    />
                )
            },
            {
                key: "delete",
                label: "",
                align: "center",
                width: "48px",
                render: (r) =>
                    r.is_administrator ? null : (
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget(r)
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )
            }
        ],
        [toggleContributor]
    )

    if (loaded && !me) {
        return (
            <Stack spacing={2}>
                <Typography color="text.secondary">not signed in.</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    home
                </Button>
            </Stack>
        )
    }
    if (me && !me.is_administrator) {
        return (
            <Stack spacing={2}>
                <Typography color="error">administrators only.</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    home
                </Button>
            </Stack>
        )
    }
    if (!me) return <Typography color="text.secondary">loading…</Typography>

    return (
        <Stack spacing={3}>
            <Box>
                <Button component={RouterLink} to="/me" size="small" sx={{ mb: 1 }}>
                    ← account
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    administration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    toggle contributor status. admin status is set in config/config.json and cannot be changed here.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary" variant="body2">
                            loading…
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    </Box>
                ) : (
                    <SortableTable columns={columns} rows={users} rowKey={(r) => r.id} />
                )}
            </Paper>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: "error.main" }}>Delete account</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        You are about to permanently delete{" "}
                        <strong>{deleteTarget?.display_name}</strong> (@{deleteTarget?.discord_handle}).
                    </Typography>
                    <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
                        This will delete their <strong>account</strong>, all of their{" "}
                        <strong>playlists</strong>, and all of their <strong>ratings</strong>.
                        Their contributed videos will be reassigned to Unknown.
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        delete permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}
