import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Dialog, DialogContent, Stack, Chip, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Emojis representativos por país
const COUNTRY_STAMPS = {
    'GB': { emoji: '🏰', name: 'Reino Unido', landmark: 'Big Ben' },
    'ES': { emoji: '🇪🇸', name: 'España', landmark: 'Sagrada Familia' },
    'FR': { emoji: '🗼', name: 'Francia', landmark: 'Torre Eiffel' },
    'IT': { emoji: '🍕', name: 'Italia', landmark: 'Coliseo' },
    'DE': { emoji: '🍺', name: 'Alemania', landmark: 'Puerta de Brandenburgo' },
    'US': { emoji: '🗽', name: 'Estados Unidos', landmark: 'Estatua de la Libertad' },
    'JP': { emoji: '🗻', name: 'Japón', landmark: 'Monte Fuji' },
    'PT': { emoji: '⛵', name: 'Portugal', landmark: 'Torre de Belém' },
    'GR': { emoji: '🏛️', name: 'Grecia', landmark: 'Partenón' },
    'NL': { emoji: '🌷', name: 'Países Bajos', landmark: 'Molinos de viento' },
    'BE': { emoji: '🧇', name: 'Bélgica', landmark: 'Atomium' },
    'CH': { emoji: '🏔️', name: 'Suiza', landmark: 'Matterhorn' },
    'AT': { emoji: '🎻', name: 'Austria', landmark: 'Ópera de Viena' },
    'CA': { emoji: '🍁', name: 'Canadá', landmark: 'CN Tower' },
    'MX': { emoji: '🌮', name: 'México', landmark: 'Pirámides de Teotihuacán' },
    'AR': { emoji: '🥩', name: 'Argentina', landmark: 'Obelisco' },
    'BR': { emoji: '🏖️', name: 'Brasil', landmark: 'Cristo Redentor' },
    'CO': { emoji: '☕', name: 'Colombia', landmark: 'Santuario de Las Lajas' },
    'PE': { emoji: '🦙', name: 'Perú', landmark: 'Machu Picchu' },
    'CL': { emoji: '🌶️', name: 'Chile', landmark: 'Isla de Pascua' },
    'CN': { emoji: '🐉', name: 'China', landmark: 'Gran Muralla' },
    'KR': { emoji: '🏯', name: 'Corea del Sur', landmark: 'Gyeongbokgung' },
    'TH': { emoji: '🛕', name: 'Tailandia', landmark: 'Templos de Bangkok' },
    'VN': { emoji: '🍜', name: 'Vietnam', landmark: 'Bahía de Halong' },
    'ID': { emoji: '🗿', name: 'Indonesia', landmark: 'Borobudur' },
    'AU': { emoji: '🦘', name: 'Australia', landmark: 'Ópera de Sydney' },
    'NZ': { emoji: '🥝', name: 'Nueva Zelanda', landmark: 'Milford Sound' },
    'ZA': { emoji: '🦁', name: 'Sudáfrica', landmark: 'Table Mountain' },
    'EG': { emoji: '🐪', name: 'Egipto', landmark: 'Pirámides de Giza' },
    'MA': { emoji: '🕌', name: 'Marruecos', landmark: 'Medina de Marrakech' },
    'IE': { emoji: '☘️', name: 'Irlanda', landmark: 'Acantilados de Moher' },
    'SE': { emoji: '👑', name: 'Suecia', landmark: 'Palacio Real' },
    'NO': { emoji: '❄️', name: 'Noruega', landmark: 'Fiordos' },
    'DK': { emoji: '🧜', name: 'Dinamarca', landmark: 'La Sirenita' },
    'FI': { emoji: '🦌', name: 'Finlandia', landmark: 'Aurora Boreal' },
    'PL': { emoji: '🏰', name: 'Polonia', landmark: 'Castillo de Wawel' },
    'CZ': { emoji: '🍺', name: 'República Checa', landmark: 'Puente de Carlos' },
    'HU': { emoji: '🎭', name: 'Hungría', landmark: 'Parlamento de Budapest' },
    'RO': { emoji: '🧛', name: 'Rumanía', landmark: 'Castillo de Bran' },
    'TR': { emoji: '🕌', name: 'Turquía', landmark: 'Hagia Sophia' }
};

