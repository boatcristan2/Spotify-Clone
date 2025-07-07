import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    strictPort: true,
    cors: true,
    // Allow ngrok domain
    allowedHosts: [
      'swu.ngrok.dev',
      'localhost',
      '127.0.0.1',
      // Allow any ngrok domain
      /\.ngrok\.dev$/,
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/
    ],
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  appType: 'spa',
  publicDir: 'public'
})