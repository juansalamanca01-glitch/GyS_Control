# Decisiones del proyecto

Aquí se registran las decisiones de diseño y de reglas de negocio de GyS Control. El código y la documentación deben respetarlas (regla 5 de `CLAUDE.md`). Para cambiar una decisión, se agrega una entrada nueva que la reemplace; no se borra la anterior.

---

## Decisiones heredadas de PathoLab

GyS Control nace de la base de PathoLab (2026-10-15). El código que se conservó (usuarios, roles, informes, pacientes, PDF, firma, adendas y pruebas) sigue cumpliendo estas decisiones, que **siguen vigentes** mientras ese código exista. Su texto completo, con la fecha y el motivo, está en [`historial-patholab/decisiones.md`](historial-patholab/decisiones.md). Cuando la transformación del dominio reemplace una parte, se registrará aquí la decisión nueva que la sustituya.

| Código | Resumen | Estado |
|---|---|---|
| D-1 | Los patólogos también administran el catálogo (patologías, plantillas y categorías) | Vigente |
| D-2 | Solo el autor o un administrador edita, borra o finaliza un informe | Vigente |
| D-3 | Un informe finalizado no se edita ni se borra por la API, ni siquiera un administrador (la excepción de `/admin/` la reemplazó D-14) | Vigente |
| D-4 | Las patologías se desactivan en lugar de borrarse (D-11 lo extiende a las EPS y los servicios) | Vigente |
| D-5 | El foro trae temas iniciales | **Retirada** el 2026-10-15: el foro se quitó |
| D-6 | Cerrar sesión o cambiar la contraseña invalida el token de renovación (lista negra) | Vigente |
| D-7 | El número de petición `P-AÑO-NNNNN` lo genera el sistema con un contador atómico | Vigente |
| D-8 | El registro médico solo lo asigna un administrador; el informe lo firma su autor; requisitos para finalizar | Vigente |
| D-9 | Un informe finalizado se corrige con adendas, que no se editan ni se borran | Vigente |
| D-10 | Al finalizar se congelan los datos que imprime el informe (`datos_finalizacion`) | Vigente |
| D-11 | Permisos sobre pacientes, EPS y servicios; solo un administrador borra pacientes | Vigente |
| D-12 | El PDF de un borrador es una vista previa solo para su autor o un administrador | Vigente |
| D-13 | Aviso al salir con cambios sin guardar y autoguardado de los borradores existentes | Vigente |
| D-14 | Un informe finalizado tampoco se modifica ni se borra desde `/admin/` | Vigente |
| D-15 | El encabezado del PDF se congela al finalizar | Vigente |
| D-16 | Cuentas: solo `is_active` y token de acceso de 30 minutos | Decidida, **sin implementar** |
| D-17 | Pruebas de Cypress con su propia base (`e2e_db.sqlite3`), puertos 8001 y 5174, fuera de la regla 7 | Vigente |

Los códigos de hallazgos (`C-x`, `I-x`, `M-x` y `O-x`) que aparecen en el código remiten a [`historial-patholab/auditoria-inicial.md`](historial-patholab/auditoria-inicial.md) y [`historial-patholab/auditoria-owasp.md`](historial-patholab/auditoria-owasp.md).

---

## Decisiones de GyS Control

### G-1. GyS Control nace de la base de PathoLab y se transforma por fases

- **Fecha:** 2026-10-15
- **Decisión:**
  - El proyecto se llama **GyS Control**: un sistema de gestión para empresas de control de plagas (servicios, informes y certificados en PDF, inventario de plaguicidas y agenda).
  - La primera limpieza (2026-10-15) quita el foro, el nombre PathoLab y los textos legales de PathoLab. Conserva usuarios, roles, login, seguridad, informes, pacientes, PDF, firma, adendas y toda la infraestructura de pruebas, incluido Cypress.
  - La documentación propia de PathoLab se mueve a `docs/historial-patholab/` y no se borra.
  - Las variables `LABORATORIO_*` y la clave `laboratorio` de `datos_finalizacion` conservan su nombre hasta la transformación del dominio, porque renombrarlas exige una migración de datos sobre los informes finalizados (D-15). Las migraciones existentes no se modifican.
  - La transformación del dominio (clientes, servicios, inventario y agenda) se planea después, por fases.
- **Motivo:** el usuario presenta las pruebas automáticas y Cypress el 2026-10-16 con este proyecto. Una limpieza segura, sin cambiar el comportamiento de lo que se conserva, mantiene las pruebas en verde.
