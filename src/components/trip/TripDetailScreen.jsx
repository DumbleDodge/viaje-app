import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, AppBar, Toolbar, IconButton, Typography, Stack, CircularProgress,
  Paper, BottomNavigation, BottomNavigationAction, Snackbar,
  Alert, Dialog, DialogTitle, DialogContent, Button
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material";
import { get, set } from "idb-keyval";

// Iconos
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ListIcon from "@mui/icons-material/List";
import PlaceIcon from "@mui/icons-material/Place";
import EuroIcon from "@mui/icons-material/Euro";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SignalWifiOffIcon from "@mui/icons-material/SignalWifiOff"; 

// Imports
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import TravioProModal from '../../TravioProModal';

// Vistas Hijas
import ItineraryView from './ItineraryView';
import SpotsView from './SpotsView';
import ExpensesView from './ExpensesView';
import TripWallet from './TripWallet';

function TripDetailScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const refreshTimeoutRef = useRef(null);

  // --- 1. CONTEXTO Y ESTADOS INICIALES ---
  const { 
    getCachedTrip, updateTripCache, loadTripDetailsFromDisk, 
    userProfile, fetchUserProfile, isPwaInstalled, installPwa, 
    deferredPrompt, isOnline 
  } = useTripContext();

  // Intentamos leer de la RAM primero (Carga Instantánea si vienes de Home)
  const cachedData = getCachedTrip(tripId);
  
  const [trip, setTrip] = useState(cachedData.trip || null);
  const [items, setItems] = useState(cachedData.items || []);
  
  // Loading solo es true si NO tenemos ni RAM ni Disco todavía
  const [loadingInitial, setLoadingInitial] = useState(!cachedData.trip);

  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState(0); // 0: Itinerario, 1: Sitios, 2: Gastos
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isEditModeSpots, setIsEditModeSpots] = useState(false);

  // UI States
  const [showToast, setShowToast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Para forzar repintado de hijos
  const [showPwaAdvice, setShowPwaAdvice] = useState(false);
  const [caching, setCaching] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);

  
  // --- 2. FUNCIÓN DE CARGA DE RED (REUTILIZABLE) ---
  // Esta función se llama al inicio Y cuando vuelves a la app tras horas
  const refreshDataFromNetwork = useCallback(async () => {
    // Si no hay red, no intentamos nada y nos quedamos con lo local
    if (!navigator.onLine) return;

    try {
      console.log("☁️ Sincronizando datos frescos de la nube...");
      
      // A. Verificar Auth (Sin bloquear UI si falla)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.id);
      } else {
        console.warn("⚠️ Sesión expirada. Modo Solo Lectura (con datos locales).");
      }

      // B. Fetch Trip Info
      const { data: tripData, error: tripError } = await supabase
        .from('trips').select('*').eq('id', tripId).single();
      
      if (!tripError && tripData) {
        const formattedTrip = {
          ...tripData,
          startDate: tripData.start_date,
          endDate: tripData.end_date,
          coverImageUrl: tripData.cover_image_url,
          notes: tripData.notes || "",
          checklist: tripData.checklist || [],
          participants: tripData.participants || [],
          aliases: tripData.aliases || {}
        };
        
        setTrip(formattedTrip);
        updateTripCache(tripId, 'trip', formattedTrip); // Guardar en disco para la próxima
      }

      // C. Fetch Trip Items (Itinerario)
      const { data: itemsData, error: itemsError } = await supabase
        .from('trip_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!itemsError && itemsData) {
        // Mapeo y ordenación
        const mappedItems = itemsData.map(i => ({ 
          id: i.id, ...i, date: i.date, time: i.time ? i.time.slice(0, 5) : '', 
          mapsLink: i.maps_link, flightNumber: i.flight_number, 
          order_index: i.order_index, location_name: i.location_name 
        }));
        
        // Aseguramos orden visual
        const sortedItems = mappedItems.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        setItems(sortedItems);
        updateTripCache(tripId, 'items', sortedItems);
      }

      console.log("✅ Datos actualizados correctamente.");

    } catch (e) {
      console.warn("Error en actualización silenciosa (probablemente offline/auth):", e);
      // No hacemos nada visualmente molesto, el usuario sigue viendo su caché.
    }
  }, [tripId, updateTripCache, fetchUserProfile]);


  // --- 3. EFECTO PRINCIPAL (MONTAJE) ---
  useEffect(() => {
    let isActive = true;

    const initLoad = async () => {
      // FASE A: CARGA DE DISCO (Prioridad Máxima)
      if (!trip) {
        // Si no había nada en RAM, preguntamos al disco
        const diskData = await loadTripDetailsFromDisk(tripId);
        
        if (isActive && diskData.trip) {
          setTrip(diskData.trip);
          setItems(diskData.items);
          setLoadingInitial(false); // ¡UI LISTA! No esperamos a internet
          console.log("💿 Datos cargados desde disco");
        }
      } else {
        // Si ya había datos en RAM, quitamos loading
        setLoadingInitial(false);
      }

      // FASE B: CARGA DE RED (Segundo plano)
      if (navigator.onLine) {
        await refreshDataFromNetwork();
      }
    };

    initLoad();

    return () => { isActive = false; };
  }, [tripId]); // Solo se ejecuta al montar el componente


  // --- 4. EFECTO DE "VUELTA A LA APP" (VISIBILITY) ---
  // Si minimizas la app 2 horas y vuelves, esto actualiza los datos
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
         console.log("👀 App visible de nuevo: Buscando cambios...");
         refreshDataFromNetwork();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [refreshDataFromNetwork]);


  // --- 5. REALTIME (SUBSCRIPTIONS) ---
  useEffect(() => {
    if (!isOnline) return; // Solo suscribimos si hay red

    // Canal TRIP (Notas, Checklist)
    const tripSub = supabase.channel('trip_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => {
          const newData = payload.new;
          setTrip(prev => {
            const updated = { ...prev, notes: newData.notes, checklist: newData.checklist, aliases: newData.aliases || {} };
            setTimeout(() => updateTripCache(tripId, 'trip', updated), 0);
            return updated;
          });
        })
      .subscribe();

    // Canal ITEMS (Itinerario)
    const itemsSub = supabase.channel('items_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_items', filter: `trip_id=eq.${tripId}` },
        () => {
          if (isReorderMode) return; // No interrumpir si el usuario está ordenando
          if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Cambio realtime detectado -> Refrescando lista");
            refreshDataFromNetwork();
          }, 1000);
        })
      .subscribe();

    return () => { supabase.removeChannel(tripSub); supabase.removeChannel(itemsSub); };
  }, [tripId, isReorderMode, isOnline, refreshDataFromNetwork, updateTripCache]);


  // --- 6. HANDLERS (DESCARGA Y ORDEN) ---

  const openAttachment = async (att) => {
    // 1. Intentar desde caché local
    if (att.path) {
      try {
        const blob = await get(att.path);
        if (blob) return window.open(URL.createObjectURL(blob));
      } catch (e) { console.error("Cache miss", e); }
    }
    // 2. Si no, abrir URL remota (R2)
    if (att.url) window.open(att.url, '_blank');

    // 3. Auto-cache PRO (Background)
    if (userProfile?.is_pro && att.url && att.path) {
      fetch(att.url).then(res => res.blob()).then(blob => {
          set(att.path, blob);
          setRefreshTrigger(p => p + 1); // Actualiza iconito verde
      }).catch(console.warn);
    }
  };

  const handleCacheAll = async () => {
    if (!userProfile?.is_pro) {
      setPaywallOpen(true);
      return;
    }
    if (!isPwaInstalled && deferredPrompt) {
      setShowPwaAdvice(true);
      return;
    }
    startDownload();
  };

  const startDownload = async () => {
    setShowPwaAdvice(false);
    setCaching(true);
    try {
      for (const item of items) {
        if (item.attachments?.length > 0) {
          for (const att of item.attachments) {
            if (att.path && att.url) {
              const existing = await get(att.path);
              if (!existing) {
                const response = await fetch(att.url);
                if (response.ok) {
                  const blob = await response.blob();
                  await set(att.path, blob);
                }
              }
            }
          }
        }
      }
      setShowToast(true);
      setRefreshTrigger(p => p + 1);
    } catch (e) {
      console.error("Error descarga offline", e);
      alert("Hubo un problema al descargar algunos archivos.");
    } finally {
      setCaching(false);
    }
  };

  const handleSaveOrder = async () => {
    setIsReorderMode(false);
    const updates = items.map((item) => ({
      id: item.id,
      trip_id: tripId,
      date: item.date,
      order_index: item.order_index,
      // ...campos necesarios para upsert...
      title: item.title, type: item.type, description: item.description,
      time: item.time, maps_link: item.mapsLink, flight_number: item.flightNumber,
      location_name: item.location_name
    }));

    try {
      const { error } = await supabase.from('trip_items').upsert(updates);
      if (error) throw error;
      updateTripCache(tripId, 'items', items);
    } catch (e) {
      console.error("Error guardando orden", e);
      alert("Error al guardar el orden. ¿Tienes internet?");
    }
  };


  // --- 7. RENDERIZADO ---

  // Loading INICIAL real (Solo si no hay nada de nada)
  if (loadingInitial) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  // Fallback si terminó de cargar y no hay viaje
  if (!trip) {
    return (
       <Box display="flex" flexDirection="column" alignItems="center" mt={10} p={3}>
         <Typography variant="h6">No se encontró el viaje.</Typography>
         <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Volver</Button>
       </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>

      {/* HEADER */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: theme.palette.mode === "light" ? "rgba(245, 247, 250, 0.45)" : "rgba(18, 18, 18, 0.45)",
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${theme.palette.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
        color: "text.primary", top: 0, zIndex: 1100,
        animation: 'fadeIn 0.6s ease-out', '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
      }}>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mr: 2 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: "1.1rem" }}>{trip.title}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              <Box sx={{ bgcolor: theme.palette.custom.place.bg, borderRadius: "6px", px: 0.8, py: 0.2, display: "flex", alignItems: "center" }}>
                <LocationOnIcon sx={{ fontSize: 12, color: theme.palette.custom.place.color, mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: theme.palette.custom.place.color }}>{trip.place}</Typography>
              </Box>
              {/* INDICADOR OFFLINE */}
              {!isOnline && (
                <Box sx={{ bgcolor: 'warning.main', borderRadius: "6px", px: 0.8, py: 0.2, display: "flex", alignItems: "center" }}>
                   <SignalWifiOffIcon sx={{ fontSize: 12, color: 'white', mr: 0.5 }} />
                   <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: 'white' }}>OFFLINE</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {(currentView === 0 || currentView === 1) && (
              <IconButton
                onClick={() => currentView === 0 ? (isReorderMode ? handleSaveOrder() : setIsReorderMode(true)) : setIsEditModeSpots(!isEditModeSpots)}
                sx={{
                  color: (isReorderMode || isEditModeSpots) ? 'white' : 'primary.main',
                  bgcolor: (isReorderMode || isEditModeSpots) ? 'primary.main' : 'background.paper',
                  boxShadow: 1
                }}
              >
                {(isReorderMode || isEditModeSpots) ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
              </IconButton>
            )}
            {items.some(i => i.type === 'flight' || i.type === 'transport') && (
              <IconButton onClick={() => setOpenWallet(true)} sx={{ color: openWallet ? 'white' : 'secondary.main', bgcolor: openWallet ? 'secondary.main' : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'), boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <ConfirmationNumberIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={handleCacheAll} disabled={caching || !isOnline} sx={{ color: caching ? "text.disabled" : (isOnline ? theme.palette.primary.main : "text.disabled"), bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {caching ? <CircularProgress size={20} /> : <CloudDownloadIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO VISTAS */}
      <Box sx={{ pb: 12 }}>
        <Box sx={{ display: currentView === 0 ? 'block' : 'none' }}>
          <ItineraryView
            trip={trip}
            items={items}
            setItems={setItems}
            isReorderMode={isReorderMode}
            tripId={tripId}
            onOpenAttachment={openAttachment}
            refreshTrigger={refreshTrigger}
          />
        </Box>
        <Box sx={{ display: currentView === 1 ? 'block' : 'none' }}>
          <SpotsView tripId={tripId} isEditMode={isEditModeSpots} openCreateSpot={() => {}} />
        </Box>
        <Box sx={{ display: currentView === 2 ? 'block' : 'none' }}>
          <ExpensesView trip={trip} tripId={tripId} userEmail={currentUser?.email} />
        </Box>
      </Box>

      {/* BOTONERA INFERIOR (Modo Edición vs Navegación) */}
      {(isReorderMode || isEditModeSpots) ? (
        <Paper elevation={4} sx={{
            position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '50px',
            bgcolor: 'text.primary', color: 'background.paper', px: 3, py: 1, display: 'flex', alignItems: 'center', gap: 2,
            animation: 'popInCentered 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes popInCentered': { '0%': { opacity: 0, transform: 'translateX(-50%) scale(0.5) translateY(20px)' }, '100%': { opacity: 1, transform: 'translateX(-50%) scale(1) translateY(0)' } }
          }}>
          <Typography variant="body2" fontWeight="700" letterSpacing={0.5}>MODO EDICIÓN</Typography>
          <IconButton size="small" onClick={() => currentView === 0 ? handleSaveOrder() : setIsEditModeSpots(false)} sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.default' } }}>
            <CheckIcon fontSize="small" />
          </IconButton>
        </Paper>
      ) : (
        <Paper sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '24px',
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.6)', backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme.palette.mode === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)',
          overflow: 'hidden', padding: '0 8px', maxWidth: '90%', width: 'auto',
          animation: 'navSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards',
          '@keyframes navSlideUp': { '0%': { opacity: 0, transform: 'translate(-50%, 100px)' }, '100%': { opacity: 1, transform: 'translate(-50%, 0)' } }
        }}>
          <BottomNavigation showLabels={false} value={currentView} onChange={(e, val) => setCurrentView(val)} sx={{ bgcolor: "transparent", height: 64, width: "auto", gap: 1 }}>
            <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Gastos" icon={<EuroIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
          </BottomNavigation>
        </Paper>
      )}

      {/* MODALES Y EXTRAS */}
      <TripWallet open={openWallet} onClose={() => setOpenWallet(false)} items={items} onOpenAttachment={openAttachment} />
      
      <Snackbar open={showToast} autoHideDuration={3000} onClose={() => setShowToast(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ bottom: { xs: 90, md: 24 } }}>
        <Alert onClose={() => setShowToast(false)} severity="success" variant="filled" sx={{ width: "100%", borderRadius: 3, fontWeight: 'bold' }}>
          ¡Viaje descargado para Offline! ✈️
        </Alert>
      </Snackbar>

      <TravioProModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      
      <Dialog open={showPwaAdvice} onClose={() => startDownload()} maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>💡 Recomendación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" mb={2}>Para asegurar que tus archivos no se borren y tener acceso offline real, te recomendamos instalar la App.</Typography>
          <Button variant="contained" fullWidth onClick={() => { installPwa(); setShowPwaAdvice(false); }} startIcon={<CloudDownloadIcon />} sx={{ mb: 1, borderRadius: '12px', fontWeight: 700 }}>Instalar App</Button>
          <Button fullWidth onClick={() => startDownload()} color="inherit" sx={{ fontSize: '0.8rem' }}>Continuar sin instalar</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TripDetailScreen;