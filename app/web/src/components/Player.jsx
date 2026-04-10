import { useCallback, useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Slider from "@mui/material/Slider"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import CloseIcon from "@mui/icons-material/Close"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious"
import VolumeDownIcon from "@mui/icons-material/VolumeDown"
import VolumeOffIcon from "@mui/icons-material/VolumeOff"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { usePlayerStore } from "../store/player.js"
import { useMirrorStore } from "../store/mirror.js"
import { useUserStore } from "../store/user.js"
import { setOpinion } from "../api.js"
import { loadYouTubeApi } from "./youtubeApi.js"
import { Chyron } from "./Chyron.jsx"
import { OpinionButtons, OPINIONS } from "./OpinionButtons.jsx"

const HEARTBEAT_MS = 5000
const DRIFT_THRESHOLD_S = 0.75

const YoutubeSurface = ({ video, paused, volume, initialPosition, onEnded, surfaceRef }) => {
    const hostRef = useRef(null)
    const ytRef = useRef(null)
    const readyRef = useRef(false)
    // Refs so callbacks always see current values without stale closures
    const onEndedRef = useRef(onEnded)
    const pausedRef = useRef(paused)
    useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
    useEffect(() => { pausedRef.current = paused }, [paused])

    // Create the YT player once. It lives for the lifetime of this component.
    // iOS Safari only allows autoplay in an iframe that was initiated by a user
    // gesture — recreating the iframe for each track breaks that. By keeping the
    // same player alive and calling loadVideoById we stay inside the gesture scope.
    useEffect(() => {
        let cancelled = false
        readyRef.current = false

        loadYouTubeApi().then((YT) => {
            if (cancelled || !hostRef.current) return
            const v = video
            const startSeconds = Math.max(v.start_s > 0 ? v.start_s : 0, Math.floor(initialPosition || 0))
            const player = new YT.Player(hostRef.current, {
                host: "https://www.youtube.com",
                videoId: v.source_ref,
                width: window.innerWidth,
                height: window.innerHeight,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    playsinline: 1,
                    start: startSeconds,
                    end: v.end_s > 0 ? v.end_s : undefined
                },
                events: {
                    onReady: (e) => {
                        readyRef.current = true
                        e.target.setVolume(Math.round((volume ?? 1) * 100))
                        if (pausedRef.current) e.target.pauseVideo()
                        else e.target.playVideo()
                        if (initialPosition && Math.abs(initialPosition - startSeconds) > 0.5) {
                            e.target.seekTo(initialPosition, true)
                        }
                    },
                    onStateChange: (e) => {
                        if (e.data === YT.PlayerState.ENDED) onEndedRef.current?.()
                    },
                    onError: () => onEndedRef.current?.()
                }
            })
            ytRef.current = player
            if (surfaceRef) {
                surfaceRef.current = {
                    isReady: () => readyRef.current,
                    getCurrentTime: () => (readyRef.current ? (player.getCurrentTime?.() ?? 0) : 0),
                    seekTo: (s) => player.seekTo?.(s, true),
                    play: () => player.playVideo?.(),
                    pause: () => player.pauseVideo?.()
                }
            }
        })

        return () => {
            cancelled = true
            if (surfaceRef) surfaceRef.current = null
            if (ytRef.current?.destroy) ytRef.current.destroy()
            ytRef.current = null
            readyRef.current = false
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally runs once

    // When the track changes, reuse the existing player instead of recreating it.
    // This is critical for iOS Safari: loadVideoById preserves the user-gesture
    // context so subsequent tracks autoplay without requiring another tap.
    // Initialised to the first video's source so the mount run is a no-op
    // (the player constructor already has this video queued).
    const prevSourceRef = useRef(video.source_ref)
    useEffect(() => {
        if (prevSourceRef.current === video.source_ref) return
        prevSourceRef.current = video.source_ref
        if (!readyRef.current || !ytRef.current) return
        const startSeconds = Math.max(video.start_s > 0 ? video.start_s : 0, 0)
        const params = { videoId: video.source_ref, startSeconds }
        if (video.end_s > 0) params.endSeconds = video.end_s
        if (pausedRef.current) ytRef.current.cueVideoById(params)
        else ytRef.current.loadVideoById(params)
    }, [video.source_ref, video.start_s, video.end_s])

    useEffect(() => {
        if (!readyRef.current || !ytRef.current) return
        if (paused) ytRef.current.pauseVideo()
        else ytRef.current.playVideo()
    }, [paused])

    useEffect(() => {
        if (!readyRef.current || !ytRef.current) return
        ytRef.current.setVolume(Math.round((volume ?? 1) * 100))
    }, [volume])

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

const SelfHostedSurface = ({ video, paused, volume, initialPosition, onEnded, surfaceRef }) => {
    const videoRef = useRef(null)
    const readyRef = useRef(false)

    useEffect(() => {
        const el = videoRef.current
        if (!el) return
        readyRef.current = false

        const onLoaded = () => {
            readyRef.current = true
            const seekTarget = Math.max(video.start_s > 0 ? video.start_s : 0, initialPosition || 0)
            if (seekTarget > 0) el.currentTime = seekTarget
            el.volume = volume ?? 1
            if (paused) el.pause()
            else el.play().catch(() => {})
        }
        const onTime = () => {
            if (video.end_s > 0 && el.currentTime >= video.end_s) {
                el.pause()
                onEnded?.()
            }
        }
        const onEndedEv = () => onEnded?.()
        el.addEventListener("loadedmetadata", onLoaded)
        el.addEventListener("timeupdate", onTime)
        el.addEventListener("ended", onEndedEv)

        if (surfaceRef) {
            surfaceRef.current = {
                isReady: () => readyRef.current,
                getCurrentTime: () => el.currentTime,
                seekTo: (s) => {
                    el.currentTime = s
                },
                play: () => el.play().catch(() => {}),
                pause: () => el.pause()
            }
        }
        return () => {
            el.removeEventListener("loadedmetadata", onLoaded)
            el.removeEventListener("timeupdate", onTime)
            el.removeEventListener("ended", onEndedEv)
            if (surfaceRef) surfaceRef.current = null
            readyRef.current = false
        }
    }, [video.source_ref, video.start_s, video.end_s, onEnded])

    useEffect(() => {
        const el = videoRef.current
        if (!el || !readyRef.current) return
        if (paused) el.pause()
        else el.play().catch(() => {})
    }, [paused])

    useEffect(() => {
        const el = videoRef.current
        if (!el) return
        el.volume = volume ?? 1
    }, [volume])

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

const VolumeControl = () => {
    const volume = usePlayerStore((s) => s.volume)
    const setVolume = usePlayerStore((s) => s.setVolume)
    const [lastVolume, setLastVolume] = useState(volume || 0.5)

    const VolIcon = volume === 0 ? VolumeOffIcon : volume < 0.5 ? VolumeDownIcon : VolumeUpIcon

    const toggleMute = () => {
        if (volume > 0) {
            setLastVolume(volume || 0.5)
            setVolume(0)
        } else {
            setVolume(lastVolume || 0.5)
        }
    }

    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 130, flexShrink: 0 }}>
            <IconButton size="small" onClick={toggleMute} sx={{ color: "#fff" }}>
                <VolIcon fontSize="small" />
            </IconButton>
            <Slider
                size="small"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, v) => setVolume(Array.isArray(v) ? v[0] : v)}
                sx={{
                    color: "#fff",
                    "& .MuiSlider-thumb": { width: 12, height: 12 }
                }}
            />
        </Stack>
    )
}

