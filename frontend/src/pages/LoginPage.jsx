import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import Icono from '../components/Icono';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales inválidas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-marca">
        <div className="login-logo">
          <span className="marca-cuadro">
            <Icono nombre="marca" />
          </span>
          <span>GyS Control</span>
        </div>
        <p className="login-lema">Gestión de servicios de control de plagas</p>
        <span className="login-raya" aria-hidden="true"></span>
        <p className="login-texto">
          Clientes, servicios, agenda de visitas, inventario de plaguicidas e informes en un solo lugar.
        </p>
      </div>

      <div className="login-panel">
        <form onSubmit={handleSubmit} className="login-form">
          <h1>Iniciar sesión</h1>
          <p className="text-muted">Ingrese con su usuario de GyS Control.</p>

          {/* role="alert": los lectores de pantalla anuncian el error al aparecer. */}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Iniciar Sesión'}
          </button>
          <p className="login-restringido">Acceso restringido a personal autorizado.</p>
        </form>

        {/* La política de privacidad y los términos se pueden leer antes de iniciar sesión. */}
        <Footer />
      </div>
    </div>
  );
}
