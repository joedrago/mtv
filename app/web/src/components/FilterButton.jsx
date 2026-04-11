import { useState } from "react"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import FormControlLabel from "@mui/material/FormControlLabel"
import IconButton from "@mui/material/IconButton"
import Popover from "@mui/material/Popover"
import Stack from "@mui/material/Stack"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Typography from "@mui/material/Typography"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"
import { OPINIONS } from "./OpinionButtons.jsx"

export const AGE_OPTIONS = [
    { value: "week", label: "last 7 days" },
    { value: "month", label: "last 30 days" },
    { value: "year", label: "last year" },
    { value: "older", label: "older" },
]

export const FilterButton = ({
    activeOpinions,
    onOpinionsChange,
    contributors = [],
    activeContributors = [],
    onContributorsChange,
    activeAge = null,
    onAgeChange,
}) => {
    const [anchor, setAnchor] = useState(null)
    const isActive = activeOpinions.length > 0 || activeContributors.length > 0 || activeAge != null

    const toggleOpinion = (value) => {
        onOpinionsChange(
            activeOpinions.includes(value)
                ? activeOpinions.filter((v) => v !== value)
                : [...activeOpinions, value]
        )
    }

    const toggleContributor = (name) => {
        onContributorsChange(
            activeContributors.includes(name)
                ? activeContributors.filter((v) => v !== name)
                : [...activeContributors, name]
        )
    }

    const clearAll = () => {
        onOpinionsChange([])
        onContributorsChange([])
        onAgeChange(null)
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
                slotProps={{ paper: { sx: { background: "#1a1e26", p: 1.5, minWidth: 180, maxWidth: 260 } } }}
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
                                    onChange={() => toggleOpinion(o.value)}
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
                                onChange={() => toggleOpinion("none")}
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

                    {contributors.length > 0 && (
                        <>
                            <Divider sx={{ my: 0.75 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, pb: 0.5 }}>
                                filter by contributor
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ px: 0.5, width: "100%" }}>
                                {contributors.map((name) => {
                                    const selected = activeContributors.includes(name)
                                    return (
                                        <Chip
                                            key={name}
                                            label={name}
                                            size="small"
                                            onClick={() => toggleContributor(name)}
                                            variant={selected ? "filled" : "outlined"}
                                            sx={{
                                                fontSize: "0.75rem",
                                                height: 24,
                                                ...(selected
                                                    ? { color: "primary.main", borderColor: "primary.main", backgroundColor: "rgba(232,72,85,0.15)" }
                                                    : { color: "text.secondary", borderColor: "rgba(255,255,255,0.15)" }),
                                            }}
                                        />
                                    )
                                })}
                            </Stack>
                        </>
                    )}

                    <Divider sx={{ my: 0.75 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, pb: 0.75 }}>
                        filter by age
                    </Typography>
                    <ToggleButtonGroup
                        value={activeAge}
                        exclusive
                        onChange={(_e, val) => onAgeChange(val)}
                        size="small"
                        orientation="vertical"
                        sx={{ alignSelf: "stretch" }}
                    >
                        {AGE_OPTIONS.map((opt) => (
                            <ToggleButton
                                key={opt.value}
                                value={opt.value}
                                sx={{
                                    justifyContent: "flex-start",
                                    px: 1.5,
                                    py: 0.4,
                                    textTransform: "none",
                                    fontSize: "0.8125rem",
                                    border: "1px solid rgba(255,255,255,0.1) !important",
                                    "&.Mui-selected": { color: "primary.main", background: "rgba(232,72,85,0.1)" },
                                }}
                            >
                                {opt.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {isActive && (
                        <Button size="small" onClick={clearAll} sx={{ mt: 0.75, alignSelf: "flex-start" }}>
                            clear filters
                        </Button>
                    )}
                </Stack>
            </Popover>
        </>
    )
}
