# Registro de cambios

Todos los cambios de código de GyS Control se documentan aquí, del más reciente al más antiguo. Cada entrada indica la fecha, qué se cambió y por qué.

**Origen:** GyS Control nace de la base de PathoLab (sistema de informes de anatomía patológica del mismo autor). El registro de cambios de PathoLab, hasta el 2026-10-14, está en [`docs/historial-patholab/CHANGELOG.md`](docs/historial-patholab/CHANGELOG.md). Los códigos como "D-7" remiten a [`docs/decisiones.md`](docs/decisiones.md), y los de hallazgos ("C-1", "O-16") a las auditorías de [`docs/historial-patholab/`](docs/historial-patholab/).

## 2026-10-15

### GyS Control, limpieza 3: documentación del nuevo proyecto

**Qué se cambió:**
- **Historial:** los documentos propios de PathoLab pasan, sin cambios, a `docs/historial-patholab/`: `auditoria-inicial.md`, `auditoria-owasp.md`, `decisiones.md`, `plan-calidad-y-diseno.md`, `propuesta-informe-v2.md`, y el `progreso.md` y el `CHANGELOG.md` tal como estaban en `main` el 2026-10-14. `docs/historial-patholab/README.md` explica qué hay en la carpeta.
- **Documentos nuevos:**
  - este `CHANGELOG.md`, con la línea de origen y las entradas de la limpieza (las de los puntos 1 y 2 pasan aquí desde el registro de PathoLab);
  - `docs/decisiones.md`: tabla de las decisiones heredadas D-1 a D-17 (vigentes, salvo D-5, retirada con el foro, y D-16, todavía sin implementar) y la decisión G-1 (GyS Control nace de PathoLab y se transforma por fases);
  - `docs/progreso.md`: estado de GyS Control, pruebas, siguiente paso y pendientes.
- **Reescritos:** `README.md` (GyS Control, módulos heredados, estructura y API sin el foro, pruebas y hoja de ruta por fases) y `CLAUDE.md` (sin el foro ni PathoLab, rutas del historial).
- **Comentarios del código:** las rutas `docs/auditoria-inicial.md`, `docs/auditoria-owasp.md`, `docs/plan-calidad-y-diseno.md` y `docs/propuesta-informe-v2.md` pasan a `docs/historial-patholab/…` en 25 archivos de `backend/` y `frontend/` (solo comentarios y docstrings). Las de `docs/decisiones.md` siguen igual, porque el archivo nuevo resume las mismas decisiones. Las migraciones no se tocan.
- **Pruebas:** 23 de la raíz, 293 del backend, 124 del frontend y 25 de Cypress, todas en verde. `npm run check` sin errores ni avisos.

**Por qué:** la documentación debe describir el nuevo proyecto sin perder la historia de PathoLab, y la regla 5 de `CLAUDE.md` necesita un `docs/decisiones.md` vigente, porque el código conservado sigue cumpliendo esas decisiones.

### GyS Control, limpieza 2: el nombre del proyecto

