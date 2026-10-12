from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Conecta los receptores que registran los inicios de sesión (hallazgo O-21).
        from . import signals  # noqa: F401
