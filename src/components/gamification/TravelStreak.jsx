import React from 'react';
import { Box, Paper, Typography, Stack, Chip, LinearProgress, useTheme } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function TravelStreak({ currentStreak, maxStreak }) {
    const theme = useTheme();

    // Determinar nivel de intensidad de la llama
    const getFlameIntensity = (streak) => {
        if (streak >= 12) return { emoji: '🔥🔥🔥', color: '#FF3D00', label: 'LEGENDARIO' };
        if (streak >= 6) return { emoji: '🔥🔥', color: '#FF6F00', label: 'IMPARABLE' };
        if (streak >= 3) return { emoji: '🔥', color: '#FF9800', label: 'EN RACHA' };
        if (streak >= 1) return { emoji: '✨', color: '#FFC107', label: 'COMENZANDO' };
        return { emoji: '💤', color: '#9E9E9E', label: 'SIN RACHA' };
    };

    const intensity = getFlameIntensity(currentStreak);
    const nextMilestone = currentStreak < 3 ? 3 : currentStreak < 6 ? 6 : currentStreak < 12 ? 12 : 24;
    const progress = Math.min(100, (currentStreak / nextMilestone) * 100);

    // Calcular si la racha está en riesgo (mes actual sin viajes)
    const isAtRisk = false; // TODO: implementar lógica de verificación

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="800" mb={2}>
                🔥 Mi Racha Viajera
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: '24px',
                    background: theme.palette.mode === 'light'
                        ? `linear-gradient(135deg, ${intensity.color}15, ${intensity.color}05)`
                        : `linear-gradient(135deg, ${intensity.color}30, ${intensity.color}15)`,
                    border: `3px solid ${intensity.color}40`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Fondo decorativo animado */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        fontSize: '12rem',
                        opacity: 0.08,
                        animation: currentStreak > 0 ? 'flameFloat 3s ease-in-out infinite' : 'none',
                        '@keyframes flameFloat': {
                            '0%, 100%': { transform: 'translateY(0px) rotate(-10deg)' },
                            '50%': { transform: 'translateY(-20px) rotate(-5deg)' }
                        }
                    }}
                >
                    {intensity.emoji}
                </Box>

                <Stack spacing={3} position="relative" zIndex={1}>
                    {/* Header con racha actual */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Chip
                                label={intensity.label}
                                size="small"
                                sx={{
                                    bgcolor: intensity.color,
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    letterSpacing: 0.5
                                }}
                            />
                            <Typography variant="h2" fontWeight="900" mt={1} sx={{ color: intensity.color }}>
                                {currentStreak}
                                <Typography component="span" variant="h5" fontWeight="600" ml={0.5}>
                                    {currentStreak === 1 ? 'mes' : 'meses'}
                                </Typography>
                            </Typography>
                        </Box>

                        <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                                RÉCORD
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                                <Typography variant="h5" fontWeight="800" sx={{ color: '#FFD700' }}>
                                    {maxStreak}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Barra de progreso hacia próximo hito */}
                    {currentStreak < 24 && (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" fontWeight="700" color="text.secondary">
                                    PRÓXIMO HITO: {nextMilestone} MESES
                                </Typography>
                                <Typography variant="caption" fontWeight="800">
                                    {Math.round(progress)}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: intensity.color,
                                        borderRadius: 6,
                                        background: `linear-gradient(90deg, ${intensity.color}, ${intensity.color}CC)`
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Mensajes motivacionales */}
                    {currentStreak === 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(255,193,7,0.1)' : 'rgba(255,193,7,0.15)',
                                borderRadius: '16px'
                            }}
                        >
                            <Typography variant="body2" fontWeight="600" color="text.secondary">
                                💡 <strong>Consejo:</strong> Planea un viaje este mes para comenzar tu racha viajera
                            </Typography>
                        </Paper>
                    )}

                    {currentStreak >= 12 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.15)',
                                borderRadius: '16px'
                            }}
                        >
                            <Typography variant="body2" fontWeight="600" color="text.secondary">
                                🎉 <strong>¡Increíble!</strong> Llevas un año entero viajando cada mes. ¡Eres una leyenda!
                            </Typography>
                        </Paper>
                    )}

                    {currentStreak > 0 && currentStreak < 12 && (
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                            {isAtRisk
                                ? '⚠️ Tu racha está en riesgo. ¡Planea un viaje este mes!'
                                : `💪 ¡Sigue así! ${nextMilestone - currentStreak} ${nextMilestone - currentStreak === 1 ? 'mes' : 'meses'} más para el próximo nivel`
                            }
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default TravelStreak;
