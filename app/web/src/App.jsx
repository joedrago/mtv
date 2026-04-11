import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom"
import Container from "@mui/material/Container"
import { useMirrorStore } from "./store/mirror.js"
import { HomePage } from "./pages/HomePage.jsx"
import { PlaylistsPage } from "./pages/PlaylistsPage.jsx"
import { PlaylistPage } from "./pages/PlaylistPage.jsx"
import { BrowsePage } from "./pages/BrowsePage.jsx"
import { MirrorPage } from "./pages/MirrorPage.jsx"
import { AccountPage } from "./pages/AccountPage.jsx"
import { AdminPage } from "./pages/AdminPage.jsx"
import { ContributePage } from "./pages/ContributePage.jsx"
import { PlayerOverlay } from "./components/Player.jsx"
import { NavBar } from "./components/NavBar.jsx"
import { Toaster } from "./components/Toaster.jsx"
import { usePlayerStore } from "./store/player.js"
import { useUserStore } from "./store/user.js"

const PopWatcher = () => {
    const location = useLocation()
    const navType = useNavigationType()
    const close = usePlayerStore((s) => s.close)
    useEffect(() => {
        if (navType === "POP") close()
    }, [location, navType, close])
    return null
}

export const App = () => {
    const load = useUserStore((s) => s.load)
    useEffect(() => {
        load()
        // Absorb ?dj=CODE into DJ mode so the code persists across navigation.
        // A savvy user can craft /?dj=MYSHOW to start a named session.
        const p = new URLSearchParams(window.location.search)
        const h = p.get("dj")
        if (h) {
            useMirrorStore.getState().setDjCode(h)
            p.delete("dj")
            const qs = p.toString()
            history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""))
        }
    }, [load])

    return (
        <BrowserRouter>
            <PopWatcher />
            <Container maxWidth="lg" sx={{ pt: 2, pb: 6 }}>
                <NavBar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/playlists" element={<PlaylistsPage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/p/:owner/:slug" element={<PlaylistPage />} />
                    <Route path="/m/:code" element={<MirrorPage />} />
                    <Route path="/me" element={<AccountPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/contribute" element={<ContributePage />} />
                </Routes>
            </Container>
            <PlayerOverlay />
            <Toaster />
        </BrowserRouter>
    )
}
