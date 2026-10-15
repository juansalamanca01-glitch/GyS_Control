import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INDICADORES, MODULOS } from '../modulos';
import { fechaLarga, horaEnBogota, saludoSegunHora } from '../utils/saludo';
import Icono from '../components/Icono';

// Inicio: saludo, indicadores (todavía sin datos) y accesos rápidos a los módulos.
export default function InicioPage() {
  const { user } = useAuth();
  const nombre = user?.nombre_completo || user?.username;

  return (
    <div className="inicio">
      <div className="inicio-saludo">
        <h1>
          {saludoSegunHora(horaEnBogota())}, {nombre}
        </h1>
        <p className="text-muted">{fechaLarga()}</p>
      </div>

      <section className="inicio-bloque" aria-labelledby="titulo-indicadores">
        <h2 id="titulo-indicadores">Indicadores</h2>
        <ul className="indicadores">
          {INDICADORES.map((indicador) => (
            <li key={indicador.nombre} className="indicador">
              <div className="indicador-cabecera">
                <h3>{indicador.nombre}</h3>
                <span className="etiqueta-proximamente">Próximamente</span>
              </div>
              <p className="indicador-valor">
                <span aria-hidden="true">—</span>
                <span className="visualmente-oculto">Sin datos todavía.</span>
                <small>{indicador.unidad}</small>
              </p>
              <p className="indicador-explicacion">{indicador.explicacion}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="inicio-bloque" aria-labelledby="titulo-accesos">
        <h2 id="titulo-accesos">Accesos rápidos</h2>
        <ul className="accesos">
          {MODULOS.map((modulo) => (
            <li key={modulo.ruta}>
              <Link to={modulo.ruta}>
                <Icono nombre={modulo.icono} className="acceso-icono" />
                <span className="acceso-nombre">{modulo.nombre}</span>
                <span className="etiqueta-proximamente">Próximamente</span>
                <span className="acceso-resumen">{modulo.resumen}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
