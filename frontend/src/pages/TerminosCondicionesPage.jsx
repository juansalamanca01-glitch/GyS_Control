// Fecha fija: cambia solo cuando cambia el texto (antes mostraba la fecha del día en que se abría).
const ULTIMA_ACTUALIZACION = '15 de octubre de 2026';

export default function TerminosCondicionesPage() {
  return (
    <div className="legal-page">
      <div className="card">
        <div className="card-body">
          <h1>Términos y Condiciones de Uso</h1>
          <p className="text-muted">Última actualización: {ULTIMA_ACTUALIZACION}</p>

          <div className="alert alert-info">
            GyS Control está en desarrollo y estos términos están en preparación. La versión definitiva debe revisarla
            una asesoría legal antes de usar el sistema en un entorno de producción.
          </div>

          <h2>1. Aceptación de los términos</h2>
          <p>
            El acceso y uso de GyS Control implica la aceptación de estos términos y de la Política de Privacidad. El
            acceso está restringido al personal autorizado por la empresa.
          </p>

          <h2>2. Cuentas y credenciales</h2>
          <p>
            Cada usuario es responsable de mantener la confidencialidad de su contraseña y de toda actividad realizada
            desde su cuenta. Las cuentas las crea únicamente un administrador; no se permite el autorregistro público,
            para evitar accesos no autorizados al sistema.
          </p>

          <h2>3. Uso adecuado del sistema</h2>
          <p>
            Está prohibido intentar vulnerar los mecanismos de seguridad del sistema (autenticación, límites de
            solicitudes, permisos por rol, etc.).
          </p>

          <h2>4. Modificaciones</h2>
          <p>
            Estos términos pueden actualizarse periódicamente. El uso continuado del sistema tras una actualización
            implica la aceptación de los nuevos términos.
          </p>
        </div>
      </div>
    </div>
  );
}
