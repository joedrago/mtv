import { useState } from "react"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import IconButton from "@mui/material/IconButton"
import Popover from "@mui/material/Popover"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"
import { OPINIONS } from "./OpinionButtons.jsx"

export const FilterButton = ({ activeOpinions, onChange }) => {
    const [anchor, setAnchor] = useState(null)
    const isActive = activeOpinions.length > 0

    const toggle = (value) => {
        onChange(
            activeOpinions.includes(value)
                ? activeOpinions.filter((v) => v !== value)
                : [...activeOpinions, value]
        )
    }

    return (
        <>
            <IconButton
                size="small"
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{
                    color: isActive ? "primary.main" : "text.secondary",
                    ...(isActive && { filter: "drop-shadow(0 0 5px #e84855)" }),
                }}
            >
                <FilterAltIcon fontSize="small" />
            </IconButton>
            <Popover
                open={!!anchor}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { background: "#1a1e26", p: 1.5, minWidth: 160 } } }}
            >
                <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, pb: 0.5 }}>
                        filter by rating
                    </Typography>
                    {OPINIONS.map((o) => (
                        <FormControlLabel
                            key={o.value}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={activeOpinions.includes(o.value)}
                                    onChange={() => toggle(o.value)}
                                    sx={{ color: o.color, "&.Mui-checked": { color: o.color } }}
                                />
                            }
                            label={
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <o.FilledIcon fontSize="small" sx={{ color: o.color }} />
                                    <Typography variant="body2">{o.value}</Typography>
                                </Stack>
                            }
                            sx={{ mx: 0 }}
                        />
                    ))}
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={activeOpinions.includes("none")}
                                onChange={() => toggle("none")}
                                sx={{ color: "text.disabled", "&.Mui-checked": { color: "text.secondary" } }}
                            />
                        }
                        label={
                            <Stack direction="row" spacing={0.75} alignItems="center">
                                <HorizontalRuleIcon fontSize="small" sx={{ color: "text.disabled" }} />
                                <Typography variant="body2" color="text.secondary">none</Typography>
                            </Stack>
                        }
                        sx={{ mx: 0 }}
                    />
                    {isActive && (
                        <Button size="small" onClick={() => onChange([])} sx={{ mt: 0.5, alignSelf: "flex-start" }}>
                            clear filters
                        </Button>
                    )}
                </Stack>
            </Popover>
        </>
    )
}
