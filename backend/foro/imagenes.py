"""
Validación y limpieza de las imágenes del foro (hallazgos O-13 y O-5 de docs/auditoria-owasp.md).

Las usan la subida por la API (`PublicacionViewSet.subir_imagenes`) y `/admin/` (`ImagenPublicacionForm`).
"""

import io
import os

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, ImageSequence

# Extensiones que se aceptan en el nombre del archivo.
EXTENSIONES_PERMITIDAS = ('.jpg', '.jpeg', '.png', '.gif', '.webp')

# Formatos reales (los que detecta Pillow) que se aceptan, con la extensión con la que se guardan.
FORMATOS_PERMITIDOS = {'JPEG': 'jpg', 'PNG': 'png', 'GIF': 'gif', 'WEBP': 'webp'}

TEXTO_FORMATOS = 'JPG, PNG, GIF o WEBP'

# Datos de `Image.info` que hacen falta para volver a dibujar la imagen igual.
# Todo lo demás (EXIF, XMP, perfiles, comentarios, texto de PNG) se descarta.
INFO_CONSERVADA = ('transparency', 'duration', 'loop', 'background')


def preparar_imagen(archivo):
    """
    Revisa una imagen subida y devuelve una copia limpia, lista para guardar.

    - Rechaza (ValidationError) si supera `FORO_MAX_TAMANO_IMAGEN`, si su extensión no está
      en `EXTENSIONES_PERMITIDAS` o si su formato real no está en `FORMATOS_PERMITIDOS`.
    - Vuelve a codificar la imagen con Pillow: se pierde todo lo que no sea la imagen
      (por ejemplo, HTML agregado al final) y los metadatos EXIF. La orientación del EXIF
      se aplica antes, para que las fotos no queden giradas. Las animaciones se conservan.
    - El nombre devuelto solo lleva la extensión del formato real; el nombre definitivo,
      aleatorio, lo pone `ruta_imagen_publicacion`.
    """
    nombre = archivo.name or ''
    limite = settings.FORO_MAX_TAMANO_IMAGEN
    if archivo.size > limite:
        raise ValidationError(f'«{nombre}» supera el tamaño máximo de {limite / (1024 * 1024):g} MB.')

    if os.path.splitext(nombre)[1].lower() not in EXTENSIONES_PERMITIDAS:
        raise ValidationError(f'«{nombre}» no es un formato permitido. Use {TEXTO_FORMATOS}.')

    try:
        archivo.seek(0)
        imagen = Image.open(archivo)
        formato = imagen.format
        if formato not in FORMATOS_PERMITIDOS:
            raise ValidationError(f'«{nombre}» no es un formato permitido. Use {TEXTO_FORMATOS}.')
        contenido = _volver_a_codificar(imagen, formato)
    except ValidationError:
        raise
    except Exception as error:
        # Pillow lanza varios tipos de error con un archivo dañado o que no es una imagen
        # (UnidentifiedImageError, OSError, DecompressionBombError, ValueError…).
        raise ValidationError(f'«{nombre}» no es una imagen válida.') from error

    return ContentFile(contenido, name=f'imagen.{FORMATOS_PERMITIDOS[formato]}')


def _volver_a_codificar(imagen, formato):
    """Guarda de nuevo la imagen en su formato, sin metadatos. Devuelve los bytes."""
    info = {clave: imagen.info[clave] for clave in INFO_CONSERVADA if clave in imagen.info}
    animada = getattr(imagen, 'n_frames', 1) > 1
    opciones = {'quality': 90} if formato == 'JPEG' else {}

    if animada:
        cuadros = [cuadro.copy() for cuadro in ImageSequence.Iterator(imagen)]
        opciones.update(save_all=True, append_images=cuadros[1:])
    else:
        cuadros = [ImageOps.exif_transpose(imagen)]

    primero = cuadros[0]
    # `exif_transpose` y `copy` copian `info`; se reemplaza por la lista blanca para no arrastrar metadatos.
    primero.info = dict(info)
    buffer = io.BytesIO()
    primero.save(buffer, format=formato, **{**info, **opciones})
    return buffer.getvalue()
