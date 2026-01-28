import React, { useEffect, useRef, useState } from 'react';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import DevicesIcon from '@mui/icons-material/Devices';
import GroupsIcon from '@mui/icons-material/Groups';

// Animaciones CSS
const keyframes = `
@keyframes fadeInUp {
    from {
    opacity: 0;
    transform: translateY(30px);
  }
    to {
    opacity: 1;
    transform: translateY(0);
  }
}

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

@keyframes slideInLeft {
    from {
    opacity: 0;
    transform: translateX(-30px);
  }
    to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
    from {
    opacity: 0;
    transform: translateX(30px);
  }
    to {
    opacity: 1;
    transform: translateX(0);
  }
}
`;

// Hook para animaciones on scroll
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

// Componente de Feature mejorado
const FeatureMockup = ({ title, icon, color, items, delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <Paper
      ref={ref}
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 3 },
        borderRadius: '24px',
        bgcolor: 'background.paper',
        height: '100%',
        border: '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay} ms`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${color} 20`,
          borderColor: `${color} 40`
        }
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <Box sx={{
          width: { xs: 32, md: 44 },
          height: { xs: 32, md: 44 },
          borderRadius: '12px',
          bgcolor: `${color} 20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s',
          '&:hover': { transform: 'rotate(10deg) scale(1.1)' }
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
            p: { xs: 0.8, md: 1.5 },
            borderRadius: '12px',
            bgcolor: 'rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: `${color} 10`, transform: 'translateX(4px)' }
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
};

// Componente "Cómo Funciona"
const HowItWorksStep = ({ number, title, description, icon, color, delay }) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <Box
      ref={ref}
      sx={{
        textAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease-out',
        transitionDelay: `${delay} ms`
      }}
    >
      <Box sx={{
        position: 'relative',
        display: 'inline-flex',
        mb: 2
      }}>
        <Box sx={{
          width: { xs: 70, md: 90 },
          height: { xs: 70, md: 90 },
          borderRadius: '50%',
          bgcolor: `${color} 15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.4s',
          '&:hover': { transform: 'scale(1.1) rotate(5deg)' }
        }}>
          {React.cloneElement(icon, { sx: { fontSize: { xs: 32, md: 40 }, color } })}
        </Box>
        <Box sx={{
          position: 'absolute',
          top: -5,
          right: -5,
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.875rem'
        }}>
          {number}
        </Box>
      </Box>
      <Typography variant="h6" fontWeight="800" mb={1} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
        {description}
      </Typography>
    </Box>
  );
};

