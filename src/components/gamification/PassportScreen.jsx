import React, { useMemo } from 'react';
import { Box, Container, Typography, Avatar, Stack, IconButton, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTripContext } from '../../TripContext';
import WorldMap from './WorldMap';
import Achievements from './Achievements';
import StatsCards from './StatsCards';
import TravelStreak from './TravelStreak';
import VirtualStamps from './VirtualStamps';
import { calculateTravelStats, getTripsByContinents } from './utils/travelCalculations';

function PassportScreen({ user }) {
  const navigate = useNavigate();
  const { tripsList } = useTripContext();

  // Calcular países únicos visitados
  const visitedCountries = useMemo(() => {
    const codes = tripsList
      .map(t => t.country_code)
      .filter(c => c);
    return [...new Set(codes)];
  }, [tripsList]);

  // Calcular todas las estadísticas
  const stats = useMemo(() => {
    return calculateTravelStats(tripsList);
  }, [tripsList]);

  // Obtener continentes visitados
  const continents = useMemo(() => {
    return getTripsByContinents(tripsList);
  }, [tripsList]);

  // Preparar datos para achievements
  const userData = useMemo(() => {
    // Calcular datos adicionales necesarios para achievements
    const maxItemsInTrip = tripsList.reduce((max, trip) => {
      const itemCount = trip.items?.length || 0;
      return Math.max(max, itemCount);
    }, 0);

    const totalSpots = tripsList.reduce((sum, trip) => {
      return sum + (trip.spots?.length || 0);
    }, 0);

    const tripsWithExpenses = tripsList.filter(trip => {
      return trip.expenses && trip.expenses.length > 0;
    }).length;

    const tripsWithChecklist = tripsList.filter(trip => {
      return trip.checklist && trip.checklist.length > 0;
    }).length;

    return {
      visitedCountries,
      totalCountries: visitedCountries.length,
      totalContinents: stats.totalContinents,
      totalTrips: stats.totalTrips,
      tripsThisYear: stats.tripsThisYear,
      currentStreak: stats.currentStreak,
      maxStreak: stats.maxStreak,
      totalDays: stats.totalDays,
      longestTrip: stats.longestTrip,
      maxItemsInTrip,
      totalSpots,
      tripsWithExpenses,
      tripsWithChecklist,
      continents
    };
  }, [visitedCountries, stats, tripsList, continents]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* HEADER */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="800">Mi Pasaporte</Typography>
      </Box>

      <Container maxWidth="sm">

        {/* PERFIL RESUMEN */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 1 }}>
          <Avatar
            src={user.user_metadata?.avatar_url}
            sx={{
              width: 100,
              height: 100,
              border: '5px solid white',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              mx: 'auto',
              mb: 2
            }}
          />
          <Typography variant="h4" fontWeight="900" gutterBottom>
            {user.user_metadata?.full_name}
          </Typography>
          <Stack direction="row" justifyContent="center" gap={1.5} mt={2}>
            <Chip
              label={`${visitedCountries.length} Países`}
              color="primary"
              sx={{ fontWeight: 800, fontSize: '0.9rem', px: 1 }}
            />
            <Chip
              label={`${tripsList.length} Viajes`}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.9rem', px: 1 }}
            />
            {stats.totalDays > 0 && (
              <Chip
                label={`${stats.totalDays} Días`}
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.9rem', px: 1 }}
              />
            )}
          </Stack>
        </Box>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <StatsCards stats={stats} />

        {/* SISTEMA DE RACHA */}
        <TravelStreak currentStreak={stats.currentStreak} maxStreak={stats.maxStreak} />

        {/* MAPA MUNDIAL CON DEGRADADO */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="800" mb={2}>
            🗺️ Mapa del Mundo
          </Typography>
          <WorldMap visitedCodes={visitedCountries} tripsList={tripsList} />
        </Box>

        {/* COLECCIÓN DE SELLOS */}
        <VirtualStamps visitedCodes={visitedCountries} tripsList={tripsList} />

        {/* LOGROS */}
        <Achievements userData={userData} />

      </Container>
    </Box>
  );
}

export default PassportScreen;