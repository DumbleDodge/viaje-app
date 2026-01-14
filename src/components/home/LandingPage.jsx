import React from 'react';
import { 
  Box, Container, Typography, Button, Grid, Stack, Paper, useTheme, Card, Chip 
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GoogleIcon from '@mui/icons-material/Google';
import MapIcon from '@mui/icons-material/Map';
import EuroIcon from '@mui/icons-material/Euro';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import StarIcon from '@mui/icons-material/Star';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import PublicIcon from '@mui/icons-material/Public';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

// Componente para las mini-capturas de funcionalidades (ULTRA COMPACTO PARA MÓVIL)
const FeatureMockup = ({ title, icon, color, items }) => (
  <Paper 
    elevation={0}
    sx={{ 
      p: { xs: 1.5, md: 3 }, // Menos padding en móvil
      borderRadius: '24px', 
      bgcolor: 'background.paper', 
      height: '100%',
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }
    }}
  >
    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
      <Box sx={{ 
        width: { xs: 32, md: 44 }, // Icono más pequeño en móvil
        height: { xs: 32, md: 44 }, 
        borderRadius: '12px', 
        bgcolor: `${color}20`, 
        color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {React.cloneElement(icon, { sx: { fontSize: { xs: 18, md: 24 } } })}
      </Box>
      <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '0.85rem', md: '1.1rem' }, lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Stack>
    
    <Stack spacing={1}>
      {items.map((item, i) => (
        <Box key={i} sx={{ 
          p: { xs: 0.8, md: 1.5 }, // Items más compactos
          borderRadius: '12px', 
          bgcolor: 'rgba(0,0,0,0.03)', 
          display: 'flex', alignItems: 'center', gap: 1 
        }}>
           <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, opacity: 0.6, flexShrink: 0 }} />
           <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' }, lineHeight: 1.2 }}>
             {item}
           </Typography>
        </Box>
      ))}
    </Stack>
  </Paper>
);

// Chip decorativo "NUEVO"
const ChipPro = () => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(103, 80, 164, 0.1)', px: 1.5, py: 0.5, borderRadius: '50px', mb: 2 }}>
        <StarIcon sx={{ fontSize: 14, color: 'primary.main' }} />
        <Typography variant="caption" fontWeight="700" color="primary.main">NUEVO: Pasaporte Digital</Typography>
    </Box>
);

