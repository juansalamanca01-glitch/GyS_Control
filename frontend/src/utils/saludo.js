// Saludo y fecha del Inicio, con la hora de Colombia (la zona del sistema, America/Bogota).
const ZONA = 'America/Bogota';

export function saludoSegunHora(hora) {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function horaEnBogota(fecha = new Date()) {
  return Number(new Intl.DateTimeFormat('es-CO', { hour: 'numeric', hourCycle: 'h23', timeZone: ZONA }).format(fecha));
}

// "Jueves, 15 de octubre de 2026"
export function fechaLarga(fecha = new Date()) {
  const texto = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA,
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
