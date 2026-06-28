import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Riyada University System',
        short_name: 'Riyada',
        description: 'The Ultimate Academic Management Platform',
        theme_color: '#0D0E15',
        background_color: '#0D0E15',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/riyada-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/riyada-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/riyada-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
