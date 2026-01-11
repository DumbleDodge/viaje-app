import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTripContext } from '../../TripContext';

// Componente de protección de ruta
const AdminRoute = ({ user, children }) => {
  const { userProfile } = useTripContext();

  // Si está cargando el perfil aún, podríamos mostrar spinner, 
  // pero por ahora asumimos que si no es admin, redirige.
  if (!user || !userProfile?.is_admin) {
    return <Box p={4} textAlign="center"><Typography>Acceso denegado. No tienes permisos de administrador.</Typography></Box>;
  }

  return children;
};
export default AdminRoute;