// Flujo 5: aviso al salir de un informe con cambios sin guardar (decisión D-13):
// "Seguir editando", "Salir sin guardar" y "Guardar y salir".

const AVISO = 'Tienes cambios sin guardar';

function irA(enlace) {
  cy.findByRole('navigation').findByRole('link', { name: enlace }).click();
}

describe('Flujo 5 (D-13): aviso de cambios sin guardar', () => {
  beforeEach(() => {
    cy.entrarComo('patologo1');
  });

  it('sin cambios, se sale del informe sin aviso', () => {
    cy.visit('/informes/nuevo');
    cy.findByRole('heading', { name: 'Nuevo Informe' });
    irA('Buscar');
    cy.location('pathname').should('eq', '/buscar');
  });

  it('"Seguir editando" se queda en el informe y conserva lo escrito', () => {
    cy.visit('/informes/nuevo');
    cy.findByLabelText('Tipo de Muestra').type('Biopsia escisional');
    cy.findByText('Cambios sin guardar');

    irA('Inicio');
    cy.findByRole('dialog', { name: AVISO });
    cy.findByRole('button', { name: 'Seguir editando' }).click();

    cy.findByRole('dialog', { name: AVISO }).should('not.exist');
    cy.location('pathname').should('eq', '/informes/nuevo');
    cy.findByLabelText('Tipo de Muestra').should('have.value', 'Biopsia escisional');
  });

  it('"Salir sin guardar" sale y descarta lo escrito', () => {
    cy.visit('/informes/nuevo');
    cy.findByLabelText('Tipo de Muestra').type('Biopsia escisional');

    irA('Inicio');
    cy.findByRole('button', { name: 'Salir sin guardar' }).click();

    cy.location('pathname').should('eq', '/');
    cy.findByRole('heading', { name: /Bienvenido/ });
  });

  it('"Guardar y salir" guarda el borrador y sale', () => {
    cy.crearInforme().then((informe) => {
      cy.visit(`/informes/${informe.id}`);
      cy.findByRole('heading', { name: `Informe ${informe.numero_peticion}` });
      cy.findByLabelText('Descripción microscópica').type('Texto que no se debe perder.');

      // Se sale enseguida, antes del autoguardado de los 5 s.
      irA('Buscar');
      cy.findByRole('button', { name: 'Guardar y salir' }).click();

      cy.location('pathname').should('eq', '/buscar');
      cy.api('GET', `/informes/${informe.id}/`)
        .its('descripcion_microscopica')
        .should('eq', 'Texto que no se debe perder.');
    });
  });

  it('"Salir" (cerrar sesión) también avisa y no cierra la sesión si se sigue editando', () => {
    cy.visit('/informes/nuevo');
    cy.findByLabelText('Tipo de Muestra').type('Biopsia escisional');

    cy.findByRole('navigation').findByRole('button', { name: 'Salir' }).click();
    cy.findByRole('dialog', { name: AVISO });
    cy.findByRole('button', { name: 'Seguir editando' }).click();

    cy.location('pathname').should('eq', '/informes/nuevo');
    cy.window().its('localStorage.access_token').should('be.a', 'string');
  });
});
