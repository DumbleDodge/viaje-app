import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

function LoginScreen({ onLogin }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, bgcolor: 'background.default' }}>

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', maxWidth: 400, width: '100%' }}>

        {/* LOGO NUEVO (Animado y limpio) */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
          <FlightTakeoffIcon
            sx={{
              color: '#FF7043',
              fontSize: 40,
              transform: 'rotate(-10deg) translateY(4px)',
              filter: 'drop-shadow(0 4px 10px rgba(255, 112, 67, 0.4))'
            }}
          />
          <Typography variant="h3" sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}>
            Travio<span style={{ color: '#FF7043' }}>.</span>
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontWeight: 500, opacity: 0.8 }}>
          Tu compañero de viaje inteligente
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={onLogin}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            py: 1.8, px: 4,
            fontSize: '1rem',
            borderRadius: '20px',
            width: '100%',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': { bgcolor: '#333', transform: 'scale(1.02)' }
          }}
        >
          Continuar con Google
        </Button>
      </Box>
    </Box>
  );
}
export default LoginScreen;