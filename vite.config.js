import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: false, // Localhost-only by default — use `npm run dev:network` for LAN access
  }
})
