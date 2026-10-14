// Flujo 2: crear y finalizar un informe con su PDF, por la pantalla, como lo hace un patólogo:
// paciente nuevo → borrador → requisitos para finalizar → finalizar → PDF.
// Las pruebas van en orden y comparten el informe: cada una sigue donde quedó la anterior.
import { PATOLOGIA, unico } from '../support/commands';

describe('Flujo 2: crear y finalizar un informe con su PDF (patologo1)', () => {
  const documento = `PRUEBA${unico()}`;
  let urlInforme;
  let numeroPeticion;

  beforeEach(() => {
    cy.entrarComo('patologo1');
  });

  it('crea un paciente ficticio y guarda un informe borrador', () => {
    cy.visit('/informes/nuevo');
    cy.findByRole('heading', { name: 'Nuevo Informe' });

    // Paciente nuevo, desde el mismo informe.
    cy.findByRole('button', { name: 'Nuevo paciente' }).click();
    cy.findByRole('dialog', { name: 'Nuevo paciente' }).within(() => {
      cy.findByLabelText('Tipo de documento').select('CC');
      cy.findByLabelText('Número de documento').type(documento);
      cy.findByLabelText('Nombres').type('Paciente Ficticio');
      cy.findByLabelText('Apellidos').type('Flujo Completo');
      cy.findByLabelText('Fecha de nacimiento').type('1975-03-20');
      cy.findByLabelText('Sexo').select('Femenino');
      cy.findByRole('button', { name: 'Guardar' }).click();
    });
    cy.findByText('Paciente Ficticio Flujo Completo');
    cy.findByText(`CC ${documento}`);

    // Estudio y campos obligatorios de la plantilla (las etiquetas terminan en "*").
    cy.findByLabelText(/^Tipo de Patología/).select(PATOLOGIA);
    cy.findByLabelText(/^Localización anatómica/).type('Antebrazo derecho');
    // "Tipo de muestra" (plantilla) no es "Tipo de Muestra" (campo fijo): la búsqueda
    // distingue mayúsculas. Se elige la primera opción real de la lista.
    cy.findByLabelText(/^Tipo de muestra/).then(($lista) => {
      cy.wrap($lista).select($lista.find('option').eq(1).val());
    });
    cy.findByLabelText(/^Dimensiones/).type('1.2 x 0.8 x 0.4 cm');

    cy.findByRole('button', { name: 'Guardar Informe' }).click();

    // Al guardarlo, el backend le asigna el número de petición (D-7) y queda en borrador.
    cy.location('pathname').should('match', /^\/informes\/\d+$/);
    cy.findByRole('heading', { name: /^Informe P-\d{4}-\d{5}$/ })
      .invoke('text')
      .then((texto) => {
        numeroPeticion = texto.match(/P-\d{4}-\d{5}/)[0];
      });
    cy.findByText('Borrador');
    cy.location('pathname').then((ruta) => {
      urlInforme = ruta;
    });
  });

  it('no deja finalizar si faltan requisitos y dice cuáles (D-8)', () => {
    cy.visit(urlInforme);
    cy.findByRole('button', { name: 'Finalizar Informe' }).click();
    cy.findByRole('button', { name: 'Si, Confirmar' }).click();

    cy.findByRole('alert')
      .should('contain', 'No se puede finalizar el informe')
      .within(() => cy.findAllByRole('listitem').should('have.length.at.least', 2));
    cy.findByText('Borrador');
  });

  it('completa la microscópica y el diagnóstico y lo finaliza con la firma del autor', () => {
    cy.visit(urlInforme);
    cy.findByLabelText('Descripción microscópica').type('Epidermis con proliferación de células basaloides.');
    cy.findByRole('button', { name: '+ Agregar diagnóstico' }).click();
    cy.findByLabelText('Diagnóstico 1').type('Carcinoma basocelular');
    cy.findByLabelText('CIE-10 del diagnóstico 1').type('c443');

    // Finalizar guarda primero los cambios pendientes (D-13).
    cy.findByRole('button', { name: 'Finalizar Informe' }).click();
    cy.findByRole('button', { name: 'Si, Confirmar' }).click();

    cy.findByText('Informe finalizado correctamente.');
    cy.findByText('Finalizado');
    // El backend normalizó el código CIE-10.
    cy.findByLabelText('CIE-10 del diagnóstico 1').should('have.value', 'C44.3');
    // Ya no se puede editar ni volver a finalizar.
    cy.findByRole('button', { name: 'Actualizar Informe' }).should('not.exist');
    cy.findByRole('button', { name: 'Finalizar Informe' }).should('not.exist');
    cy.findByRole('heading', { name: 'Firma' });
    cy.findByText('Registro médico N.º RM-PRUEBA-0001');
  });

  it('descarga el PDF del informe finalizado', () => {
    cy.visit(urlInforme);
    cy.findByRole('button', { name: 'Exportar PDF' }).click();
    cy.then(() => {
      const archivo = `${Cypress.config('downloadsFolder')}/informe_${numeroPeticion}.pdf`;
      // Un PDF de verdad empieza con "%PDF".
      cy.readFile(archivo, 'binary', { timeout: 15000 }).should((contenido) => {
        expect(contenido.slice(0, 4)).to.eq('%PDF');
      });
    });
  });
});
