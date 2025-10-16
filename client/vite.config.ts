import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 3000,
    allowedHosts: true,
    proxy: {
      // Proxy /api requests to the backend server
      '/api': {
          target: 'http://0.0.0.0:7860', // Replace with your backend URL
          changeOrigin: true,
      },
  },
  },
})
