import React, { useMemo, useState, useEffect } from 'react';
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
import { supabase } from '../../supabaseClient';

function PassportScreen({ user }) {
  const navigate = useNavigate();
  const { tripsList } = useTripContext();
  const [userData, setUserData] = useState(null);

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

  // Cargar datos completos de achievements de forma asíncrona desde Supabase
  useEffect(() => {
    const loadAchievementData = async () => {
      let maxItemsInTrip = 0;
      let totalSpots = 0;
      let tripsWithExpenses = 0;
      let tripsWithChecklist = 0;

      console.log('DEBUG: Loading achievement data for', tripsList.length, 'trips');

      // Cargar items, spots y expenses de Supabase para todos los trips
      try {
        // Obtener IDs de todos los trips
        const tripIds = tripsList.map(t => t.id);

        // Cargar items
        const { data: items } = await supabase
          .from('trip_items')
          .select('trip_id')
          .in('trip_id', tripIds);

        // Cargar spots
        const { data: spots } = await supabase
          .from('trip_spots')
          .select('trip_id')
          .in('trip_id', tripIds);

        // Cargar expenses
        const { data: expenses } = await supabase
          .from('trip_expenses')
          .select('trip_id')
          .in('trip_id', tripIds);

        // Contar por trip
        for (const trip of tripsList) {
          const itemCount = items?.filter(i => i.trip_id === trip.id).length || 0;
          const spotCount = spots?.filter(s => s.trip_id === trip.id).length || 0;
          const expenseCount = expenses?.filter(e => e.trip_id === trip.id).length || 0;

          maxItemsInTrip = Math.max(maxItemsInTrip, itemCount);
          totalSpots += spotCount;
          if (expenseCount > 0) tripsWithExpenses++;

          console.log(`DEBUG: Trip ${trip.title} - items: ${itemCount}, spots: ${spotCount}, expenses: ${expenseCount}`);
        }

        console.log('DEBUG: Final stats - maxItems:', maxItemsInTrip, 'totalSpots:', totalSpots, 'tripsWithExpenses:', tripsWithExpenses);

      } catch (error) {
        console.error('Error loading achievement data:', error);
      }

      setUserData({
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
        tripsWithChecklist: 0, // TODO: Añadir tabla de checklist si existe
        continents
      });
    };

    if (tripsList.length > 0) {
      loadAchievementData();
    }
  }, [tripsList, visitedCountries, stats, continents]);

  // Si aún no tenemos userData, mostrar un placeholder básico
  if (!userData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="800">Mi Pasaporte</Typography>
        </Box>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
            Cargando datos...
          </Typography>
        </Container>
      </Box>
    );
  }

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

        {/* MAPA MUNDIAL CON DEGRADADO */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="800" mb={2}>
            🗺️ Mapa del Mundo
          </Typography>
          <WorldMap visitedCodes={visitedCountries} tripsList={tripsList} />
        </Box>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <StatsCards stats={stats} />

        {/* SISTEMA DE RACHA */}
        <TravelStreak currentStreak={stats.currentStreak} maxStreak={stats.maxStreak} />

        {/* COLECCIÓN DE SELLOS */}
        <VirtualStamps visitedCodes={visitedCountries} tripsList={tripsList} />

        {/* LOGROS */}
        <Achievements userData={userData} />

      </Container>
    </Box>
  );
}

export default PassportScreen;