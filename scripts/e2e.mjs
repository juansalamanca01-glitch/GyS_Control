// npm run e2e: pruebas de punta a punta con Cypress, contra el backend y el frontend reales.
// 1. Crea desde cero una base SQLite aparte (backend/e2e_db.sqlite3) con seed_data:
//    la base de desarrollo no se toca.
// 2. Arranca el backend (8001) y el frontend (5174), en otros puertos que "npm run dev",
//    para que los dos puedan estar abiertos a la vez.
// 3. Ejecuta Cypress y, al terminar, detiene los dos servidores.
// "npm run e2e:abrir" hace lo mismo, pero abre la interfaz de Cypress.
// Los argumentos extra pasan a Cypress: npm run e2e -- --spec cypress/e2e/login-y-roles.cy.js
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { revisarEntorno, rutaPython } from './entorno.mjs';

export const PUERTO_BACKEND = 8001;
export const PUERTO_FRONTEND = 5174;
export const ARCHIVO_BASE = 'e2e_db.sqlite3';

/**
 * Variables de entorno del backend de las pruebas: su propia base y un límite de peticiones
 * por usuario más alto (Cypress hace en segundos lo que una persona hace en minutos).
 * El límite del login no cambia.
 */
export function entornoBackend(entorno = process.env) {
  return {
    ...entorno,
    SQLITE_NOMBRE: ARCHIVO_BASE,
    LIMITE_PETICIONES_USUARIO: '2000/minute',
  };
}

/** Pasos para crear la base desde cero (después de borrar el archivo). */
export function pasosPreparacion(raiz, plataforma = process.platform) {
  const python = rutaPython(raiz, plataforma);
  const cwd = path.join(raiz, 'backend');
  return [
    {
      nombre: 'Crear las tablas (migrate)',
      comando: python,
      args: ['manage.py', 'migrate', '--noinput'],
      cwd,
    },
    {
      nombre: 'Cargar los datos de prueba (seed_data)',
      comando: python,
      args: ['manage.py', 'seed_data'],
      cwd,
    },
  ];
}

/** Los dos servidores, en el formato de concurrently. */
export function servidores(raiz, plataforma = process.platform, entorno = process.env) {
  const python = rutaPython(raiz, plataforma);
  return [
    {
      // --noreload: un solo proceso, que se detiene limpio al terminar.
      command: `"${python}" manage.py runserver ${PUERTO_BACKEND} --noreload`,
      name: 'backend',
      cwd: path.join(raiz, 'backend'),
      env: entornoBackend(entorno),
      prefixColor: 'green',
    },
    {
      // --strictPort: si el puerto está ocupado, falla en vez de usar otro.
      command: `npm run dev -- --port ${PUERTO_FRONTEND} --strictPort`,
      name: 'frontend',
      cwd: path.join(raiz, 'frontend'),
      env: {
        ...entorno,
        API_PROXY_DESTINO: `http://127.0.0.1:${PUERTO_BACKEND}`,
      },
      prefixColor: 'cyan',
    },
  ];
}

/**
 * Variables de entorno de Cypress. Las terminales de VS Code (y Claude Code dentro de él)
 * definen ELECTRON_RUN_AS_NODE=1, y con ella Cypress, que es una app de Electron, no
 * arranca ("bad option: --smoke-test"). Por eso se quita.
 */
export function entornoCypress(entorno = process.env) {
  const copia = { ...entorno };
  delete copia.ELECTRON_RUN_AS_NODE;
  return copia;
}

/** Argumentos de Cypress: "run" sin interfaz, "open" con ella. */
export function argumentosCypress(abrir, extra = []) {
  return abrir ? ['cypress', 'open', '--e2e', '--browser', 'electron', ...extra] : ['cypress', 'run', ...extra];
}

/** Espera a que la dirección responda (con cualquier código HTTP). */
async function esperar(url, segundos = 60) {
  for (let i = 0; i < segundos * 2; i++) {
    try {
      await fetch(url);
      return true;
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 500));
    }
  }
  return false;
}

// Solo se ejecuta si se llama directamente (npm run e2e), no al importarlo en las pruebas.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const abrir = process.argv.includes('--abrir');
  const extra = process.argv.slice(2).filter((arg) => arg !== '--abrir');

  const { errores } = revisarEntorno({ raiz, existe: existsSync });
  if (errores.length > 0) {
    console.error('\nFalta preparar el entorno. Ejecuta "npm run dev" para ver qué falta.\n');
    process.exit(1);
  }

  // 1. Base de datos nueva.
  console.log(`\n=== Base de datos de las pruebas (backend/${ARCHIVO_BASE}) ===`);
  rmSync(path.join(raiz, 'backend', ARCHIVO_BASE), { force: true });
  for (const { nombre, comando, args, cwd } of pasosPreparacion(raiz)) {
    console.log(nombre);
    const { status } = spawnSync(comando, args, {
      cwd,
      env: entornoBackend(),
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    if (status !== 0) {
      console.error(`\nFalló: ${nombre}`);
      process.exit(1);
    }
  }

  // 2. Servidores.
  const { default: concurrently } = await import('concurrently');
  const { result, commands } = concurrently(servidores(raiz), {
    killOthersOn: ['failure'],
  });
  let detenidos = false;
  result.catch(() => {
    if (!detenidos) {
      console.error('\nUn servidor se detuvo. ¿Están ocupados los puertos 8001 o 5174?\n');
      process.exit(1);
    }
  });
  // Hay que esperar a que los servidores se cierren antes de salir: si el script termina
  // antes, quedan vivos (en Windows) y la base sigue abierta para la próxima corrida.
  const detener = async () => {
    detenidos = true;
    commands.forEach((comando) => comando.kill());
    await Promise.race([result.catch(() => {}), new Promise((resolver) => setTimeout(resolver, 10000))]);
  };

  const listos =
    (await esperar(`http://127.0.0.1:${PUERTO_BACKEND}/api/`)) &&
    (await esperar(`http://localhost:${PUERTO_FRONTEND}/`));
  if (!listos) {
    console.error('\nLos servidores no respondieron a tiempo.\n');
    await detener();
    process.exit(1);
  }

  // 3. Cypress. En Windows, npx es un .cmd y necesita la terminal (como en check.mjs).
  console.log('\n=== Cypress ===');
  const { status } = spawnSync(`npx ${argumentosCypress(abrir, extra).join(' ')}`, {
    cwd: path.join(raiz, 'frontend'),
    env: entornoCypress(),
    stdio: 'inherit',
    shell: true,
  });
  await detener();
  process.exit(status ?? 1);
}
