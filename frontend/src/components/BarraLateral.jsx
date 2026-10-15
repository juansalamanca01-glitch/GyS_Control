import { Link, NavLink } from 'react-router-dom';
import { MODULOS } from '../modulos';
import Icono from './Icono';

// Barra lateral: la marca, los módulos y, al pie, las páginas legales. En el celular se abre
// con el botón de menú de la barra superior; onNavegar la cierra al elegir una opción.
export default function BarraLateral({ id, onNavegar }) {
  return (
    <aside id={id} className="barra-lateral">
      <div className="barra-lateral-marca">
        <span className="marca-cuadro">
          <Icono nombre="marca" />
        </span>
        <span>GyS Control</span>
      </div>

      <nav aria-label="Módulos">
        <ul className="barra-lateral-modulos">
          <li>
            <NavLink to="/" end onClick={onNavegar}>
              <Icono nombre="inicio" />
              Inicio
            </NavLink>
          </li>
          {MODULOS.map((modulo) => (
            <li key={modulo.ruta}>
              <NavLink to={modulo.ruta} onClick={onNavegar}>
                <Icono nombre={modulo.icono} />
                {modulo.nombre}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="barra-lateral-pie">
        <Link to="/politica-privacidad" onClick={onNavegar}>
          Política de Privacidad
        </Link>
        <Link to="/terminos-condiciones" onClick={onNavegar}>
          Términos y Condiciones
        </Link>
        <small>© {new Date().getFullYear()} GyS Control</small>
      </div>
    </aside>
  );
}
