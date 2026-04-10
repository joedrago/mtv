import { Link as RouterLink, useLocation } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useUserStore } from "../store/user.js"

const NavLink = ({ to, label }) => {
    const loc = useLocation()
    const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to))
    return (
        <Button
            component={RouterLink}
            to={to}
            size="small"
            sx={{
                color: active ? "text.primary" : "text.secondary",
                fontWeight: active ? 600 : 400,
                textTransform: "none",
                minWidth: 0,
                px: 1
            }}
        >
            {label}
        </Button>
    )
}

export const NavBar = () => {
    const user = useUserStore((s) => s.user)
    const signOut = useUserStore((s) => s.signOut)

    return (
        <Stack direction="row" alignItems="center" sx={{ mb: 3, gap: 2, flexWrap: "wrap", rowGap: 1 }}>
            <Box
                component={RouterLink}
                to="/"
                sx={{
                    fontFamily: '"Kabel Black"',
                    fontSize: "40px",
                    color: "primary.main",
                    textDecoration: "none",
                    lineHeight: 1,
                    letterSpacing: "-0.02em"
                }}
            >
                mtv
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <NavLink to="/" label="home" />
                <NavLink to="/browse" label="browse" />
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            {user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {user.display_name}
                    </Typography>
                    {user.is_administrator && <Chip size="small" color="primary" label="admin" />}
                    {user.is_contributor && <Chip size="small" color="secondary" label="contributor" />}
                    <Button size="small" onClick={signOut} sx={{ textTransform: "none" }}>
                        sign out
                    </Button>
                </Stack>
            ) : (
                <Button size="small" variant="contained" href="/auth/discord" sx={{ textTransform: "none" }}>
                    sign in with discord
                </Button>
            )}
        </Stack>
    )
}
