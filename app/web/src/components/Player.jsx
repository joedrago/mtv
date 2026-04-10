import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious"
import { usePlayerStore } from "../store/player.js"
import { loadYouTubeApi } from "./youtubeApi.js"
import { Chyron } from "./Chyron.jsx"

const YoutubeSurface = ({ video, onEnded }) => {
    const hostRef = useRef(null)
    const ytRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        let player = null

        loadYouTubeApi().then((YT) => {
            if (cancelled || !hostRef.current) return
            player = new YT.Player(hostRef.current, {
                host: "https://www.youtube.com",
                videoId: video.source_ref,
                width: window.innerWidth,
                height: window.innerHeight,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    playsinline: 1,
                    start: video.start_s > 0 ? video.start_s : 0,
                    end: video.end_s > 0 ? video.end_s : undefined
                },
                events: {
                    onReady: (e) => e.target.playVideo(),
                    onStateChange: (e) => {
                        if (e.data === YT.PlayerState.ENDED) onEnded?.()
                    },
                    onError: () => onEnded?.()
                }
            })
            ytRef.current = player
        })

        return () => {
            cancelled = true
            if (ytRef.current?.destroy) ytRef.current.destroy()
            ytRef.current = null
        }
    }, [video.source_ref, video.start_s, video.end_s, onEnded])

    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                "& > *": { width: "100% !important", height: "100% !important" }
            }}
        >
            <div ref={hostRef} />
        </Box>
    )
}

const SelfHostedSurface = ({ video, onEnded }) => {
    const videoRef = useRef(null)

    useEffect(() => {
        const el = videoRef.current
        if (!el) return
        const onLoaded = () => {
            if (video.start_s > 0) el.currentTime = video.start_s
            el.play().catch(() => {})
        }
        const onTime = () => {
            if (video.end_s > 0 && el.currentTime >= video.end_s) {
                el.pause()
                onEnded?.()
            }
        }
        el.addEventListener("loadedmetadata", onLoaded)
        el.addEventListener("timeupdate", onTime)
        el.addEventListener("ended", onEnded)
        return () => {
            el.removeEventListener("loadedmetadata", onLoaded)
            el.removeEventListener("timeupdate", onTime)
            el.removeEventListener("ended", onEnded)
        }
    }, [video.source_ref, video.start_s, video.end_s, onEnded])

    return (
        <Box
            component="video"
            ref={videoRef}
            src={`/videos/${video.source_ref}.mp4`}
            playsInline
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        />
    )
}

export const PlayerOverlay = () => {
    const { isOpen, queue, index, close, next, prev } = usePlayerStore()
    const video = queue[index] ?? null

    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === "Escape") close()
            else if (e.key === "ArrowRight") next()
            else if (e.key === "ArrowLeft") prev()
        }
        window.addEventListener("keydown", handler)
        const priorOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", handler)
            document.body.style.overflow = priorOverflow
        }
    }, [isOpen, close, next, prev])

    if (!isOpen || !video) return null

    const owner = {
        display_name: video.owner_display_name,
        label: video.owner_label
    }

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1300,
                background: "#000",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Box sx={{ position: "absolute", inset: 0 }}>
                {video.source === "youtube" ? (
                    <YoutubeSurface key={video.id} video={video} onEnded={next} />
                ) : (
                    <SelfHostedSurface key={video.id} video={video} onEnded={next} />
                )}
                <Chyron video={video} owner={owner} mode="solo" />
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pt: 6,
                    px: 2,
                    pb: 2,
                    background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    opacity: 0,
                    transition: "opacity 200ms",
                    "&:hover": { opacity: 1 }
                }}
            >
                <IconButton onClick={prev} sx={{ color: "#fff" }} disabled={index === 0}>
                    <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={next} sx={{ color: "#fff" }}>
                    <SkipNextIcon />
                </IconButton>
                <Stack sx={{ flexGrow: 1, color: "#fff" }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {video.artist}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        {index + 1} / {queue.length}
                    </Typography>
                </Stack>
                <IconButton onClick={close} sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </Box>
        </Box>
    )
}
