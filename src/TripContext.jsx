import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { get, set } from 'idb-keyval';

const TripContext = createContext();
import PendingModal from './components/auth/PendingModal';

export const TripProvider = ({ children }) => {
  const [tripsList, setTripsList] = useState([]);
  const [userProfile, setUserProfile] = useState({ is_pro: false, storage_used: 0 });
  const [cache, setCache] = useState({});

  // 1. NUEVO: Estado de conexión Global
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Estados PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // 2. NUEVO ESTADO
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  useEffect(() => {
    // Detectar conexión
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Lógica PWA existente...
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(ios);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsPwaInstalled(isStandalone);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const changeHandler = (evt) => setIsPwaInstalled(evt.matches);
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', changeHandler);
    else mediaQuery.addListener(changeHandler);

    // Cargar listas iniciales
    loadInitialDataFromDisk();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      window.removeEventListener('beforeinstallprompt', handler);
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', changeHandler);
      else mediaQuery.removeListener(changeHandler);
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const loadInitialDataFromDisk = useCallback(async () => {
    try {
      const offlineTrips = await get('offline_trips');
      const offlineProfile = await get('offline_profile');
      if (offlineTrips) setTripsList(offlineTrips);
      if (offlineProfile) setUserProfile(offlineProfile);
    } catch (e) { console.error(e); }
  }, []);

  const fetchTripsList = useCallback(async (user) => {
    if (!user) return; // Si no hay user, nos quedamos con lo de disco
    const { data, error } = await supabase.from('trips').select('*').order('start_date', { ascending: true });
    if (!error && data) {
      const mapped = data.map(t => ({
        id: t.id,
        title: t.title,
        place: t.place,
        startDate: t.start_date,
        endDate: t.end_date,
        coverImageUrl: t.cover_image_url,
        participants: t.participants,
        aliases: t.aliases || {},
        country_code: t.country_code
      }));
      setTripsList(mapped);
      await set('offline_trips', mapped);
    }
  }, []);

  // En src/TripContext.jsx

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (!error && data) {
      // --- LÓGICA DE BLOQUEO ---
      if (data.is_approved === false && !data.is_admin) {
          console.warn("Usuario no aprobado. Bloqueando acceso.");
          
          // EN LUGAR DE ALERT, ACTIVAMOS EL MODAL
          setIsPendingApproval(true);
          
          // NO hacemos signOut aquí todavía, porque si cerramos sesión
          // el modal podría desaparecer si depende de que haya 'user'.
          // Dejamos que el botón del modal haga el signOut.
          return; 
      }
      // -------------------------

      setUserProfile(data);
      await set('offline_profile', data);
    }
  }, []);

  const updateTripCache = useCallback(async (tripId, key, data) => {
    setCache(prev => ({
      ...prev,
      [tripId]: { ...(prev[tripId] || {}), [key]: data }
    }));
    try { await set(`trip_${tripId}_${key}`, data); } catch (e) { console.error(e); }
  }, []);

  // 2. MODIFICADO: Devuelve datos explícitamente y actualiza RAM
  const loadTripDetailsFromDisk = useCallback(async (tripId) => {
    try {
      // Usamos Promise.all para máxima velocidad
      const [trip, items, spots, expenses] = await Promise.all([
        get(`trip_${tripId}_trip`),
        get(`trip_${tripId}_items`),
        get(`trip_${tripId}_spots`),
        get(`trip_${tripId}_expenses`)
      ]);

      const dataFound = {
        trip: trip || null,
        items: items || [],
        spots: spots || [],
        expenses: expenses || []
      };

      // Actualizar RAM inmediatamente
      setCache(prev => ({
        ...prev,
        [tripId]: dataFound
      }));

      return dataFound;
    } catch (e) {
      console.error("Error IDB", e);
      return { trip: null, items: [], spots: [], expenses: [] };
    }
  }, []);

  const getCachedTrip = useCallback((tripId) => cache[tripId] || {}, [cache]);

  return (
    <TripContext.Provider value={{
      tripsList, fetchTripsList, userProfile, fetchUserProfile,
      updateTripCache, getCachedTrip, loadTripDetailsFromDisk, loadInitialDataFromDisk,
      deferredPrompt, installPwa, isPwaInstalled, isIos,
      isOnline // <--- Exportamos esto
    }}>
      {children}
      {/* 3. RENDERIZAR EL MODAL AQUÍ (Siempre disponible globalmente) */}
      <PendingModal open={isPendingApproval} />
    </TripContext.Provider>
  );
};

export const useTripContext = () => useContext(TripContext);