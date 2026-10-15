// Se carga antes de cada archivo de pruebas de Cypress.
// Testing Library agrega cy.findByRole, cy.findByLabelText, cy.findByText...: las pruebas buscan
// los elementos como los ve una persona (rol, etiqueta o texto), nunca por clases CSS ni
// posiciones, para que sigan sirviendo después del rediseño (fases 5 a 7 del plan).
import '@testing-library/cypress/add-commands';
import './commands';

// Modo presentación (npm run e2e:presentacion): después de cada acción se espera "pausa" ms,
// para que el público pueda seguir lo que pasa. Las demás corridas no reciben la pausa y no
// cambian nada aquí, así que no se hacen más lentas.
const pausa = Number(Cypress.expose('pausa')) || 0;
if (pausa > 0) {
  ['visit', 'reload', 'click', 'type', 'clear', 'select', 'check', 'uncheck'].forEach((accion) => {
    Cypress.Commands.overwrite(accion, (original, ...argumentos) => {
      const resultado = original(...argumentos);
      return new Cypress.Promise((terminar) => setTimeout(() => terminar(resultado), pausa));
    });
  });
}
