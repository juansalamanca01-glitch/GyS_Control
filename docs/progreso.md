# Estado del trabajo

Este archivo dice **en qué quedamos**. Se actualiza al terminar cada tarea para poder retomar el trabajo si la conversación se corta.
- **Qué se cambió y por qué:** `CHANGELOG.md`.
- **Decisiones tomadas:** `docs/decisiones.md`.
- **Historia de PathoLab** (base de este proyecto): `docs/historial-patholab/`.

**Última actualización:** 2026-10-15

---

## Dónde estamos

- **Proyecto:** GyS Control, sistema de gestión para empresas de control de plagas (servicios, informes y certificados en PDF, inventario de plaguicidas y agenda). Carpeta `C:\Users\salam\Desktop\GyS Control`, repositorio `github.com/juansalamanca01-glitch/GyS_Control`.
- **Origen:** nace de la base de PathoLab (decisión G-1). **La interfaz ya es la de GyS Control** (G-3): barra lateral, Inicio y páginas "Próximamente" para los módulos. El backend heredado (informes de patología, pacientes, PDF, firma y adendas) sigue en el código, inactivo en la interfaz. El dominio de control de plagas aún no existe.
- **Rama de trabajo:** `rediseno-visual` (desde `main`). Tiene el rediseño visual provisional (decisión G-2) y es la base de la etapa 1 del plan de la interfaz. **No se une a `main` hasta que el usuario revise el resultado en el navegador.**
- **Plan vigente:** [`plan-interfaz.md`](plan-interfaz.md) (2026-10-15). En la presentación del 2026-10-16 no debe verse nada de PathoLab, ni en pantallas ni en pruebas. Etapas: 1) estructura nueva de la interfaz y ocultar lo heredado (G-3), hoy; 2) Cypress solo de GyS Control, el 2026-10-16 en la mañana; 3) dominio, después de entrevistar al técnico; 4) métricas y KPI; 5) IA y ciencia de datos; además, los grupos 4, 6, 7 y 8 de OWASP.
- **Rama anterior:** la limpieza (`limpieza-patholab`: quitar el foro, nombre GyS Control y documentación) se unió a `main` por fast-forward el 2026-10-15, después de que el usuario confirmara que Cypress pasaba en la rama. La rama sigue en GitHub.
- **Entorno local** (preparado el 2026-10-15 en este clon): venv del backend con `requirements-dev.txt`, `npm install` en la raíz y en `frontend/`, `backend/.env` con una `SECRET_KEY` nueva y propia de GyS Control (no la de PathoLab), `migrate` y `seed_data`. `npm run dev` arranca y responde.
- **Pruebas:**
  - **Antes de la limpieza (línea base):** 23 de la raíz, 322 del backend, 137 del frontend y 25 de Cypress. Todas pasaban.
  - **Después de cada uno de los tres commits:** 23 de la raíz (`npm test`), 293 del backend (`python manage.py test`), 124 del frontend (`npm test` en `frontend/`) y 25 de Cypress (`npm run e2e`). Todas pasan, y `npm run check` termina sin errores ni avisos.
  - **En `rediseno-visual`:** las mismas 23, 293, 124 y 25, todas en verde, y `npm run check` sin errores ni avisos.
  - **Después de la etapa 1 (G-3):** 23 de la raíz, 293 del backend, 34 del frontend y 5 de Cypress, todas en verde, y `npm run check` sin errores ni avisos. Las pruebas de las pantallas borradas están en el historial de git.
  - Las 29 del backend y las 13 del frontend que faltan eran del foro.
- **Forma de trabajar:** la de las reglas 1 a 8 de `CLAUDE.md`. La regla 8 (rama por tarea, prueba que demuestre el fallo, push después de cada commit y preguntar antes de unir a `main`) se pasó a `CLAUDE.md` el 2026-10-15: en PathoLab estaba en este archivo. Además, **hasta la presentación del 2026-10-16**, `npm run e2e` se corre antes de cada commit de código, aunque la regla 7 no lo exija (lo aprobó el usuario el 2026-10-15).

## Hecho

