// Pruebas de "npm run e2e". Se ejecutan con: npm test (desde la raíz del proyecto).
// Solo prueban la preparación; Cypress y los servidores se ejecutan con npm run e2e.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import {
  ARCHIVO_BASE,
  PUERTO_BACKEND,
  PUERTO_FRONTEND,
  argumentosCypress,
  entornoBackend,
  entornoCypress,
  leerArgumentos,
  pasosPreparacion,
  servidores,
} from './e2e.mjs';

const RAIZ = path.join('C:', 'proyecto');

test('el backend de las pruebas usa su propia base y no la de desarrollo', () => {
  const entorno = entornoBackend({ SECRET_KEY: 'x' });
  assert.equal(entorno.SQLITE_NOMBRE, ARCHIVO_BASE);
  assert.notEqual(ARCHIVO_BASE, 'db.sqlite3');
  assert.equal(entorno.SECRET_KEY, 'x');
});

test('solo sube el límite de peticiones por usuario', () => {
  const entorno = entornoBackend({});
  assert.equal(entorno.LIMITE_PETICIONES_USUARIO, '2000/minute');
  assert.deepEqual(Object.keys(entorno).sort(), ['LIMITE_PETICIONES_USUARIO', 'SQLITE_NOMBRE']);
});

test('prepara la base con migrate y seed_data, con el Python del venv', () => {
  const pasos = pasosPreparacion(RAIZ, 'win32');
  assert.deepEqual(
    pasos.map(({ args }) => args[1]),
    ['migrate', 'seed_data'],
  );
  assert.ok(pasos.every(({ comando }) => comando === path.join(RAIZ, 'backend', 'venv', 'Scripts', 'python.exe')));
  assert.ok(pasos.every(({ cwd }) => cwd === path.join(RAIZ, 'backend')));
});

test('los servidores usan otros puertos que npm run dev y el frontend apunta al backend de las pruebas', () => {
  const [backend, frontend] = servidores(RAIZ, 'linux', {});
  assert.equal(PUERTO_BACKEND, 8001);
  assert.equal(PUERTO_FRONTEND, 5174);
  assert.match(backend.command, /runserver 8001 --noreload$/);
  assert.equal(backend.env.SQLITE_NOMBRE, ARCHIVO_BASE);
  assert.match(frontend.command, /--port 5174 --strictPort$/);
  assert.equal(frontend.env.API_PROXY_DESTINO, 'http://127.0.0.1:8001');
  // El frontend no necesita las variables del backend.
  assert.equal(frontend.env.SQLITE_NOMBRE, undefined);
});

test('Cypress se ejecuta sin ELECTRON_RUN_AS_NODE, que lo dejaría sin arrancar', () => {
  const entorno = entornoCypress({ ELECTRON_RUN_AS_NODE: '1', PATH: 'algo' });
  assert.equal(entorno.ELECTRON_RUN_AS_NODE, undefined);
  assert.equal(entorno.PATH, 'algo');
});

test('"run" sin interfaz, "open" con ella y "video" graba; los argumentos extra pasan a Cypress', () => {
  assert.deepEqual(argumentosCypress('correr'), ['cypress', 'run']);
  assert.deepEqual(argumentosCypress('correr', ['--spec', 'x.cy.js']), ['cypress', 'run', '--spec', 'x.cy.js']);
  assert.deepEqual(argumentosCypress('abrir'), ['cypress', 'open', '--e2e', '--browser', 'electron']);
  assert.deepEqual(argumentosCypress('video'), ['cypress', 'run', '--config', 'video=true']);
});

test('--abrir y --video eligen el modo y no pasan a Cypress', () => {
  assert.deepEqual(leerArgumentos([]), { modo: 'correr', extra: [] });
  assert.deepEqual(leerArgumentos(['--abrir']), { modo: 'abrir', extra: [] });
  assert.deepEqual(leerArgumentos(['--video', '--spec', 'x.cy.js']), { modo: 'video', extra: ['--spec', 'x.cy.js'] });
});
