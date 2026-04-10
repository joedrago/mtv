import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from "@mui/material/Container"
import { HomePage } from "./pages/HomePage.jsx"
import { PlaylistPage } from "./pages/PlaylistPage.jsx"
import { BrowsePage } from "./pages/BrowsePage.jsx"
import { PlayerOverlay } from "./components/Player.jsx"
import { NavBar } from "./components/NavBar.jsx"
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
                </Routes>
            </Container>
            <PlayerOverlay />
        </BrowserRouter>
    )
}
