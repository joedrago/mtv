import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import FavoriteIcon from "@mui/icons-material/Favorite"
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule"
import PersonIcon from "@mui/icons-material/Person"
import QueueMusicIcon from "@mui/icons-material/QueueMusic"
import SearchIcon from "@mui/icons-material/Search"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import { fetchJson } from "../api.js"
import { usePlayerStore } from "../store/player.js"
import { useToastStore } from "../store/toast.js"
import { useUserStore } from "../store/user.js"

const shuffled = (arr) => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

const ActionCard = ({ Icon, label, description, onClick, loading = false, iconColor = "primary.main" }) => (
    <Paper
        variant="outlined"
        onClick={loading ? undefined : onClick}
        sx={{
            width: 200,
            p: 3,
            cursor: loading ? "default" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            opacity: loading ? 0.6 : 1,
            transition: "background 0.15s, opacity 0.15s",
            "&:hover": loading ? {} : { bgcolor: "action.hover" },
            userSelect: "none"
        }}
    >
        {loading ? (
            <CircularProgress size={48} sx={{ color: iconColor }} />
        ) : (
            <Icon sx={{ fontSize: 48, color: iconColor }} />
        )}
        <Typography variant="subtitle1" fontWeight={600} textAlign="center">
            {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
            {description}
        </Typography>
    </Paper>
)

export const HomePage = () => {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const openQueue = usePlayerStore((s) => s.openQueue)
    const showToast = useToastStore((s) => s.show)
    const [loadingKey, setLoadingKey] = useState(null)

    const watchVideos = useCallback(
        async (key, filter = null) => {
            if (loadingKey) return
            setLoadingKey(key)
            try {
                const { videos } = await fetchJson("/api/videos")
                const queue = filter ? videos.filter(filter) : videos
                if (!queue.length) {
                    showToast("no videos found")
                    return
                }
                openQueue(shuffled(queue), { startAt: 0 })
            } catch {
                showToast("failed to load videos")
            } finally {
                setLoadingKey(null)
            }
        },
        [loadingKey, openQueue, showToast]
    )

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 200px)", gap: 2, mt: 2, justifyContent: "center" }}>
            <ActionCard
                Icon={ShuffleIcon}
                label="shuffle all"
                description="play every video in a random order"
                onClick={() => watchVideos("all")}
                loading={loadingKey === "all"}
            />
            <ActionCard
                Icon={SearchIcon}
                label="browse"
                description="search and filter the full catalog"
                onClick={() => navigate("/browse")}
            />
            <ActionCard
                Icon={QueueMusicIcon}
                label="playlists"
                description={user ? "view and manage playlists" : "view others' playlists"}
                onClick={() => navigate("/playlists")}
            />
            {user && (
                <>
                    <ActionCard
                        Icon={FavoriteIcon}
                        label="shuffle liked"
                        description="play your loved and liked videos"
                        onClick={() =>
                            watchVideos("liked", (v) => v.my_opinion === "love" || v.my_opinion === "like")
                        }
                        loading={loadingKey === "liked"}
                        iconColor="#ff4f70"
                    />
                    <ActionCard
                        Icon={HorizontalRuleIcon}
                        label="shuffle unrated"
                        description="play videos you haven't rated yet"
                        onClick={() => watchVideos("unrated", (v) => !v.my_opinion)}
                        loading={loadingKey === "unrated"}
                        iconColor="text.disabled"
                    />
                    <ActionCard
                        Icon={PersonIcon}
                        label="my account"
                        description="settings and stats"
                        onClick={() => navigate("/me")}
                    />
                </>
            )}
        </Box>
    )
}
