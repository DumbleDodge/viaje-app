import { createClient } from '@supabase/supabase-js';

// 1. Leemos las claves del archivo .env (Las pondremos en el Paso 4)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Inicializamos el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- FUNCIONES DE AYUDA PARA AUTH ---

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Esto es vital: redirige al usuario de vuelta a tu app después de loguearse
      redirectTo: window.location.origin 
    }
  });
  return { data, error };
};

// Función para cerrar sesión
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};