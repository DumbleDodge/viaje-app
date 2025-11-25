// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// IMPORTANTE: Fíjate que aquí cambiamos las importaciones para la base de datos
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// --- TU CONFIGURACIÓN (NO LA BORRES, PEGA LA TUYA AQUÍ) ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfTS1-kHl0NY19IESHUkmdZWzqO3JLzBo",
  authDomain: "viajes-app-5b8e6.firebaseapp.com",
  projectId: "viajes-app-5b8e6",
  storageBucket: "viajes-app-5b8e6.firebasestorage.app",
  messagingSenderId: "860577637766",
  appId: "1:860577637766:web:a8dade8d7dfe31513b3807"
};

// --------------------------------------------------

// 1. Inicializar Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 1. El permiso que ya tenías
googleProvider.addScope('https://www.googleapis.com/auth/drive.file'); 

// 2. ESTA ES LA LÍNEA MÁGICA: Obliga a Google a preguntarte siempre
//googleProvider.setCustomParameters({ prompt: 'select_account consent' }); // <--- NUEVO

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});