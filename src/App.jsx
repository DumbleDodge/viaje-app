import React, { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from 'dayjs/plugin/relativeTime';

// --- IMPORTS DE CONFIGURACIÓN ---
import { supabase } from './supabaseClient';
import { useTripContext } from './TripContext';
import { getDesignTokens } from "./theme/theme"; // <--- PASO 1

// --- IMPORTS DE PANTALLAS ---
import LoginScreen from "./components/auth/LoginScreen"; // <--- PASO 2
import AdminRoute from "./components/auth/AdminRoute";   // <--- PASO 3
import HomeScreen from "./components/home/HomeScreen";   // <--- PASO 5
import TripDetailScreen from "./components/trip/TripDetailScreen"; // <--- PASO 6
import SettingsScreen from "./SettingsScreen"; // (Este ya lo tenías fuera)
import AdminDashboard from "./AdminDashboard"; // (Este también)

// Configuración global de fechas
dayjs.extend(relativeTime);
dayjs.locale("es");

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");
  
  const { loadInitialDataFromDisk } = useTripContext();

  // Gestión de Sesión
  useEffect(() => {
    loadInitialDataFromDisk();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadInitialDataFromDisk]);

  // Gestión de Tema
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) setMode(savedMode);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={
              <LoginScreen onLogin={() => supabase.auth.signInWithOAuth({ 
                  provider: 'google', 
                  options: { redirectTo: window.location.origin } 
              })} />
            } />
          ) : (
            <>
              <Route path="/" element={
                <HomeScreen 
                  user={user} 
                  onLogout={async () => await supabase.auth.signOut()} 
                  toggleTheme={toggleTheme} 
                  mode={mode} 
                />
              } />
              
              <Route path="/trip/:tripId" element={<TripDetailScreen />} />
              
              <Route path="/settings" element={
                <SettingsScreen user={user} toggleTheme={toggleTheme} mode={mode} />
              } />

              <Route path="/admin" element={
                <AdminRoute user={user}>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;