import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import { buildChyron } from "../../../shared/chyron.js"

// Fades in a few seconds after a new track starts, then fades out a few seconds
// later. Matches the behavior of the old play.coffee showInfo() routine.

const FADE_IN_DELAY_MS = 3000
const FADE_OUT_DELAY_MS = 15000
const FADE_MS = 1000

export const Chyron = ({ video, owner, mode }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(false)
        const t1 = setTimeout(() => setVisible(true), FADE_IN_DELAY_MS)
        const t2 = setTimeout(() => setVisible(false), FADE_OUT_DELAY_MS)
        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }
    }, [video?.id])

    if (!video) return null
    const lines = buildChyron(video, owner, { mode })
    if (!lines.length) return null

    return (
        <Box
            sx={{
                position: "absolute",
                left: "3%",
                bottom: "3%",
                fontFamily: '"Kabel Black"',
                fontSize: "clamp(12px, min(5vh, 2.8vw), 48px)",
                lineHeight: 1,
                color: "#ffffff",
                textShadow: "0.1em 0.1em #000000",
                opacity: visible ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "pre"
            }}
        >
            {lines.join("\n")}
        </Box>
    )
}
