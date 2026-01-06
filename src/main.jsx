import React from 'react' // <--- ESTA ES LA QUE TE FALTA AHORA
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ReactDOM from 'react-dom/client' // <--- ESTA ES LA LÍNEA QUE TE FALTA
import App from './App.jsx'

// main.jsx
import { TripProvider } from './TripContext'; // Importa tu contexto

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TripProvider> {/* El proveedor debe envolver a App */}
      <App />
    </TripProvider>
  </React.StrictMode>
);