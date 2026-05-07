import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: false,
      babel: {
        babelrc: false,
        configFile: false,
      }
    }),
    tailwindcss()
  ],
  server:{port:5173},
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
