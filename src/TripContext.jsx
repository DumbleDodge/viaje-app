import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { get, set, clear } from 'idb-keyval';
import { offlineQueue } from './utils/offlineQueue';
import { retryWithBackoff } from './utils/retryWithBackoff';

import { cacheImage, getCachedImage } from './utils/imageCache';

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

  // 3. OFFLINE QUEUE STATES
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOpsCount, setPendingOpsCount] = useState(0);

  useEffect(() => {
    // Initialize offline queue
    offlineQueue.init().then(() => {
      setPendingOpsCount(offlineQueue.getCount());
    });

    // Detectar conexión
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      // If we just came online, process pending operations
      if (online) {
        console.log('🌐 Connection restored. Processing pending operations...');
        processPendingOps();
      }
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Lógica PWA existente...
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(ios);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e; // Sync global
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if it fired before we mounted
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

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

  // Añade esto dentro de TripProvider en TripContext.jsx

  useEffect(() => {
    // Escuchamos eventos de Auth (Login, Logout, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {
        // Alguien acaba de entrar (o se ha refrescado el token)
        const newUser = session.user;

        // Leemos quién era el último usuario guardado
        const offlineProfile = await get('offline_profile');

        // SEGURIDAD: Si había datos de OTRO usuario, BORRAMOS TODO
        if (offlineProfile && offlineProfile.id !== newUser.id) {
          console.warn("🚨 Cambio de usuario detectado. Limpiando datos del usuario anterior...");

          // 1. Borramos IndexedDB
          await clear();

          // 2. Limpiamos estados en memoria
          setTripsList([]);
          setCache({});
          setUserProfile({});

          // 3. Opcional: Recargar página para asegurar limpieza total
          // window.location.reload(); 
        }
      }

      if (event === 'SIGNED_OUT') {
        // Esto captura cuando el usuario le da a cerrar sesión, 
        // pero también ayuda si supabase cierra sesión forzada.
        // Lo ideal es mantener los datos si es solo expiración, 
        // así que aquí no solemos borrar nada automáticamente 
        // para respetar el modo Offline.
      }
    });

    return () => {
      subscription.unsubscribe();
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
      // 1. CARGA PURA DE DISCO (Sin depender de Supabase/Red)
      // Esto asegura que sea instantáneo. La validación de seguridad
      // se hace en el useEffect de onAuthStateChange.
      const offlineProfile = await get('offline_profile');
      let offlineTrips = await get('offline_trips');

      // --- HYDRATE BLOB URLS ---
      // Las Blob URLs (blob:http://...) caducan al cerrar la pestaña.
      // Tenemos que regenerarlas desde el IndexedDB cada vez que arranca la app.
      if (offlineTrips && offlineTrips.length > 0) {
        offlineTrips = await Promise.all(offlineTrips.map(async (t) => {
          const cacheKey = `trip_${t.id}_cover`;
          const freshBlobUrl = await getCachedImage(cacheKey);
          return {
            ...t,
            coverImageUrl: freshBlobUrl || t.originalCoverUrl || t.coverImageUrl
          };
        }));
      }
      // -------------------------

      if (offlineTrips) setTripsList(offlineTrips);
      if (offlineProfile) setUserProfile(offlineProfile);

      return { trips: offlineTrips || [], profile: offlineProfile || null };

    } catch (e) {
      console.error("Error cargando de IDB", e);
      return { trips: [], profile: null };
    }
  }, []);

  const fetchTripsList = useCallback(async (user) => {
    if (!user) return; // Si no hay user, nos quedamos con lo de disco
    const { data, error } = await supabase.from('trips').select('*').order('start_date', { ascending: true });
    if (!error && data) {
      // PROCESAMOS IMÁGENES EN PARALELO
      const mapped = await Promise.all(data.map(async (t) => {
        // Intentamos recuperar imagen caché
        const cacheKey = `trip_${t.id}_cover`;
        let finalUrl = t.cover_image_url;

        // 1. Si tenemos blob local, usamos ese para mostrar YA
        const localBlobUrl = await getCachedImage(cacheKey);
        if (localBlobUrl) {
          finalUrl = localBlobUrl;
        } else if (t.cover_image_url) {
          // 2. Si no, lanzamos descarga en background (sin await para no bloquear UI)
          cacheImage(t.cover_image_url, cacheKey)
            .then(blobUrl => {
              // Opcional: Podríamos actualizar el estado aquí si quisiéramos efecto "pop",
              // pero mejor que se actualice en la siguiente carga para no re-renderizar a lo loco.
            })
            .catch(e => console.error("Fallo cache fondo", e));
        }

        return {
          id: t.id,
          title: t.title,
          place: t.place,
          startDate: t.start_date,
          endDate: t.end_date,
          coverImageUrl: finalUrl, // Usamos Blob URL si existe
          originalCoverUrl: t.cover_image_url, // Guardamos original por si acaso
          participants: t.participants,
          aliases: t.aliases || {},
          country_code: t.country_code
        };
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
    try { await set(`trip_${tripId}_${key}`, data); } catch (e) { console.error(`❌ Error saving ${key} to IDB:`, e); }
  }, []);

  // 2. MODIFICADO: Devuelve datos explícitamente y actualiza RAM
  const loadTripDetailsFromDisk = useCallback(async (tripId) => {
    console.log(`💾 Loading trip details from disk for tripId: ${tripId}`);

    try {
      // Individual catches to prevent one failure from blocking all
      const [trip, items, spots, expenses] = await Promise.all([
        get(`trip_${tripId}_trip`).catch(e => { console.warn('Failed to load trip from IDB:', e); return null; }),
        get(`trip_${tripId}_items`).catch(e => { console.warn('Failed to load items from IDB:', e); return []; }),
        get(`trip_${tripId}_spots`).catch(e => { console.warn('Failed to load spots from IDB:', e); return []; }),
        get(`trip_${tripId}_expenses`).catch(e => { console.warn('Failed to load expenses from IDB:', e); return []; })
      ]);

      const dataFound = {
        trip: trip || null,
        items: items || [],
        spots: spots || [],
        expenses: expenses || []
      };

      console.log(`📊 Disk load results for trip ${tripId}:`, {
        tripFound: !!dataFound.trip,
        tripTitle: dataFound.trip?.title || 'N/A',
        itemsCount: dataFound.items.length,
        spotsCount: dataFound.spots.length,
        expensesCount: dataFound.expenses.length
      });

      // Actualizar RAM inmediatamente
      setCache(prev => ({
        ...prev,
        [tripId]: dataFound
      }));

      return dataFound;
    } catch (e) {
      console.error("❌ Critical IDB error in loadTripDetailsFromDisk:", e);
      return { trip: null, items: [], spots: [], expenses: [] };
    }
  }, []);

  const getCachedTrip = useCallback((tripId) => cache[tripId] || {}, [cache]);

  // QUEUE OPERATION HELPER
  const queueOperation = useCallback(async (operation) => {
    const opId = await offlineQueue.add(operation);
    setPendingOpsCount(offlineQueue.getCount());
    console.log(`📝 Operation queued: ${operation.type}`);
    return opId;
  }, []);

  // PROCESS PENDING OPERATIONS
  const processPendingOps = useCallback(async () => {
    if (!navigator.onLine) {
      console.log('⚠️ Cannot process queue: offline');
      return;
    }

    setIsSyncing(true);
    try {
      const executors = {
        // Define executors for different operation types
        UPDATE_ITEMS: async (data) => {
          const { tripId, items } = data;
          const updates = items.map((item) => ({
            id: item.id,
            trip_id: tripId,
            date: item.date,
            order_index: item.order_index,
            title: item.title,
            type: item.type,
            description: item.description,
            time: item.time || null,
            maps_link: item.mapsLink,
            flight_number: item.flightNumber,
            location_name: item.location_name
          }));
          const { error } = await supabase.from('trip_items').upsert(updates);
          if (error) throw error;
        },
        UPDATE_TRIP: async (data) => {
          const { tripId, updates } = data;
          const { error } = await supabase.from('trips').update(updates).eq('id', tripId);
          if (error) throw error;
        },
        DELETE_ITEM: async (data) => {
          const { itemId } = data;
          const { error } = await supabase.from('trip_items').delete().eq('id', itemId);
          if (error) throw error;
        },
        DELETE_SPOT: async (data) => {
          const { spotId } = data;
          const { error } = await supabase.from('trip_spots').delete().eq('id', spotId);
          if (error) throw error;
        },
        DELETE_EXPENSE: async (data) => {
          const { expenseId } = data;
          const { error } = await supabase.from('trip_expenses').delete().eq('id', expenseId);
          if (error) throw error;
        }
      };

      const result = await offlineQueue.process(executors);
      setPendingOpsCount(offlineQueue.getCount());

      if (result.processed > 0) {
        console.log(`✅ Synced ${result.processed} operations`);
      }
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} operations failed`);
      }
    } catch (e) {
      console.error('Error processing queue:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // PROCESS QUEUE ON MOUNT IF ALREADY ONLINE
  useEffect(() => {
    // Wait a bit to ensure queue is loaded
    const timer = setTimeout(() => {
      if (pendingOpsCount > 0 && navigator.onLine && !isSyncing) {
        console.log('🔄 Processing pending operations on mount (already online)...');
        processPendingOps();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingOpsCount]); // Only run when pendingOpsCount changes (after queue init)

  // ... dentro de TripProvider ...

  // FUNCIÓN DE LOGOUT SEGURO
  const logout = useCallback(async () => {
    console.log("🔒 Cerrando sesión y limpiando datos sensibles...");

    try {
      // 1. Limpiar toda la caché del disco (IndexedDB)
      await clear();

      // 2. Limpiar estados en memoria (por si acaso no recargamos)
      setTripsList([]);
      setUserProfile({});
      setCache({});

      // 3. Cerrar sesión en Supabase
      await supabase.auth.signOut();

      // 4. Forzar recarga para limpiar cualquier variable global/contexto residual
      window.location.href = "/";

    } catch (e) {
      console.error("Error al cerrar sesión:", e);
      // Fallback por si falla algo
      window.location.href = "/";
    }
  }, []);


  return (
    <TripContext.Provider value={{
      tripsList, fetchTripsList, userProfile, fetchUserProfile,
      updateTripCache, getCachedTrip, loadTripDetailsFromDisk, loadInitialDataFromDisk,
      deferredPrompt, installPwa, isPwaInstalled, isIos,
      isOnline, isSyncing, pendingOpsCount,
      queueOperation, processPendingOps,
      logout // <--- Exportamos esto
    }}>
      {children}
      {/* 3. RENDERIZAR EL MODAL AQUÍ (Siempre disponible globalmente) */}
      <PendingModal open={isPendingApproval} />
    </TripContext.Provider>
  );
};

export const useTripContext = () => useContext(TripContext);