| Fecha | Qué se hizo | Commit |
|---|---|---|
| 2026-10-15 | Entorno del clon preparado y línea base de pruebas en verde (ver "Pruebas") | — |
| 2026-10-15 | Limpieza 1: se quita el foro (backend, frontend, estilos, `seed_data`, Postman). La base local se limpió con `migrate foro zero` antes de borrar la app | `refactor: quitar el foro` |
| 2026-10-15 | Limpieza 2: nombre GyS Control en pantallas, `/admin/`, PDF (encabezado de demostración), scripts, paquetes, ejemplos y Postman; textos legales neutros "en preparación" | `refactor: nombre GyS Control` |
| 2026-10-15 | Limpieza 3: documentos de PathoLab a `docs/historial-patholab/`; `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `docs/decisiones.md` y este archivo describen GyS Control | `docs: documentación de GyS Control` |
| 2026-10-15 | Unión de `limpieza-patholab` a `main` (fast-forward), con Cypress en verde en la rama | `04526df` |
| 2026-10-15 | Regla 8 en `CLAUDE.md`: la "Forma de trabajar" de PathoLab (rama por tarea, prueba primero, push, preguntar antes de unir) | commit "docs: limpieza unida a main y regla 8" |
| 2026-10-15 | Plan de la interfaz (`docs/plan-interfaz.md`) | `047dfc2` |
| 2026-10-15 | Etapa 1 (G-3): estructura nueva (barra lateral, barra superior, Inicio, "Próximamente", login), frontend de patología borrado (etiqueta `patholab-frontend`), "Técnico" en lugar de "Patólogo", `tecnico1` y `tecnico2` en `seed_data` y base local recreada | commit "feat: estructura de la interfaz de GyS Control" |
| 2026-10-15 | Rediseño visual provisional (G-2), en la rama `rediseno-visual`: paleta carmín, carbón y blanco, IBM Plex Sans con `@fontsource`, radio 0, sin sombras ni degradados, errores en óxido con ícono, "Finalizar Informe" en carbón. Solo `index.css`, la clase de los botones de finalizar y el favicon. La paleta, la tipografía y los botones los aprobó el usuario antes de empezar | commit "style: identidad visual provisional" |

## Siguiente paso

0. **Revisión de la rama `rediseno-visual`** (etapas G-2 y G-3) por el usuario en el navegador. Después, preguntar antes de unirla a `main`.
1. **Etapa 2, 2026-10-16 en la mañana:** pruebas de Cypress solo de GyS Control (`docs/plan-interfaz.md`).
2. **Presentación de las pruebas automáticas y Cypress:** viernes 2026-10-16.
3. **Videos de respaldo** (`npm run e2e:video`): el usuario los grabará después del rediseño visual.
4. **Después:** planear con el usuario la transformación del dominio por fases (clientes, servicios, inventario de plaguicidas, agenda, certificados en PDF). No se empieza sin su aprobación.

Para unir una rama a `main` (fast-forward desde la terminal, sin pull request, porque `gh` no está instalado):
1. Comprobar que todas las pruebas pasan.
2. Ejecutar `git switch main`, luego `git merge --ff-only <rama de trabajo>` y `git push origin main`.

Siempre se pregunta antes al usuario.

Para arrancar la aplicación: `npm run dev` en la raíz y abrir http://localhost:5173. Se detiene con Ctrl + C.

## Pendientes

### 1. Transformación del dominio (sin fases definidas todavía)

Se planea después de la presentación, por fases, con el usuario:
- clientes y sus sedes;
- servicios de control de plagas, con su informe y su certificado en PDF;
- inventario de plaguicidas;
- agenda.

Al hacerlo, habrá que decidir qué pasa con lo heredado de PathoLab: patologías, plantillas, pacientes, EPS, CIE-10 y el contenido del PDF. También renombrar `LABORATORIO_*` y la clave `laboratorio` de `datos_finalizacion`, con una migración de datos (G-1, D-15), y redactar los textos legales definitivos con revisión legal (Ley 1581 de 2012).

### 2. Heredados de PathoLab

Siguen siendo válidos para el código conservado. El detalle está en `docs/historial-patholab/progreso.md` ("Pendientes") y en `docs/historial-patholab/auditoria-owasp.md`:
- fase 4 de la auditoría OWASP: grupos 4 (Django 5.2), 6 (cuentas y sesiones, D-16) y 7 (concurrencia), y las mejoras para producción del grupo 8;
- I-9c (avisos moderados de `react-router`);
- todo lo de "Para producción": `SECRET_KEY`, `DEBUG=False`, PostgreSQL, límite de tamaño de petición, servir `media/`, registros del servidor web.

Las fases 5 a 8 del plan de PathoLab (guía de diseño y rediseño) se replantean con el dominio nuevo.

### 3. Si alguien trae estos cambios a una base que tenía el foro

Antes de traerlos, ejecutar `python manage.py migrate foro zero` (después ya no se puede, porque la app no existe) y borrar `backend/media/foro/`.

## Pendiente de respuesta del usuario

- **Revisión visual de `rediseno-visual`** en el navegador, y permiso para unirla a `main`.
- La transformación del dominio no se empieza hasta que el usuario lo pida.
