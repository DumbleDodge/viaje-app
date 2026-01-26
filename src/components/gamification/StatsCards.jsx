import React from 'react';
import { Box, Paper, Typography, Stack, useTheme } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PublicIcon from '@mui/icons-material/Public';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function StatsCards({ stats }) {
    const theme = useTheme();

    const cards = [
        {
            id: 'trips',
            label: 'Viajes',
            value: stats.totalTrips,
            icon: <FlightTakeoffIcon />,
            color: '#2196F3',
            subtitle: `${stats.tripsThisYear} este año`
        },
        {
            id: 'countries',
            label: 'Países',
            value: stats.totalCountries,
            icon: <PublicIcon />,
            color: '#4CAF50',
            subtitle: `${stats.totalContinents} continentes`
        },
        {
            id: 'days',
            label: 'Días Viajando',
            value: stats.totalDays,
            icon: <CalendarMonthIcon />,
            color: '#FF9800',
            subtitle: `~${stats.averageTripDuration} días/viaje`
        },
        {
            id: 'streak',
            label: 'Racha Actual',
            value: `${stats.currentStreak}m`,
            icon: <LocalFireDepartmentIcon />,
            color: '#F44336',
            subtitle: `Récord: ${stats.maxStreak} meses`
        },
        {
            id: 'cities',
            label: 'Ciudades',
            value: stats.totalCities,
            icon: <LocationCityIcon />,
            color: '#9C27B0',
            subtitle: 'Lugares únicos'
        },
        {
            id: 'longest',
            label: 'Viaje Más Largo',
            value: `${stats.longestTrip}d`,
            icon: <TrendingUpIcon />,
            color: '#00BCD4',
            subtitle: 'Días consecutivos'
        }
    ];

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="800" mb={1.5}>
                📊 Mis Estadísticas
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5
                }}
            >
                {cards.map((card) => (
                    <Paper
                        key={card.id}
                        elevation={0}
                        sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            background: theme.palette.mode === 'light'
                                ? `linear-gradient(135deg, ${card.color}15, ${card.color}05)`
                                : `linear-gradient(135deg, ${card.color}25, ${card.color}10)`,
                            border: `2px solid ${card.color}30`,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 16px ${card.color}25`
                            }
                        }}
                    >
                        {/* Icono de fondo decorativo */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                fontSize: '2.5rem',
                                opacity: 0.06,
                                color: card.color
                            }}
                        >
                            {card.icon}
                        </Box>

                        {/* Contenido */}
                        <Stack spacing={0.3} position="relative" zIndex={1}>
                            <Typography
                                variant="h5"
                                fontWeight="900"
                                sx={{
                                    background: `linear-gradient(135deg, ${card.color}, ${card.color}CC)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    lineHeight: 1.2
                                }}
                            >
                                {card.value}
                            </Typography>

                            <Typography
                                variant="caption"
                                fontWeight="700"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                            >
                                {card.label}
                            </Typography>

                            <Typography
                                variant="caption"
                                fontSize="0.65rem"
                                color="text.secondary"
                                sx={{ opacity: 0.7, lineHeight: 1.1 }}
                            >
                                {card.subtitle}
                            </Typography>
                        </Stack>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}

export default StatsCards;
