import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serveert de app op https://bentj-01.github.io/berlijnbierweekend/
export default defineConfig({
  base: '/berlijnbierweekend/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Berlijn',
        short_name: 'Berlijn',
        description: 'Pinten, pubgolf en planning voor ons weekend in Berlijn',
        lang: 'nl-BE',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b0b0c',
        background_color: '#0b0b0c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Enkel de app shell cachen; data komt altijd live van Supabase.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
