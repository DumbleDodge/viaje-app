import React, { useState } from 'react';
import { 
  Dialog, DialogContent, Box, Typography, Stack, Button, CircularProgress, useTheme 
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { supabase } from './supabaseClient';

const TravioProModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Debes estar logueado para suscribirte");
        return;
      }

      // Asegúrate de tener VITE_STRIPE_PRICE_ID en tu .env
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          userId: user.id, 
          userEmail: user.email,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID 
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Response("No se recibió la URL de pago");
      }

    } catch (err) {
      console.error("Error al iniciar el pago:", err);
      alert("Hubo un error al conectar con la pasarela de pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { borderRadius: '28px', p: 1, maxWidth: 350 } }}
    >
      <DialogContent sx={{ textAlign: 'center' }}>
        <Box sx={{ 
          width: 70, height: 70, bgcolor: theme.palette.primary.light, borderRadius: '20px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 
        }}>
          <StarIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        
        <Typography variant="h5" fontWeight="800" gutterBottom>Travio Pro</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Lleva tu experiencia de viaje al siguiente nivel.
        </Typography>

        <Stack spacing={2} textAlign="left" mb={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CloudDownloadIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="700">Modo Offline Total</Typography>
              <Typography variant="caption" color="text.secondary">Descarga todos los documentos.</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <AttachFileIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="700">5 GB de Almacenamiento</Typography>
              <Typography variant="caption" color="text.secondary">Espacio de sobra para todo.</Typography>
            </Box>
          </Stack>
        </Stack>

        <Button 
          variant="contained" 
          fullWidth 
          disabled={loading}
          onClick={handleSubscribe}
          sx={{ py: 1.5, borderRadius: '15px', fontWeight: '800', fontSize: '1rem', bgcolor: 'primary.main', color: 'white' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Suscribirme por 2,99€"}
        </Button>
        
        <Button onClick={onClose} fullWidth sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }}>
          Ahora no, gracias
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TravioProModal;