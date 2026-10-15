import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tituloDeRuta } from '../modulos';
import BarraLateral from './BarraLateral';
import BarraSuperior from './BarraSuperior';

const ID_MENU = 'barra-lateral';

// Estructura de las pantallas con sesión: barra lateral, barra superior y área de trabajo.
export default function EstructuraApp({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const cerrarMenu = () => setMenuAbierto(false);

  // Con el menú abierto en el celular, Escape lo cierra.
  useEffect(() => {
    if (!menuAbierto) return undefined;
    const alPulsar = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false);
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [menuAbierto]);

  return (
    <div className={`app${menuAbierto ? ' menu-abierto' : ''}`}>
      <BarraLateral id={ID_MENU} onNavegar={cerrarMenu} />
      {menuAbierto && <div className="velo-menu" onClick={cerrarMenu} aria-hidden="true" />}
      <div className="app-trabajo">
        <BarraSuperior
          titulo={tituloDeRuta(pathname)}
          menuAbierto={menuAbierto}
          onAlternarMenu={() => setMenuAbierto((abierto) => !abierto)}
          idMenu={ID_MENU}
        />
        <main className="app-contenido">{children}</main>
      </div>
    </div>
  );
}
