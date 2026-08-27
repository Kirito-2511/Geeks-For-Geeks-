import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Ensures source maps are not generated for production
  },
  server: {
    host: false, // Localhost-only by default — use `npm run dev:network` for LAN access
  }
})
