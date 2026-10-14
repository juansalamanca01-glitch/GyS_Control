// Aviso al salir de un informe con cambios sin guardar (decisión D-13):
// "Seguir editando", "Salir sin guardar" y "Guardar y salir".

const AVISO = 'Tienes cambios sin guardar';

function irA(enlace) {
  cy.get('.navbar').contains(enlace).click();
}

describe('D-13: aviso de cambios sin guardar', () => {
  beforeEach(() => {
    cy.entrarComo('patologo1');
  });

  it('sin cambios, se sale del informe sin aviso', () => {
    cy.visit('/informes/nuevo');
    cy.contains('h1', 'Nuevo Informe');
    irA('Buscar');
    cy.location('pathname').should('eq', '/buscar');
  });

  it('"Seguir editando" se queda en el informe y conserva lo escrito', () => {
    cy.visit('/informes/nuevo');
    cy.get('#tipoMuestra').type('Biopsia escisional');
    cy.contains('Cambios sin guardar');

    irA('Inicio');
    cy.get('[role="dialog"]').should('contain', AVISO);
    cy.contains('button', 'Seguir editando').click();

    cy.get('[role="dialog"]').should('not.exist');
    cy.location('pathname').should('eq', '/informes/nuevo');
    cy.get('#tipoMuestra').should('have.value', 'Biopsia escisional');
  });

  it('"Salir sin guardar" sale y descarta lo escrito', () => {
    cy.visit('/informes/nuevo');
    cy.get('#tipoMuestra').type('Biopsia escisional');

    irA('Inicio');
    cy.contains('button', 'Salir sin guardar').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('h1', 'Bienvenido');
  });

  it('"Guardar y salir" guarda el borrador y sale', () => {
    cy.crearInforme().then((informe) => {
      cy.visit(`/informes/${informe.id}`);
      cy.contains('h1', informe.numero_peticion);
      cy.get('textarea[aria-label="Descripción microscópica"]').type('Texto que no se debe perder.');

      // Se sale enseguida, antes del autoguardado de los 5 s.
      irA('Buscar');
      cy.contains('button', 'Guardar y salir').click();

      cy.location('pathname').should('eq', '/buscar');
      cy.api('GET', `/informes/${informe.id}/`)
        .its('descripcion_microscopica')
        .should('eq', 'Texto que no se debe perder.');
    });
  });

  it('"Salir" (cerrar sesión) también avisa y no cierra la sesión si se sigue editando', () => {
    cy.visit('/informes/nuevo');
    cy.get('#tipoMuestra').type('Biopsia escisional');

    cy.get('.navbar').contains('button', 'Salir').click();
    cy.get('[role="dialog"]').should('contain', AVISO);
    cy.contains('button', 'Seguir editando').click();

    cy.location('pathname').should('eq', '/informes/nuevo');
    cy.window().its('localStorage.access_token').should('be.a', 'string');
  });
});
