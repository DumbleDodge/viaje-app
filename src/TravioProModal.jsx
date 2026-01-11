import React, { useState } from 'react';
import { 
  Dialog, DialogContent, Box, Typography, Stack, Button, CircularProgress, 
  useTheme, ToggleButtonGroup, ToggleButton, Chip 
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from './supabaseClient';

const TravioProModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [planInterval, setPlanInterval] = useState('monthly'); // 'monthly' | 'yearly'

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Debes iniciar sesión primero.");
        setLoading(false);
        return;
      }

      // Elegimos el ID del precio según el switch
      const priceId = planInterval === 'monthly' 
        ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY 
        : import.meta.env.VITE_STRIPE_PRICE_YEARLY;

      if (!priceId) {
        alert("Error de configuración: No se encontraron los precios.");
        setLoading(false);
        return;
      }

      // Llamada a la Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          userId: user.id, 
          userEmail: user.email,
          priceId: priceId,
          isYearly: planInterval === 'yearly' // Útil para métricas
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }

    } catch (err) {
      console.error("Error al iniciar pago:", err);
      alert("Error conectando con Stripe. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { borderRadius: '28px', p: 1, maxWidth: 380 } }}
    >
      <DialogContent sx={{ textAlign: 'center', px: 2 }}>
        
        {/* ICONO CABECERA */}
        <Box sx={{ 
          width: 60, height: 60, bgcolor: 'primary.main', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
          boxShadow: '0 8px 20px rgba(103, 80, 164, 0.3)'
        }}>
          <StarIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        
        <Typography variant="h5" fontWeight="800">Travio Pro</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Desbloquea todo el potencial de tus viajes.
        </Typography>

        {/* SELECTOR MENSUAL / ANUAL */}
        <Box mb={3} display="flex" justifyContent="center">
          <ToggleButtonGroup
            value={planInterval}
            exclusive
            onChange={(e, val) => val && setPlanInterval(val)}
            sx={{ 
              bgcolor: 'action.hover', 
              borderRadius: '50px', 
              p: 0.5,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '50px !important',
                px: 3,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.secondary'
              },
              '& .Mui-selected': {
                bgcolor: 'background.paper + !important',
                color: 'primary.main !important',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <ToggleButton value="monthly">Mensual</ToggleButton>
            <ToggleButton value="yearly">
              Anual <Chip label="-20%" size="small" color="success" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 800 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* PRECIO GRANDE */}
        <Box mb={3}>
          <Typography variant="h3" fontWeight="800" component="span">
            {planInterval === 'monthly' ? '2.99€' : '29.99€'}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="span" fontWeight="600">
             /{planInterval === 'monthly' ? 'mes' : 'año'}
          </Typography>
          {planInterval === 'yearly' && (
            <Typography variant="caption" display="block" color="success.main" fontWeight="700">
              ¡Ahorras 2 meses gratis! 🎉
            </Typography>
          )}
        </Box>

        {/* BENEFICIOS */}
        <Stack spacing={2} textAlign="left" mb={4} px={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight="600">Modo Offline Total</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight="600">5 GB de Almacenamiento</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight="600">Soporte Prioritario</Typography>
          </Stack>
        </Stack>

        {/* BOTÓN DE PAGO */}
        <Button 
          variant="contained" 
          fullWidth 
          disabled={loading}
          onClick={handleSubscribe}
          size="large"
          sx={{ 
            py: 1.5, 
            borderRadius: '16px', 
            fontWeight: '800', 
            fontSize: '1rem', 
            bgcolor: 'primary.main', 
            boxShadow: '0 8px 25px rgba(103, 80, 164, 0.4)',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : `Suscribirme ahora`}
        </Button>
        
        <Button onClick={onClose} fullWidth sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>
          Quizás luego
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TravioProModal;