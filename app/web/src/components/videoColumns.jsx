import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditIcon from "@mui/icons-material/Edit"
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd"
import { RatingCell, opinionSortValue } from "./OpinionButtons.jsx"
import { addToPlaylist } from "../api.js"
import { useDestinationStore } from "../store/destination.js"
import { useToastStore } from "../store/toast.js"

const QuickAddButton = ({ video }) => {
    const destinationId = useDestinationStore((s) => s.destinationId)
    const myPlaylists = useDestinationStore((s) => s.myPlaylists)
    const show = useToastStore((s) => s.show)
    const enabled = !!destinationId
    const destName = myPlaylists.find((p) => p.id === destinationId)?.name

    const handle = async (e) => {
        e.stopPropagation()
        if (!enabled) return
        try {
            const result = await addToPlaylist(destinationId, video.id)
            if (result?.alreadyPresent) {
                show(`already in ${destName}`)
            } else {
                show(`${video.artist} — ${video.title} → ${destName}`)
            }
        } catch (err) {
            show(`failed: ${String(err?.message ?? err)}`)
        }
    }

    return (
        <Tooltip
            title={enabled ? `add to ${destName}` : "pick a destination above"}
            placement="left"
            enterDelay={400}
            enterNextDelay={400}
        >
            <span>
                <IconButton
                    size="small"
                    onClick={handle}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={!enabled}
                    sx={{
                        color: enabled ? "text.secondary" : "action.disabled",
                        "&:hover": { color: "primary.main" }
                    }}
                >
                    <PlaylistAddIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    )
}

export const fmtDuration = (s) => {
    if (s == null || s < 0) return "—"
    const m = Math.floor(s / 60)
    const r = Math.floor(s % 60)
    return `${m}:${String(r).padStart(2, "0")}`
}

// Columns for video tables (playlist items, library browse).
// onRate     - called with (videoId, newValue|null)
// canRemove  - true when the current user can remove items from this list
// onRemove   - called with (videoId)
// canEdit    - true when the current user can edit video metadata (contributor)
// onEdit     - called with (video) when the edit pencil is clicked
export const buildVideoColumns = ({ signedIn, onRate, canRemove = false, onRemove = null, canEdit = false, onEdit = null }) => {
    const cols = [
        {
            key: "artist",
            label: "artist",
            sortWith: "title",
            clickable: true,
            render: (r) => (
                <Typography variant="body2" color="text.secondary">
                    {r.artist}
                </Typography>
            )
        },
        {
            key: "title",
            label: "title",
            sortWith: "artist",
            clickable: true,
            render: (r) => <Typography variant="body2">{r.title}</Typography>
        },
        {
            key: "owner_display_name",
            label: "added",
            sortWith: "artist",
            width: "120px",
            hideOnMobile: true,
            render: (r) => (
                <Typography variant="body2" color="text.secondary">
                    {r.owner_display_name ?? ""}
                </Typography>
            )
        },
        {
            key: "duration_s",
            label: "length",
            sortWith: "artist",
            align: "right",
            width: "80px",
            hideOnMobile: true,
            render: (r) => fmtDuration(r.duration_s),
            cellSx: { fontVariantNumeric: "tabular-nums", color: "text.secondary" }
        }
    ]
    if (signedIn) {
        cols.push({
            key: "my_opinion",
            label: "rating",
            sortWith: "artist",
            sortValue: (r) => opinionSortValue(r.my_opinion),
            align: "center",
            width: "60px",
            render: (r) => <RatingCell current={r.my_opinion ?? null} onChange={(v) => onRate(r.id, v)} />
        })
        cols.push({
            key: "add",
            label: "",
            align: "center",
            width: "50px",
            render: (r) => <QuickAddButton video={r} />
        })
    }
    if (canEdit) {
        cols.push({
            key: "edit",
            label: "",
            align: "center",
            width: "50px",
            render: (r) => (
                <Tooltip title="edit metadata" placement="left" enterDelay={400} enterNextDelay={400}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(r)
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{ color: "text.disabled", "&:hover": { color: "primary.main" } }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        })
    }
    if (canRemove) {
        cols.push({
            key: "remove",
            label: "",
            align: "center",
            width: "50px",
            render: (r) => (
                <Tooltip title="remove from playlist" placement="left" enterDelay={400} enterNextDelay={400}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove?.(r.id)
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        })
    }
    return cols
}
