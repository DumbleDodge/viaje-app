import React, { useMemo } from 'react';
import { Box, Container, Typography, Avatar, Stack, IconButton, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTripContext } from '../../TripContext';
import WorldMap from './WorldMap';
import Achievements from './Achievements';

function PassportScreen({ user }) {
  const navigate = useNavigate();
  const { tripsList } = useTripContext();

  // Calculamos países únicos visitados
  // Nota: Esto depende de que hayamos rellenado 'country_code' en la BD
  const visitedCountries = useMemo(() => {
    const codes = tripsList
        .map(t => t.country_code) // Supabase column: country_code
        .filter(c => c); // Quitar nulos
    
    // Devolver array único
    return [...new Set(codes)];
  }, [tripsList]);

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
            sx={{ width: 80, height: 80, border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', mx: 'auto', mb: 2 }}
          />
          <Typography variant="h5" fontWeight="800">{user.user_metadata?.full_name}</Typography>
          <Stack direction="row" justifyContent="center" gap={1} mt={1}>
             <Chip label={`${visitedCountries.length} Países`} color="primary" size="small" sx={{ fontWeight: 800 }} />
             <Chip label={`${tripsList.length} Viajes`} variant="outlined" size="small" sx={{ fontWeight: 700 }} />
          </Stack>
        </Box>

        {/* MAPA MUNDI */}
        <WorldMap visitedCodes={visitedCountries} />

        {/* LOGROS */}
        <Achievements count={visitedCountries.length} />

      </Container>
    </Box>
  );
}

export default PassportScreen;