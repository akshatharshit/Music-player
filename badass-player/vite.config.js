import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, // Increases the limit for large libraries
  },
  server:{
    allowedHosts :["bootlessly-heterolecithal-miya.ngrok-free.dev"],
  },
})