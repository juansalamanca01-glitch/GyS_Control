// Módulos de GyS Control (etapa 1 de docs/plan-interfaz.md). De esta lista salen la barra
// lateral, los accesos rápidos del Inicio y las rutas. Mientras un módulo no exista, su ruta
// abre la página "Próximamente" con su descripción (dos líneas). Los textos son una propuesta:
// se ajustan después de entrevistar al técnico (etapa 3).
export const MODULOS = [
  {
    ruta: '/clientes',
    nombre: 'Clientes',
    icono: 'clientes',
    resumen: 'Clientes y sus sedes.',
    descripcion:
      'Registrará los clientes y sus sedes, con contacto, dirección y tipo de establecimiento. Desde cada sede se verá su historial de servicios.',
  },
  {
    ruta: '/servicios',
    nombre: 'Servicios',
    icono: 'servicios',
    resumen: 'Órdenes de servicio y productos aplicados.',
    descripcion:
      'Registrará cada servicio de control de plagas: tipo de servicio, plaga objetivo, productos aplicados y técnico responsable. Al cerrarlo se generará su informe.',
  },
  {
    ruta: '/agenda',
    nombre: 'Agenda',
    icono: 'agenda',
    resumen: 'Visitas programadas por técnico y sede.',
    descripcion:
      'Programará las visitas por técnico y por sede, incluidas las periódicas de cada contrato. Mostrará las visitas del día y las pendientes.',
  },
  {
    ruta: '/inventario',
    nombre: 'Inventario',
    icono: 'inventario',
    resumen: 'Plaguicidas por lote y vencimiento.',
    descripcion:
      'Llevará las existencias de plaguicidas por lote, con registro sanitario, fecha de vencimiento y consumo en cada servicio. Avisará de los productos próximos a vencer.',
  },
  {
    ruta: '/informes',
    nombre: 'Informes',
    icono: 'informes',
    resumen: 'Informes y certificados en PDF.',
    descripcion:
      'Generará los informes de servicio y los certificados en PDF, firmados por el técnico responsable. Se crearán a partir de los servicios cerrados.',
  },
  {
    ruta: '/metricas',
    nombre: 'Métricas',
    icono: 'metricas',
    resumen: 'Indicadores de la operación.',
    descripcion:
      'Mostrará los indicadores de la operación con datos reales: servicios por mes, cumplimiento de la agenda, consumo de productos y clientes activos.',
  },
];

// Indicadores del Inicio. Sin cifras hasta que existan los módulos (etapa 4 del plan):
// se muestran con "—" y la etiqueta "Próximamente", nunca con números inventados.
export const INDICADORES = [
  { nombre: 'Servicios del mes', unidad: 'servicios', explicacion: 'Servicios realizados en el mes, por tipo.' },
  { nombre: 'Clientes activos', unidad: 'clientes', explicacion: 'Clientes con contrato o servicio vigente.' },
  { nombre: 'Productos por vencer', unidad: 'lotes', explicacion: 'Lotes de plaguicida que vencen en 60 días.' },
  { nombre: 'Próximas visitas', unidad: 'visitas', explicacion: 'Visitas programadas en los próximos 7 días.' },
];

// Título de la barra superior para cada ruta.
const TITULOS = {
  '/': 'Inicio',
  '/perfil': 'Mi cuenta',
  '/politica-privacidad': 'Política de Privacidad',
  '/terminos-condiciones': 'Términos y Condiciones',
  ...Object.fromEntries(MODULOS.map((m) => [m.ruta, m.nombre])),
};

export const tituloDeRuta = (ruta) => TITULOS[ruta] ?? 'GyS Control';
