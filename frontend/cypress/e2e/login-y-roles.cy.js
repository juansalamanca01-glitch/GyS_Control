// Flujo 1: inicio de sesión con cada rol y cierre de sesión.
// Es el único archivo que entra por la pantalla de login; los demás usan cy.entrarComo(),
// para no pasar del límite de 10 intentos de login por minuto (O-16).
import { USUARIOS } from '../support/commands';

function entrarPorPantalla(usuario, contrasena) {
  cy.visit('/login');
  cy.findByLabelText('Usuario').type(usuario);
  cy.findByLabelText('Contraseña').type(contrasena, { log: false });
  cy.findByRole('button', { name: 'Iniciar Sesión' }).click();
}

const ROLES = [
  { usuario: 'admin', rol: 'Administrador', escribe: true },
  { usuario: 'patologo1', rol: 'Patólogo', escribe: true },
  { usuario: 'auditor1', rol: 'Auditor', escribe: false },
];

describe('Flujo 1: inicio de sesión con cada rol', () => {
  ROLES.forEach(({ usuario, rol, escribe }) => {
    it(`${rol}: entra, ve el menú de su rol y cierra la sesión`, () => {
      entrarPorPantalla(usuario, USUARIOS[usuario]);
      cy.location('pathname').should('eq', '/');
      cy.findByRole('heading', { name: /Bienvenido/ });
      cy.findByText(`Panel de control — ${rol}`);

      // Solo el admin y el patólogo pueden crear informes.
      cy.findByRole('navigation').within(() => {
        cy.findByRole('link', { name: 'Buscar' });
        cy.findByRole('link', { name: 'Nuevo Informe' }).should(escribe ? 'exist' : 'not.exist');
      });

      // "Salir" cierra la sesión: vuelve al login y las páginas protegidas ya no abren.
      cy.findByRole('navigation').findByRole('button', { name: 'Salir' }).click();
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage.access_token').should('be.undefined');
      cy.visit('/');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('con una contraseña incorrecta muestra un error y no entra', () => {
    entrarPorPantalla('patologo1', 'contrasena-incorrecta');
    cy.findByRole('alert').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('sin sesión, una página protegida lleva al login', () => {
    cy.visit('/pacientes');
    cy.location('pathname').should('eq', '/login');
  });
});
