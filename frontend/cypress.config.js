// Pruebas de punta a punta con Cypress (fase de Cypress). Se ejecutan desde la raíz con
// "npm run e2e" (sin interfaz), "npm run e2e:abrir" (con la interfaz de Cypress) o
// "npm run e2e:video" (graba un video por archivo): el script prepara una base de datos
// aparte y arranca backend (8001) y frontend (5174).
import { defineConfig } from 'cypress';

export default defineConfig({
  // Sin videos por defecto: ocupan espacio. Las capturas de los fallos sí quedan.
  // Va aquí y no dentro de "e2e": lo que está en "e2e" pesa más que la línea de comandos,
  // y "npm run e2e:video" lo activa con --config video=true.
  video: false,
  // Cypress.env() deja que el código del navegador lea esos valores, y Cypress avisa que es
  // inseguro y que lo quitará. Las pruebas no lo usan: la pausa de la presentación llega con
  // --expose y se lee con Cypress.expose().
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:5174',
    // La interfaz de Cypress y los videos muestran cada prueba en este tamaño de ventana.
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
