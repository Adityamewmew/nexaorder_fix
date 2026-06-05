import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Mengizinkan semua host termasuk ngrok
    host: true, // Mengekspos server ke jaringan lokal (IP Address)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
