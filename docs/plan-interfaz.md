# Plan de la interfaz y de las siguientes fases de GyS Control

Plan acordado con el usuario el 2026-10-15. El estado de cada etapa se lleva en [`progreso.md`](progreso.md), y las decisiones que salgan de él, en [`decisiones.md`](decisiones.md).

**Alcance recortado el 2026-11-11 (decisión G-4):** el proyecto académico es la gestión y el seguimiento de visitas técnicas. El inventario de plaguicidas, un calendario completo con recordatorios y los demás módulos de un ERP quedan como trabajo futuro. Las etapas 2 a 4 se ajustaron a ese alcance.

**Base visual:** la identidad provisional de la decisión G-2 (rama `rediseno-visual`): rojo carmín como acento, carbón y blanco, IBM Plex Sans, bordes rectos y sin sombras.

---

## Etapa 1. Nueva estructura de la interfaz (2026-10-15) — hecha

Hecha el 2026-10-15 en la rama `rediseno-visual` (decisión G-3). El frontend borrado está en la etiqueta de git `patholab-frontend`.

**Objetivo:** que en la presentación del 2026-10-16 no se vea nada de PathoLab, ni en las pantallas ni en las pruebas.

- **Estructura nueva:**
  - barra lateral izquierda en carbón, con la marca arriba y los módulos Inicio, Clientes, Servicios, Agenda, Inventario, Informes y Métricas; el elemento activo, en carmín. En el celular se convierte en un botón de menú;
  - barra superior delgada con el título de la sección, el usuario, su rol y el botón para salir;
  - área de trabajo clara para formularios y tablas.
- **Inicio:** saludo con el nombre del usuario, tarjetas de indicadores de control de plagas marcadas "Próximamente" (sin cifras inventadas) y accesos rápidos a los módulos.
- **Módulos que aún no existen:** cada uno lleva a una página "Próximamente" que explica en dos líneas qué hará.
- **Login rediseñado** con la nueva identidad.
- **Páginas legales:** siguen siendo neutras y se abren desde el pie o la barra lateral.
- **Ocultar lo heredado (decisión G-3):**
  - se quitan de la interfaz las pantallas de informes de patología, pacientes, patologías y catálogos, y todo texto de patología visible en el frontend;
  - el backend (modelos, API y sus pruebas) no se toca: queda inactivo hasta la etapa 3.
- **Pruebas:** se eliminan las de Cypress y Vitest que dependen de las pantallas ocultas (quedan en el historial de git). Las de login y cierre de sesión se conservan o se ajustan, y todo lo demás sigue pasando.

## Etapa 2. Pruebas de Cypress de GyS Control — en pausa

En pausa desde el 2026-11-11 (G-4): se retoma cuando existan las pantallas de visitas técnicas. Las 5 pruebas actuales de login y roles (`login-y-roles.cy.js`) siguen vigentes.

- Nuevas pruebas de punta a punta, solo de GyS Control: login, navegación por la barra lateral, páginas "Próximamente", cierre de sesión y páginas legales.
- Se siguen las reglas de D-17 y los selectores accesibles de `CLAUDE.md` (`findByRole`, `findByLabelText`, `findByText`).

## Etapa 3. Dominio de visitas técnicas

- **Base:** el resumen del trabajo de grado (`docs/trabajo-de-grado/resumen.md`, que agregará el usuario: título, objetivos, alcance y requisitos) y las entrevistas con el controlador de plagas de la empresa de referencia (tipos de servicio, plagas, productos aplicados, frecuencia de visitas, informes y certificados que exigen los clientes y la autoridad sanitaria).
- **Módulos (G-4):** clientes y sus sedes; programación de visitas (fecha, cliente, sede y técnico asignado); registro y seguimiento de cada visita; informe o certificado en PDF de la visita. Se planean por fases con el usuario.
- **Fuera del alcance (trabajo futuro):** inventario de plaguicidas y calendario completo con recordatorios o notificaciones.
- **Código heredado de patología:** en esta etapa se transforma o se elimina (informes, pacientes, patologías, plantillas, EPS, CIE-10, firma y PDF). Hay que decidir qué se reutiliza, renombrar `LABORATORIO_*` y la clave `laboratorio` de `datos_finalizacion` con una migración de datos (G-1, D-15), y redactar los textos legales definitivos con revisión legal (Ley 1581 de 2012).

## Etapa 4. Indicadores del seguimiento de las visitas

- Indicadores con datos reales de las visitas de la etapa 3, en el módulo Métricas y en las tarjetas del Inicio, que hoy dicen "Próximamente". Se confirman contra los objetivos específicos del trabajo de grado.

## Etapa 5. Inteligencia artificial y ciencia de datos

- Componente de IA y análisis de datos sobre la información acumulada. Se define más adelante.

## Pendientes técnicos heredados

De la auditoría OWASP de PathoLab ([`historial-patholab/auditoria-owasp.md`](historial-patholab/auditoria-owasp.md)), siguen pendientes para el código conservado:
- **grupo 4** (O-9, O-10): actualización a Django 5.2;
- **grupo 6** (O-2, O-19 punto 1, O-6, O-7): cuentas y sesiones (decisión D-16);
- **grupo 7** (O-14): concurrencia;
- **grupo 8** (O-20, O-15, O-5 punto 3, O-18, O-8, O-11, O-12, O-19 punto 3 y tamaño máximo de los textos largos): mejoras antes de producción.
