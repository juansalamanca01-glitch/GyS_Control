import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // npm run e2e (Cypress) apunta a otro backend, que usa su propia base de datos.
        target: process.env.API_PROXY_DESTINO || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Pruebas del frontend con Vitest (npm test). jsdom simula el navegador.
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
