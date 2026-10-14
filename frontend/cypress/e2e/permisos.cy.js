// Flujo 6: permisos sobre los informes. La pantalla oculta lo que no se puede hacer y el
// backend lo rechaza aunque se intente directamente por la API.
// D-2: un patólogo no modifica los informes de otro. D-3: un informe finalizado no se modifica.

/**
 * Intenta modificar el informe por la API y devuelve la respuesta (sin fallar por el código).
 * El token se lee dentro de cy.then(): los comandos de Cypress van en cola, y fuera de ella
 * se leería antes de que cy.entrarComo() restaure la sesión.
 */
function intentarEditar(informe) {
  return cy.then(() =>
    cy.request({
      method: 'PATCH',
      url: `/api/informes/${informe.id}/`,
      body: { comentarios: 'Intento de modificación' },
      headers: { Authorization: `Bearer ${window.localStorage.getItem('access_token')}` },
      failOnStatusCode: false,
    }),
  );
}

describe('Flujo 6a (D-2): un patólogo no modifica el informe de otro', () => {
  let informe;

  before(() => {
    cy.entrarComo('patologo1');
    cy.crearInforme().then((creado) => {
      informe = creado;
    });
  });

  it('patologo2 ve el borrador de patologo1 en solo lectura', () => {
    cy.entrarComo('patologo2');
    cy.visit(`/informes/${informe.id}`);
    cy.findByRole('heading', { name: `Informe ${informe.numero_peticion}` });

    cy.findByLabelText('Descripción microscópica').should('be.disabled');
    cy.findByLabelText('Tipo de Muestra').should('be.disabled');
    cy.findByRole('button', { name: 'Actualizar Informe' }).should('not.exist');
    cy.findByRole('button', { name: 'Finalizar Informe' }).should('not.exist');
    // La vista previa del PDF de un borrador es solo para su autor o un admin (D-12).
    cy.findByRole('button', { name: 'Vista previa (borrador)' }).should('not.exist');
  });

  it('el backend rechaza la modificación de patologo2 (403)', () => {
    cy.entrarComo('patologo2');
    intentarEditar(informe).its('status').should('eq', 403);
  });

  it('el autor sí puede editarlo', () => {
    cy.entrarComo('patologo1');
    cy.visit(`/informes/${informe.id}`);
    cy.findByLabelText('Descripción microscópica').should('be.enabled');
    cy.findByRole('button', { name: 'Actualizar Informe' });
    intentarEditar(informe).its('status').should('eq', 200);
  });
});

describe('Flujo 6b (D-3): un informe finalizado no se modifica', () => {
  let informe;

  before(() => {
    cy.entrarComo('patologo1');
    cy.crearInforme({ finalizar: true }).then((creado) => {
      informe = creado;
    });
  });

  it('ni su autor puede editarlo en la pantalla', () => {
    cy.entrarComo('patologo1');
    cy.visit(`/informes/${informe.id}`);
    cy.findByText('Finalizado');

    cy.findByLabelText('Descripción microscópica').should('be.disabled');
    cy.findByRole('button', { name: 'Actualizar Informe' }).should('not.exist');
    cy.findByRole('button', { name: 'Finalizar Informe' }).should('not.exist');
    // Lo que sí queda: el PDF y las adendas, que es como se corrige (D-9).
    cy.findByRole('button', { name: 'Exportar PDF' });
    cy.findByRole('button', { name: '+ Agregar adenda' });
  });

  it('el backend rechaza la modificación aunque sea del autor (400)', () => {
    cy.entrarComo('patologo1');
    intentarEditar(informe).its('status').should('eq', 400);
  });

  it('ni un admin puede modificarlo (400)', () => {
    cy.entrarComo('admin');
    intentarEditar(informe).its('status').should('eq', 400);
  });
});
