"""
Registro de los inicios de sesión (hallazgo O-21 de docs/historial-patholab/auditoria-owasp.md).

Se escribe en el logger `seguridad` (LOGGING en config/settings.py): el usuario y la IP,
nunca la contraseña ni los tokens. Es la base para detectar muchos fallos seguidos.
Los receptores se conectan en AccountsConfig.ready() (accounts/apps.py).
"""

import logging

from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from rest_framework.throttling import BaseThrottle

logger = logging.getLogger('seguridad')

# Un usuario de Django tiene como máximo 150 caracteres; lo demás no se registra.
MAX_LARGO_USUARIO = 150


def ip_de(request):
    """IP del cliente, igual que la usan los límites de peticiones (respeta NUM_PROXIES, O-17)."""
    if request is None:
        return 'desconocida'
    return BaseThrottle().get_ident(request)


def usuario_para_registro(nombre):
    """El nombre tal como lo escribió el cliente, recortado y en una sola línea (sin inyectar líneas falsas)."""
    texto = str(nombre or '')[:MAX_LARGO_USUARIO]
    return texto.replace('\r', ' ').replace('\n', ' ') or '(vacío)'


def registrar_login_correcto(request, nombre):
    logger.info('Inicio de sesión correcto: usuario=%s ip=%s', usuario_para_registro(nombre), ip_de(request))


@receiver(user_login_failed)
def login_fallido(sender, credentials, request=None, **kwargs):
    # Django ya oculta la contraseña en `credentials`; de todos modos solo se usa el usuario.
    logger.warning(
        'Inicio de sesión fallido: usuario=%s ip=%s',
        usuario_para_registro(credentials.get('username')),
        ip_de(request),
    )


@receiver(user_logged_in)
def login_correcto(sender, request, user, **kwargs):
    # Lo emite el login con sesión de Django (/admin/). El de la API lo registra CustomTokenView.
    registrar_login_correcto(request, user.get_username())
