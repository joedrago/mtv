import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from "@mui/material/Container"
import { HomePage } from "./pages/HomePage.jsx"
import { PlaylistPage } from "./pages/PlaylistPage.jsx"
import { PlayerOverlay } from "./components/Player.jsx"

export const App = () => (
    <BrowserRouter>
        <Container maxWidth="md" sx={{ pt: 2, pb: 6 }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/p/:owner/:slug" element={<PlaylistPage />} />
            </Routes>
        </Container>
        <PlayerOverlay />
    </BrowserRouter>
)
