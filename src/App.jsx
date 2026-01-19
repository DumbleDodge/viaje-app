import React, { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, createTheme, Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from 'dayjs/plugin/relativeTime';

// --- IMPORTS DE CONFIGURACIÓN ---
import { supabase } from './supabaseClient';
import { useTripContext } from './TripContext';
import { getDesignTokens } from "./theme/theme";

// --- IMPORTS DE PANTALLAS ---
import LoginScreen from "./components/auth/LoginScreen"; // O LandingPage, lo que prefieras
import AdminRoute from "./components/auth/AdminRoute";
import HomeScreen from "./components/home/HomeScreen";
import TripDetailScreen from "./components/trip/TripDetailScreen";
import SettingsScreen from "./SettingsScreen";
import AdminDashboard from "./AdminDashboard";
import PassportScreen from "./components/gamification/PassportScreen";
import LandingPage from "./components/home/LandingPage";

// Configuración global de fechas
dayjs.extend(relativeTime);
dayjs.locale("es");

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");
  
  // 1. ESTADO DE CARGA PARA EVITAR PANTALLA BLANCA AL VENIR DE GOOGLE
  const [loading, setLoading] = useState(true);

  // Traemos 'logout' del contexto para hacer la limpieza segura
  const { loadInitialDataFromDisk, logout } = useTripContext();

  // Gestión de Sesión
  useEffect(() => {
    // Carga datos offline por si acaso
    loadInitialDataFromDisk();

    // Comprobamos sesión al arrancar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // --- CORRECCIÓN CRÍTICA PARA LOGIN CON GOOGLE ---
      // Si no hay sesión, pero hay un hash en la URL (token de Google),
      // NO quitamos el loading todavía. Esperamos a que onAuthStateChange lo procese.
      if (!session && window.location.hash.includes('access_token')) {
         console.log("⏳ Detectado retorno de Google. Esperando procesar token...");
      } else {
         setLoading(false); // Solo dejamos de cargar si NO estamos esperando a Google
      }
    });

    // Escuchamos cambios (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // Aquí SIEMPRE quitamos el loading
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

  // 2. SPINNER DE CARGA (Para que no parpadee el Login mientras procesa Google)
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          
          {/* RUTA 1: HOME (Protegida: Si no hay usuario -> Landing) */}
          <Route path="/" element={
            user ? (
              <HomeScreen
                user={user}
                onLogout={logout} // <--- USAMOS EL LOGOUT SEGURO DEL CONTEXTO
                toggleTheme={toggleTheme}
                mode={mode}
              />
            ) : (
              <LandingPage onLogin={() => supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
              })} />
            )
          } />

          {/* RUTA 2: DETALLE VIAJE (PÚBLICA / OFFLINE) */}
          {/* IMPORTANTE: Esta ruta está fuera del chequeo de 'user' para que funcione offline */}
          <Route path="/trip/:tripId" element={<TripDetailScreen />} />

          {/* RUTA 3: RUTAS PROTEGIDAS (Settings, Passport, Admin) */}
          {/* Usamos Navigate para protegerlas individualmente */}
          
          <Route path="/settings" element={
            user ? <SettingsScreen user={user} toggleTheme={toggleTheme} mode={mode} /> : <Navigate to="/" />
          } />
          
          <Route path="/passport" element={
            user ? <PassportScreen user={user} /> : <Navigate to="/" />
          } />

          <Route path="/admin" element={
            <AdminRoute user={user}>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* RUTA 4: CUALQUIER OTRA -> REDIRIGIR A HOME */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;