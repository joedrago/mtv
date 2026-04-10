import { useState } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Popover from "@mui/material/Popover"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral"
import ThumbDownIcon from "@mui/icons-material/ThumbDown"
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt"
import HeartBrokenIcon from "@mui/icons-material/HeartBroken"
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"

// Sort order: love is "best" (0). Used as the sortValue basis for rating columns.
export const OPINION_SORT_ORDER = { love: 0, like: 1, meh: 2, bleh: 3, hate: 4 }
export const opinionSortValue = (value) => OPINION_SORT_ORDER[value] ?? 5

export const OPINIONS = [
    { value: "love", label: "love (1)", key: "1", color: "#ff4f70", FilledIcon: FavoriteIcon, OutlineIcon: FavoriteBorderIcon },
    { value: "like", label: "like (2)", key: "2", color: "#7ec850", FilledIcon: ThumbUpIcon, OutlineIcon: ThumbUpOffAltIcon },
    {
        value: "meh",
        label: "meh (3)",
        key: "3",
        color: "#9aa0a8",
        FilledIcon: SentimentNeutralIcon,
        OutlineIcon: SentimentNeutralIcon
    },
    { value: "bleh", label: "bleh (4)", key: "4", color: "#e8a53b", FilledIcon: ThumbDownIcon, OutlineIcon: ThumbDownOffAltIcon },
    { value: "hate", label: "hate (5)", key: "5", color: "#b13a3a", FilledIcon: HeartBrokenIcon, OutlineIcon: HeartBrokenIcon }
]

export const OpinionButtons = ({ current, onSet, disabled = false, idleColor = "rgba(255,255,255,0.55)" }) => (
    <Stack direction="row" spacing={0.5}>
        {OPINIONS.map((o) => {
            const active = current === o.value
            const Icon = active ? o.FilledIcon : o.OutlineIcon
            return (
                <Tooltip key={o.value} title={o.label}>
                    <span>
                        <IconButton
                            size="small"
                            disabled={disabled}
                            onClick={() => onSet(active ? null : o.value)}
                            sx={{
                                color: active ? o.color : idleColor,
                                "&:hover": { color: o.color }
                            }}
                        >
                            <Icon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )
        })}
    </Stack>
)

// Tappable rating cell for use inside table rows. Shows the current rating as
// a single icon; tapping opens a popover with the full OpinionButtons bar.
// Stops click/mousedown propagation so the row's own onClick (play-from-here)
// doesn't fire.
export const RatingCell = ({ current, onChange }) => {
    const [anchor, setAnchor] = useState(null)
    const opinion = OPINIONS.find((o) => o.value === current)
    const Icon = opinion?.FilledIcon ?? HorizontalRuleIcon
    const color = opinion?.color ?? "text.disabled"

    const stop = (e) => e.stopPropagation()
    const open = (e) => {
        e.stopPropagation()
        setAnchor(e.currentTarget)
    }
    const close = () => setAnchor(null)
    const handle = (value) => {
        onChange(value)
        close()
    }

    return (
        <>
            <IconButton size="small" onClick={open} onMouseDown={stop} sx={{ color }}>
                <Icon fontSize="small" />
            </IconButton>
            <Popover
                open={!!anchor}
                anchorEl={anchor}
                onClose={close}
                onClick={stop}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                slotProps={{ paper: { sx: { background: "#1a1e26", p: 0.5 } } }}
            >
                <Box>
                    <OpinionButtons current={current} onSet={handle} idleColor="rgba(255,255,255,0.7)" />
                </Box>
            </Popover>
        </>
    )
}
