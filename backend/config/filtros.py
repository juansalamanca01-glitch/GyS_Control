"""
Lectura de los parámetros de filtro de la URL (hallazgo O-22 de docs/auditoria-owasp.md).

Un valor que no es un número o una fecha llegaba sin revisar a `filter()` y el ORM
respondía 500. Estas funciones lo comprueban antes y responden 400 con un mensaje
en español, con el nombre del parámetro como clave (como los errores de DRF).
"""

from datetime import date

from rest_framework.exceptions import ValidationError

# Los ids son BigAutoField: un número mayor no cabe en la columna (SQLite lanza OverflowError).
MAX_ID = 2**63 - 1


def parametro_entero(request, nombre):
    """Devuelve ?<nombre>= como id (entero positivo), o None si no viene o está vacío."""
    valor = request.query_params.get(nombre, '').strip()
    if not valor:
        return None
    # isascii(): isdigit() también acepta cifras como «²», que int() no convierte.
    if not (valor.isascii() and valor.isdigit()) or not 0 < int(valor) <= MAX_ID:
        raise ValidationError({nombre: 'Debe ser un número entero positivo.'})
    return int(valor)


def parametro_fecha(request, nombre):
    """Devuelve ?<nombre>= como fecha (AAAA-MM-DD), o None si no viene o está vacío."""
    valor = request.query_params.get(nombre, '').strip()
    if not valor:
        return None
    try:
        return date.fromisoformat(valor)
    except ValueError:
        raise ValidationError({nombre: 'Debe ser una fecha válida con el formato AAAA-MM-DD.'}) from None
