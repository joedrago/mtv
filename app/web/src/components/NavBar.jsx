import { Link as RouterLink, useLocation } from "react-router-dom"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
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
                {user?.is_contributor && <NavLink to="/contribute" label="contribute" />}
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            {user ? (
                <Typography variant="body2" color="text.secondary">
                    hello,{" "}
                    <Box
                        component={RouterLink}
                        to="/me"
                        sx={{
                            color: "primary.main",
                            textDecoration: "none",
                            fontWeight: 600,
                            "&:hover": { textDecoration: "underline" }
                        }}
                    >
                        {user.display_name}
                    </Box>
                </Typography>
            ) : (
                <Button size="small" variant="contained" href="/auth/discord" sx={{ textTransform: "none" }}>
                    sign in with discord
                </Button>
            )}
        </Stack>
    )
}