export const PlayerOverlay = () => {
    const {
        isOpen,
        queue,
        index,
        close,
        next,
        prev,
        setPaused,
        setOpinionForCurrent,
        isMirror,
        paused,
        volume,
        initialPosition
    } = usePlayerStore()
    const signedIn = useUserStore((s) => !!s.user)
    const hostCode = useMirrorStore((s) => s.hostCode)
    const sessionState = useMirrorStore((s) => s.sessionState)
    const startHost = useMirrorStore((s) => s.startHost)
    const stopHost = useMirrorStore((s) => s.stopHost)
    const sendVideo = useMirrorStore((s) => s.sendVideo)
    const sendPlaying = useMirrorStore((s) => s.sendPlaying)
    const sendNext = useMirrorStore((s) => s.sendNext)
    const sendPrev = useMirrorStore((s) => s.sendPrev)
    const replaceMirrorVideo = usePlayerStore((s) => s.replaceMirrorVideo)

    const video = queue[index] ?? null
    const surfaceRef = useRef(null)
    const sessionStateRef = useRef(sessionState)
    sessionStateRef.current = sessionState
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Mobile layout: video pinned top (16:9), info + always-visible controls below
    const isPortraitMobile = useMediaQuery("(orientation: portrait) and (max-width: 900px)")

    // Desktop: hover on the outer container shows/hides controls via onMouseEnter/onMouseLeave.
    // Touch (non-portrait-mobile): tap on the video surface toggles controls with auto-hide.
    const [controlsVisible, setControlsVisible] = useState(false)
    const hideTimerRef = useRef(null)
    const clearHideTimer = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
    }, [])
    const handleVideoTap = useCallback(() => {
        if (controlsVisible) {
            clearHideTimer()
            setControlsVisible(false)
        } else {
            setControlsVisible(true)
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500)
        }
    }, [controlsVisible, clearHideTimer])
    useEffect(() => clearHideTimer, [clearHideTimer])

    useEffect(() => {
        const sync = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", sync)
        sync()
        return () => document.removeEventListener("fullscreenchange", sync)
    }, [])

    const applyOpinion = (value) => {
        if (!video || !signedIn) return
        const cur = video.my_opinion ?? null
        const nextVal = value === cur ? null : value
        setOpinionForCurrent(nextVal)
        setOpinion(video.id, nextVal)
    }

    // HOST: emit state on video change (includes mid-song mirror start).
    useEffect(() => {
        if (!hostCode || !video) return
        const pos = surfaceRef.current?.getCurrentTime?.() ?? 0
        sendVideo(video, { pos, playing: !paused })
    }, [hostCode, video?.id])

    // HOST: heartbeat while playing to keep viewers drift-corrected.
    useEffect(() => {
        if (!hostCode || paused || !video) return
        const id = setInterval(() => {
            const pos = surfaceRef.current?.getCurrentTime?.() ?? 0
            sendPlaying(true, pos)
        }, HEARTBEAT_MS)
        return () => clearInterval(id)
    }, [hostCode, paused, video, sendPlaying])

    // Apply incoming mirror state. Runs for both host and viewers.
    //   - Viewer: reacts to everything (video changes, pause, drift).
    //   - Host:   reacts to pause/play from viewers (but never swaps its own
    //             queue — it owns the queue).
    //
    // On a pause-state TRANSITION we snap-seek everyone to the exact
    // (already-rounded) position the initiator sent, so all participants
    // land on the same frame. Between transitions we just drift-correct.
    useEffect(() => {
        if (!sessionState?.video) return
        if (!hostCode && !isMirror) return

        const expected = sessionState.playing
            ? sessionState.pos + (Date.now() - sessionState.receivedAt) / 1000
            : sessionState.pos

        if (sessionState.video.id !== video?.id) {
            if (isMirror && !hostCode) {
                replaceMirrorVideo(sessionState.video, {
                    initialPosition: Math.max(0, expected),
                    paused: !sessionState.playing
                })
            }
            return
        }

        const targetPaused = !sessionState.playing
        if (paused !== targetPaused) {
            // Pause/play transition — snap to the exact pos from the sender.
            const snapPos = Math.max(0, sessionState.pos)
            surfaceRef.current?.seekTo?.(snapPos)
            if (targetPaused) surfaceRef.current?.pause?.()
            else surfaceRef.current?.play?.()
            setPaused(targetPaused)
            return
        }

        // Same paused state: viewers do ongoing drift correction.
        if (isMirror && !targetPaused && surfaceRef.current?.isReady?.()) {
            const localPos = surfaceRef.current.getCurrentTime?.() ?? 0
            if (Math.abs(localPos - expected) > DRIFT_THRESHOLD_S) {
                surfaceRef.current.seekTo(Math.max(0, expected))
            }
        }
    }, [sessionState, hostCode, isMirror])

    const handleNext = useCallback(() => {
        if (isMirror) sendNext()
        else next()
    }, [isMirror, sendNext, next])

    const handlePrev = useCallback(() => {
        if (isMirror) sendPrev()
        else prev()
    }, [isMirror, sendPrev, prev])

    const handleTogglePause = useCallback(() => {
        const newPaused = !paused
        // Round to the nearest second and snap locally first, so everyone
        // (including the initiator) lands on the same frame.
        const currentPos = surfaceRef.current?.getCurrentTime?.() ?? 0
        const snapPos = Math.max(0, Math.round(currentPos))
        surfaceRef.current?.seekTo?.(snapPos)
        if (newPaused) surfaceRef.current?.pause?.()
        else surfaceRef.current?.play?.()
        setPaused(newPaused)
        if (hostCode || isMirror) sendPlaying(!newPaused, snapPos)
    }, [paused, hostCode, isMirror, sendPlaying, setPaused])

    const toggleMirror = async () => {
        if (hostCode) {
            stopHost()
            return
        }
        const code = await startHost()
        if (!code) return
        const url = `${window.location.origin}/m/${code}`
        try {
            await navigator.clipboard?.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (_e) {
            /* no clipboard perms */
        }
    }

    const closeOverlay = () => {
        if (hostCode) stopHost()
        close()
    }

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen?.()
        } else {
            document.documentElement.requestFullscreen?.().catch(() => {})
        }
    }

    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === "Escape") closeOverlay()
            else if (e.key === "ArrowRight") handleNext()
            else if (e.key === "ArrowLeft") handlePrev()
            else if (e.key === " ") {
                e.preventDefault()
                handleTogglePause()
            } else {
                const opinion = OPINIONS.find((o) => o.key === e.key)
                if (opinion) applyOpinion(opinion.value)
            }
        }
        window.addEventListener("keydown", handler)
        const priorOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", handler)
            document.body.style.overflow = priorOverflow
        }
    }, [isOpen, video?.id, video?.my_opinion, hostCode, isMirror, paused])

    if (!isOpen || !video) return null

    const owner = { display_name: video.owner_display_name, label: video.owner_label }
    const chyronMode = isMirror || hostCode ? "mirror" : "solo"

    const iconBtnSx = { color: "#fff", p: { xs: "12px", md: "8px" } }
    const showControlBar = isPortraitMobile || controlsVisible

    const surface =
        video.source === "youtube" ? (
            <YoutubeSurface
                key="youtube"
                video={video}
                paused={paused}
                volume={volume}
                initialPosition={initialPosition}
                surfaceRef={surfaceRef}
                onEnded={next}
            />
        ) : (
            <SelfHostedSurface
                key={video.id}
                video={video}
                paused={paused}
                volume={volume}
                initialPosition={initialPosition}
                surfaceRef={surfaceRef}
                onEnded={next}
            />
        )

    return (
        <Box
            onMouseEnter={isPortraitMobile ? undefined : () => { clearHideTimer(); setControlsVisible(true) }}
            onMouseLeave={isPortraitMobile ? undefined : () => { clearHideTimer(); setControlsVisible(false) }}
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1300,
                background: "#000",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Box
                onClick={isPortraitMobile ? undefined : handleVideoTap}
                sx={
                    isPortraitMobile
                        ? {
                              position: "relative",
                              width: "100%",
                              aspectRatio: "16 / 9",
                              background: "#000",
                              flexShrink: 0
                          }
                        : { position: "absolute", inset: 0, cursor: "pointer" }
                }
            >
                {surface}
                <Chyron video={video} owner={owner} mode={chyronMode} />
            </Box>

            {isPortraitMobile && (
                <Stack spacing={0.5} sx={{ p: 2, color: "#fff", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {video.artist}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>
                        {video.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
                        {isMirror ? "mirroring" : `${index + 1} / ${queue.length}`}
                        {hostCode && ` · mirror ${hostCode}${copied ? " (copied)" : ""}`}
                    </Typography>
                </Stack>
            )}

            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: isPortraitMobile ? "relative" : "absolute",
                    left: 0,
                    right: 0,
                    bottom: isPortraitMobile ? undefined : 0,
                    pt: isPortraitMobile ? 1.5 : 6,
                    px: { xs: 1, md: 2 },
                    pb: isPortraitMobile ? 2 : 2,
                    background: isPortraitMobile
                        ? "rgba(0,0,0,0.92)"
                        : "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)",
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 0.5, md: 2 },
                    flexWrap: isPortraitMobile ? "wrap" : "nowrap",
                    rowGap: 1,
                    opacity: showControlBar ? 1 : 0,
                    pointerEvents: showControlBar ? "auto" : "none",
                    transition: "opacity 200ms",
                    flexShrink: 0,
                }}
            >
                <IconButton onClick={handlePrev} sx={iconBtnSx} disabled={!isMirror && index === 0}>
                    <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={handleTogglePause} sx={iconBtnSx}>
                    {paused ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
                <IconButton onClick={handleNext} sx={iconBtnSx}>
                    <SkipNextIcon />
                </IconButton>
                {!isPortraitMobile && <VolumeControl />}
                {!isPortraitMobile && (
                    <Stack sx={{ flexGrow: 1, color: "#fff", minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                            {video.artist} — {video.title}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                            {isMirror ? `mirroring` : `${index + 1} / ${queue.length}`}
                        </Typography>
                    </Stack>
                )}
                {isPortraitMobile && <Box sx={{ flexGrow: 1 }} />}
                {!isPortraitMobile && hostCode && (
                    <Chip
                        size="small"
                        label={copied ? `copied ${hostCode}` : `mirror ${hostCode}`}
                        sx={{
                            color: "#fff",
                            background: "rgba(255,255,255,0.15)",
                            fontVariantNumeric: "tabular-nums"
                        }}
                    />
                )}
                {signedIn && <OpinionButtons current={video.my_opinion ?? null} onSet={applyOpinion} />}
                {!isMirror && (
                    <Tooltip title={hostCode ? "stop mirroring" : "start mirroring"}>
                        <IconButton onClick={toggleMirror} sx={{ ...iconBtnSx, color: hostCode ? "primary.main" : "#fff" }}>
                            {hostCode ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </IconButton>
                    </Tooltip>
                )}
                {!isPortraitMobile && (
                    <IconButton onClick={toggleFullscreen} sx={iconBtnSx}>
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                )}
                <IconButton onClick={closeOverlay} sx={iconBtnSx}>
                    <CloseIcon />
                </IconButton>
            </Box>
        </Box>
    )
}