function LandingPage({ onLogin }) {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      
      {/* --- NAVBAR --- */}
      <Container maxWidth="lg">
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <FlightTakeoffIcon sx={{ color: '#FF7043', fontSize: { xs: 32, md: 40 }, transform: 'rotate(-10deg)' }} />
            <Typography variant="h4" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 900, letterSpacing: '-0.03em', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Travio<span style={{ color: '#FF7043' }}>.</span>
            </Typography>
          </Stack>
          <Button variant="outlined" size="small" onClick={onLogin} sx={{ borderRadius: '50px', px: 3, fontWeight: 700, textTransform: 'none', border: '2px solid', '&:hover': { border: '2px solid' } }}>
            Acceder
          </Button>
        </Box>
      </Container>

      {/* --- HERO SECTION --- */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 10, textAlign: 'center' }}>
        
        {/* TEXTO */}
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: { xs: 6, md: 8 }, animation: 'fadeIn 0.8s ease-out' }}>
          <ChipPro />
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 900, lineHeight: 1.1, mb: 3, pb: 1, 
              fontSize: 'clamp(2.5rem, 7vw, 5rem)', 
              background: '-webkit-linear-gradient(45deg, #6750A4 30%, #FF7043 90%)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
            }}
          >
            Tu compañero de viaje, <br/>
            reimaginado.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, maxWidth: 650, mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Planifica itinerarios al detalle, divide gastos con amigos y lleva todos tus billetes contigo.
          </Typography>
          <Button 
            variant="contained" size="large" onClick={onLogin} startIcon={<GoogleIcon />}
            sx={{ py: 2, px: 5, borderRadius: '50px', fontSize: '1rem', fontWeight: 800, textTransform: 'none', boxShadow: '0 20px 40px rgba(103, 80, 164, 0.25)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
          >
            Empezar Gratis con Google
          </Button>
        </Box>

        {/* IMAGEN CENTRAL (TU FOTO REAL) */}
        <Box sx={{ position: 'relative', maxWidth: 1000, mx: 'auto', px: 2 }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '90%', background: 'radial-gradient(circle, rgba(103,80,164,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />

            {/* MARCO DEL MÓVIL CON FOTO */}
            <Box 
              component="img"
              src="/app-screenshot.png"
              alt="Captura de la App"
              sx={{ 
                position: 'relative', 
                zIndex: 1, 
                borderRadius: '38px', 
                boxShadow: '0 40px 100px rgba(0,0,0,0.2)', 
                border: '10px solid white', 
                bgcolor: '#F3F4F6', 
                maxWidth: 380, // Ancho optimizado
                width: '100%',
                height: 'auto',
                mx: 'auto', 
                display: 'block',
                objectFit: 'cover'
              }} 
            />

            {/* FLOTANTES */}
            <Paper sx={{ position: 'absolute', top: { xs: '10%', md: '20%' }, right: { xs: '-5%', md: '20%' }, p: 1.5, borderRadius: '20px', boxShadow: 4, zIndex: 2, display: 'flex', alignItems: 'center', gap: 1.5, animation: 'float 6s ease-in-out infinite', transform: { xs: 'scale(0.85)', md: 'scale(1)' } }}>
                <Box sx={{ bgcolor: '#E8F5E9', p: 1, borderRadius: '12px', color: '#2E7D32' }}><CloudDownloadIcon /></Box>
                <Box textAlign="left">
                    <Typography variant="body2" fontWeight="800" display="block" fontSize={{ xs: '0.75rem', md: '0.875rem' }}>Modo Offline</Typography>
                    <Chip label="PRO" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#FFD700', color: 'black', mt: 0.5 }} />
                </Box>
            </Paper>

            <Paper sx={{ position: 'absolute', bottom: { xs: '10%', md: '20%' }, left: { xs: '-5%', md: '20%' }, p: 1.5, borderRadius: '20px', boxShadow: 4, zIndex: 2, display: 'flex', alignItems: 'center', gap: 1.5, animation: 'float 5s ease-in-out infinite reverse', transform: { xs: 'scale(0.85)', md: 'scale(1)' } }}>
                <Box sx={{ bgcolor: '#E3F2FD', p: 1, borderRadius: '12px', color: '#1565C0' }}><EuroIcon /></Box>
                <Box textAlign="left">
                    <Typography variant="body2" fontWeight="800" display="block" fontSize={{ xs: '0.75rem', md: '0.875rem' }}>Gastos</Typography>
                    <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.65rem', md: '0.75rem' }}>Tú pagaste 120€</Typography>
                </Box>
            </Paper>
        </Box>
      </Container>

      {/* --- FUNCIONALIDADES (CSS GRID - AJUSTE PERFECTO) --- */}
      <Box 
        sx={{ 
          // CAMBIO CLAVE: Usamos un degradado lineal en lugar de un color sólido
          // Empieza en Blanco (0%) -> Transiciona a Gris suave (20%) -> Se mantiene Gris (100%)
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 20%, #F9FAFB 100%)' 
            : 'rgba(255,255,255,0.02)',
            
          py: { xs: 6, md: 10 } 
        }}
      > <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h4" fontWeight="900" textAlign="center" mb={{ xs: 4, md: 6 }}>
            Todo lo que necesitas
          </Typography>
          
          {/* USAMOS CSS GRID NATIVO PARA CONTROLAR EL ANCHO EXACTO */}
          <Box sx={{ 
            display: 'grid',
            // En móvil: 2 columnas iguales (1fr 1fr). En PC: 4 columnas.
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2, // Espacio entre tarjetas (16px)
            width: '100%'
          }}>
            
            <FeatureMockup 
              title="Itinerario" 
              icon={<ChecklistRtlIcon />} 
              color="#6750A4"
              items={["Drag & Drop", "Links a Google Maps", "Adjuntos"]}
            />

            <FeatureMockup 
              title="Sitios Top" 
              icon={<BookmarksIcon />} 
              color="#FF9800" 
              items={["Drag & Drop", "Lugares", "Filtros"]}
            />

            <FeatureMockup 
              title="Gastos" 
              icon={<EuroIcon />} 
              color="#4CAF50"
              items={["Reparto auto", "Multidivisa", "Reembolsos"]}
            />

            <FeatureMockup 
              title="Pasaporte" 
              icon={<PublicIcon />} 
              color="#2196F3"
              items={["Mapa mundo", "Logros", "Estadísticas"]}
            />

          </Box>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box sx={{ py: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">© 2026 Travio App. Hecho con ❤️ para viajeros.</Typography>
      </Box>

    </Box>
  );
}

export default LandingPage;