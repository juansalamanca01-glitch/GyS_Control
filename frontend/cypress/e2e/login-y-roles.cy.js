// Flujo 1: inicio de sesión con cada rol, estructura de GyS Control y cierre de sesión.
// Es el único archivo que entra por la pantalla de login; las demás pruebas usan
// cy.entrarComo(), para no pasar del límite de 10 intentos de login por minuto (O-16).
import { USUARIOS } from '../support/commands';

function entrarPorPantalla(usuario, contrasena) {
  cy.visit('/login');
  cy.findByLabelText('Usuario').type(usuario);
  cy.findByLabelText('Contraseña').type(contrasena, { log: false });
  cy.findByRole('button', { name: 'Iniciar Sesión' }).click();
}

const ROLES = [
  { usuario: 'admin', rol: 'Administrador' },
  { usuario: 'tecnico1', rol: 'Técnico' },
  { usuario: 'auditor1', rol: 'Auditor' },
];

const MODULOS = ['Inicio', 'Clientes', 'Servicios', 'Agenda', 'Inventario', 'Informes', 'Métricas'];

describe('Flujo 1: inicio de sesión con cada rol', () => {
  ROLES.forEach(({ usuario, rol }) => {
    it(`${rol}: entra, ve el Inicio y los módulos, y cierra la sesión`, () => {
      entrarPorPantalla(usuario, USUARIOS[usuario]);
      cy.location('pathname').should('eq', '/');
      cy.findByRole('heading', { level: 1, name: /^(Buenos días|Buenas tardes|Buenas noches), / });

      // La barra superior muestra el rol; la lateral, los módulos de GyS Control.
      cy.findByRole('banner').findByText(rol);
      cy.findByRole('navigation', { name: 'Módulos' }).within(() => {
        MODULOS.forEach((modulo) => cy.findByRole('link', { name: modulo }));
      });

      // "Salir" cierra la sesión: vuelve al login y las páginas protegidas ya no abren.
      cy.findByRole('banner').findByRole('button', { name: 'Salir' }).click();
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage.access_token').should('be.undefined');
      cy.visit('/');
      cy.location('pathname').should('eq', '/login');
    });
  });

  it('con una contraseña incorrecta muestra un error y no entra', () => {
    entrarPorPantalla('tecnico1', 'contrasena-incorrecta');
    cy.findByRole('alert').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('sin sesión, una página protegida lleva al login', () => {
    cy.visit('/clientes');
    cy.location('pathname').should('eq', '/login');
  });
});
