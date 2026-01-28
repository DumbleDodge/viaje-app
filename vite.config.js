import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'script-defer', // Carga el SW sin bloquear el renderizado
      registerType: 'autoUpdate',
      // ESTO ES LO NUEVO: Forzamos que funcione en modo dev
      devOptions: {
        enabled: true
      },
      // ------------------------------------------------
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gotravio - Viajes Inteligentes',
        short_name: 'Gotravio',
        description: 'Organizador de viajes inteligente',
        theme_color: '#6750A4',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any' // Icono estándar
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any' // Icono estándar grande
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Icono específico para recortar en Android
          }
        ]
      }
    })
  ],
})