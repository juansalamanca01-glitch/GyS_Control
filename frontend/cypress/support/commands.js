// Comandos propios de Cypress que comparten las pruebas.

// Contraseñas de los usuarios de prueba que crea "python manage.py seed_data".
export const USUARIOS = {
  admin: 'admin1234',
  tecnico1: 'tecnico1234',
  tecnico2: 'tecnico2345',
  auditor1: 'auditor1234',
};

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
