import { useEffect, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import FormControlLabel from "@mui/material/FormControlLabel"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { fetchMyStats, updateMe } from "../api.js"
import { clearWatchHistory } from "../lastWatched.js"
import { useSettingsStore } from "../store/settings.js"
import { useUserStore } from "../store/user.js"
import { LIMITS } from "../limits.js"

const StatLine = ({ label, value }) => (
    <Stack direction="row" sx={{ py: 0.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {value == null ? "—" : value}
        </Typography>
    </Stack>
)

export const AccountPage = () => {
    const user = useUserStore((s) => s.user)
    const loaded = useUserStore((s) => s.loaded)
    const setUser = useUserStore((s) => s.setUser)
    const signOut = useUserStore((s) => s.signOut)
    const quickRating = useSettingsStore((s) => s.quickRating)
    const setQuickRating = useSettingsStore((s) => s.setQuickRating)
    const navigate = useNavigate()

    const [displayName, setDisplayName] = useState("")
    const [label, setLabel] = useState("")
    const [stats, setStats] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [saved, setSaved] = useState(false)
    const [historyCleared, setHistoryCleared] = useState(false)

    const handleClearHistory = () => {
        clearWatchHistory()
        setHistoryCleared(true)
        setTimeout(() => setHistoryCleared(false), 1500)
    }

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name ?? "")
            setLabel(user.label ?? "")
        }
    }, [user])

    useEffect(() => {
        if (!user) return
        fetchMyStats()
            .then((d) => setStats(d.stats))
            .catch(() => setStats(null))
    }, [user])

    if (loaded && !user) {
        return (
            <Stack spacing={2}>
                <Typography color="text.secondary">not signed in.</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                    home
                </Button>
            </Stack>
        )
    }

    if (!user) return <Typography color="text.secondary">loading…</Typography>

    const dirty = displayName !== (user.display_name ?? "") || label !== (user.label ?? "")

    const save = async () => {
        setSaving(true)
        setError(null)
        setSaved(false)
        try {
            const { user: updated } = await updateMe({ display_name: displayName, label })
            setUser(updated)
            setSaved(true)
            setTimeout(() => setSaved(false), 1500)
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setSaving(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        navigate("/")
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    account
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip size="small" label={`@${user.discord_handle}`} />
                    {user.is_administrator && <Chip size="small" color="primary" label="admin" />}
                    {user.is_contributor && <Chip size="small" color="secondary" label="contributor" />}
                </Stack>
            </Box>

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                        profile
                    </Typography>
                    <TextField
                        size="small"
                        label="display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value.slice(0, LIMITS.userDisplayName))}
                        slotProps={{ htmlInput: { maxLength: LIMITS.userDisplayName } }}
                        helperText="2–32 characters: letters, digits, underscores"
                        fullWidth
                    />
                    <TextField
                        size="small"
                        label="record label (shown in the chyron)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value.slice(0, LIMITS.userLabel))}
                        slotProps={{ htmlInput: { maxLength: LIMITS.userLabel } }}
                        placeholder="Cool Guy Records"
                        fullWidth
                    />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button variant="contained" onClick={save} disabled={!dirty || saving}>
                            save
                        </Button>
                        {saved && (
                            <Typography variant="body2" color="success.main">
                                saved
                            </Typography>
                        )}
                        {error && (
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={1}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                        stats
                    </Typography>
                    <StatLine label="videos added" value={stats?.videos_added} />
                    <StatLine label="ratings given" value={stats?.opinions} />
                    <StatLine label="playlists owned" value={stats?.playlists} />
                    <Box sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button size="small" variant="outlined" color="warning" onClick={handleClearHistory}>
                                clear shuffle history
                            </Button>
                            {historyCleared && (
                                <Typography variant="body2" color="success.main">
                                    cleared
                                </Typography>
                            )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            resets the watch timestamps used to de-prioritise recently-played videos in shuffles
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                        preferences
                    </Typography>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={quickRating}
                                    onChange={(e) => setQuickRating(e.target.checked)}
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">quick rating mode</Typography>}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 4 }}>
                            shows all 5 rating buttons inline in the browse &amp; playlist tables
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        done for now?
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {user.is_administrator && (
                        <Button variant="outlined" component={RouterLink} to="/admin">
                            administration
                        </Button>
                    )}
                    <Button variant="outlined" color="error" onClick={handleSignOut}>
                        sign out
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    )
}
