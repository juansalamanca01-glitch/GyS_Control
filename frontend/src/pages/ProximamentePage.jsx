import { Link } from 'react-router-dom';

// Página de un módulo que todavía no existe: su nombre y, en dos líneas, qué hará.
export default function ProximamentePage({ modulo }) {
  return (
    <div className="proximamente">
      <div className="proximamente-titulo">
        <h1>{modulo.nombre}</h1>
        <span className="etiqueta-proximamente">Próximamente</span>
      </div>
      <p>{modulo.descripcion}</p>
      <div>
        <Link to="/" className="btn btn-outline btn-sm">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
