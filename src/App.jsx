import React, { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, createTheme, Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from 'dayjs/plugin/relativeTime';

// --- IMPORTS DE CONFIGURACIÓN ---
import { supabase } from './supabaseClient';
import { useTripContext } from './TripContext';
import { get } from 'idb-keyval'; // <--- Importamos get
import { getDesignTokens } from "./theme/theme";

// --- IMPORTS DE PANTALLAS ---
// --- IMPORTS DE PANTALLAS (Code Splitting) ---
import LoginScreen from "./components/auth/LoginScreen";
import HomeScreen from "./components/home/HomeScreen";
import LandingPage from "./components/home/LandingPage";

// Lazy Loading para pantallas pesadas
const TripDetailScreen = React.lazy(() => import("./components/trip/TripDetailScreen"));
const SettingsScreen = React.lazy(() => import("./SettingsScreen"));
const AdminDashboard = React.lazy(() => import("./AdminDashboard"));
const PassportScreen = React.lazy(() => import("./components/gamification/PassportScreen"));
const NotFoundScreen = React.lazy(() => import("./components/common/NotFoundScreen")); // <--- 404 Page

// Lazy AdminRoute
const AdminRoute = React.lazy(() => import("./components/auth/AdminRoute"));



import DebugConsole from "./components/common/DebugConsole"; // <--- DEBUG 
import AnalyticsTracker from "./components/common/AnalyticsTracker"; // <--- ANALYTICS 

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
    const initAuth = async () => {
      try {
        console.log("🚀 Iniciando App: Auth Check...");

        // 1. Cargar datos offline primero
        console.log("💾 1. Cargando disco...");
        const { profile } = await loadInitialDataFromDisk();
        console.log("✅ 1. Disco OK", profile ? "(Con perfil)" : "(Sin perfil)");

        let offlineUser = null;

        // 1.1 OPTIMISTIC LOAD: Si tenemos perfil en disco, asumimos logged-in YA.
        if (profile && profile.id) {
          console.log("⚡ Offline/Pre-load: Activando usuario caché inmediatamente");
          offlineUser = {
            id: profile.id,
            email: profile.email,
            aud: 'authenticated',
            role: 'authenticated',
            user_metadata: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              email: profile.email
            }
          };
          setUser(offlineUser);

          // Si NO estamos en medio de un redirect de Google, mostramos la app ya
          if (!window.location.hash.includes('access_token')) {
            setLoading(false);
          }
        }

        // 2. Comprobar sesión de Supabase (Local)
        console.log("🔐 2. Verificando sesión...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("✅ 2. Sesión:", session ? "Activa" : "No existe");

        if (session?.user) {
          // Si hay sesión real, actualizamos (esto sobrescribe el usuario offline si lo hubiera)
          console.log("🔄 Actualizando con sesión real de Supabase");
          setUser(session.user);
        } else if (!offlineUser) {
          // Si NO hay sesión Y NO había usuario offline, entonces sí somos anónimos
          setUser(null);
        }
        // Si no hay sesión pero SI había offlineUser, nos quedamos con el offlineUser (Fallback implícito)

        // --- CORRECCIÓN CRÍTICA PARA LOGIN CON GOOGLE ---
        if (!session && window.location.hash.includes('access_token')) {
          console.log("⏳ Detectado retorno de Google. Esperando procesar token...");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("💥 Error crítico en initAuth:", error);
        setLoading(false); // En caso de error, liberamos la app para que no se quede bloqueada
      }
    };

    initAuth();

    // SAFETY NET: Si por lo que sea initAuth se cuelga (ej: IndexedDB corrupta),
    // forzamos la carga a los 4 segundos para que el usuario no vea blanco eterno.
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("🚨 Safety Timeout: Forzando inicio de App.");
          return false;
        }
        return prev;
      });
    }, 4000);

    // Escuchamos cambios (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("🔔 Auth Change Event:", _event);

      if (session?.user) {
        // A. Tenemos sesión válida (Online o Token válido)
        setUser(session.user);
      } else {
        // B. No hay sesión (Posiblemente Offline, expirado, o Logout explícito)
        // Intentamos recuperar el perfil offline ANTES de echar al usuario
        console.log("⚠️ Sesión nula. Verificando persistencia offline...");

        try {
          const offlineProfile = await get('offline_profile');
          if (offlineProfile && offlineProfile.id) {
            console.log("✅ Perfil offline encontrado. Manteniendo sesión (Modo Offline).");
            // Reconstruimos usuario temporal para no romper la UI
            setUser({
              id: offlineProfile.id,
              email: offlineProfile.email,
              aud: 'authenticated',
              role: 'authenticated',
              user_metadata: {
                full_name: offlineProfile.full_name,
                avatar_url: offlineProfile.avatar_url,
                email: offlineProfile.email
              }
            });
          } else {
            // C. De verdad no hay nada (Logout real o primera vez)
            console.log("⛔ No hay perfil offline. Redirigiendo a Landing.");
            setUser(null);
          }
        } catch (e) {
          console.error("Error comprobando offline profile en auth change", e);
          setUser(null);
        }
      }
      setLoading(false); // Aquí SIEMPRE quitamos el loading
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    }
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
        <DebugConsole />
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <DebugConsole />
      <CssBaseline />
      <BrowserRouter>
        <AnalyticsTracker />
        <React.Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
            <CircularProgress />
          </Box>
        }>
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

            {/* RUTA 4: CUALQUIER OTRA -> PÁGINA 404 */}
            <Route path="*" element={<NotFoundScreen />} />

          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;