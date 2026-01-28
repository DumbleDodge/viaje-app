import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Fuentes locales (Poppins)
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

// main.jsx
import { TripProvider } from './TripContext'; // Importa tu contexto

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TripProvider> {/* El proveedor debe envolver a App */}
      <App />
    </TripProvider>
  </React.StrictMode>
);