function VirtualStamps({ visitedCodes, tripsList }) {
    const theme = useTheme();
    const [selectedStamp, setSelectedStamp] = useState(null);

    // Obtener información de viajes por país
    const getCountryInfo = (code) => {
        const trips = tripsList.filter(t => t.country_code === code);
        return {
            visits: trips.length,
            firstVisit: trips.length > 0 ? new Date(trips[0].start_date).toLocaleDateString() : null,
            lastVisit: trips.length > 0 ? new Date(trips[trips.length - 1].start_date).toLocaleDateString() : null
        };
    };

    // Países disponibles para mostrar (todos los del diccionario)
    const allCountries = Object.keys(COUNTRY_STAMPS);
    const unlockedCount = visitedCodes.length;
    const totalCount = allCountries.length;

    return (
        <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="800">
                    🎫 Mi Colección de Sellos
                </Typography>
                <Chip
                    label={`${unlockedCount}/${totalCount}`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                    color={unlockedCount > totalCount / 2 ? 'success' : 'default'}
                />
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: '24px',
                    bgcolor: theme.palette.mode === 'light' ? '#FAF8F3' : '#2A2520',
                    border: '2px dashed rgba(0,0,0,0.1)'
                }}
            >
                <Grid container spacing={1.5}>
                    {allCountries.map((code) => {
                        const stamp = COUNTRY_STAMPS[code];
                        const isUnlocked = visitedCodes.includes(code);
                        const info = isUnlocked ? getCountryInfo(code) : null;

                        return (
                            <Grid item xs={3} sm={2.4} md={2} key={code}>
                                <Paper
                                    elevation={0}
                                    onClick={() => isUnlocked && setSelectedStamp({ code, stamp, info })}
                                    sx={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px',
                                        border: isUnlocked
                                            ? `3px solid ${theme.palette.primary.main}`
                                            : '2px dashed rgba(0,0,0,0.1)',
                                        bgcolor: isUnlocked
                                            ? theme.palette.mode === 'light' ? 'white' : 'rgba(255,255,255,0.05)'
                                            : 'transparent',
                                        position: 'relative',
                                        cursor: isUnlocked ? 'pointer' : 'default',
                                        transition: 'all 0.3s',
                                        transform: isUnlocked ? 'rotate(-3deg)' : 'none',
                                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                        opacity: isUnlocked ? 1 : 0.3,
                                        '&:hover': isUnlocked ? {
                                            transform: 'rotate(0deg) scale(1.05)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                        } : {}
                                    }}
                                >
                                    {/* Emoji del país */}
                                    <Typography fontSize="2rem" sx={{ filter: isUnlocked ? 'none' : 'grayscale(100%) blur(2px)' }}>
                                        {stamp.emoji}
                                    </Typography>

                                    {/* Checkmark si está desbloqueado */}
                                    {isUnlocked && (
                                        <CheckCircleIcon
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                fontSize: 16,
                                                color: 'success.main'
                                            }}
                                        />
                                    )}

                                    {/* Contador de visitas */}
                                    {isUnlocked && info.visits > 1 && (
                                        <Chip
                                            label={`×${info.visits}`}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 4,
                                                height: 18,
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                bgcolor: 'primary.main',
                                                color: 'white'
                                            }}
                                        />
                                    )}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Mensaje motivacional */}
                {unlockedCount < totalCount && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                        display="block"
                        mt={3}
                        fontWeight="600"
                    >
                        🌟 Te faltan {totalCount - unlockedCount} sellos para completar tu colección
                    </Typography>
                )}

                {unlockedCount === totalCount && (
                    <Box textAlign="center" mt={3}>
                        <Typography variant="h6" fontWeight="800" gutterBottom>
                            🏆 ¡COLECCIÓN COMPLETA! 🏆
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Has visitado todos los países disponibles. ¡Eres una leyenda viajera!
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Modal con detalles del sello */}
            <Dialog
                open={!!selectedStamp}
                onClose={() => setSelectedStamp(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        maxWidth: 400,
                        m: 2
                    }
                }}
            >
                {selectedStamp && (
                    <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                        <IconButton
                            onClick={() => setSelectedStamp(null)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Sello grande */}
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                border: `5px solid ${theme.palette.primary.main}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '4rem',
                                mx: 'auto',
                                mb: 3,
                                bgcolor: theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255,255,255,0.05)',
                                transform: 'rotate(-5deg)'
                            }}
                        >
                            {selectedStamp.stamp.emoji}
                        </Box>

                        <Typography variant="h5" fontWeight="800" gutterBottom>
                            {selectedStamp.stamp.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {selectedStamp.stamp.landmark}
                        </Typography>

                        <Stack spacing={2} mt={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="700">
                                    PRIMERA VISITA
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedStamp.info.firstVisit}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="700">
                                    ÚLTIMA VISITA
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {selectedStamp.info.lastVisit}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="700">
                                    NÚMERO DE VISITAS
                                </Typography>
                                <Typography variant="h4" fontWeight="900" color="primary">
                                    {selectedStamp.info.visits}
                                </Typography>
                            </Box>
                        </Stack>
                    </DialogContent>
                )}
            </Dialog>
        </Box>
    );
}

export default VirtualStamps;
