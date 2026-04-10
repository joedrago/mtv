import Typography from "@mui/material/Typography"
import { RatingCell, opinionSortValue } from "./OpinionButtons.jsx"

export const fmtDuration = (s) => {
    if (s == null || s < 0) return "—"
    const m = Math.floor(s / 60)
    const r = Math.floor(s % 60)
    return `${m}:${String(r).padStart(2, "0")}`
}

// Columns for video tables (playlist items, library browse).
// onRate is called with (videoId, newValue|null).
export const buildVideoColumns = ({ signedIn, onRate }) => {
    const cols = [
        {
            key: "artist",
            label: "artist",
            sortWith: "title",
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
            render: (r) => <Typography variant="body2">{r.title}</Typography>
        },
        {
            key: "owner_display_name",
            label: "added",
            sortWith: "artist",
            width: "120px",
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
    }
    return cols
}
