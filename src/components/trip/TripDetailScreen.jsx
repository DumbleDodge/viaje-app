import React, { useState, useEffect, useRef } from "react";
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
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"; // Icono de Ticket

// Imports
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import TravioProModal from '../../TravioProModal';

// TUS 3 VISTAS HIJAS
import ItineraryView from './ItineraryView';
import SpotsView from './SpotsView';
import ExpensesView from './ExpensesView';
import TripWallet from './TripWallet';

function TripDetailScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const refreshTimeoutRef = useRef(null);

  // Contexto y Datos
  const { getCachedTrip, updateTripCache, loadTripDetailsFromDisk, userProfile, fetchUserProfile, isPwaInstalled, installPwa, deferredPrompt } = useTripContext();
  const cachedData = getCachedTrip(tripId);
  const [showToast, setShowToast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [trip, setTrip] = useState(cachedData.trip || null);
  const [items, setItems] = useState(cachedData.items || []);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPwaAdvice, setShowPwaAdvice] = useState(false);

  // Estados de UI
  const [currentView, setCurrentView] = useState(0); // 0: Itinerario, 1: Sitios, 2: Gastos
  const [isReorderMode, setIsReorderMode] = useState(false); // Para Itinerario
  const [isEditModeSpots, setIsEditModeSpots] = useState(false); // Para Sitios

  const [caching, setCaching] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('offline');
  const fetchTripFromNet = async () => {
    const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();
    if (!error && data) {
      const tripData = { id: data.id, title: data.title, place: data.place, startDate: data.start_date, endDate: data.end_date, coverImageUrl: data.cover_image_url, notes: data.notes || "", checklist: data.checklist || [], participants: data.participants || [], aliases: data.aliases || {} };
      setTrip(tripData);
      // BORRADO: setTripNotes(data.notes || ""); <--- ESTA LINEA FUERA
      updateTripCache(tripId, 'trip', tripData);
    }
  };
  // --- CARGA DE DATOS UNIFICADA (DISCO + RED) ---
  const fetchItemsFromNet = async () => {
    const { data, error } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true }); // Supabase ya lo intenta ordenar

    if (!error && data) {
      // 1. Mapeamos los datos (nombres, horas...)
      const mappedItems = data.map(i => ({ 
        id: i.id, 
        ...i, 
        date: i.date, 
        time: i.time ? i.time.slice(0, 5) : '', 
        mapsLink: i.maps_link, 
        flightNumber: i.flight_number, 
        order_index: i.order_index, // Aseguramos que order_index existe
        location_name: i.location_name 
      }));

      // 2. RE-ORDENAMOS AQUÍ para asegurar que el array visual es perfecto
      // (A veces Supabase devuelve desordenado si hay empates)
      const sortedItems = mappedItems.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      setItems(sortedItems); 
      updateTripCache(tripId, 'items', sortedItems);
    }
  };

  // --- CARGA DE DATOS Y REALTIME ---
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setCurrentUser(user); fetchUserProfile(user.id); }

      if (!trip) {
        const diskData = await loadTripDetailsFromDisk(tripId);
        if (diskData.trip) setTrip(diskData.trip);
        if (diskData.items) setItems(diskData.items);
      }
      fetchTripFromNet();
      fetchItemsFromNet();
    };
    initData();

    // SUSCRIPCIÓN TRIP (Notas, Checklist, Alias)
    const tripSub = supabase.channel('trip_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => {
          const newData = payload.new;

          setTrip(prev => {
            // Calculamos el nuevo estado
            const updated = {
              ...prev,
              notes: newData.notes,
              checklist: newData.checklist,
              aliases: newData.aliases || {}
            };

            // FIX CLAVE: Usamos setTimeout para sacar esto del ciclo de render de React.
            // Esto evita el error "Cannot update a component while rendering..."
            setTimeout(() => {
              updateTripCache(tripId, 'trip', updated);
            }, 0);

            return updated;
          });


        })
      .subscribe();

    // 2. CANAL DE ITEMS (Itinerario) - AQUÍ ESTABA EL ERROR
    const itemsSub = supabase.channel('items_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_items', filter: `trip_id=eq.${tripId}` },
        () => {
          // Si estamos editando, ignoramos cambios externos para que no salte
          if (isReorderMode) return;

          // Debounce usando useRef (Solución al error ReferenceError)
          if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

          refreshTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Cambio detectado en DB -> Recargando lista...");
            fetchItemsFromNet();
          }, 1000);
        })
      .subscribe();

    return () => { supabase.removeChannel(tripSub); supabase.removeChannel(itemsSub); };
  }, [tripId, isReorderMode]);

  const [openWallet, setOpenWallet] = useState(false); // <--- ESTE ES EL QUE TE FALTABA

  // Función para abrir adjuntos (necesaria para la Wallet)
  const openAttachment = async (att) => {
    // 1. INTENTO OFFLINE: Buscar en disco
    if (att.path) {
      try {
        const blob = await get(att.path);
        if (blob) {
          console.log("📂 Abriendo desde caché local");
          return window.open(URL.createObjectURL(blob));
        }
      } catch (e) { console.error("Error lectura cache", e); }
    }

    // 2. ABRIR URL REMOTA (R2)
    // Si no está en disco, abrimos la URL pública directamente
    if (att.url) {
        window.open(att.url, '_blank');
    }

    // 3. AUTO-CACHÉ (Solo PRO): Guardar para la próxima
    // Si es Pro y no lo teníamos en disco, lo bajamos ahora
    if (userProfile?.is_pro && att.url && att.path) {
      try {
        console.log("⬇️ Usuario PRO: Guardando para offline...");
        
        // CORRECCIÓN: Usamos fetch normal a la URL de R2, no supabase.storage
        const response = await fetch(att.url);
        
        if (response.ok) {
            const blob = await response.blob();
            await set(att.path, blob);
            setRefreshTrigger(p => p + 1); // Pone el chip verde
            console.log("✅ Guardado en disco");
        }
      } catch (e) { 
        console.warn("No se pudo auto-guardar", e); 
      }
    }
  };


  const fetchTripData = async (onlyItems = false) => {
    if (!onlyItems) {
      const { data } = await supabase.from('trips').select('*').eq('id', tripId).single();
      if (data) { setTrip(data); updateTripCache(tripId, 'trip', data); }
    }
    const { data: itemsData } = await supabase.from('trip_items').select('*').eq('trip_id', tripId).order('order_index', { ascending: true });
    if (itemsData) { setItems(itemsData); updateTripCache(tripId, 'items', itemsData); }
  };


  const handleCacheAll = async () => {
    // 1. Check PRO
    if (!userProfile?.is_pro) {
      setPaywallReason('offline');
      setPaywallOpen(true);
      return;
    }

    // DEBUG: Ver qué valores tenemos
    console.log("DEBUG PWA:", { isPwaInstalled, deferredPrompt });

    // 2. Check PWA (Si no la tiene instalada y es instalable)
    if (!isPwaInstalled && deferredPrompt) {
      setShowPwaAdvice(true);
      // No retornamos, dejamos que el usuario decida en el modal
      return;
    }

    // 3. Si todo ok, descargamos
    startDownload();
  };

  // Función auxiliar con la lógica de descarga que ya tenías
  const startDownload = async () => {
    setShowPwaAdvice(false);
    setCaching(true);

    try {
      for (const item of items) {
        if (item.attachments && item.attachments.length > 0) {
          for (const att of item.attachments) {
            if (att.path && att.url) { // Aseguramos que tenga URL
              // 1. Mirar si ya está en caché
              const existing = await get(att.path);

              if (!existing) {
                console.log(`⬇️ Descargando ${att.name} desde Cloudflare R2...`);
                
                try {
                  // 2. Descargar desde la URL pública de R2
                  const response = await fetch(att.url);
                  if (!response.ok) throw new Error("Error HTTP " + response.status);
                  
                  const blob = await response.blob();

                  // 3. Guardar en disco
                  await set(att.path, blob);
                  
                } catch (err) {
                  console.error(`Fallo al bajar ${att.name}`, err);
                }
              }
            }
          }
        }
      }
      
      setShowToast(true);
      setRefreshTrigger(p => p + 1);

    } catch (e) {
      console.error("Error global", e);
      alert("Error al descargar archivos offline");
    } finally {
      setCaching(false);
    }
  };



  if (!trip) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;


  // --- GUARDAR ORDEN DEL ITINERARIO ---
  const handleSaveOrder = async () => {
    // 1. Salimos del modo edición visualmente
    setIsReorderMode(false);

    // 2. Preparamos los datos para Supabase (Mapeo CamelCase -> SnakeCase)
    // Recorremos TODOS los items y actualizamos su order_index basándonos en cómo están en el array ahora mismo.
    // (Para ser más precisos, deberíamos ordenar por fecha y luego asignar índice, 
    // pero como el array ya viene ordenado visualmente del hijo, suele valer).

    const updates = items.map((item) => ({
      id: item.id,
      trip_id: tripId,
      date: item.date,
      order_index: item.order_index, // Este valor ya lo actualizó el hijo en local

      // Mapeo de campos necesarios
      title: item.title,
      type: item.type,
      description: item.description,
      time: item.time,
      maps_link: item.mapsLink,
      flight_number: item.flightNumber,
      origin: item.origin,
      destination: item.destination,
      terminal: item.terminal,
      gate: item.gate,
      location_name: item.location_name
    }));

    try {
      // 3. Upsert Masivo
      const { error } = await supabase.from('trip_items').upsert(updates);
      if (error) throw error;

      // 4. Actualizamos caché local
      updateTripCache(tripId, 'items', items);
      console.log("Orden guardado correctamente");

    } catch (e) {
      console.error("Error guardando orden:", e);
      alert("Hubo un error al guardar el orden.");
    }
  };


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>

      {/* HEADER */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: theme.palette.mode === "light" ? "rgba(245, 247, 250, 0.45)" : "rgba(18, 18, 18, 0.45)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${theme.palette.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`, color: "text.primary", top: 0, zIndex: 1100, // NUEVA ANIMACIÓN: Solo opacidad, sin movimiento brusco
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <IconButton onClick={() => navigate("/")} sx={{ bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mr: 2 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>{trip.title}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              <Box sx={{ bgcolor: theme.palette.custom.place.bg, borderRadius: "6px", px: 0.8, py: 0.2, display: "flex", alignItems: "center" }}>
                <LocationOnIcon sx={{ fontSize: 12, color: theme.palette.custom.place.color, mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: theme.palette.custom.place.color }}>{trip.place}</Typography>
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            {/* Botón Editar/Guardar */}
            {(currentView === 0 || currentView === 1) && (
              <IconButton
                onClick={() => {
                  if (currentView === 0) {
                    // SI ES ITINERARIO:
                    if (isReorderMode) handleSaveOrder(); // Si estaba activo, GUARDAR
                    else setIsReorderMode(true);          // Si no, ACTIVAR
                  } else {
                    // SI SON SITIOS:
                    // (Aquí podrías hacer lo mismo si implementas batch update en spots, 
                    // o dejarlo como toggle simple si spots sigue guardando al momento)
                    setIsEditModeSpots(!isEditModeSpots);
                  }
                }}
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
            <IconButton onClick={handleCacheAll} disabled={caching} sx={{ color: caching ? "text.disabled" : theme.palette.primary.main, bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {caching ? <CircularProgress size={20} /> : <CloudDownloadIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <Box sx={{ pb: 12 }}>

        {/* PESTAÑA 1: ITINERARIO */}
        <Box sx={{ display: currentView === 0 ? 'block' : 'none' }}>
          <ItineraryView
            trip={trip}
            items={items}
            setItems={setItems}
            isReorderMode={isReorderMode}
            tripId={tripId}
            onOpenAttachment={openAttachment} // <--- ¡AÑADE ESTA LÍNEA!
            refreshTrigger={refreshTrigger} // <--- AÑADE ESTO
          />
        </Box>

        {/* PESTAÑA 2: SITIOS */}
        <Box sx={{ display: currentView === 1 ? 'block' : 'none' }}>
          <SpotsView
            tripId={tripId}
            isEditMode={isEditModeSpots}
            // Pasamos funciones de modal si hiciera falta, o dejamos que SpotsView las maneje
            openCreateSpot={() => { }} // (Opcional si SpotsView tiene su propio modal)
          />
        </Box>

        {/* PESTAÑA 3: GASTOS */}
        <Box sx={{ display: currentView === 2 ? 'block' : 'none' }}>
          <ExpensesView trip={trip} tripId={tripId} userEmail={currentUser?.email} />
        </Box>

      </Box>

      {/* BARRA INFERIOR DINÁMICA */}
      {(isReorderMode || isEditModeSpots) ? (

        /* --- MODO EDICIÓN ACTIVO --- */
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            borderRadius: '50px',
            bgcolor: 'text.primary', // Negro en modo claro, Blanco en oscuro
            color: 'background.paper',
            px: 3,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            // ... resto de estilos ...
            animation: 'popInCentered 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes popInCentered': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-50%) scale(0.5) translateY(20px)' // Empieza centrado, pequeño y abajo
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(-50%) scale(1) translateY(0)'     // Termina centrado y en su sitio
              }
            }
          }}
        >
          <Typography variant="body2" fontWeight="700" letterSpacing={0.5}>
            MODO EDICIÓN
          </Typography>

          <IconButton
            size="small"
            // CAMBIO AQUÍ: Llamamos a la función de guardar
            onClick={() => {
              if (currentView === 0) handleSaveOrder(); // Si es itinerario, guarda
              else setIsEditModeSpots(false); // Si son spots, solo cierra (o crea otra funcion similar para spots)
            }}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              '&:hover': { bgcolor: 'background.default' }
            }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </Paper>

      ) : (

        /* --- NAVEGACIÓN NORMAL --- */
        <Paper sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '24px', bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.6)', backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`, boxShadow: theme.palette.mode === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '0 8px', maxWidth: '90%', width: 'auto',// NUEVA ANIMACIÓN: Entra desde abajo con un pequeño retraso (0.2s)
          animation: 'navSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards',

          '@keyframes navSlideUp': {
            '0%': {
              opacity: 0,
              transform: 'translate(-50%, 100px)' // Empieza abajo fuera de pantalla
            },
            '100%': {
              opacity: 1,
              transform: 'translate(-50%, 0)' // Termina en su sitio
            }
          }
        }}>
          <BottomNavigation showLabels={false} value={currentView} onChange={(e, val) => setCurrentView(val)} sx={{ bgcolor: "transparent", height: 64, width: "auto", gap: 1 }}>
            <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Gastos" icon={<EuroIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
          </BottomNavigation>
        </Paper>
      )}



      {/* DRAWER DE WALLET */}
      <TripWallet
        open={openWallet}
        onClose={() => setOpenWallet(false)}
        items={items}
        onOpenAttachment={openAttachment}
      />

      {/* NOTIFICACIÓN DE DESCARGA COMPLETADA */}
      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 90, md: 24 } }} // Para que no lo tape el menú inferior
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 'bold' }}
        >
          ¡Viaje descargado para Offline! ✈️
        </Alert>
      </Snackbar>

      <TravioProModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      {/* MODAL CONSEJO PWA OFFLINE */}
      <Dialog open={showPwaAdvice} onClose={() => startDownload()} maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>
          💡 Recomendación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" mb={2}>
            Para asegurar que tus archivos no se borren y tener acceso offline real, te recomendamos instalar la App.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => { installPwa(); setShowPwaAdvice(false); }}
            startIcon={<CloudDownloadIcon />}
            sx={{ mb: 1, borderRadius: '12px', fontWeight: 700 }}
          >
            Instalar App
          </Button>
          <Button
            fullWidth
            onClick={() => startDownload()}
            color="inherit"
            sx={{ fontSize: '0.8rem' }}
          >
            Continuar sin instalar
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TripDetailScreen;