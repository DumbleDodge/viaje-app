import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripsList, setTripsList] = useState([]);
  const [userProfile, setUserProfile] = useState({ is_pro: false, storage_used: 0 });
  const [cache, setCache] = useState({});

  // 1. Envolvemos con useCallback y dejamos las dependencias vacías []
  const fetchTripsList = useCallback(async (user) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true });

    if (!error && data) {
      setTripsList(data.map(t => ({
        id: t.id,
        title: t.title,
        place: t.place,
        startDate: t.start_date,
        endDate: t.end_date,
        coverImageUrl: t.cover_image_url,
        participants: t.participants,
        aliases: t.aliases || {}
      })));
    }
  }, []); // [] significa que la función no cambia nunca

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setUserProfile(data);
    }
  }, []);

  const updateTripCache = useCallback((tripId, key, data) => {
    setCache(prev => ({
      ...prev,
      [tripId]: {
        ...(prev[tripId] || {}),
        [key]: data
      }
    }));
  }, []);

  const getCachedTrip = useCallback((tripId) => cache[tripId] || {}, [cache]);

  return (
    <TripContext.Provider value={{ 
      tripsList, 
      fetchTripsList, 
      userProfile, 
      fetchUserProfile,
      updateTripCache,
      getCachedTrip
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => useContext(TripContext);