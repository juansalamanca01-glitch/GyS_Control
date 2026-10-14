// Flujo completo de un informe por la pantalla, como lo hace un patólogo:
// paciente nuevo → borrador → requisitos para finalizar → finalizar → PDF → adenda.
// Las pruebas van en orden y comparten el informe: cada una sigue donde quedó la anterior.
import { PATOLOGIA, unico } from '../support/commands';

describe('Informe completo (patologo1)', () => {
  const documento = `PRUEBA${unico()}`;
  let urlInforme;
  let numeroPeticion;

  beforeEach(() => {
    cy.entrarComo('patologo1');
  });

  it('crea un paciente ficticio y guarda un informe borrador', () => {
    cy.visit('/informes/nuevo');
    cy.contains('h1', 'Nuevo Informe');

    // Paciente nuevo, desde el mismo informe.
    cy.contains('button', 'Nuevo paciente').click();
    cy.get('.modal-card').within(() => {
      cy.get('#paciente-tipo-documento').select('CC');
      cy.get('#paciente-numero-documento').type(documento);
      cy.get('#paciente-nombres').type('Paciente Ficticio');
      cy.get('#paciente-apellidos').type('Flujo Completo');
      cy.get('#paciente-fecha-nacimiento').type('1975-03-20');
      cy.get('#paciente-sexo').select('femenino');
      cy.contains('button', 'Guardar').click();
    });
    cy.get('.datos-paciente').should('contain', 'Paciente Ficticio Flujo Completo').and('contain', documento);

    // Estudio y campos obligatorios de la plantilla.
    cy.get('#patologia').select(PATOLOGIA);
    cy.get('#localizacion').type('Antebrazo derecho');
    cy.get('#tipo_muestra').select(1);
    cy.get('#dimensiones').type('1.2 x 0.8 x 0.4 cm');

    cy.contains('button', 'Guardar Informe').click();

    // Al guardarlo, el backend le asigna el número de petición (D-7) y queda en borrador.
    cy.location('pathname').should('match', /^\/informes\/\d+$/);
    cy.contains('h1', /Informe P-\d{4}-\d{5}/)
      .invoke('text')
      .then((texto) => {
        numeroPeticion = texto.match(/P-\d{4}-\d{5}/)[0];
      });
    cy.get('.badge').should('contain', 'Borrador');
    cy.location('pathname').then((ruta) => {
      urlInforme = ruta;
    });
  });

  it('no deja finalizar si faltan requisitos y dice cuáles (D-8)', () => {
    cy.visit(urlInforme);
    cy.contains('button', 'Finalizar Informe').click();
    cy.contains('button', 'Si, Confirmar').click();

    cy.get('.alert-lista')
      .should('contain', 'No se puede finalizar el informe')
      .find('li')
      .should('have.length.at.least', 2);
    cy.get('.badge').should('contain', 'Borrador');
  });

  it('completa la microscópica y el diagnóstico y lo finaliza', () => {
    cy.visit(urlInforme);
    cy.get('textarea[aria-label="Descripción microscópica"]').type(
      'Epidermis con proliferación de células basaloides.',
    );
    cy.contains('button', '+ Agregar diagnóstico').click();
    cy.contains('label', 'Diagnóstico 1')
      .invoke('attr', 'for')
      .then((id) => cy.get(`#${id}`).type('Carcinoma basocelular'));
    cy.get('input[aria-label="CIE-10 del diagnóstico 1"]').type('c443');

    // Finalizar guarda primero los cambios pendientes (D-13).
    cy.contains('button', 'Finalizar Informe').click();
    cy.contains('button', 'Si, Confirmar').click();

    cy.contains('.alert-success', 'Informe finalizado correctamente.');
    cy.get('.badge').should('contain', 'Finalizado');
    // El backend normalizó el código CIE-10.
    cy.get('input[aria-label="CIE-10 del diagnóstico 1"]').should('have.value', 'C44.3');
    // Ya no se puede editar ni volver a finalizar.
    cy.contains('button', 'Actualizar Informe').should('not.exist');
    cy.contains('button', 'Finalizar Informe').should('not.exist');
    cy.contains('.card', 'Firma').should('contain', 'RM-PRUEBA-0001');
  });

  it('descarga el PDF del informe finalizado', () => {
    cy.visit(urlInforme);
    cy.contains('button', 'Exportar PDF').click();
    cy.then(() => {
      const archivo = `${Cypress.config('downloadsFolder')}/informe_${numeroPeticion}.pdf`;
      // Un PDF de verdad empieza con "%PDF".
      cy.readFile(archivo, 'binary', { timeout: 15000 }).should((contenido) => {
        expect(contenido.slice(0, 4)).to.eq('%PDF');
      });
    });
  });

  it('agrega una adenda al informe finalizado (D-9)', () => {
    cy.visit(urlInforme);
    cy.contains('button', '+ Agregar adenda').click();
    cy.get('#adendaMotivo').type('Resultado de inmunohistoquímica');
    cy.get('#adendaTexto').type('BerEP4 positivo en las células tumorales.');
    cy.contains('button', 'Guardar adenda').click();
    // Pide confirmación: una adenda no se puede modificar ni borrar.
    cy.contains('button', 'Sí, guardar adenda').click();

    cy.contains('.adenda h3', 'Adenda N.º 1');
    cy.get('.adenda').should('contain', 'Resultado de inmunohistoquímica');
    // Sigue ahí al recargar: quedó guardada en el backend.
    cy.reload();
    cy.contains('.adenda h3', 'Adenda N.º 1');
  });
});
