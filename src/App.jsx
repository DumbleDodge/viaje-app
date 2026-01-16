import React, { useState, useEffect, useMemo } from "react";
import {
  ThemeProvider, CssBaseline, createTheme, Box,
  CircularProgress
} from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from 'dayjs/plugin/relativeTime';
import { get, set, del } from "idb-keyval";


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
import PassportScreen from "./components/gamification/PassportScreen";
import LandingPage from "./components/home/LandingPage";

// Configuración global de fechas
dayjs.extend(relativeTime);
dayjs.locale("es");

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");
  // 1. NUEVO ESTADO: Para saber si estamos comprobando credenciales
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  const { loadInitialDataFromDisk, hasOfflineData, clearOfflineDataFlag } = useTripContext();

  // Gestión de Sesión y Datos
  useEffect(() => {
    const initApp = async () => {
      setIsSessionChecking(true); // Empezamos a cargar

      try {
      // 1. Cargar datos del disco (Trips y Perfil)
      await loadInitialDataFromDisk();

      // 2. Intentar recuperar usuario (Supabase u Offline)
      // A. Probamos Supabase (Online)
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        console.log("✅ Usuario Online detectado");
        setUser(data.session.user);
        await set('offline_user', data.session.user); // Refrescamos copia local
      } else {
        // B. Si falla, probamos disco (Offline)
        console.log("⚠️ Sin sesión online, buscando en disco...");
        const cachedUser = await get('offline_user');

        if (cachedUser) {
          console.log("👤 Usuario Offline recuperado");
          setUser(cachedUser);
        } else {
          console.log("❌ No hay usuario ni online ni offline");
          setUser(null);
        }
      }
      }finally {

      setIsSessionChecking(false); // ¡YA HEMOS TERMINADO DE COMPROBAR!
      }
    };

    initApp();

    // Suscripción a cambios de sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Solo actualizamos si el evento es relevante para no causar re-renders locos
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          await set('offline_user', session.user);
        }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        await del('offline_user');
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await del('offline_user');
    clearOfflineDataFlag();
    setUser(null);
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // PANTALLA DE CARGA GLOBAL (Mientras comprobamos quién eres)
  if (isSessionChecking) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // LÓGICA DE ACCESO
  // Solo entramos si hay usuario real o datos offline CON usuario offline recuperado
  // (Si user es null, isAuthenticated será false, aunque hasOfflineData sea true,
  //  porque ya intentamos recuperar el usuario del disco y falló).
  const isAuthenticated = user !== null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={
              <LandingPage onLogin={() => supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
              })} />
            } />
          ) : (
            <>
              <Route path="/" element={
                <HomeScreen
                  user={user}
                  onLogout={handleLogout}
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

              <Route path="/passport" element={<PassportScreen user={user} />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;