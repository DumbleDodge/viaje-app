import React, { useState } from 'react';
import { 
  Box, Container, Typography, Paper, Avatar, Stack, 
  List, ListItem, ListItemText, ListItemIcon, Switch, 
  Button, Divider, LinearProgress, IconButton, Chip,
  Select, MenuItem, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import LogoutIcon from '@mui/icons-material/Logout';
import StarIcon from '@mui/icons-material/Star';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';

import { useTripContext } from './TripContext';
import { supabase } from './supabaseClient';
import TravioProModal from './TravioProModal';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import DownloadIcon from '@mui/icons-material/Download';
import IosShareIcon from '@mui/icons-material/IosShare'; // Importa esto arriba

// Helper para formato de bytes
const formatBytes = (bytes) => {
  if (!bytes) return '0 MB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

function SettingsScreen({ user, toggleTheme, mode }) {
  const navigate = useNavigate();
  const { userProfile, deferredPrompt, installPwa, isIos } = useTripContext();
  const [openProModal, setOpenProModal] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  
  // Estados para ajustes locales (simulados por ahora)
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('EUR');
  const [notifications, setNotifications] = useState(true);



  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Función para redirigir al Portal de Stripe (Gestión de suscripción)
  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      // Llamamos a una Edge Function que genera el link del portal
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { userId: user.id } // Pasamos el ID para que Stripe sepa quién es
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("No se pudo abrir el portal de facturación. Inténtalo más tarde.");
    } finally {
      setLoadingPortal(false);
    }
  };

  // Datos calculados (Simulados si no existen en DB aún)
  const LIMIT_FREE = 50 * 1024 * 1024; 
  const LIMIT_PRO = 5120 * 1024 * 1024;
  const currentLimit = userProfile.is_pro ? LIMIT_PRO : LIMIT_FREE;
  const storagePercent = (userProfile.storage_used / currentLimit) * 100;
  
  // Calculamos antigüedad
  const joinDate = dayjs(user.created_at);
  const monthsMember = dayjs().diff(joinDate, 'month');
  
  // Simulamos fecha de renovación (esto debería venir de la BD: userProfile.subscription_end)
  const renewDate = dayjs().add(12, 'day'); 

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      
      {/* HEADER */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, bgcolor: 'background.default', zIndex: 10 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="800">Ajustes</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 1 }}>
        
        {/* 1. PERFIL RESUMEN */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={user.user_metadata?.avatar_url} 
            sx={{ width: 60, height: 60, border: '2px solid', borderColor: 'primary.main' }}
          />
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="700" lineHeight={1.1}>
              {user.user_metadata?.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {user.email}
            </Typography>
            <Stack direction="row" gap={1} mt={0.5}>
              {userProfile.is_pro ? (
                <Chip label="PRO" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 900, fontSize: '0.65rem', height: 20 }} />
              ) : (
                <Chip label="FREE" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
              )}
               <Chip label={`Miembro ${monthsMember} meses`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
            </Stack>
          </Box>
        </Paper>
{/* --- SECCIÓN INSTALAR APP (DISEÑO LIMPIO) --- */}

            {/* CASO 1: ANDROID / CHROME */}
            {deferredPrompt && (
              <>
                <ListItem 
                  button 
                  onClick={installPwa} 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'primary.dark' }, 
                    borderRadius: '20px', // Más redondeado
                    mb: 2, // Separación con el divisor
                    mt: 1
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}> {/* minWidth reduce el hueco entre icono y texto */}
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Instalar Aplicación" 
                    secondary="Acceso directo y mejor rendimiento"
                    primaryTypographyProps={{ fontWeight: 800 }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.85)' }}
                  />
                </ListItem>
                
                {/* DIVISOR CON MÁS AIRE Y SIN HUECO A LA IZQUIERDA */}
                <Divider sx={{ my: 2, opacity: 0.6 }} /> 
              </>
            )}

            {/* CASO 2: IPHONE / IOS */}
            {isIos && (
              <>
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '20px', mb: 2, mt: 1 }}>
                  <Stack direction="row" gap={2} alignItems="center">
                    <IosShareIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="800">Instalar en iPhone</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block', mt: 0.5 }}>
                        1. Pulsa <IosShareIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} /> <strong>Compartir</strong> en Safari.<br/>
                        2. Selecciona <strong>"Añadir a inicio"</strong>.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                {/* DIVISOR CON MÁS AIRE */}
                <Divider sx={{ my: 2, opacity: 0.6 }} />
              </>
            )}

            {/* --- FIN SECCIÓN INSTALAR --- */}
        {/* 2. GESTIÓN DE SUSCRIPCIÓN (NUEVO) */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" ml={2} mb={1}>
          SUSCRIPCIÓN Y PAGOS
        </Typography>
        
        {userProfile.is_pro ? (
          <Paper elevation={0} sx={{ p: 0, mb: 3, borderRadius: '24px', border: '1px solid', borderColor: 'primary.light', overflow: 'hidden', bgcolor: mode === 'dark' ? '#1A1033' : '#F3E5F5' }}>
            <Box p={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <StarIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="800" color="primary.main">Travio Pro</Typography>
                </Box>
                <Chip label="ACTIVA" color="success" size="small" sx={{ fontWeight: 800 }} />
              </Stack>
              
              <Stack direction="row" spacing={3} mb={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">RENOVACIÓN</Typography>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="700">{renewDate.format('D MMM YYYY')}</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">CICLO</Typography>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="700">Mensual</Typography>
                  </Stack>
                </Box>
              </Stack>

              <Button 
                fullWidth 
                variant="contained" 
                disabled={loadingPortal}
                onClick={handleManageSubscription}
                startIcon={<CreditCardIcon />}
                sx={{ borderRadius: '12px', bgcolor: 'primary.main', fontWeight: 700, textTransform: 'none' }}
              >
                {loadingPortal ? "Cargando..." : "Gestionar / Cancelar Suscripción"}
              </Button>
              <Typography variant="caption" textAlign="center" display="block" mt={1} color="text.secondary">
                Cambia de tarjeta, descarga facturas o cambia a plan anual.
              </Typography>
            </Box>
          </Paper>
        ) : (
          // SI ES FREE, MOSTRAMOS CTA PARA UPGRADE
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '24px', border: '1px dashed', borderColor: 'text.disabled', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="800" gutterBottom>Pásate a PRO 🚀</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Desbloquea 5GB, modo offline total y soporta el desarrollo.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => setOpenProModal(true)}
              sx={{ borderRadius: '50px', fontWeight: 800, background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)', color: 'white' }}
            >
              Ver Planes
            </Button>
          </Paper>
        )}

        {/* 3. ALMACENAMIENTO */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" ml={2} mb={1}>
          USO DE DATOS
        </Typography>
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Stack direction="row" gap={1} alignItems="center">
              <CloudQueueIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="600">Nube</Typography>
            </Stack>
            <Typography variant="caption" fontWeight="700">
              {formatBytes(userProfile.storage_used)} / {formatBytes(currentLimit)}
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(storagePercent, 100)} 
            sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: storagePercent > 90 ? 'error.main' : 'primary.main' } }} 
          />
        </Paper>

        {/* 4. PREFERENCIAS DE LA APP */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" ml={2} mb={1}>
          GENERAL
        </Typography>
        <Paper elevation={0} sx={{ mb: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <List disablePadding>
            
            {/* IDIOMA */}
            <ListItem>
              <ListItemIcon><LanguageIcon /></ListItemIcon>
              <ListItemText primary="Idioma" />
              <FormControl variant="standard" sx={{ minWidth: 80 }}>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disableUnderline
                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider variant="inset" component="li" />

            {/* MONEDA */}
            <ListItem>
              <ListItemIcon><CurrencyExchangeIcon /></ListItemIcon>
              <ListItemText primary="Moneda Principal" secondary="Para los gastos compartidos" />
              <FormControl variant="standard" sx={{ minWidth: 80 }}>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disableUnderline
                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                >
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider variant="inset" component="li" />

            {/* MODO OSCURO */}
            <ListItem>
              <ListItemIcon><DarkModeIcon /></ListItemIcon>
              <ListItemText primary="Modo Oscuro" />
              <Switch edge="end" checked={mode === 'dark'} onChange={toggleTheme} />
            </ListItem>
            <Divider variant="inset" component="li" />

            {/* NOTIFICACIONES */}
            <ListItem>
              <ListItemIcon><NotificationsActiveIcon /></ListItemIcon>
              <ListItemText primary="Notificaciones" />
              <Switch edge="end" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            </ListItem>

            {/* LOGOUT */}
            <ListItem button onClick={handleLogout} sx={{ bgcolor: 'rgba(211, 47, 47, 0.04)' }}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="Cerrar Sesión" 
                primaryTypographyProps={{ color: 'error', fontWeight: 700 }} 
              />
            </ListItem>

          </List>
        </Paper>

        <Typography variant="caption" display="block" textAlign="center" color="text.disabled" mb={4}>
          ID Usuario: {user.id.slice(0, 8)}...<br/>
          Versión 1.2.0 (Build 2024)
        </Typography>

      </Container>

      {/* Modal para hacerse PRO */}
      <TravioProModal open={openProModal} onClose={() => setOpenProModal(false)} />

    </Box>
  );
}

export default SettingsScreen;