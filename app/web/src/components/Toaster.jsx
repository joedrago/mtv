import Snackbar from "@mui/material/Snackbar"
import { useToastStore } from "../store/toast.js"

export const Toaster = () => {
    const current = useToastStore((s) => s.current)
    const clear = useToastStore((s) => s.clear)

    return (
        <Snackbar
            open={!!current}
            message={current?.message ?? ""}
            autoHideDuration={2500}
            onClose={clear}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            key={current?.key}
            ContentProps={{
                sx: {
                    background: "#1a1e26",
                    color: "#e6e8eb",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    fontSize: "0.875rem"
                }
            }}
        />
    )
}
