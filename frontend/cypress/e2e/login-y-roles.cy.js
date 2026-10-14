// Inicio de sesión, cierre de sesión y lo que ve cada rol.
// Es el único archivo que entra por la pantalla de login; los demás usan cy.entrarComo().
import { USUARIOS } from '../support/commands';

function entrarPorPantalla(usuario, contrasena) {
  cy.visit('/login');
  cy.get('#username').type(usuario);
  cy.get('#password').type(contrasena, { log: false });
  cy.contains('button', 'Iniciar Sesión').click();
}

describe('Inicio de sesión', () => {
  it('entra con un usuario y contraseña correctos', () => {
    entrarPorPantalla('patologo1', USUARIOS.patologo1);
    cy.location('pathname').should('eq', '/');
    cy.contains('h1', 'Bienvenido');
    cy.contains('Panel de control — Patólogo');
  });

  it('con una contraseña incorrecta muestra un error y no entra', () => {
    entrarPorPantalla('patologo1', 'contrasena-incorrecta');
    cy.get('.alert-error').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('sin sesión, una página protegida lleva al login', () => {
    cy.visit('/pacientes');
    cy.location('pathname').should('eq', '/login');
  });

  it('"Salir" cierra la sesión y lleva al login', () => {
    entrarPorPantalla('patologo1', USUARIOS.patologo1);
    cy.contains('h1', 'Bienvenido');
    cy.contains('button', 'Salir').click();
    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage.access_token').should('be.undefined');
    // La sesión cerrada ya no abre las páginas protegidas.
    cy.visit('/');
    cy.location('pathname').should('eq', '/login');
  });
});

describe('Lo que ve cada rol', () => {
  it('el auditor solo consulta: no ve "Nuevo Informe" ni "+ Paciente"', () => {
    cy.entrarComo('auditor1');
    cy.visit('/');
    cy.contains('Panel de control — Auditor');
    cy.get('.navbar').contains('Nuevo Informe').should('not.exist');
    cy.contains('a', 'Nuevo Informe').should('not.exist');
    cy.visit('/pacientes');
    cy.contains('h1', 'Pacientes');
    cy.contains('button', '+ Paciente').should('not.exist');
  });

  it('el patólogo sí ve "Nuevo Informe" y "+ Paciente"', () => {
    cy.entrarComo('patologo1');
    cy.visit('/');
    cy.get('.navbar').contains('Nuevo Informe');
    cy.visit('/pacientes');
    cy.contains('button', '+ Paciente');
  });
});
