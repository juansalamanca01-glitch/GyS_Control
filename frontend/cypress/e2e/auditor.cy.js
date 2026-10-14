// Flujo 4: el auditor solo consulta; no puede crear informes ni pacientes.
// La pantalla oculta las acciones y el backend las rechaza aunque se intenten por la API.

describe('Flujo 4: el auditor no puede crear informes', () => {
  beforeEach(() => {
    cy.entrarComo('auditor1');
  });

  it('no ve "Nuevo Informe" ni "+ Paciente"', () => {
    cy.visit('/');
    cy.findByText('Panel de control — Auditor');
    cy.findByRole('link', { name: 'Nuevo Informe' }).should('not.exist');
    cy.visit('/pacientes');
    cy.findByRole('heading', { name: 'Pacientes' });
    cy.findByRole('button', { name: '+ Paciente' }).should('not.exist');
  });

  it('si abre /informes/nuevo directamente, no puede llenar ni guardar nada', () => {
    cy.visit('/informes/nuevo');
    cy.findByLabelText(/^Tipo de Patología/).should('be.disabled');
    cy.findByLabelText('Descripción microscópica').should('be.disabled');
    cy.findByRole('button', { name: 'Guardar Informe' }).should('not.exist');
  });

  it('el backend rechaza crear un informe por la API (403)', () => {
    // El token se lee dentro de cy.then(), después de que cy.entrarComo() restaura la sesión.
    cy.then(() =>
      cy.request({
        method: 'POST',
        url: '/api/informes/',
        body: { tipo_estudio: 'histologia' },
        headers: { Authorization: `Bearer ${window.localStorage.getItem('access_token')}` },
        failOnStatusCode: false,
      }),
    )
      .its('status')
      .should('eq', 403);
  });
});
