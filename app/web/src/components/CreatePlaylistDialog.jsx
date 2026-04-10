import { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import FormControlLabel from "@mui/material/FormControlLabel"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { LIMITS } from "../limits.js"

export const CreatePlaylistDialog = ({ open, onCancel, onSubmit }) => {
    const [name, setName] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [error, setError] = useState(null)
    const [busy, setBusy] = useState(false)

    const reset = () => {
        setName("")
        setIsPublic(true)
        setError(null)
        setBusy(false)
    }

    const submit = async () => {
        const trimmed = name.trim()
        if (!trimmed) return
        setBusy(true)
        setError(null)
        try {
            await onSubmit(trimmed, isPublic)
            reset()
        } catch (e) {
            setError(String(e?.message ?? e))
        } finally {
            setBusy(false)
        }
    }

    const cancel = () => {
        reset()
        onCancel()
    }

    return (
        <Dialog open={open} onClose={cancel} fullWidth maxWidth="xs">
            <DialogTitle>create playlist</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        label="name"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, LIMITS.playlistName))}
                        slotProps={{ htmlInput: { maxLength: LIMITS.playlistName } }}
                        fullWidth
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit()
                        }}
                    />
                    <FormControlLabel
                        control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                        label="public"
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel}>cancel</Button>
                <Button onClick={submit} variant="contained" disabled={busy || !name.trim()}>
                    create
                </Button>
            </DialogActions>
        </Dialog>
    )
}
