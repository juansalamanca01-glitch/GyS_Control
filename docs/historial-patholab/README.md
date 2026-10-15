# Historial de PathoLab

GyS Control nace de la base de PathoLab, un sistema de informes de anatomía patológica desarrollado por el mismo autor. Esta carpeta guarda, sin cambios, los documentos propios de PathoLab, tal como estaban el 2026-10-14 (commit `c0b8f34` de `main`). Se movieron aquí el 2026-10-15 en lugar de borrarse.

| Archivo | Contenido |
|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | Registro de cambios de PathoLab, hasta la fase de Cypress |
| [`progreso.md`](progreso.md) | Último estado del trabajo de PathoLab, con sus pendientes |
| [`decisiones.md`](decisiones.md) | Texto completo de las decisiones D-1 a D-17. Las vigentes se resumen en [`../decisiones.md`](../decisiones.md) |
| [`auditoria-inicial.md`](auditoria-inicial.md) | Auditoría del código, hallazgos `C-x`, `I-x` y `M-x` |
| [`auditoria-owasp.md`](auditoria-owasp.md) | Auditoría de seguridad OWASP Top 10:2025, hallazgos `O-1` a `O-23` |
| [`propuesta-informe-v2.md`](propuesta-informe-v2.md) | Diseño del informe de anatomía patológica v2 (pacientes, solicitud, diagnósticos, firma, PDF y adendas) |
| [`plan-calidad-y-diseno.md`](plan-calidad-y-diseno.md) | Plan por fases (herramientas de calidad, OWASP, Cypress y rediseño) |

Los documentos se dejaron como estaban: las rutas que citan entre sí (`docs/decisiones.md`, `docs/auditoria-owasp.md`…) son las de antes de moverlos, y hoy están en esta carpeta. Los comentarios del código ya apuntan aquí.
