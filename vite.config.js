import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ESTO ES LO NUEVO: Forzamos que funcione en modo dev
      devOptions: {
        enabled: true
      },
      // ------------------------------------------------
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mis Viajes App',
        short_name: 'Viajes',
        description: 'Organizador de viajes inteligente',
        theme_color: '#6750A4',
        background_color: '#FEF7FF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/201/201623.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/201/201623.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})