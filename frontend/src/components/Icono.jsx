// Íconos de línea de la interfaz (decorativos: el texto de al lado dice qué son).
const TRAZOS = {
  inicio: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  clientes: (
    <>
      <path d="M3 21V8l6-4v17M9 21h12V11l-6-3" />
      <path d="M13 13h4M13 17h4M5 12h2M5 16h2" />
    </>
  ),
  servicios: (
    <>
      <path d="M9 21h6v-9H9zM10 12V9h4v3M12 9V5h5M17 3v4" />
      <path d="M19 4h2M19 6l1.5 1" />
    </>
  ),
  agenda: <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" />,
  inventario: <path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" />,
  informes: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" />,
  metricas: <path d="M3 21h18M6 17v-5M11 17V7M16 17v-8M21 17V4" />,
  marca: <path d="M12 3v18M3 12h18M6 6l12 12" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  cerrar: <path d="M5 5l14 14M19 5L5 19" />,
};

export default function Icono({ nombre, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
