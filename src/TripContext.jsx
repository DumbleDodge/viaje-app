import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { get, set } from 'idb-keyval';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripsList, setTripsList] = useState([]);
  const [userProfile, setUserProfile] = useState({ is_pro: false, storage_used: 0 });
  // La caché en memoria para acceso rápido
  const [cache, setCache] = useState({});

  // 1. Cargar DATOS GLOBALES (Lista de viajes y Perfil) al iniciar la app
  const loadInitialDataFromDisk = useCallback(async () => {
    try {
      const offlineTrips = await get('offline_trips');
      const offlineProfile = await get('offline_profile');
      if (offlineTrips) setTripsList(offlineTrips);
      if (offlineProfile) setUserProfile(offlineProfile);
      console.log("📦 Datos globales cargados del disco");
    } catch (e) {
      console.error("Error cargando de IDB", e);
    }
  }, []);

  // 2. Fetch Lista Viajes (Network -> Disk)
  const fetchTripsList = useCallback(async (user) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true });

    if (!error && data) {
      const mapped = data.map(t => ({
        id: t.id, title: t.title, place: t.place,
        startDate: t.start_date, endDate: t.end_date,
        coverImageUrl: t.cover_image_url,
        participants: t.participants, aliases: t.aliases || {}
      }));
      setTripsList(mapped);
      await set('offline_trips', mapped); // Guardar en disco
    }
  }, []);

  // 3. Fetch Perfil (Network -> Disk)
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      setUserProfile(data);
      await set('offline_profile', data); // Guardar en disco
    }
  }, []);

  // 4. ACTUALIZAR CACHÉ (Memoria + Disco)
  // Esta función la usaremos en TripDetail, SpotsView y ExpensesView
  const updateTripCache = useCallback(async (tripId, key, data) => {
    // A. Actualizar RAM
    setCache(prev => ({
      ...prev,
      [tripId]: { ...(prev[tripId] || {}), [key]: data }
    }));
    
    // B. Actualizar Disco (IDB) con una clave única: "trip_ID_KEY"
    // Ej: trip_123_items, trip_123_spots, trip_123_expenses
    try {
      await set(`trip_${tripId}_${key}`, data);
      console.log(`💾 Guardado offline: trip_${tripId}_${key}`);
    } catch (e) {
      console.error("Error guardando en disco", e);
    }
  }, []);

  // 5. RECUPERAR CACHÉ (Disco -> Memoria)
  // Esta función la llamaremos al entrar en TripDetailScreen
  const loadTripDetailsFromDisk = useCallback(async (tripId) => {
    try {
      const trip = await get(`trip_${tripId}_trip`);
      const items = await get(`trip_${tripId}_items`);
      const spots = await get(`trip_${tripId}_spots`);
      const expenses = await get(`trip_${tripId}_expenses`);

      // Actualizamos la memoria con lo que encontramos en el disco
      setCache(prev => ({
        ...prev,
        [tripId]: {
          trip: trip || null,
          items: items || [],
          spots: spots || [],
          expenses: expenses || []
        }
      }));
      return { trip, items, spots, expenses };
    } catch (e) {
      console.error("Error recuperando detalles del disco", e);
      return {};
    }
  }, []);

  // Helper síncrono para leer de RAM
  const getCachedTrip = useCallback((tripId) => cache[tripId] || {}, [cache]);

  return (
    <TripContext.Provider value={{ 
      tripsList, 
      fetchTripsList, 
      userProfile, 
      fetchUserProfile,
      updateTripCache,
      getCachedTrip,
      loadTripDetailsFromDisk, // <--- Nueva función expuesta
      loadInitialDataFromDisk 
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => useContext(TripContext);