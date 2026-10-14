// Se carga antes de cada archivo de pruebas de Cypress.
// Testing Library agrega cy.findByRole, cy.findByLabelText, cy.findByText...: las pruebas buscan
// los elementos como los ve una persona (rol, etiqueta o texto), nunca por clases CSS ni
// posiciones, para que sigan sirviendo después del rediseño (fases 5 a 7 del plan).
import '@testing-library/cypress/add-commands';
import './commands';
