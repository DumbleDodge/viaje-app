import React, { useState, useEffect } from "react";
import {
  Box, Typography, Fab, Container, Card, CardContent, Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Menu, MenuItem, ListItemIcon, Divider, Paper, CardActionArea, Snackbar,
  Alert, Slide
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import ShareIcon from "@mui/icons-material/Share";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import SignalWifiOffIcon from "@mui/icons-material/SignalWifiOff"; // <--- IMPORTANTE

import { useTheme } from "@mui/material";

// Añade estos iconos
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxIcon from '@mui/icons-material/AddBox';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';

// Imports
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import TripCoverImage from '../common/TripCoverImage';
import TravioProModal from '../../TravioProModal';
import SuccessProModal from '../common/SuccessProModal';


// --- PANTALLA HOME REDISEÑADA ---
function HomeScreen({ user, onLogout, toggleTheme, mode }) {
  const { 
    tripsList, 
    fetchTripsList, 
    userProfile, 
    fetchUserProfile, 
    deferredPrompt, 
    installPwa,
    isIos,
    isPwaInstalled,
    isOnline // <--- 1. Traemos el estado de conexión
  } = useTripContext();

  // --- LÓGICA PWA ---
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const hasRefused = localStorage.getItem('pwa_refused');
    if (!isPwaInstalled && (deferredPrompt || isIos) && !hasRefused) {
      const timer = setTimeout(() => setShowInstallModal(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, isIos, installPwa, isPwaInstalled]);

  const handleCloseInstall = (permanently = false) => {
    setShowInstallModal(false);
    if (permanently) localStorage.setItem('pwa_refused', 'true');
  };

  const trips = tripsList || []; // tripsList ya viene cargado de IDB gracias al Context

  // Estados de UI
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estados auxiliares
  const [openShare, setOpenShare] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareTripId, setShareTripId] = useState(null);
  const [editTripData, setEditTripData] = useState({ id: '', title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [newTrip, setNewTrip] = useState({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  const navigate = useNavigate();
  const theme = useTheme();

  // --- 2. LÓGICA DE REVALIDACIÓN AL VOLVER A LA APP ---
  // Esto hace que si minimizas y vuelves a las 2 horas, se actualice solo
  useEffect(() => {
    const handleRevalidation = () => {
      // Solo refrescamos si la app es visible, tenemos internet y hay usuario
      if (document.visibilityState === 'visible' && navigator.onLine && user?.id) {
        console.log("👀 Home visible de nuevo: Buscando cambios en la nube...");
        fetchTripsList(user);
        fetchUserProfile(user.id);
      }
    };

    document.addEventListener("visibilitychange", handleRevalidation);
    window.addEventListener("focus", handleRevalidation);

    return () => {
      document.removeEventListener("visibilitychange", handleRevalidation);
      window.removeEventListener("focus", handleRevalidation);
    };
  }, [user, fetchTripsList, fetchUserProfile]);


  // --- 3. CARGA INICIAL Y REALTIME ---
  useEffect(() => {
    if (user?.id) {
        // Intentamos actualizar con datos frescos de la red al montar
        // (Los datos de disco ya se muestran porque tripsList viene del Context)
        if (isOnline) {
            fetchTripsList(user);
            fetchUserProfile(user.id);
        }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && user?.id) {
      setShowSuccessModal(true);
      window.history.replaceState({}, document.title, "/");
      fetchUserProfile(user.id);
    }

    // Suscripción Realtime (Solo si hay red)
    let sub;
    if (isOnline && user?.id) {
         sub = supabase
            .channel('home_trips')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
                console.log("🔄 Cambio en trips (Realtime) -> Recargando");
                fetchTripsList(user);
            })
            .subscribe();
    }

    return () => { if (sub) supabase.removeChannel(sub); };
  }, [user?.id, fetchTripsList, fetchUserProfile, isOnline]); // Dependencia isOnline añadida


  // --- HANDLERS (Crear, Borrar, Editar...) ---

  const handleSave = async () => {
    if (!isOnline) { alert("Necesitas internet para crear viajes."); return; } // Protección Offline
    if (!newTrip.title) return;
    
    const userEmail = user.email || user.user_metadata?.email;
    const { error } = await supabase.from('trips').insert([{
      title: newTrip.title,
      place: newTrip.place,
      start_date: newTrip.startDate,
      end_date: newTrip.endDate,
      cover_image_url: newTrip.coverImageUrl,
      owner_id: user.id,
      participants: [userEmail]
    }]);

    if (error) alert("Error: " + error.message);
    else {
      setOpenModal(false);
      setNewTrip({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
      fetchTripsList(user); // Forzamos actualización inmediata
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!isOnline) { alert("Necesitas internet para eliminar viajes."); return; }
    if (confirm("¿Eliminar viaje completo?")) {
      await supabase.from('trips').delete().eq('id', id);
      fetchTripsList(user); // Actualizamos UI manual por si el realtime falla
    }
  };

  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };

  const handleUpdateTrip = async () => {
    if (!isOnline) { alert("Estás offline."); return; }
    const { id, ...data } = editTripData;
    const { error } = await supabase.from('trips').update({
      title: data.title,
      place: data.place,
      start_date: data.startDate,
      end_date: data.endDate,
      cover_image_url: data.coverImageUrl
    }).eq('id', id);

    if (!error) {
        setOpenEditModal(false);
        fetchTripsList(user);
    }
  };

  const handleShare = async () => {
    if (!isOnline) { alert("Conéctate a internet para invitar."); return; }
    if (!shareEmail) return;
    try {
      const { data: currentTrip, error } = await supabase.from('trips').select('participants').eq('id', shareTripId).single();
      if (error) throw error;

      const currentParticipants = currentTrip.participants || [];
      if (currentParticipants.includes(shareEmail)) {
        alert("Usuario ya invitado.");
      } else {
        await supabase.from('trips').update({ participants: [...currentParticipants, shareEmail] }).eq('id', shareTripId);
        alert("¡Invitado!");
      }
      setOpenShare(false); setShareEmail('');
    } catch (e) { console.error(e); }
  };

  // LÓGICA DE VISUALIZACIÓN
  const today = dayjs().startOf('day');
  const upcomingTrips = trips.filter(t => dayjs(t.endDate).isAfter(today) || dayjs(t.endDate).isSame(today));
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  const otherTrips = trips.filter(t => t.id !== nextTrip?.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>

      {/* CABECERA (MARCA) */}
      <Box sx={{
        px: 3, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.background.default,
        animation: 'fadeIn 0.8s ease-out', '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
      }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FlightTakeoffIcon sx={{ color: '#FF7043', fontSize: 28, transform: 'rotate(-10deg) translateY(2px)', filter: 'drop-shadow(0 4px 6px rgba(255, 112, 67, 0.3))' }} />
          <Typography variant="h5" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: '1.5rem' }}>
            Travio<span style={{ color: '#FF7043' }}>.</span>
          </Typography>
          
          {/* INDICADOR OFFLINE EN EL HOME */}
          {!isOnline && (
             <Box sx={{ 
                 bgcolor: 'warning.main', color: 'white', px: 1, py: 0.5, borderRadius: 2, 
                 display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, boxShadow: 2
             }}>
                 <SignalWifiOffIcon sx={{ fontSize: 14 }} />
                 <Typography variant="caption" fontWeight="bold">OFFLINE</Typography>
             </Box>
          )}
        </Stack>
        
        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar src={user?.user_metadata?.avatar_url} sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        </IconButton>
      </Box>

      {/* SALUDO */}
      <Box sx={{ px: 3, mb: 3, mt: 1, animation: 'slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)', '@keyframes slideUp': { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }}>
        <Typography variant="h6" color="text.secondary" fontWeight="500" sx={{ fontSize: '1rem' }}>
          Hola, <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>{user?.user_metadata?.full_name?.split(' ')[0] || 'Viajero'}</span> 👋
        </Typography>
      </Box>

      {/* MENU USUARIO */}
      {/* MENU USUARIO */}
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        PaperProps={{ style: { borderRadius: 20, width: 250, padding: '8px 0' } }}
      >
        {/* LÓGICA DE SEGURIDAD VISUAL */}
        {(userProfile?.is_approved || userProfile?.is_admin) ? (
          /* --- CONTENIDO PARA USUARIOS APROBADOS --- */
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="800" color="primary.main">
                PLAN {userProfile?.is_pro ? 'PRO ⭐' : 'MOCHILERO'}
              </Typography>

              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">ESPACIO USADO</Typography>
                  <Typography variant="caption" fontWeight="800">
                    {(userProfile?.storage_used / (1024 * 1024)) > 1000 
                      ? `${(userProfile?.storage_used / (1024 * 1024 * 1024)).toFixed(2)} GB` 
                      : `${(userProfile?.storage_used / (1024 * 1024)).toFixed(1)} MB`
                    } 
                    {' / '} 
                    {userProfile?.is_pro ? '200 MB' : '20 MB'}
                  </Typography>
                </Stack>
                <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%',
                    bgcolor: (userProfile?.storage_used / (50 * 1024 * 1024)) > 0.9 && !userProfile?.is_pro ? '#EF5350' : 'primary.main',
                    width: `${Math.min(100, (userProfile?.storage_used / (userProfile?.is_pro ? 200 * 1024 * 1024 : 20 * 1024 * 1024)) * 100)}%`,
                    transition: 'width 0.5s ease-out'
                  }} />
                </Box>
              </Box>

              <MenuItem onClick={() => { setAnchorElUser(null); navigate('/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <Typography textAlign="center">Ajustes</Typography>
              </MenuItem>

              {!userProfile?.is_pro && (
                <Button fullWidth size="small" variant="contained" onClick={() => { setAnchorElUser(null); setPaywallOpen(true); }} sx={{ mt: 2, borderRadius: '10px', fontWeight: 'bold', fontSize: '0.7rem', py: 1 }}>
                  Subir a Pro
                </Button>
              )}

              {userProfile?.is_admin && (
                <MenuItem onClick={() => navigate('/admin')}>
                  <ListItemIcon><SettingsSuggestIcon fontSize="small" color="warning" /></ListItemIcon>
                  <Typography textAlign="center">Panel Admin</Typography>
                </MenuItem>
              )}
              {deferredPrompt && (
                <MenuItem onClick={() => { setAnchorElUser(null); installPwa(); }} sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
                  <ListItemIcon><DownloadIcon fontSize="small" color="primary" /></ListItemIcon>
                  <Typography textAlign="center" color="primary.main" fontWeight="700">Instalar App</Typography>
                </MenuItem>
              )}
            </Box>

            <Divider sx={{ my: 1 }} />
            
            <MenuItem onClick={toggleTheme}>
              <ListItemIcon>{mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}</ListItemIcon>
              <Typography textAlign="center">Modo {mode === 'light' ? 'Oscuro' : 'Claro'}</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => { setAnchorElUser(null); navigate('/passport'); }}>
                <ListItemIcon><PublicIcon fontSize="small" sx={{ color: '#2196F3' }} /></ListItemIcon>
                <Typography textAlign="center">Mi Pasaporte</Typography>
            </MenuItem>
            
             <Divider sx={{ my: 1 }} />
          </>
        ) : (
          /* --- CONTENIDO PARA TRAMPOSOS (NO APROBADOS) --- */
          <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="error" fontWeight="bold">
              ⛔ CUENTA RESTRINGIDA
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
              Esperando aprobación...
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* ESTE BOTÓN SIEMPRE VISIBLE PARA PODER SALIR */}
        <MenuItem onClick={onLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <Typography textAlign="center" color="error">Cerrar Sesión</Typography>
        </MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ px: 2, animation: 'slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s backwards' }}>

        {/* 2. PRÓXIMA PARADA (HERO CARD) */}
        {nextTrip && (
          <Box mb={4} mt={2}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              PRÓXIMA PARADA 🚀
            </Typography>

            {(() => {
              const start = dayjs(nextTrip.startDate).startOf('day');
              const diffDays = start.diff(today, 'day');
              const isOngoing = diffDays <= 0 && dayjs(nextTrip.endDate).isAfter(today);

              return (
                <Card onClick={() => navigate(`/trip/${nextTrip.id}`)} sx={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <Box sx={{ height: 320, width: '100%', position: 'relative' }}>
                    <TripCoverImage url={nextTrip.coverImageUrl} place={nextTrip.place} height="100%" />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)' }} />

                    {/* CUENTA ATRÁS */}
                    <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', p: 1.5, minWidth: 80, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                      {isOngoing ? (
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#4ADE80', lineHeight: 1 }}>ON</Typography>
                      ) : (
                        <Typography variant="h4" fontWeight="800" sx={{ color: 'white', lineHeight: 0.9 }}>{diffDays}</Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1, display: 'block', mt: 0.5 }}>{isOngoing ? 'EN RUTA' : 'DÍAS'}</Typography>
                    </Box>

                    {/* ACCIONES HERO */}
                    <Box position="absolute" top={20} right={20} display="flex" gap={1}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); if(!isOnline) return alert('Offline'); setShareTripId(nextTrip.id); setOpenShare(true); }} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}><ShareIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={(e) => openEdit(e, nextTrip)} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={(e) => handleDelete(e, nextTrip.id)} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: '#FF8A80', '&:hover': { bgcolor: 'rgba(255,60,60,0.4)' } }}><DeleteForeverIcon fontSize="small" /></IconButton>
                    </Box>

                    {/* DATOS HERO */}
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 3, width: '100%' }}>
                      <Typography variant="h3" fontWeight="800" sx={{ color: 'white', mb: 0.5, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{nextTrip.place}</Typography>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{nextTrip.title}</Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>{dayjs(nextTrip.startDate).format('D MMM')} - {dayjs(nextTrip.endDate).format('D MMM')}</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              );
            })()}
          </Box>
        )}

        {/* 3. OTROS VIAJES */}
        {otherTrips.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              OTROS VIAJES
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '24px', p: 1, border: 'none', overflow: 'hidden' }}>
              <Stack spacing={0.8}>
                {otherTrips.map(trip => (
                  <Card key={trip.id} sx={{ borderRadius: '16px', bgcolor: 'background.paper', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
                      <Box sx={{ width: 80, minWidth: 80, height: 80, position: 'relative' }}>
                        <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="100%" />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, py: 1, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', pr: 10 }}>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'text.primary', lineHeight: 1.2, mb: 0.5, fontSize: '0.95rem' }}>{trip.title}</Typography>
                          <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary">
                            <LocationOnIcon sx={{ fontSize: 14, color: theme.palette.custom.place.color }} />
                            <Typography variant="caption" fontWeight="600" noWrap>{trip.place}</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.05)', alignSelf: 'flex-start', px: 1, py: 0.3, borderRadius: '6px', fontWeight: 600 }}>
                          {dayjs(trip.startDate).format('D MMM YYYY')}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <Box position="absolute" top={8} right={8} sx={{ zIndex: 10, display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); if(!isOnline) return alert('Offline'); setShareTripId(trip.id); setOpenShare(true); }} sx={{ color: 'text.secondary', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { color: 'primary.main' } }}><ShareIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ color: 'text.secondary', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { color: 'primary.main' } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(e, trip.id); }} sx={{ color: '#E57373', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#FFEBEE' } }}><DeleteForeverIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {trips.length === 0 && (
          <Box textAlign="center" mt={10} opacity={0.6}>
            <FlightTakeoffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="700">Sin viajes todavía</Typography>
            <Typography variant="body2">Dale al botón + para empezar tu aventura</Typography>
          </Box>
        )}
      </Container>

      {/* FAB - DESHABILITADO SI OFFLINE */}
      <Fab variant="extended" 
           onClick={() => { if(!isOnline) return alert("Modo Offline: No puedes crear viajes."); setOpenModal(true); }} 
           sx={{
             position: 'fixed', bottom: 24, right: 24, 
             bgcolor: isOnline ? 'primary.main' : 'text.disabled', 
             color: 'white', fontWeight: 700, borderRadius: '20px', 
             boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)', 
             '&:hover': { bgcolor: isOnline ? 'primary.dark' : 'text.disabled' },
             animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards',
             '@keyframes popIn': { '0%': { opacity: 0, transform: 'scale(0.8) translateY(40px)' }, '100%': { opacity: 1, transform: 'scale(1) translateY(0)' } }
           }}>
        <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Nuevo Viaje
      </Fab>

      {/* MODALES */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>Nuevo Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.title} onChange={e => setNewTrip({ ...newTrip, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.place} onChange={e => setNewTrip({ ...newTrip, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada (Opcional)" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} /> }} value={newTrip.coverImageUrl} onChange={e => setNewTrip({ ...newTrip, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3, justifyContent: 'center' }}> <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary', bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleSave} disableElevation sx={{ bgcolor: 'primary.main', color: 'white' }}>Crear Viaje</Button> </DialogActions> </Dialog>
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Editar Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.title} onChange={e => setEditTripData({ ...editTripData, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.place} onChange={e => setEditTripData({ ...editTripData, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.startDate} onChange={e => setEditTripData({ ...editTripData, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.endDate} onChange={e => setEditTripData({ ...editTripData, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.coverImageUrl} onChange={e => setEditTripData({ ...editTripData, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenEditModal(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleUpdateTrip} sx={{ bgcolor: 'primary.main', color: 'white' }}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Invitar</DialogTitle> <DialogContent> <TextField autoFocus label="Email Gmail" type="email" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={shareEmail} onChange={e => setShareEmail(e.target.value)} sx={{ mt: 1 }} /> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenShare(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleShare} sx={{ bgcolor: 'primary.main', color: 'white' }}>Enviar</Button> </DialogActions> </Dialog>
      
      <TravioProModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <SuccessProModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      
      {/* MODAL INSTALACIÓN APP */}
      <Dialog open={showInstallModal} onClose={() => handleCloseInstall(false)} TransitionComponent={Slide} TransitionProps={{ direction: "up" }} PaperProps={{ sx: { borderRadius: '28px', maxWidth: 360, width: '100%', m: 2, p: 1 } }}>
        <Box position="relative">
          <IconButton onClick={() => handleCloseInstall(true)} sx={{ position: 'absolute', right: 8, top: 8, color: 'text.disabled' }}><CloseIcon /></IconButton>
          <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 3 }}>
            <Box sx={{ width: 70, height: 70, bgcolor: 'primary.light', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 20px rgba(103, 80, 164, 0.2)' }}><InstallMobileIcon sx={{ fontSize: 40, color: 'primary.main' }} /></Box>
            <Typography variant="h5" fontWeight="800" gutterBottom>Instala Travio</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 1 }}>Obtén la mejor experiencia a pantalla completa y acceso sin conexión a tus viajes.</Typography>
            {isIos ? (
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '16px', textAlign: 'left', mb: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" gap={1.5}><IosShareIcon color="primary" fontSize="small" /><Typography variant="caption" fontWeight="600">1. Pulsa el botón "Compartir" abajo.</Typography></Stack>
                  <Divider />
                  <Stack direction="row" alignItems="center" gap={1.5}><AddBoxIcon color="primary" fontSize="small" /><Typography variant="caption" fontWeight="600">2. Selecciona "Añadir a inicio".</Typography></Stack>
                </Stack>
              </Box>
            ) : (
              <Button variant="contained" fullWidth size="large" onClick={() => { installPwa(); handleCloseInstall(false); }} sx={{ borderRadius: '16px', py: 1.5, fontWeight: '800', fontSize: '1rem', boxShadow: '0 8px 20px rgba(103, 80, 164, 0.3)', mb: 2 }}>Instalar Ahora</Button>
            )}
            <Typography variant="caption" color="text.disabled" display="block">Puedes hacerlo más tarde en <strong style={{ color: theme.palette.text.secondary }}>Ajustes</strong></Typography>
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
}
export default HomeScreen;