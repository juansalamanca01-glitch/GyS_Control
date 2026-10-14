// Pruebas de punta a punta con Cypress (fase de Cypress). Se ejecutan desde la raíz con
// "npm run e2e" (sin interfaz) o "npm run e2e:abrir" (con la interfaz de Cypress):
// el script prepara una base de datos aparte y arranca backend (8001) y frontend (5174).
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    // La interfaz de Cypress muestra cada prueba en este tamaño de ventana.
    viewportWidth: 1280,
    viewportHeight: 800,
    // Sin videos: ocupan espacio y no se usan. Las capturas de los fallos sí quedan.
    video: false,
  },
});
