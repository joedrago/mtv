import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

// Scrollable "up next" list for the player overlay. Highlights the current
// track, auto-scrolls it into view when the index changes, and calls onJump
// when a row is clicked. Layout-agnostic — the caller controls width/height
// via sx and the outer container's flex sizing.
export const QueuePanel = ({ queue, index, onJump, sx }) => {
    const listRef = useRef(null)

    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-queue-row="${index}"]`)
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, [index])

    return (
        <Box
            ref={listRef}
            sx={{
                overflowY: "auto",
                color: "#fff",
                // Narrow, subtle scrollbar that matches the dark overlay.
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.25)", borderRadius: 4 },
                ...sx
            }}
        >
            {queue.map((v, i) => {
                const active = i === index
                return (
                    <Stack
                        key={`${v.id ?? v.source_ref}-${i}`}
                        data-queue-row={i}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        onClick={() => onJump(i)}
                        sx={{
                            px: 1,
                            py: 0.75,
                            cursor: "pointer",
                            background: active ? "rgba(255,255,255,0.14)" : "transparent",
                            borderLeft: active ? "3px solid" : "3px solid transparent",
                            borderLeftColor: active ? "primary.main" : "transparent",
                            "&:hover": { background: "rgba(255,255,255,0.08)" }
                        }}
                    >
                        {v.thumb && (
                            <Box
                                component="img"
                                src={v.thumb}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                sx={{
                                    width: 56,
                                    height: 32,
                                    objectFit: "cover",
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                    opacity: active ? 1 : 0.85
                                }}
                            />
                        )}
                        <Stack sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: active ? 700 : 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.2
                                }}
                            >
                                {v.artist}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    opacity: 0.7,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.2
                                }}
                            >
                                {v.title}
                            </Typography>
                        </Stack>
                    </Stack>
                )
            })}
        </Box>
    )
}
