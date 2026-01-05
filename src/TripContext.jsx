import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { get, set } from 'idb-keyval'; // <--- AÑADE ESTA LÍNEA AQUÍ
const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripsList, setTripsList] = useState([]);
  const [userProfile, setUserProfile] = useState({ is_pro: false, storage_used: 0 });
  const [cache, setCache] = useState({});

  // --- NUEVA FUNCIÓN: Cargar datos del disco al arrancar ---
  const loadInitialDataFromDisk = useCallback(async () => {
    try {
      const offlineTrips = await get('offline_trips');
      const offlineProfile = await get('offline_profile');
      if (offlineTrips) setTripsList(offlineTrips);
      if (offlineProfile) setUserProfile(offlineProfile);
      console.log("📦 Datos offline cargados del disco");
    } catch (e) {
      console.error("Error cargando de IDB", e);
    }
  }, []);

  // 1. Cargar lista de viajes y GUARDAR copia
  const fetchTripsList = useCallback(async (user) => {
    if (!user) return;
    
    // Primero intentamos fetch real
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
      // GUARDAMOS EN DISCO PARA OFFLINE
      await set('offline_trips', mapped);
    }
  }, []);

  // 2. Cargar perfil y GUARDAR copia
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (!error && data) {
      setUserProfile(data);
      // GUARDAMOS EN DISCO PARA OFFLINE
      await set('offline_profile', data);
    }
  }, []);

  // 3. Modificar la caché de detalles para que también sea persistente
  const updateTripCache = useCallback(async (tripId, key, data) => {
    setCache(prev => {
      const newCache = { ...prev, [tripId]: { ...(prev[tripId] || {}), [key]: data } };
      // Opcional: Podrías guardar el detalle del viaje en disco aquí también
      set(`trip_detail_${tripId}`, newCache[tripId]); 
      return newCache;
    });
  }, []);

  const getCachedTrip = useCallback((tripId) => cache[tripId] || {}, [cache]);

  return (
  <TripContext.Provider value={{ 
    tripsList, 
    fetchTripsList, 
    userProfile, 
    fetchUserProfile,
    updateTripCache,
    getCachedTrip,
    loadInitialDataFromDisk // <--- ASEGÚRATE DE QUE ESTO ESTÉ AQUÍ
  }}>
    {children}
  </TripContext.Provider>
);
};

export const useTripContext = () => useContext(TripContext);