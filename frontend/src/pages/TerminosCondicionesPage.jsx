// Fecha fija: cambia solo cuando cambia el texto (antes mostraba la fecha del día en que se abría).
const ULTIMA_ACTUALIZACION = '5 de octubre de 2026';

export default function TerminosCondicionesPage() {
  return (
    <div className="legal-page">
      <div className="card">
        <div className="card-body">
          <h1>Términos y Condiciones de Uso</h1>
          <p className="text-muted">Última actualización: {ULTIMA_ACTUALIZACION}</p>

          <div className="alert alert-info">
            Este texto es una plantilla de referencia y debe ser revisado por asesoría legal antes de su uso en un
            entorno de producción con pacientes reales.
          </div>

          <h2>1. Aceptación de los términos</h2>
          <p>
            El acceso y uso de PathoLab implica la aceptación plena de estos términos y de la Política de Privacidad. El
            acceso está restringido a personal autorizado por la institución (patólogos, auditores y administradores).
          </p>

          <h2>2. Cuentas y credenciales</h2>
          <p>
            Cada usuario es responsable de mantener la confidencialidad de su contraseña y de toda actividad realizada
            desde su cuenta. Las cuentas son creadas únicamente por un administrador; no se permite el autoregistro
            público, precisamente para evitar accesos no autorizados al sistema.
          </p>

          <h2>3. Uso adecuado del sistema</h2>
          <ul>
            <li>Los informes de patología deben registrarse con información veraz y completa.</li>
            <li>
              Está prohibido intentar vulnerar los mecanismos de seguridad del sistema (autenticación, límites de
              solicitudes, permisos por rol, etc.).
            </li>
          </ul>

          <h2>4. Roles y permisos</h2>
          <p>
            El sistema define roles (administrador, patólogo, auditor) con distintos niveles de acceso. Los patólogos
            pueden crear y gestionar patologías, categorías e informes; los auditores tienen acceso de solo lectura; los
            administradores gestionan los usuarios.
          </p>

          <h2>5. Disponibilidad del servicio</h2>
          <p>
            Se procura la disponibilidad continua del sistema, sin perjuicio de labores de mantenimiento programado o
            eventos de fuerza mayor.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            PathoLab es una herramienta de apoyo para la generación y gestión de informes; la responsabilidad clínica y
            diagnóstica final corresponde al profesional de la salud que firma y finaliza cada informe.
          </p>

          <h2>7. Modificaciones</h2>
          <p>
            Estos términos pueden actualizarse periódicamente. El uso continuado del sistema tras una actualización
            implica la aceptación de los nuevos términos.
          </p>
        </div>
      </div>
    </div>
  );
}
