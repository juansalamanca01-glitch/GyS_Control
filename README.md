# GyS Control — Gestión de Servicios de Control de Plagas

[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.14+-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cypress](https://img.shields.io/badge/Cypress-15-69D3A7?style=for-the-badge&logo=cypress&logoColor=white)](https://www.cypress.io/)

**GyS Control** es un sistema web de gestión para empresas de control de plagas: servicios, informes y certificados en PDF, inventario de plaguicidas y agenda.

> **Estado actual (2026-10-15).** GyS Control nace de la base de **PathoLab**, un sistema de informes de anatomía patológica del mismo autor. De PathoLab conserva la plataforma completa: usuarios, roles, login, seguridad, informes con PDF, firma y adendas, pacientes, catálogos y toda la infraestructura de pruebas (Django, Vitest y Cypress). El dominio de control de plagas (clientes, servicios, inventario y agenda) se construirá **por fases** sobre esa base. Mientras tanto, los módulos funcionales son los heredados, descritos abajo. La historia de PathoLab está en [`docs/historial-patholab/`](docs/historial-patholab/).

---

## Tabla de Contenidos

- [Características](#características)
- [Roles y Permisos](#roles-y-permisos)
- [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración Local](#instalación-y-configuración-local)
- [Arrancar el Proyecto](#arrancar-el-proyecto)
- [Usuarios y Cuentas de Prueba](#usuarios-y-cuentas-de-prueba)
- [Pruebas Automáticas](#pruebas-automáticas)
- [Formato y Linter](#formato-y-linter)
- [Referencia de la API REST](#referencia-de-la-api-rest)
- [Seguridad](#seguridad)
- [Documentación del Proyecto](#documentación-del-proyecto)
- [Hoja de Ruta](#hoja-de-ruta)

---

## Características

### Plataforma (se mantiene en GyS Control)

- **Usuarios y roles**: administrador, patólogo y auditor, con permisos aplicados en el backend. Los nombres de los roles cambiarán con el dominio nuevo.
- **Inicio de sesión con JWT**: renovación automática del token, cierre de sesión real (lista negra de tokens) y límites de intentos.
- **Perfil de usuario**: edición de datos personales y cambio de contraseña (con los validadores de Django).
- **Documentos firmados e inmutables**: un informe se guarda como borrador, se finaliza con la firma de su autor y desde ese momento no se modifica; se corrige con adendas firmadas. Al finalizar se congelan los datos que imprime.
- **PDF con ReportLab**: encabezado de la empresa configurable en `backend/.env`, firma, adendas, "Página X de Y" y, en los borradores, una marca de agua "BORRADOR".
- **No perder lo escrito**: aviso al salir con cambios sin guardar y autoguardado de los borradores existentes.
- **Catálogos administrables** que se desactivan en lugar de borrarse, y **búsqueda paginada** con filtros.

### Módulos heredados de PathoLab (se transformarán)

- **Informes de anatomía patológica**: 14 patologías con formularios dinámicos, descripción macroscópica redactada automáticamente, número de petición `P-AÑO-NNNNN`, datos de la solicitud, descripción microscópica, diagnósticos con código CIE-10 y comentarios.
- **Pacientes**: documento, nombres, fecha de nacimiento, sexo y EPS, con la edad calculada y el historial de informes. Solo datos ficticios.
- **Catálogos de EPS y servicios** (pantalla Catálogos).

---

## Roles y Permisos

| Acción | Administrador | Patólogo | Auditor |
|---|:---:|:---:|:---:|
| Ver informes, buscar y descargar el PDF de un informe finalizado | Sí | Sí | Sí |
| Descargar la vista previa en PDF de un borrador | Sí (cualquiera) | Solo los suyos | No |
| Crear informes | Sí | Sí | No |
| Editar, borrar o finalizar un informe | Sí (cualquiera) | Solo los suyos | No |
| Editar o borrar un informe **finalizado** | No | No | No |
| Agregar adendas a un informe finalizado (con registro médico) | Sí (cualquiera) | Solo a los suyos | No |
| Administrar patologías, plantillas y categorías | Sí | Sí | No |
| Ver pacientes | Sí | Sí | Sí |
| Crear y editar pacientes; administrar EPS y servicios | Sí | Sí | No |
| Borrar pacientes (solo si no tienen informes) | Sí | No | No |
| Registrar usuarios y ver la lista de usuarios | Sí | No | No |
| Editar su perfil y cambiar su contraseña | Sí | Sí | Sí |

Estas reglas vienen de las decisiones heredadas de PathoLab, resumidas en [`docs/decisiones.md`](docs/decisiones.md) (D-1 a D-17). Un informe finalizado se corrige **siempre** con una adenda: no se modifica ni se borra por la API ni desde `/admin/` (D-3, D-9, D-14), y su estado solo cambia con `POST /api/informes/{id}/finalizar/`.

---

## Arquitectura y Tecnologías

```
┌────────────────────────────────────────────────────────┐
│                   Cliente (Navegador)                  │
│             React 18 + Vite + React Router             │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Axios)
                           │ Token JWT en la cabecera Authorization
┌──────────────────────────▼─────────────────────────────┐
│                API REST (Django + DRF)                 │
│   ┌────────────┐   ┌───────────────┐   ┌────────────┐  │
│   │  accounts  │   │   informes    │   │ pacientes  │  │
│   │- Login JWT │   │- Patologías   │   │- Pacientes │  │
│   │- Roles     │   │- Plantillas   │   │- EPS       │  │
│   │- Perfil    │   │- Servicios    │   │- Historial │  │
│   │- Usuarios  │   │- Informes     │   │            │  │
│   │            │   │- Diagnósticos │   │            │  │
│   │            │   │- Adendas      │   │            │  │
│   │            │   │- PDF          │   │            │  │
│   └────────────┘   └───────────────┘   └────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │ ORM
┌──────────────────────────▼─────────────────────────────┐
│          Base de datos (SQLite / PostgreSQL)           │
└────────────────────────────────────────────────────────┘
```

- **Backend**: Python 3.10+, Django 4.2 LTS, Django REST Framework, SimpleJWT (tokens de acceso de 8 horas y de renovación de 7 días, con rotación), django-cors-headers, python-decouple (configuración desde `.env`), ReportLab (PDF), SQLite en desarrollo o PostgreSQL si se define `DB_NAME`, y Ruff (formato y linter, solo en desarrollo).
- **Frontend**: React 18 y React Router 6 (`createBrowserRouter`), Vite 6.4, Axios (añade el token y lo renueva), estilos propios en `src/index.css` (identidad visual provisional G-2: variables CSS en un solo bloque, fuente IBM Plex Sans instalada con `@fontsource`), Vitest 5 y React Testing Library, Prettier y ESLint.
- **Pruebas de punta a punta**: Cypress 15 con `@testing-library/cypress`.

---

## Estructura del Proyecto

```
GyS Control/
├── backend/
│   ├── accounts/              # Usuarios, roles, login JWT, perfil y contraseñas
│   ├── config/                # settings.py (lee el .env), urls, paginación, catálogos, filtros, ejecutor de pruebas
│   ├── informes/              # Catálogo, servicios, informes, diagnósticos, adendas, PDF y seed_data
│   ├── pacientes/             # Pacientes, EPS y listas fijas
│   ├── requirements.txt       # Dependencias de producción
│   ├── requirements-dev.txt   # Las de producción más Ruff
│   └── .env.example           # Plantilla del .env (SECRET_KEY obligatoria)
├── frontend/
│   ├── src/                   # api/, context/, components/ (e informe/), hooks/, pages/, utils/, App.jsx, index.css
│   ├── cypress/e2e/           # Pruebas de Cypress: 6 flujos críticos
│   ├── cypress.config.js
│   ├── vite.config.js         # Proxy /api → backend y configuración de Vitest
│   └── .env.example           # Plantilla del .env (VITE_API_URL)
├── docs/
│   ├── decisiones.md          # Decisiones vigentes (heredadas y de GyS Control)
│   ├── progreso.md            # Estado del trabajo, pendientes y siguiente paso
│   └── historial-patholab/    # Documentos de PathoLab: auditorías, decisiones, propuesta del informe v2, plan y registro de cambios
├── scripts/                   # "npm run dev", "npm run check" y "npm run e2e"
├── CHANGELOG.md               # Registro de cambios de GyS Control
├── CLAUDE.md                  # Guía para el asistente de código
├── package.json               # Comandos de la raíz
└── GyS_Control_API.postman_collection.json
```

Las pruebas del frontend están junto a cada componente, en archivos `*.test.jsx`.

---

## Requisitos Previos

- **Python** 3.10 o superior ([python.org](https://www.python.org/))
- **Node.js** 22.12 o superior y **npm** ([nodejs.org](https://nodejs.org/)). Vitest 5 necesita Node 22.12+.
- **Git** ([git-scm.com](https://git-scm.com/))
- **Google Chrome**, para `npm run e2e:abrir` y `npm run e2e:presentacion`.

---

## Instalación y Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/juansalamanca01-glitch/GyS_Control.git
cd GyS_Control
```

### 2. Backend (Django)

Desde `backend/`:

1. **Crea y activa un entorno virtual:**
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   ```bash
   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Instala las dependencias:**
   ```bash
   pip install -r requirements-dev.txt
   ```
   Instala las de producción (`requirements.txt`) más Ruff. En un servidor basta con `pip install -r requirements.txt`.

3. **Crea el archivo `.env` (obligatorio):**
   ```bash
   copy .env.example .env     # Windows
   # cp .env.example .env     # Linux/macOS
   ```
   Genera una clave secreta **propia** y pégala en `SECRET_KEY=`:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(50))"
   ```
   > Sin `SECRET_KEY` el backend no arranca. Si no se define `DEBUG`, queda en `False`. El `.env.example` trae `DEBUG=True` para desarrollo.

   **Encabezado del PDF (opcional):**

   | Variable | Qué imprime | Si no se define |
   |---|---|---|
   | `LABORATORIO_NOMBRE` | Primera línea, en negrita | "GyS Control (demostración)" |
   | `LABORATORIO_DIRECCION` | Segunda línea: dirección completa y ciudad | "Santiago de Cali, Colombia" |
   | `LABORATORIO_TELEFONO` | Tercera línea, "Teléfono: …" | No se imprime la línea |

   Las variables conservan el nombre heredado de PathoLab hasta la transformación del dominio (decisión G-1). Un informe finalizado conserva el encabezado que tenía al finalizarse (D-15).

4. **Aplica las migraciones y carga los datos iniciales:**
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```
   `seed_data` crea los usuarios de prueba, las 14 patologías con sus plantillas, 7 servicios, 12 EPS y 2 pacientes ficticios. Se puede ejecutar varias veces sin duplicar datos.

### 3. Frontend y herramientas de la raíz

```bash
npm install                  # en la raíz (npm run dev, check, e2e)
cd frontend && npm install   # en frontend/
```

`frontend/.env` es opcional: en desarrollo `VITE_API_URL` va vacía y el proxy de `vite.config.js` reenvía `/api/...` al backend. El archivo `.env.example` explica cuándo hay que darle un valor.

---

## Arrancar el Proyecto

Desde la raíz:

```bash
npm run dev
```

- Arranca el backend (http://localhost:8000) y el frontend (http://localhost:5173) en la misma terminal, con las etiquetas `[backend]` y `[frontend]`.
- Abre la aplicación en **http://localhost:5173**. El panel de Django está en http://localhost:8000/admin/.
- **Ctrl + C** detiene los dos servidores.
- Antes de arrancar comprueba el entorno virtual, `backend/.env` y las dependencias del frontend, y avisa si hay migraciones pendientes.

---

## Usuarios y Cuentas de Prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin1234` | **Administrador** (también entra en `/admin/`) |
| `patologo1` | `patologo1234` | **Patólogo** (registro médico ficticio `RM-PRUEBA-0001`) |
| `patologo2` | `patologo2345` | **Patólogo** (`RM-PRUEBA-0002`), para probar que un patólogo no modifica los informes de otro (D-2) |
| `auditor1` | `auditor1234` | **Auditor** |

Los pacientes de `seed_data` son **ficticios** ("Paciente Ficticio Uno", documento `PRUEBA0001`, y "Prueba Apellido Dos", `PRUEBA0002`). Nunca se usan datos de personas reales.

> **Importante:** son contraseñas de **demostración**. La API rechaza contraseñas así de débiles al registrar un usuario o cambiar una contraseña.

---

## Pruebas Automáticas

```bash
# Backend (desde backend/, con el entorno virtual activado)
python manage.py test                     # 293 pruebas

# Frontend (desde frontend/)
npm test                                  # 124 pruebas
npm run test:watch                        # se repiten al guardar cambios

# Comprobaciones de los scripts (desde la raíz)
npm test                                  # 23 pruebas

# Pruebas de punta a punta con Cypress (desde la raíz)
npm run e2e                               # 25 pruebas, sin interfaz
npm run e2e -- --spec cypress/e2e/permisos.cy.js   # un solo archivo
npm run e2e:abrir                         # con la interfaz de Cypress, en Chrome
npm run e2e:presentacion                  # igual, con una pausa de 500 ms después de cada acción
npm run e2e:presentacion -- --pausa=1000  # con otra pausa (máximo 3000 ms)
npm run e2e:video                         # graba un video por archivo en frontend/cypress/videos/
```

- **Backend:** permisos por rol y por autor, número de petición (incluida la creación simultánea), pacientes, datos de la solicitud, diagnósticos y CIE-10, finalización, datos congelados, adendas, PDF, catálogos, paginación, filtros, límites del login, registros de seguridad y configuración segura.
- **Frontend:** formulario del informe y sus partes, pacientes, catálogos, listados, perfil, exportación a PDF, aviso de cambios sin guardar y autoguardado, cierre de sesión y dirección de la API.
- **Cypress:** manejan la aplicación real en un navegador (6 flujos críticos y 25 pruebas):
  1. inicio de sesión con cada rol y "Salir";
  2. crear y finalizar un informe con su PDF;
  3. agregar una adenda;
  4. el auditor no puede crear informes, ni en la pantalla ni por la API;
  5. el aviso de cambios sin guardar (D-13);
  6. los permisos D-2 y D-3.

  Buscan los elementos por rol, etiqueta o texto (`cy.findByRole`, `cy.findByLabelText`, `cy.findByText`), nunca por clases CSS. `npm run e2e` crea desde cero una base aparte (`backend/e2e_db.sqlite3`) y usa los puertos 8001 y 5174, así que no toca la base de desarrollo ni choca con `npm run dev` (D-17). Al terminar, en Windows es normal ver `exited with code 1` de los dos servidores: es el apagado.

---

## Formato y Linter

| Herramienta | Dónde | Qué hace |
|---|---|---|
| **Prettier** 3.9 | `frontend/` | Formato (comillas simples, punto y coma, 120 caracteres) |
| **ESLint** 9 | `frontend/` | Errores y malas prácticas, incluidas las reglas de los hooks de React |
| **Ruff** 0.16 | `backend/` | Formato y linter de Python (sin las migraciones) |

Antes de cada commit, desde la raíz:
```bash
npm run check
```
Revisa las cuatro cosas sin cambiar archivos. Para corregir el formato: `npm run format` en `frontend/` y `python -m ruff format .` en `backend/`. VS Code formatea al guardar con las mismas versiones (`.vscode/settings.json`).

---

## Referencia de la API REST

Todas las rutas exigen la cabecera `Authorization: Bearer <token>`, excepto el login y la renovación del token. Los listados vienen **paginados de 20 en 20** (`count`, `next`, `previous`, `results`); `?page_size=` admite hasta 1000.

### Autenticación y usuarios (`/api/auth/`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/auth/login/` | Iniciar sesión. Devuelve `access`, `refresh` y el usuario | Público (máx. 10 intentos/min) |
| POST | `/api/auth/refresh/` | Renovar el token. Devuelve un `refresh` nuevo; el anterior queda invalidado | Público |
| POST | `/api/auth/logout/` | Cerrar sesión: invalida el `refresh` enviado | Público (con el token de renovación) |
| GET / PATCH | `/api/auth/perfil/` | Ver o editar el perfil propio. El rol, el usuario y el registro médico no se cambian | Autenticado |
| POST | `/api/auth/cambiar-password/` | Cambiar la contraseña. Cierra las demás sesiones y devuelve tokens nuevos | Autenticado |
| POST | `/api/auth/registro/` | Crear un usuario con su rol y su `registro_medico` | Admin |
| GET | `/api/auth/usuarios/` | Listar usuarios | Admin |

### Catálogo (`/api/`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET / POST | `/api/categorias/` | Listar o crear categorías | Leer: todos · Escribir: patólogo/admin |
| GET / PUT / PATCH / DELETE | `/api/categorias/{id}/` | Ver, editar o borrar una categoría (no se borra si tiene patologías) | Igual |
| GET / POST | `/api/patologias/` | Listar o crear patologías (`?categoria=`, `?search=`, `?activa=`) | Igual |
| GET / PUT / PATCH / DELETE | `/api/patologias/{id}/` | Detalle con sus campos. No se borra si tiene informes (400) | Igual |
| GET / POST | `/api/plantillas/` | Listar o crear campos de formulario (`?patologia=`) | Igual |
| GET / PUT / PATCH / DELETE | `/api/plantillas/{id}/` | Ver, editar o borrar un campo | Igual |
| GET / POST | `/api/servicios/` | Listar o crear servicios (`?search=`, `?activo=`) | Igual |
| GET / PUT / PATCH / DELETE | `/api/servicios/{id}/` | Ver, editar, desactivar o borrar un servicio (no se borra si está en uso) | Igual |
| GET | `/api/opciones/` | Listas fijas: `sexos`, `tipos_documento` y `tipos_estudio` | Todos |

### Pacientes (`/api/pacientes/`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET / POST | `/api/pacientes/eps/` | Listar o crear EPS (`?search=`, `?activa=`) | Leer: todos · Escribir: patólogo/admin |
| GET / PUT / PATCH / DELETE | `/api/pacientes/eps/{id}/` | Ver, editar, desactivar o borrar una EPS (no se borra si está en uso) | Igual |
| GET / POST | `/api/pacientes/` | Listar o crear pacientes. `?q=` busca por documento, nombres y apellidos | Leer: todos · Crear: patólogo/admin |
| GET / PUT / PATCH | `/api/pacientes/{id}/` | Ver o editar un paciente | Leer: todos · Editar: patólogo/admin |
| DELETE | `/api/pacientes/{id}/` | Borrar un paciente sin informes (si tiene → 400) | Solo admin |
| GET | `/api/pacientes/{id}/informes/` | Historial de informes del paciente | Todos |

### Informes (`/api/informes/`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/informes/` | Listar informes. Filtros: `q`, `fecha_desde`, `fecha_hasta`, `estado`, `patologia`, `paciente`. Un valor no válido → 400 | Todos |
| POST | `/api/informes/` | Crear un informe (`paciente` obligatorio). El backend asigna `numero_peticion` y redacta la macroscópica | Patólogo / Admin |
| GET | `/api/informes/estadisticas/` | Totales `{total, borradores, finalizados}` | Todos |
| GET | `/api/informes/{id}/` | Ver un informe completo, con diagnósticos y adendas | Todos |
| PUT / PATCH | `/api/informes/{id}/` | Editar un borrador (finalizado → 400) | Autor / Admin |
| DELETE | `/api/informes/{id}/` | Borrar un borrador (finalizado → 400) | Autor / Admin |
| POST | `/api/informes/{id}/finalizar/` | Finalizar: firma, fecha de informe y datos congelados. Si faltan requisitos → 400 con la lista `requisitos` | Autor / Admin |
| GET / POST | `/api/informes/{id}/adendas/` | Ver o agregar adendas `{motivo, texto}` a un finalizado. Sin PUT, PATCH ni DELETE | Leer: todos · Crear: autor/admin con registro médico |
| GET | `/api/informes/{id}/pdf/` | Descargar el PDF. El de un borrador es una vista previa solo para su autor o un admin (403 para los demás) | Todos (finalizado) / Autor y Admin (borrador) |

La colección [`GyS_Control_API.postman_collection.json`](GyS_Control_API.postman_collection.json) se puede importar en Postman para probar estos endpoints.

---

## Seguridad

- **JWT** en la cabecera `Authorization`, nunca en la URL, con renovación automática y lista negra de tokens al cerrar sesión, renovar o cambiar la contraseña.
- **Permisos por rol y por autor** en el backend; el frontend solo oculta botones.
- **Límites de peticiones:** anónimas 30/min, usuarios 120/min, login 10/min y registro 5/min. Por IP cuenta la de la conexión, no `X-Forwarded-For` (`NUM_PROXIES` en `backend/.env`).
- **Contraseñas** con los validadores de Django.
- **Configuración segura por defecto:** sin `SECRET_KEY` no arranca y `DEBUG` es `False` si no se define. Con `DEBUG=False` se activan HTTPS, cookies seguras, HSTS y CORS restringido.
- **PDF:** el texto del usuario se escapa, y el nombre del archivo solo lleva el número de petición.
- **Integridad:** un documento finalizado no se modifica por ninguna vía y conserva los datos congelados (D-10, D-14, D-15).
- **Errores y registros:** un filtro no válido responde 400, no 500. Los errores 500 y los inicios de sesión (usuario e IP) se registran en la consola, nunca contraseñas, tokens ni datos personales (`LOG_LEVEL`).

Para publicar la app en un servidor: `SECRET_KEY` propia, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `NUM_PROXIES`, PostgreSQL, un límite de tamaño de petición en el servidor web y servir `media/`. Las auditorías heredadas ([inicial](docs/historial-patholab/auditoria-inicial.md) y [OWASP Top 10:2025](docs/historial-patholab/auditoria-owasp.md)) listan lo protegido y lo pendiente.

---

## Documentación del Proyecto

| Archivo | Contenido |
|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | Registro de cada cambio de GyS Control: fecha, qué se cambió y por qué |
| [`docs/decisiones.md`](docs/decisiones.md) | Decisiones vigentes: las heredadas de PathoLab (D-1 a D-17) y las de GyS Control (G-x) |
| [`docs/progreso.md`](docs/progreso.md) | Estado del trabajo, pendientes y siguiente paso |
| [`docs/historial-patholab/`](docs/historial-patholab/) | Documentos de PathoLab: auditorías, decisiones completas, propuesta del informe v2, plan de calidad, progreso y registro de cambios |

---

## Hoja de Ruta

La transformación del dominio se planeará por fases. Ninguna está empezada:

- [ ] **Clientes**: empresas y personas que contratan el servicio, con sus sedes.
- [ ] **Servicios de control de plagas**: programación, ejecución, informe del servicio y **certificado en PDF**, sobre la base de firma, adendas y documentos inmutables que ya existe.
- [ ] **Inventario de plaguicidas**: productos, lotes, existencias y consumo por servicio.
- [ ] **Agenda**: calendario de servicios por técnico.
- [ ] **Adaptar lo heredado**: roles, catálogos, encabezado del PDF (`LABORATORIO_*` → datos de la empresa) y textos legales definitivos (Ley 1581 de 2012), y retirar lo propio de la patología cuando ya no se use.
- [ ] **Pendientes de seguridad heredados**: grupos 4, 6 (D-16) y 7 de la auditoría OWASP y lo necesario para producción.
- [ ] **Contenedores Docker**: `Dockerfile` y `docker-compose.yml` para desplegar en un solo paso.

---

## Autor y Contacto

- **Proyecto**: GyS Control (a partir de PathoLab)
- **Desarrollado por**: Juan Salamanca ([@juansalamanca01-glitch](https://github.com/juansalamanca01-glitch))
- **Institución**: Unicatólica
