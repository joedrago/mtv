import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from "@mui/material/Container"
import { HomePage } from "./pages/HomePage.jsx"
import { PlaylistPage } from "./pages/PlaylistPage.jsx"
import { BrowsePage } from "./pages/BrowsePage.jsx"
import { MirrorPage } from "./pages/MirrorPage.jsx"
import { AccountPage } from "./pages/AccountPage.jsx"
import { AdminPage } from "./pages/AdminPage.jsx"
import { PlayerOverlay } from "./components/Player.jsx"
import { NavBar } from "./components/NavBar.jsx"
import { Toaster } from "./components/Toaster.jsx"
import { useUserStore } from "./store/user.js"

export const App = () => {
    const load = useUserStore((s) => s.load)
    useEffect(() => {
        load()
    }, [load])

    return (
        <BrowserRouter>
            <Container maxWidth="lg" sx={{ pt: 2, pb: 6 }}>
                <NavBar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/p/:owner/:slug" element={<PlaylistPage />} />
                    <Route path="/m/:code" element={<MirrorPage />} />
                    <Route path="/me" element={<AccountPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </Container>
            <PlayerOverlay />
            <Toaster />
        </BrowserRouter>
    )
}