// Tab de caso de uso
const UseCaseTab = ({ icon, title, description, features, color }) => (
  <Box sx={{ py: 4 }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
      <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
        <Box sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '20px',
          bgcolor: `${color} 15`,
          mb: 3
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 48, color } })}
        </Box>
        <Typography variant="h4" fontWeight="900" mb={2}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3} sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
        <Stack spacing={1.5}>
          {features.map((feature, i) => (
            <Stack key={i} direction="row" spacing={1.5} alignItems="center">
              <CheckCircleIcon sx={{ color, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="600">
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
      <Box sx={{
        flex: 1,
        width: '100%',
        height: { xs: 250, md: 350 },
        borderRadius: '24px',
        bgcolor: `${color}08`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px dashed ${color} 40`
      }}>
        <Typography variant="h6" color="text.secondary" fontWeight="700">
          [Screenshot Demo]
        </Typography>
      </Box>
    </Stack>
  </Box>
);

// Badge de confianza
const TrustBadge = ({ icon, text }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{
    px: 2,
    py: 1,
    borderRadius: '50px',
    bgcolor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)'
  }}>
    {React.cloneElement(icon, { sx: { fontSize: 18, color: '#4CAF50' } })}
    <Typography variant="body2" fontWeight="700" color="#4CAF50" sx={{ fontSize: '0.875rem' }}>
      {text}
    </Typography>
  </Stack>
);

function LandingPage({ onLogin }) {
  const theme = useTheme();
  // const [heroRef, heroVisible] = useIntersectionObserver(); // Hero ya no usa esto para mejorar LCP
  const howItWorksRef = useRef(null);

  // Función para scroll suave a "Cómo Funciona"
  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <style>{keyframes}</style>

      {/* --- NAVBAR --- */}
      <Container maxWidth="lg">
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <FlightTakeoffIcon sx={{ color: '#FF7043', fontSize: { xs: 32, md: 40 }, transform: 'rotate(-10deg)' }} />
            <Typography variant="h4" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 900, letterSpacing: '-0.03em', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Travio<span style={{ color: '#FF7043' }}>.</span>
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={onLogin}
            sx={{
              borderRadius: '50px',
              px: 3,
              fontWeight: 700,
              textTransform: 'none',
              border: '2px solid',
              '&:hover': { border: '2px solid', transform: 'scale(1.05)' },
              transition: 'transform 0.2s'
            }}
          >
            Acceder
          </Button>
        </Box>
      </Container>

      {/* --- HERO SECTION --- */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 10, textAlign: 'center' }}>

        <Box
          sx={{
            maxWidth: 900,
            mx: 'auto',
            mb: { xs: 6, md: 8 },
            animation: 'fadeInUp 0.8s ease-out' // Animación CSS inmediata (Mejora LCP)
          }}
        >
          {/* Badge NUEVO */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(103, 80, 164, 0.1)',
            px: 2,
            py: 0.8,
            borderRadius: '50px',
            mb: 3,
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <StarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight="700" color="primary.main" sx={{ fontSize: '0.875rem' }}>
              ✨ NUEVO: Pasaporte Digital
            </Typography>
          </Box>

          {/* Título principal con gradiente animado */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 1.35,
              mb: 3,
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              background: 'linear-gradient(45deg, #6750A4 30%, #FF7043 90%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease infinite'
            }}
          >
            Tu compañero de viaje,{' '}
            <Box component="span" sx={{ display: 'block' }}>reimaginado.</Box>
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              fontWeight: 400,
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Planifica itinerarios al detalle, divide gastos con amigos y lleva todos tus recuerdos organizados en un solo lugar.
          </Typography>


          {/* Dual CTA */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={onLogin}
              startIcon={<GoogleIcon />}
              sx={{
                py: 2,
                px: 5,
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 20px 40px rgba(103, 80, 164, 0.3)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.03)',
                  boxShadow: '0 25px 50px rgba(103, 80, 164, 0.4)'
                }
              }}
            >
              Empezar Gratis con Google
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={scrollToHowItWorks}
              sx={{
                py: 2,
                px: 4,
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                border: '2px solid',
                '&:hover': {
                  border: '2px solid',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Ver cómo funciona →
            </Button>
          </Stack>
        </Box>

        {/* IMAGEN CENTRAL CON FLOTANTES */}
        <Box sx={{ position: 'relative', maxWidth: 1000, mx: 'auto', px: 2 }}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            background: 'radial-gradient(circle, rgba(103,80,164,0.15) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0
          }} />

          <Box
            component="img"
            src="/app-screenshot.webp"
            alt="Captura de pantalla de la aplicación Gotravio mostrando el itinerario de viaje"
            sx={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '38px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
              border: '10px solid white',
              bgcolor: '#F3F4F6',
              maxWidth: 380,
              width: 380,         // Explicit width for CLS
              height: 800,        // Explicit height (approx) for CLS
              mx: 'auto',
              display: 'block',
              objectFit: 'cover'
            }}
            fetchPriority="high"  // LCP Boost
            loading="eager"       // Ensure immediate load
          />

          {/* Flotantes mejorados */}
          <Paper sx={{
            position: 'absolute',
            top: { xs: '10%', md: '20%' },
            right: { xs: '-5%', md: '20%' },
            p: 1.5,
            borderRadius: '20px',
            boxShadow: 4,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            animation: 'float 6s ease-in-out infinite',
            transform: { xs: 'scale(0.85)', md: 'scale(1)' },
            transition: 'all 0.3s',
            '&:hover': { transform: { md: 'scale(1.05)' }, boxShadow: 6 }
          }}>
            <Box sx={{ bgcolor: '#E8F5E9', p: 1, borderRadius: '12px', color: '#2E7D32' }}>
              <CloudDownloadIcon />
            </Box>
            <Box textAlign="left">
              <Typography variant="body2" fontWeight="800" display="block" fontSize={{ xs: '0.75rem', md: '0.875rem' }}>
                Modo Offline
              </Typography>
              <Chip label="PRO" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#FFD700', color: 'black', mt: 0.5 }} />
            </Box>
          </Paper>

          <Paper sx={{
            position: 'absolute',
            bottom: { xs: '10%', md: '20%' },
            left: { xs: '-5%', md: '20%' },
            p: 1.5,
            borderRadius: '20px',
            boxShadow: 4,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            animation: 'float 5s ease-in-out infinite reverse',
            transform: { xs: 'scale(0.85)', md: 'scale(1)' },
            transition: 'all 0.3s',
            '&:hover': { transform: { md: 'scale(1.05)' }, boxShadow: 6 }
          }}>
            <Box sx={{ bgcolor: '#E3F2FD', p: 1, borderRadius: '12px', color: '#1565C0' }}>
              <EuroIcon />
            </Box>
            <Box textAlign="left">
              <Typography variant="body2" fontWeight="800" display="block" fontSize={{ xs: '0.75rem', md: '0.875rem' }}>
                Gastos
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize={{ xs: '0.65rem', md: '0.75rem' }}>
                Tú pagaste 120€
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* --- CÓMO FUNCIONA --- */}
      <Box ref={howItWorksRef} sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="900"
            textAlign="center"
            mb={2}
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Viaja sin complicaciones
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            mb={6}
            sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Con Travio, organizar tu próximo viaje es más fácil que nunca
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <HowItWorksStep
                number={1}
                title="Crea tu viaje"
                description="En segundos, configura tu destino y fechas"
                icon={<FlightTakeoffIcon />}
                color="#FF7043"
                delay={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <HowItWorksStep
                number={2}
                title="Organiza el plan"
                description="Arrastra y organiza tus actividades por día"
                icon={<ChecklistRtlIcon />}
                color="#6750A4"
                delay={100}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <HowItWorksStep
                number={3}
                title="Divide gastos"
                description="Registra pagos y divide automáticamente"
                icon={<EuroIcon />}
                color="#4CAF50"
                delay={200}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- FUNCIONALIDADES --- */}
      <Box
        sx={{
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h3" fontWeight="900" textAlign="center" mb={2} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Todas las herramientas que necesitas
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={6}
            sx={{ maxWidth: 650, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Desde planificación hasta gestión de gastos, todo en un solo lugar
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            width: '100%'
          }}>
            <FeatureMockup
              title="Itinerario"
              icon={<ChecklistRtlIcon />}
              color="#6750A4"
              items={["Drag & Drop", "Links a Google Maps", "Adjuntos"]}
              delay={0}
            />
            <FeatureMockup
              title="Sitios Top"
              icon={<BookmarksIcon />}
              color="#FF9800"
              items={["Drag & Drop", "Lugares", "Filtros"]}
              delay={100}
            />
            <FeatureMockup
              title="Gastos"
              icon={<EuroIcon />}
              color="#4CAF50"
              items={["Reparto auto", "Multidivisa", "Reembolsos"]}
              delay={200}
            />
            <FeatureMockup
              title="Pasaporte"
              icon={<PublicIcon />}
              color="#2196F3"
              items={["Mapa mundo", "Logros", "Estadísticas"]}
              delay={300}
            />
          </Box>
        </Container>
      </Box>



      {/* --- POR QUÉ TRAVIO --- */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="900" textAlign="center" mb={1.5} sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            ¿Por qué Travio?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
            sx={{ maxWidth: 650, mx: 'auto' }}
          >
            No es solo otra app de viajes. Es tu compañero inteligente de aventuras.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'rgba(103, 80, 164, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#6750A4',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(103, 80, 164, 0.15)'
                  }
                }}
              >
                <SpeedIcon sx={{ fontSize: 40, color: '#FF7043', mb: 1.5 }} />
                <Typography variant="h6" fontWeight="800" mb={1.5}>
                  Ahorra tiempo en planificación
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Deja de usar 5 apps diferentes. Con Travio tienes itinerario, gastos, reservas y documentos en un solo lugar.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'rgba(76, 175, 80, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(76, 175, 80, 0.15)'
                  }
                }}
              >
                <GroupsIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1.5 }} />
                <Typography variant="h6" fontWeight="800" mb={1.5}>
                  Evita conflictos por dinero
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Olvídate de las hojas de cálculo interminables. El reparto automático de gastos elimina las discusiones.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'rgba(33, 150, 243, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#2196F3',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(33, 150, 243, 0.15)'
                  }
                }}
              >
                <DevicesIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1.5 }} />
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Typography variant="h6" fontWeight="800">
                    Viaja con tranquilidad
                  </Typography>
                  <Chip
                    label="PRO"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      bgcolor: '#FFD700',
                      color: 'black'
                    }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Modo offline completo. Accede a toda tu información sin internet, incluso en medio del Sahara.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'rgba(255, 152, 0, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#FF9800',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(255, 152, 0, 0.15)'
                  }
                }}
              >
                <PublicIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1.5 }} />
                <Typography variant="h6" fontWeight="800" mb={1.5}>
                  Colecciona tus aventuras
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Tu pasaporte digital guarda cada país visitado, crea estadísticas y te motiva a explorar más del mundo.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CTA FINAL --- */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #6750A4 0%, #FF7043 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de fondo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography
            variant="h2"
            fontWeight="900"
            color="white"
            mb={3}
            sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, lineHeight: 1.2 }}
          >
            ¿Listo para tu próxima aventura?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.6 }}
          >
            Únete a miles de viajeros que ya organizan sus viajes de forma inteligente. Es gratis, rápido y no requiere tarjeta de crédito.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={4}>
            <Button
              variant="contained"
              size="large"
              onClick={onLogin}
              startIcon={<GoogleIcon />}
              sx={{
                py: 2.5,
                px: 6,
                borderRadius: '50px',
                fontSize: '1.125rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: 'white',
                color: '#6750A4',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s'
              }}
            >
              Comenzar Gratis Ahora
            </Button>
          </Stack>

        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box sx={{ py: 4, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          © 2026 Travio App. Hecho con ❤️ para viajeros.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Tu próxima aventura comienza aquí.
        </Typography>
      </Box>

    </Box>
  );
}

export default LandingPage;