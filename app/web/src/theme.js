import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#0f1115",
            paper: "#161a21"
        },
        primary: {
            main: "#e84855"
        },
        secondary: {
            main: "#6a8eae"
        },
        text: {
            primary: "#e6e8eb",
            secondary: "#9aa0a8"
        }
    },
    shape: { borderRadius: 8 },
    typography: {
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    }
})
