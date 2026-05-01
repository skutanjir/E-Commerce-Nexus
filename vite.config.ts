import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://gwk.gopayapi.com https://gwk.gopayapi.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io",
        "font-src 'self' data: https://fonts.gstatic.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io",
        "img-src 'self' data: blob: https: http://localhost:5000",
        "connect-src 'self' http://localhost:5000 ws://localhost:5000 ws://localhost:5173 https://*.midtrans.com https://gwk.gopayapi.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io",
        "frame-src 'self' https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com https://gwk.gopayapi.com",
        "frame-ancestors 'self'",
        "worker-src 'self' blob:",
      ].join('; '),
    },
  },
})
