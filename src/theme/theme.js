// --- DEFINICIÓN DE TEMAS (LIGHT / DARK) ---
export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        primary: { main: "#6750A4", light: "#EADDFF", contrastText: "#FFFFFF" },
        secondary: { main: "#625B71", light: "#E8DEF8" },
        ...(mode === "light"
            ? {
                // CAMBIO 1: Fondo gris suave (estilo app moderna) en lugar de blanco puro
                background: { default: '#FFFFFF', paper: '#FFFFFF' },
                text: { primary: "#1C1B1F", secondary: "#49454F" },
                custom: {
                    flight: { bg: "#D7E3FF", color: "#001B3D", border: "transparent" },
                    food: { bg: "#FFE0B2", color: "#E65100", border: "transparent" },
                    place: { bg: "#FFCDD2", color: "#C62828", border: "transparent" },
                    transport: {
                        bg: "#C4EED0",
                        color: "#00210E",
                        border: "transparent",
                    },
                    note: {
                        bg: "#fffbeb",
                        color: "#92400e",
                        border: "#fde68a",
                        titleColor: "#b45309",
                    },
                    dateChip: { bg: "#efddff", color: "#000000" },
                    filterActive: { bg: "primary.main", color: "#FFFFFF" },
                },
            }
            : {
                background: { default: '#0A0A0A', paper: '#1D1F21' },
                text: { primary: "#E3E3E3", secondary: "#A0A0A0" },
                custom: {
                    flight: { bg: "#36517d", color: "#d4e3ff", border: "#4b648a" },
                    food: { bg: "#704216", color: "#ffdbc2", border: "#8f5820" },
                    place: { bg: "#692222", color: "#ffdad6", border: "#8c3333" },
                    transport: { bg: "#1b3622", color: "#bcebe0", border: "#2e5739" },
                    note: {
                        bg: "#3d3614",
                        color: "#FFF8E1",
                        border: "#5e5423",
                        titleColor: "#f7df94",
                    },
                    dateChip: { bg: "#4F378B", color: "#EADDFF" },
                    filterActive: { bg: "primary.main", color: "primary.contrastText" },
                },
            }),
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        // Fuente para Títulos (La de tu imagen)
        h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
        h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
        h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
        subtitle1: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
        subtitle2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },


        body2: { letterSpacing: 0.15, fontSize: "0.8rem" },
        button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: "50px", padding: "6px 20px", boxShadow: "none" },
            },
        },
        // CAMBIO 2: Tarjetas estilo "Elevado limpio"
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: "16px", // Bordes redondeados pero no excesivos
                    // Sombra suave grisácea en modo claro, nada en oscuro
                    boxShadow:
                        theme.palette.mode === "light"
                            ? "0 2px 12px rgba(0,0,0,0.06)"
                            : "0 4px 10px rgba(0,0,0,0.3)",
                    border: "none", // IMPORTANTE: Quitamos el borde por defecto
                    backgroundImage: "none",
                    // Microinteracción: se eleva un poquito al pasar el ratón
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                            theme.palette.mode === "light"
                                ? "0 6px 16px rgba(0,0,0,0.1)"
                                : "0 6px 16px rgba(0,0,0,0.4)",
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: "28px",
                    padding: "8px",
                    backgroundImage: "none",
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    borderRadius: "16px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    backgroundColor: "#EADDFF",
                    color: "#21005D",
                    "&:hover": { backgroundColor: "#D0BCFF" },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                    "& .MuiFilledInput-root": {
                        borderTopLeftRadius: "4px",
                        borderTopRightRadius: "4px",
                    },
                },
            },
        },
        MuiChip: { styleOverrides: { root: { borderRadius: "8px" } } },
        MuiAppBar: {
            styleOverrides: {
                root: { boxShadow: "none", borderBottom: "1px solid rgba(0,0,0,0.05)" },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                    textTransform: "none",
                    border: "1px solid rgba(0,0,0,0.12)",
                },
            },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "&.Mui-selected": {
                        color:
                            theme.palette.mode === "dark"
                                ? "#FFFFFF"
                                : theme.palette.primary.main,
                    },
                    "& .MuiBottomNavigationAction-label.Mui-selected": {
                        color:
                            theme.palette.mode === "dark"
                                ? "#FFFFFF"
                                : theme.palette.primary.main,
                        fontWeight: 700,
                    },
                }),
            },
        },
    },
});