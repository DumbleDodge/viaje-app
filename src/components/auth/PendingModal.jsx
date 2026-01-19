import React from 'react';
import { 
  Dialog, DialogContent, Typography, Box, Button, Slide 
} from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from '../../supabaseClient'; // Ajusta la ruta si es necesario

// Animación de entrada
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PendingModal = ({ open }) => {
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recargamos para limpiar todo
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      // PROHIBIDO CERRAR: Bloqueamos clic fuera y tecla ESC
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          // Solo permitiría cerrar por código, pero no damos opción
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          padding: 2,
          textAlign: 'center',
          maxWidth: 400
        }
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 3 }}>
        
        {/* ICONO ANIMADO */}
        <Box sx={{ 
          width: 80, height: 80, 
          bgcolor: 'warning.light', 
          color: 'warning.dark',
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3,
          boxShadow: '0 8px 24px rgba(237, 108, 2, 0.25)'
        }}>
          <LockClockIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" fontWeight="800" gutterBottom>
          Cuenta en Espera ⏳
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tu cuenta ha sido creada correctamente, pero necesita ser <b>aprobada por el administrador</b> antes de que puedas acceder a los viajes.
        </Typography>

        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '16px', mb: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" fontWeight="600">
            ¿Qué debo hacer?
          </Typography>
          <Typography variant="body2" color="text.primary">
            Avisa al administrador para que active tu usuario.
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          color="inherit" // Gris oscuro/negro
          fullWidth 
          size="large"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: '14px', 
            py: 1.5, 
            fontWeight: 'bold',
            boxShadow: 'none',
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' }
          }}
        >
          Entendido, cerrar sesión
        </Button>

      </DialogContent>
    </Dialog>
  );
};

export default PendingModal;