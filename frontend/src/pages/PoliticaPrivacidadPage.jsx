// Fecha fija: cambia solo cuando cambia el texto (antes mostraba la fecha del día en que se abría).
const ULTIMA_ACTUALIZACION = '15 de octubre de 2026';

export default function PoliticaPrivacidadPage() {
  return (
    <div className="legal-page">
      <div className="card">
        <div className="card-body">
          <h1>Política de Privacidad</h1>
          <p className="text-muted">Última actualización: {ULTIMA_ACTUALIZACION}</p>

          <div className="alert alert-info">
            GyS Control está en desarrollo y esta política está en preparación. La versión definitiva se redactará
            cuando el sistema gestione los datos de los clientes y de los servicios de control de plagas, y debe
            revisarla un abogado antes de usar el sistema con datos reales, conforme a la Ley 1581 de 2012 y el Decreto
            1377 de 2013 (protección de datos personales en Colombia).
          </div>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            La empresa que opera GyS Control es la responsable del tratamiento de los datos personales que registran sus
            usuarios en el sistema.
          </p>

          <h2>2. Datos de prueba</h2>
          <p>
            Mientras el sistema está en desarrollo, todos los datos que contiene son ficticios y se usan solo para
            pruebas.
          </p>

          <h2>3. Seguridad de la información</h2>
          <p>
            Se aplican controles técnicos como autenticación mediante tokens (JWT) enviados en la cabecera de cada
            petición, contraseñas almacenadas con hash, control de acceso basado en roles, límites de solicitudes (rate
            limiting) para prevenir abusos y restricciones de origen (CORS).
          </p>

          <h2>4. Contacto</h2>
          <p>
            Para resolver dudas sobre el tratamiento de los datos, comuníquese con el administrador del sistema en su
            empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
