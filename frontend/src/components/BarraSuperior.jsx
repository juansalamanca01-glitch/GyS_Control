import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_LABELS } from '../constants';
import Icono from './Icono';

// Barra superior: botón de menú (solo en el celular), título de la sección, usuario y "Salir".
export default function BarraSuperior({ titulo, menuAbierto, onAlternarMenu, idMenu }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // La sesión se cierra en /salir (D-13): si una pantalla tiene cambios sin guardar,
  // su aviso aparece antes, con la sesión todavía abierta.
  const salir = () => navigate('/salir');

  return (
    <header className="barra-superior">
      <button
        type="button"
        className="barra-superior-menu"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuAbierto}
        aria-controls={idMenu}
        onClick={onAlternarMenu}
      >
        <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} />
      </button>
      <span className="barra-superior-titulo">{titulo}</span>
      <Link to="/perfil" className="barra-superior-usuario" title="Mi cuenta">
        <span className="usuario-nombre">{user?.nombre_completo || user?.username}</span>
        <span className="usuario-rol">{ROL_LABELS[user?.rol] || user?.rol}</span>
      </Link>
      <button type="button" className="btn btn-outline btn-sm" onClick={salir}>
        Salir
      </button>
    </header>
  );
}
