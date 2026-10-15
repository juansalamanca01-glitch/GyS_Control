import { useState } from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import EstructuraApp from './components/EstructuraApp';
import Footer from './components/Footer';
import { MODULOS } from './modulos';
import LoginPage from './pages/LoginPage';
import InicioPage from './pages/InicioPage';
import ProximamentePage from './pages/ProximamentePage';
import PerfilPage from './pages/PerfilPage';
import PoliticaPrivacidadPage from './pages/PoliticaPrivacidadPage';
import TerminosCondicionesPage from './pages/TerminosCondicionesPage';
import CerrarSesionPage from './pages/CerrarSesionPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-center">
        <span className="spinner"></span>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <EstructuraApp>{children}</EstructuraApp>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// Las páginas legales son visibles tanto autenticado como sin autenticar.
// Sin sesión no hay barra lateral: se ofrece volver al login y el pie con los enlaces legales.
function LegalRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return (
      <>
        <main className="legal-sin-sesion">
          <p className="legal-volver">
            <Link to="/login">← Volver al inicio de sesión</Link>
          </p>
          {children}
        </main>
        <Footer />
      </>
    );
  }
  return <EstructuraApp>{children}</EstructuraApp>;
}

// Router de datos (createBrowserRouter): lo necesita useBlocker, con el que una pantalla
// avisa antes de salir si hay cambios sin guardar (decisión D-13).
// Las pantallas heredadas de PathoLab (informes de patología, pacientes, patologías y
// catálogos) se quitaron (decisión G-3); sus rutas viejas llevan al Inicio por la ruta "*".
const rutas = createRoutesFromElements(
  <>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route path="/salir" element={<CerrarSesionPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <InicioPage />
        </ProtectedRoute>
      }
    />
    {MODULOS.map((modulo) => (
      <Route
        key={modulo.ruta}
        path={modulo.ruta}
        element={
          <ProtectedRoute>
            <ProximamentePage modulo={modulo} />
          </ProtectedRoute>
        }
      />
    ))}
    <Route
      path="/perfil"
      element={
        <ProtectedRoute>
          <PerfilPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/politica-privacidad"
      element={
        <LegalRoute>
          <PoliticaPrivacidadPage />
        </LegalRoute>
      }
    />
    <Route
      path="/terminos-condiciones"
      element={
        <LegalRoute>
          <TerminosCondicionesPage />
        </LegalRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </>,
);

export default function App() {
  // Se crea al montar la app (y no al importar el módulo), para que lea la dirección actual.
  const [router] = useState(() => createBrowserRouter(rutas));
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
