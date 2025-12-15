import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const BE_URL = process.env.BE_URL ?? "https://fe-hometask-api.qa.vault.tryvault.com"

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: BE_URL,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