**Qué se cambió:**
- **Pantallas:** "GyS Control" en el menú (`Navbar.jsx`), el pie (`Footer.jsx`) y el login (`LoginPage.jsx`), con el subtítulo "Gestión de servicios de control de plagas". También el `<title>` y la descripción de `frontend/index.html`.
- **Textos legales:** `PoliticaPrivacidadPage.jsx` y `TerminosCondicionesPage.jsx` pasan a un texto breve y neutro de GyS Control, marcado como "en preparación" (sin PathoLab, patólogos, pacientes ni historia clínica). Se conservan las rutas, el `Footer`, `LegalRoute` y los títulos que comprueba `App.test.jsx`.
- **Encabezado del PDF:** el valor por defecto de `LABORATORIO_NOMBRE` (`backend/config/settings.py`) pasa a "GyS Control (demostración)". Las variables siguen llamándose `LABORATORIO_*`: la clave `laboratorio` está en los datos congelados de los finalizados (D-15) y renombrarla exige una migración de datos, que va con la transformación del dominio. Los finalizados conservan su encabezado congelado, y la migración `informes/0012` no se toca porque es historia. Se ajustan `EncabezadoLaboratorioTests` (`backend/config/tests.py`) y dos pruebas del PDF en `backend/informes/tests.py`.
- **Código interno:** `PathoLabTestRunner` → `GySControlTestRunner` (`backend/config/test_runner.py` y `TEST_RUNNER`), "Datos de GyS Control" en `/admin/` (`backend/accounts/admin.py`), comentario de `frontend/src/index.css` y mensajes de `scripts/dev.mjs`.
- **Paquetes:** `gys-control` (raíz) y `gys-control-frontend`, en `package.json` y `package-lock.json`.
- **Ejemplos:** `api.patolab.com` → `api.example.com` (dominio reservado para ejemplos) en `frontend/src/api/client.js`, su prueba y `frontend/.env.example`; ejemplo ficticio de empresa en `backend/.env.example`.
- **Postman:** `PathoLab_API.postman_collection.json` → `GyS_Control_API.postman_collection.json`, con el nombre y la descripción nuevos.
- **Pruebas:** 23 de la raíz, 293 del backend, 124 del frontend y 25 de Cypress, todas en verde. `npm run check` sin errores ni avisos.

**Por qué:** el proyecto se llama GyS Control. El nombre se cambia de una sola vez en todos los lugares del inventario de PathoLab, salvo la historia (migración 0012) y los nombres internos que dependen de los datos guardados.

### GyS Control, limpieza 1: se quita el foro

**Qué se cambió:**
- **Backend:** se borra la app `foro` (modelos, migración, `imagenes.py`, vistas, serializadores, `/admin/` y sus 28 pruebas). En `backend/config/settings.py` salen `'foro'` de `INSTALLED_APPS`, los límites `foro_publicacion` y `foro_comentario` y `FORO_MAX_TAMANO_IMAGEN`; `MEDIA_URL` y `MEDIA_ROOT` se conservan para las evidencias de los servicios. `backend/config/urls.py` ya no tiene `api/foro/`. `seed_data` ya no crea los temas del foro (D-5 queda retirada).
- **Pruebas del backend:** `backend/informes/tests.py` pierde `test_foro_muestra_nombre_completo_o_username`, y `ConsultasPorListadoTests` conserva sus 4 pruebas solo con categorías y patologías (los totales se comprueban ahora con `total_patologias`).
- **Frontend:** se borran `ForoPage.jsx`, `PublicacionDetallePage.jsx`, sus pruebas (13) y `VisorImagenes.jsx`, que solo usaba el foro. Salen las rutas `/foro` y `/foro/:id` de `App.jsx`, el enlace "Foro" de `Navbar.jsx` y los estilos del foro, el visor y los comentarios de `index.css`. Las páginas legales ya no mencionan el foro.
- **Postman:** sin la carpeta "5. Foro" ni la variable `publicacion_id`.
- **Base de datos local:** antes de quitar la app se ejecutó `python manage.py migrate foro zero`, para no dejar tablas huérfanas. Quien tenga una base con el foro debe hacer lo mismo **antes** de traer este cambio (después ya no se puede, porque la app no existe) y borrar `backend/media/foro/`.
- **Pruebas:** 23 de la raíz, 293 del backend (antes 322), 124 del frontend (antes 137) y 25 de Cypress, todas en verde. `npm run check` sin errores ni avisos.

**Por qué:** GyS Control (gestión para empresas de control de plagas) nace de la base de PathoLab, y el foro de patólogos no tiene lugar en el nuevo proyecto. Se quita sin tocar usuarios, roles, informes, pacientes, PDF, firma ni adendas, que se conservan hasta la transformación del dominio.

