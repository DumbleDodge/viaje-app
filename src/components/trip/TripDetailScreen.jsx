import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, AppBar, Toolbar, IconButton, Typography, Stack, CircularProgress,
  Paper, BottomNavigation, BottomNavigationAction, Snackbar,
  Alert, Dialog, DialogTitle, DialogContent, Button, DialogActions, TextField, FormControl, InputLabel
  , Select, MenuItem
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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; // <--- Importado
import TouchAppIcon from "@mui/icons-material/TouchApp"; // <--- Importado

// Imports
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import TravioProModal from '../../TravioProModal';
import { retryWithBackoff } from '../../utils/retryWithBackoff';

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
    deferredPrompt, isOnline, isSyncing, pendingOpsCount,
    queueOperation
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
  const [isEditModeExpenses, setIsEditModeExpenses] = useState(false); // <--- NUEVO ESTADO

  // UI States
  const [showToast, setShowToast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Para forzar repintado de hijos
  const [showPwaAdvice, setShowPwaAdvice] = useState(false);
  const [caching, setCaching] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);


  // --- HANDLERS PARA SITIOS (Spots) ---
  const [openSpotModal, setOpenSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: "", category: "Comida", description: "", mapsLink: "", tags: "" });
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [isSavingSpot, setIsSavingSpot] = useState(false);

  // --- NUEVO ESTADO DE AYUDA ---
  const [openHelp, setOpenHelp] = useState(false);


  // --- 2. FUNCIÓN DE CARGA DE RED (REUTILIZABLE) ---
  // Esta función se llama al inicio Y cuando vuelves a la app tras horas
  const refreshDataFromNetwork = useCallback(async () => {
    // Si no hay red, no intentamos nada y nos quedamos con lo local
    if (!navigator.onLine) return;

    try {
      console.log("☁️ Sincronizando datos frescos de la nube...");

      // Use retry with backoff for critical network calls
      await retryWithBackoff(async () => {
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
      }, 2); // 2 retries with exponential backoff

      console.log("✅ Datos actualizados correctamente.");

    } catch (e) {
      console.warn("Error en actualización silenciosa (probablemente offline/auth):", e);
      // No hacemos nada visualmente molesto, el usuario sigue viendo su caché.
    }
  }, [tripId, updateTripCache, fetchUserProfile]);



  // --- 3. EFECTO PRINCIPAL (MONTAJE) ---
  useEffect(() => {
    let isActive = true;
    let hasLoadedFromNetwork = false; // Prevent multiple network calls

    const initLoad = async () => {
      try {
        console.log(`🔍 TripDetail: Mounting (tripId: ${tripId})`);
        console.log(`📱 Network status: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}`);

        // FASE A: CARGA DE DISCO (Siempre intentar primero)
        let foundOnDisk = false;

        if (!trip) {
          console.log('💾 No trip in RAM, loading from disk...');

          try {
            const diskData = await loadTripDetailsFromDisk(tripId);

            if (isActive && diskData && diskData.trip) {
              console.log('✅ Disk data loaded successfully:', {
                tripTitle: diskData.trip.title,
                itemsCount: diskData.items?.length || 0,
                spotsCount: diskData.spots?.length || 0
              });

              setTrip(diskData.trip);
              setItems(diskData.items || []);
              setLoadingInitial(false); // ✅ Mostrar YA contenido de disco
              foundOnDisk = true;
            } else {
              console.warn('⚠️ No data found on disk for tripId:', tripId);
            }
          } catch (diskError) {
            console.error('❌ Error loading from disk:', diskError);
            // Continue to network attempt
          }
        } else {
          console.log('✅ Trip already in RAM, using cached data');
          setLoadingInitial(false);
          foundOnDisk = true;
        }

        // FASE B: CARGA DE RED
        // Si ya encontramos en disco, hacemos la carga en background (sin bloquear)
        // Si NO encontramos en disco, tenemos que esperar (await) para quitar el spinner
        if (navigator.onLine && !hasLoadedFromNetwork) {
          hasLoadedFromNetwork = true;
          console.log('🌐 Network available, attempting sync...');

          if (foundOnDisk) {
            console.log('🔄 Background refresh (data already visible)');
            refreshDataFromNetwork(); // Background refresh
          } else {
            console.log('⏳ Waiting for network data (no disk cache)...');
            // No hay datos, el usuario está esperando -> Await critical
            try {
              await refreshDataFromNetwork();
              console.log('✅ Network data loaded');
            } catch (netError) {
              console.error('❌ Network load failed:', netError);
            }
            if (isActive) setLoadingInitial(false);
          }
        } else if (!navigator.onLine) {
          console.log('📴 Offline mode - using disk data only');
          if (isActive && !foundOnDisk) {
            console.warn('⚠️ No disk data and offline - showing empty state');
            setLoadingInitial(false);
          }
        }
      } catch (error) {
        console.error('❌ Critical error in initLoad:', error);
        // Ensure we always clear loading state, even on error
        if (isActive) {
          setLoadingInitial(false);
        }
      }
    };

    initLoad();

    return () => {
      console.log('🧹 TripDetail unmounting');
      isActive = false;
    };
  }, [tripId, loadTripDetailsFromDisk, refreshDataFromNetwork]);


  // --- 4. EFECTO DE "VUELTA A LA APP" (VISIBILITY) ---
  // Si minimizas la app 2 horas y vuelves, esto actualiza los datos
  useEffect(() => {
    let debounceTimer = null;
    let lastSyncTime = 0;
    const MIN_SYNC_INTERVAL = 5000; // Minimum 5 seconds between syncs

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        // Clear any pending debounce
        if (debounceTimer) clearTimeout(debounceTimer);

        // Check if enough time has passed since last sync
        const now = Date.now();
        if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
          console.log("⏳ Sync debounced (too soon)");
          return;
        }

        debounceTimer = setTimeout(() => {
          console.log("👀 App visible de nuevo: Buscando cambios...");
          lastSyncTime = Date.now();
          refreshDataFromNetwork();
        }, 500); // 500ms debounce
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
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
    const updates = items.map((item) => ({
      id: item.id,
      trip_id: tripId,
      date: item.date,
      order_index: item.order_index,
      title: item.title, type: item.type, description: item.description,
      time: item.time || null, maps_link: item.mapsLink, flight_number: item.flightNumber,
      location_name: item.location_name
    }));

    // Optimistic update: save locally first
    await updateTripCache(tripId, 'items', items);
    setIsReorderMode(false);

    if (!navigator.onLine) {
      // Offline: queue for later
      console.log('📴 Offline: Queueing reorder operation');
      await queueOperation({
        type: 'UPDATE_ITEMS',
        data: { tripId, items }
      });
      return;
    }

    // Online: try to sync immediately
    try {
      const { error } = await supabase.from('trip_items').upsert(updates);
      if (error) throw error;
      console.log('✅ Order saved to server');
    } catch (e) {
      console.error("Error guardando orden", e);
      // Failed - queue it for retry
      await queueOperation({
        type: 'UPDATE_ITEMS',
        data: { tripId, items }
      });
    }
  };

  // 1. Abrir modal para crear
  const handleOpenCreateSpot = () => {
    setEditingSpotId(null);
    setNewSpot({ name: "", category: "Comida", description: "", mapsLink: "", tags: "" });
    setOpenSpotModal(true);
  };

  // 2. Abrir modal para editar
  const handleOpenEditSpot = (spot) => {
    setEditingSpotId(spot.id);
    setNewSpot({
      name: spot.name,
      category: spot.category || "Comida",
      description: spot.description || "",
      mapsLink: spot.mapsLink || "",
      tags: spot.tags ? spot.tags.join(", ") : ""
    });
    setOpenSpotModal(true);
  };

  // 3. Guardar en Supabase
  const handleSaveSpot = async () => {
    if (!newSpot.name) return;
    setIsSavingSpot(true);
    try {
      // (Opcional: aquí podrías usar fetchLocationFromUrl si quieres autocompletar)

      const tagsArray = newSpot.tags.split(",").map((t) => t.trim()).filter((t) => t !== "");

      const spotData = {
        name: newSpot.name,
        category: newSpot.category,
        description: newSpot.description,
        maps_link: newSpot.mapsLink,
        tags: tagsArray,
        trip_id: tripId
      };

      if (editingSpotId) {
        await supabase.from('trip_spots').update(spotData).eq('id', editingSpotId);
      } else {
        await supabase.from('trip_spots').insert([{ ...spotData, order_index: Date.now() }]);
      }
      setOpenSpotModal(false);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsSavingSpot(false);
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
          <IconButton onClick={() => navigate("/")} aria-label="Volver al inicio" sx={{ bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mr: 2 }}>
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
              {/* SYNC INDICATOR */}
              {isSyncing && (
                <Box sx={{ bgcolor: 'info.main', borderRadius: "6px", px: 0.8, py: 0.2, display: "flex", alignItems: "center" }}>
                  <CircularProgress size={10} sx={{ color: 'white', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: 'white' }}>SYNC</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {/* Solo mostrar AYUDA si NO estamos en Gastos (View 2) */}
            {currentView !== 2 && (
              <IconButton onClick={() => setOpenHelp(true)} aria-label="Ayuda" sx={{ color: theme.palette.text.secondary, bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            )}
            {/* ITINERARIO (0): Solo mostramos Check si estamos en modo reordenar. El modo se activa con Long Press. */}
            {currentView === 0 && isReorderMode && (
              <IconButton
                onClick={handleSaveOrder}
                aria-label="Guardar orden"
                sx={{
                  color: 'white',
                  bgcolor: 'primary.main',
                  boxShadow: 1
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            )}

            {/* SITIOS (1): Mantenemos botón Editar normal */}
            {/* SITIOS (1): Solo mostramos Check si estamos en modo edición */}
            {currentView === 1 && isEditModeSpots && (
              <IconButton
                onClick={() => setIsEditModeSpots(false)}
                aria-label="Guardar cambios de sitios"
                sx={{ color: 'white', bgcolor: 'primary.main', boxShadow: 1 }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            )}

            {/* GASTOS (2): Botón Toggle Edición */}
            {currentView === 2 && (
              <IconButton
                onClick={() => setIsEditModeExpenses(!isEditModeExpenses)}
                aria-label={isEditModeExpenses ? "Guardar cambios de gastos" : "Editar gastos"}
                sx={{
                  color: isEditModeExpenses ? 'white' : 'primary.main',
                  bgcolor: isEditModeExpenses ? 'primary.main' : 'background.paper',
                  boxShadow: 1
                }}
              >
                {isEditModeExpenses ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
              </IconButton>
            )}

            {items.some(i => i.type === 'flight' || i.type === 'transport') && (
              <IconButton onClick={() => setOpenWallet(true)} aria-label="Abrir cartera y tickets" sx={{ color: openWallet ? 'white' : 'secondary.main', bgcolor: openWallet ? 'secondary.main' : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'), boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <ConfirmationNumberIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={handleCacheAll} aria-label="Descargar para offline" disabled={caching || !isOnline} sx={{ color: caching ? "text.disabled" : (isOnline ? theme.palette.primary.main : "text.disabled"), bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
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
            onEnableReorder={setIsReorderMode}
            tripId={tripId}
            onOpenAttachment={openAttachment}
            refreshTrigger={refreshTrigger}
          />
        </Box>
        <Box sx={{ display: currentView === 1 ? 'block' : 'none' }}>
          <SpotsView
            tripId={tripId}
            isEditMode={isEditModeSpots}
            onEnableEditMode={setIsEditModeSpots} // <--- Pasamos el setter
            openCreateSpot={handleOpenCreateSpot}
            onEdit={handleOpenEditSpot}
          />
        </Box>
        <Box sx={{ display: currentView === 2 ? 'block' : 'none' }}>
          <ExpensesView
            trip={trip}
            tripId={tripId}
            userEmail={currentUser?.email}
            isEditMode={isEditModeExpenses}
            onToggleEditMode={setIsEditModeExpenses}
          />
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
          <IconButton size="small" onClick={() => isReorderMode ? handleSaveOrder() : setIsEditModeSpots(false)} aria-label="Salir del modo edición" sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.default' } }}>
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
            <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: "text.secondary", width: 80, minWidth: 80, maxWidth: 80, borderRadius: "20px", "&.Mui-selected": { "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: "text.secondary", width: 80, minWidth: 80, maxWidth: 80, borderRadius: "20px", "&.Mui-selected": { "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Gastos" icon={<EuroIcon />} sx={{ color: "text.secondary", width: 80, minWidth: 80, maxWidth: 80, borderRadius: "20px", "&.Mui-selected": { "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
          </BottomNavigation>
        </Paper>
      )}

      {/* PENDING OPERATIONS FLOATING BANNER */}
      {pendingOpsCount > 0 && !isSyncing && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 100, // Above navigation bar
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            borderRadius: '16px',
            bgcolor: 'secondary.main',
            color: 'white',
            px: 2.5,
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            maxWidth: '85%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            animation: 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes slideUpFade': {
              '0%': { opacity: 0, transform: 'translate(-50%, 20px)' },
              '100%': { opacity: 1, transform: 'translate(-50%, 0)' }
            }
          }}
        >
          <Box
            sx={{
              minWidth: 28,
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.9rem',
              flexShrink: 0
            }}
          >
            {pendingOpsCount}
          </Box>
          <Typography variant="body2" fontWeight="700" sx={{ letterSpacing: 0.3 }}>
            {pendingOpsCount === 1 ? 'Cambio pendiente' : 'Cambios pendientes'}
          </Typography>
          <SignalWifiOffIcon sx={{ fontSize: 18, opacity: 0.9 }} />
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


      {/* Modal Crear Spot */}
      <Dialog open={openSpotModal} onClose={() => setOpenSpotModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
          {editingSpotId ? "Editar Sitio" : "Nuevo Sitio"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>

            {/* CAMPO NOMBRE */}
            <TextField
              label="Nombre del sitio"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }}
              value={newSpot.name}
              onChange={e => setNewSpot({ ...newSpot, name: e.target.value })}
            />

            {/* SELECTOR CATEGORÍA */}
            <FormControl fullWidth variant="filled">
              <InputLabel shrink>Categoría</InputLabel>
              <Select
                value={newSpot.category}
                onChange={e => setNewSpot({ ...newSpot, category: e.target.value })}
                disableUnderline
                sx={{ borderRadius: 3, bgcolor: 'action.hover' }}
              >
                <MenuItem value="Comida">🍔 Comida</MenuItem>
                <MenuItem value="Super">🛒 Supermercado</MenuItem>
                <MenuItem value="Gasolina">⛽ Gasolinera</MenuItem>
                <MenuItem value="Visita">📷 Turismo</MenuItem>
                <MenuItem value="Salud">🏥 Salud</MenuItem>
                <MenuItem value="Otro">⭐ Otro</MenuItem>
              </Select>
            </FormControl>

            {/* CAMPO LINK */}
            <TextField
              label="Link Google Maps"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }}
              value={newSpot.mapsLink}
              onChange={e => setNewSpot({ ...newSpot, mapsLink: e.target.value })}
            />

            {/* CAMPO DESCRIPCIÓN */}
            <TextField
              label="Notas / Descripción"
              multiline rows={2}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }}
              value={newSpot.description}
              onChange={e => setNewSpot({ ...newSpot, description: e.target.value })}
            />

            {/* CAMPO ETIQUETAS */}
            <TextField
              label="Etiquetas (separadas por coma)"
              placeholder="barato, cena, imperdible"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }}
              value={newSpot.tags}
              onChange={e => setNewSpot({ ...newSpot, tags: e.target.value })}
            />

          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenSpotModal(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveSpot} disabled={isSavingSpot} sx={{ borderRadius: '50px', px: 4, fontWeight: 800 }}>
            {isSavingSpot ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showPwaAdvice} onClose={() => startDownload()} maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>💡 Recomendación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" mb={2}>Para asegurar que tus archivos no se borren y tener acceso offline real, te recomendamos instalar la App.</Typography>
          <Button variant="contained" fullWidth onClick={() => { installPwa(); setShowPwaAdvice(false); }} startIcon={<CloudDownloadIcon />} sx={{ mb: 1, borderRadius: '12px', fontWeight: 700 }}>Instalar App</Button>
          <Button fullWidth onClick={() => startDownload()} color="inherit" sx={{ fontSize: '0.8rem' }}>Continuar sin instalar</Button>
        </DialogContent>
      </Dialog>

      {/* MODAL DE AYUDA (NUEVO) */}
      <Dialog open={openHelp} onClose={() => setOpenHelp(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Box sx={{ width: 60, height: 60, borderRadius: '20px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <TouchAppIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight="800" gutterBottom>¿Cómo reordenar?</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {currentView === 1
              ? "Para cambiar el orden de los sitios, simplemente:"
              : "Para mover un plan de día o cambiar el orden, simplemente:"}
          </Typography>
          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '16px', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="700" color="primary.main">👉 Mantén pulsada una tarjeta</Typography>
            <Typography variant="caption" display="block" mt={0.5} color="text.secondary">
              Espera un segundo hasta que vibre y se levante. ¡Luego arrástrala donde quieras!
            </Typography>
          </Box>
          <Button variant="contained" fullWidth onClick={() => setOpenHelp(false)} sx={{ borderRadius: '12px', fontWeight: 'bold' }}>Entendido</Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default TripDetailScreen;