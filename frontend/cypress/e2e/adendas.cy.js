// Flujo 3: un informe finalizado se corrige con una adenda (decisión D-9).
// El informe se prepara por la API; la adenda se agrega por la pantalla.

describe('Flujo 3: agregar una adenda (patologo1)', () => {
  beforeEach(() => {
    cy.entrarComo('patologo1');
  });

  it('un borrador todavía no admite adendas', () => {
    cy.crearInforme().then((informe) => {
      cy.visit(`/informes/${informe.id}`);
      cy.findByRole('heading', { name: `Informe ${informe.numero_peticion}` });
      cy.findByRole('button', { name: '+ Agregar adenda' }).should('not.exist');
    });
  });

  it('agrega una adenda con confirmación y queda guardada con su firma', () => {
    cy.crearInforme({ finalizar: true }).then((informe) => {
      cy.visit(`/informes/${informe.id}`);
      cy.findByText('Finalizado');

      cy.findByRole('button', { name: '+ Agregar adenda' }).click();
      cy.findByLabelText(/^Motivo/).type('Resultado de inmunohistoquímica');
      cy.findByLabelText(/^Texto/).type('BerEP4 positivo en las células tumorales.');
      cy.findByRole('button', { name: 'Guardar adenda' }).click();
      // Pide confirmación: una adenda no se puede modificar ni borrar.
      cy.findByText(/Las adendas no se pueden modificar ni borrar/);
      cy.findByRole('button', { name: 'Sí, guardar adenda' }).click();

      cy.findByRole('heading', { name: /^Adenda N\.º 1/ });
      cy.findByText('Resultado de inmunohistoquímica');

      // Sigue ahí al recargar: quedó guardada en el backend, con la firma de quien la hizo.
      cy.reload();
      cy.findByRole('heading', { name: /^Adenda N\.º 1/ });
      cy.api('GET', `/informes/${informe.id}/adendas/`).then((adendas) => {
        expect(adendas).to.have.length(1);
        expect(adendas[0].firma.registro_medico).to.eq('RM-PRUEBA-0001');
      });
    });
  });
});
