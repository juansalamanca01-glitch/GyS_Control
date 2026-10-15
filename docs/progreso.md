# Estado del trabajo

Este archivo dice **en qué quedamos**. Se actualiza al terminar cada tarea para poder retomar el trabajo si la conversación se corta.
- **Qué se cambió y por qué:** `CHANGELOG.md`.
- **Decisiones tomadas:** `docs/decisiones.md`.
- **Historia de PathoLab** (base de este proyecto): `docs/historial-patholab/`.

**Última actualización:** 2026-10-15

---

## Dónde estamos

- **Proyecto:** GyS Control, sistema de gestión para empresas de control de plagas (servicios, informes y certificados en PDF, inventario de plaguicidas y agenda). Carpeta `C:\Users\salam\Desktop\GyS Control`, repositorio `github.com/juansalamanca01-glitch/GyS_Control`.
- **Origen:** nace de la base de PathoLab (decisión G-1). Hoy la aplicación es todavía la de PathoLab sin el foro: usuarios, roles, login, seguridad, informes de patología, pacientes, PDF, firma, adendas y toda la infraestructura de pruebas. El dominio de control de plagas aún no existe.
- **Rama de trabajo:** `limpieza-patholab`, con tres commits, todos subidos a GitHub:
  1. `refactor: quitar el foro`;
  2. `refactor: nombre GyS Control`;
  3. `docs: documentación de GyS Control`.
- **Entorno local** (preparado el 2026-10-15 en este clon): venv del backend con `requirements-dev.txt`, `npm install` en la raíz y en `frontend/`, `backend/.env` con una `SECRET_KEY` nueva y propia de GyS Control (no la de PathoLab), `migrate` y `seed_data`. `npm run dev` arranca y responde.
- **Pruebas:**
  - **Antes de la limpieza (línea base):** 23 de la raíz, 322 del backend, 137 del frontend y 25 de Cypress. Todas pasaban.
  - **Después de cada uno de los tres commits:** 23 de la raíz (`npm test`), 293 del backend (`python manage.py test`), 124 del frontend (`npm test` en `frontend/`) y 25 de Cypress (`npm run e2e`). Todas pasan, y `npm run check` termina sin errores ni avisos.
  - Las 29 del backend y las 13 del frontend que faltan eran del foro.
- **Forma de trabajar:** la de las reglas de `CLAUDE.md`. Además, **hasta la presentación del 2026-10-16**, `npm run e2e` se corre antes de cada commit de código, aunque la regla 7 no lo exija (lo aprobó el usuario el 2026-10-15). Después de cada commit se hace `git push` de la rama de trabajo (autorizado por el usuario el 2026-10-15 para este repositorio). Unir una rama a `main` requiere preguntar aparte.

## Hecho

| Fecha | Qué se hizo | Commit |
|---|---|---|
| 2026-10-15 | Entorno del clon preparado y línea base de pruebas en verde (ver "Pruebas") | — |
| 2026-10-15 | Limpieza 1: se quita el foro (backend, frontend, estilos, `seed_data`, Postman). La base local se limpió con `migrate foro zero` antes de borrar la app | `refactor: quitar el foro` |
| 2026-10-15 | Limpieza 2: nombre GyS Control en pantallas, `/admin/`, PDF (encabezado de demostración), scripts, paquetes, ejemplos y Postman; textos legales neutros "en preparación" | `refactor: nombre GyS Control` |
| 2026-10-15 | Limpieza 3: documentos de PathoLab a `docs/historial-patholab/`; `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `docs/decisiones.md` y este archivo describen GyS Control | `docs: documentación de GyS Control` |

## Siguiente paso

1. **El usuario prueba `npm run e2e:presentacion`** con la rama `limpieza-patholab`.
2. Si funciona, **se une a `main` hoy, 2026-10-15** (fast-forward, con todas las pruebas en verde), y mañana presenta desde `main`. El usuario ya lo aprobó con esa condición.
3. **Presentación de las pruebas automáticas y Cypress:** viernes 2026-10-16.
4. **Después:** planear con el usuario la transformación del dominio por fases (clientes, servicios, inventario de plaguicidas, agenda, certificados en PDF). No se empieza sin su aprobación.

Para unir una rama a `main` (fast-forward desde la terminal, sin pull request, porque `gh` no está instalado):
1. Comprobar que todas las pruebas pasan.
2. Ejecutar `git switch main`, luego `git merge --ff-only limpieza-patholab` y `git push origin main`.

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

- Resultado de `npm run e2e:presentacion` con la rama `limpieza-patholab`, para unirla a `main`.
