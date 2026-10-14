// Comandos propios de Cypress que comparten las pruebas.

// Contraseñas de los usuarios de prueba que crea "python manage.py seed_data".
export const USUARIOS = {
  admin: 'admin1234',
  patologo1: 'patologo1234',
  patologo2: 'patologo2345',
  auditor1: 'auditor1234',
};

// Patología de seed_data que usan las pruebas: tiene tres campos obligatorios sencillos.
export const PATOLOGIA = 'Biopsia de Piel';

/**
 * Un número distinto en cada llamada, para que los documentos de los pacientes no se repitan.
 * Tiene 11 cifras: con el prefijo "PRUEBA" cabe en los 20 caracteres del documento.
 */
export function unico() {
  return `${String(Date.now()).slice(-9)}${Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Abre la sesión de un usuario de prueba por la API, sin pasar por la pantalla de login,
 * y guarda los tokens en localStorage como lo hace AuthContext.login().
 * cy.session reutiliza la sesión entre pruebas: así no se gasta el límite de
 * 10 intentos de login por minuto (O-16). Solo login-y-roles.cy.js entra por la pantalla.
 */
Cypress.Commands.add('entrarComo', (usuario) => {
  cy.session(
    usuario,
    () => {
      cy.request('POST', '/api/auth/login/', { username: usuario, password: USUARIOS[usuario] }).then(({ body }) => {
        window.localStorage.setItem('access_token', body.access);
        window.localStorage.setItem('refresh_token', body.refresh);
        window.localStorage.setItem('user_data', JSON.stringify(body.user));
      });
    },
    {
      cacheAcrossSpecs: true,
      // Si el token ya no sirve (por ejemplo, otra prueba cerró esa sesión), se vuelve a entrar.
      validate: () => {
        cy.request({
          url: '/api/auth/perfil/',
          headers: { Authorization: `Bearer ${window.localStorage.getItem('access_token')}` },
        });
      },
    },
  );
});

/**
 * Petición a la API con el token del usuario que entró con cy.entrarComo().
 * Sirve para preparar datos rápido; lo que se quiere probar se hace por la pantalla.
 */
Cypress.Commands.add('api', (method, url, body) =>
  cy
    .request({
      method,
      url: `/api${url}`,
      body,
      headers: { Authorization: `Bearer ${window.localStorage.getItem('access_token')}` },
    })
    .its('body'),
);

/**
 * Crea por la API un paciente ficticio y un informe borrador de PATOLOGIA, con los campos
 * obligatorios llenos. Con { listo: true } le agrega microscópica y un diagnóstico, y con
 * { finalizar: true } además lo finaliza. Devuelve el informe.
 */
Cypress.Commands.add('crearInforme', ({ listo = false, finalizar = false } = {}) => {
  const documento = `PRUEBA${unico()}`;
  return cy
    .api('POST', '/pacientes/', {
      tipo_documento: 'CC',
      numero_documento: documento,
      nombres: 'Paciente Ficticio',
      apellidos: 'Cypress',
      fecha_nacimiento: '1980-01-01',
      sexo: 'femenino',
    })
    .then((paciente) =>
      cy.api('GET', `/patologias/?page_size=1000`).then(({ results }) => {
        const { id } = results.find((p) => p.nombre === PATOLOGIA);
        return cy.api('GET', `/patologias/${id}/`).then((patologia) => {
          // Cada campo obligatorio con un valor válido: la primera opción de las listas.
          const datos = {};
          patologia.plantillas
            .filter((p) => p.obligatorio)
            .forEach((p) => {
              datos[p.campo_nombre] = p.tipo_campo === 'lista' ? p.opciones[0] : 'Dato de prueba';
            });
          return cy.api('POST', '/informes/', {
            paciente: paciente.id,
            patologia: id,
            tipo_estudio: 'histologia',
            datos_ingresados: datos,
            ...(listo || finalizar
              ? {
                  descripcion_microscopica: 'Microscópica de prueba.',
                  diagnosticos: [{ descripcion: 'Diagnóstico de prueba', codigo_cie10: 'C44.3' }],
                }
              : {}),
          });
        });
      }),
    )
    .then((informe) => (finalizar ? cy.api('POST', `/informes/${informe.id}/finalizar/`) : informe));
});
