import importlib.util
import os
from pathlib import Path
from unittest import mock

import decouple
from django.test import SimpleTestCase

RUTA_SETTINGS = Path(__file__).resolve().parent / 'settings.py'


def cargar_settings(variables_entorno):
    """
    Carga config/settings.py como un módulo nuevo, simulando que NO existe el
    archivo .env y que el entorno solo tiene las variables indicadas.
    No afecta a la configuración con la que corren las demás pruebas.
    """
    sin_env = decouple.Config(decouple.RepositoryEmpty())
    entorno = {k: v for k, v in os.environ.items() if k not in ('SECRET_KEY', 'DEBUG')}
    entorno.update(variables_entorno)
    with mock.patch.object(decouple, 'config', sin_env), mock.patch.dict(os.environ, entorno, clear=True):
        spec = importlib.util.spec_from_file_location('settings_prueba', RUTA_SETTINGS)
        modulo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modulo)
    return modulo


class ValoresPorDefectoSegurosTests(SimpleTestCase):
    """
    Hallazgo C-3 de docs/historial-patholab/auditoria-inicial.md: si falta el .env, la app no debe
    arrancar con DEBUG=True ni con una SECRET_KEY escrita en el código.
    """

    def test_sin_secret_key_la_app_no_arranca(self):
        with self.assertRaises(Exception) as contexto:
            cargar_settings({})
        self.assertIn('SECRET_KEY', str(contexto.exception))

    def test_debug_es_false_si_no_se_define(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertFalse(settings.DEBUG)

    def test_sin_debug_no_se_permite_cors_desde_cualquier_origen(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertFalse(settings.CORS_ALLOW_ALL_ORIGINS)

    def test_usa_la_secret_key_del_entorno(self):
        # Control: si la variable existe, se usa tal cual.
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests', 'DEBUG': 'True'})
        self.assertEqual(settings.SECRET_KEY, 'clave-de-prueba-solo-para-tests')
        self.assertTrue(settings.DEBUG)


class EncabezadoLaboratorioTests(SimpleTestCase):
    """
    Tarea previa 2 de docs/historial-patholab/plan-calidad-y-diseno.md: el encabezado del PDF se lee
    de backend/.env (LABORATORIO_NOMBRE, LABORATORIO_DIRECCION, LABORATORIO_TELEFONO).
    Sin esas variables queda el encabezado de demostración de siempre (P-9).
    """

    CLAVE = {'SECRET_KEY': 'clave-de-prueba-solo-para-tests'}

    def test_sin_variables_usa_el_encabezado_de_demostracion(self):
        settings = cargar_settings(self.CLAVE)
        self.assertEqual(settings.LABORATORIO_NOMBRE, 'GyS Control (demostración)')
        self.assertEqual(settings.LABORATORIO_DIRECCION, 'Santiago de Cali, Colombia')
        self.assertEqual(settings.LABORATORIO_TELEFONO, '')

    def test_usa_las_variables_definidas(self):
        settings = cargar_settings(
            {
                **self.CLAVE,
                'LABORATORIO_NOMBRE': 'Laboratorio Ficticio de Prueba',
                'LABORATORIO_DIRECCION': 'Calle Falsa 123, Ciudad Ficticia',
                'LABORATORIO_TELEFONO': '000 000 0000',
            }
        )
        self.assertEqual(settings.LABORATORIO_NOMBRE, 'Laboratorio Ficticio de Prueba')
        self.assertEqual(settings.LABORATORIO_DIRECCION, 'Calle Falsa 123, Ciudad Ficticia')
        self.assertEqual(settings.LABORATORIO_TELEFONO, '000 000 0000')

    def test_lee_tildes_y_raya_del_archivo_env(self):
        # El .env se escribe a mano: las tildes y la raya (—) deben llegar intactas al PDF.
        import tempfile

        with tempfile.TemporaryDirectory() as carpeta:
            ruta = Path(carpeta) / '.env'
            ruta.write_text(
                'SECRET_KEY=clave-de-prueba-solo-para-tests\n'
                'LABORATORIO_NOMBRE=Laboratorio Ficticio — Anatomía Patológica\n'
                'LABORATORIO_DIRECCION=Carrera Ficticia 1 # 2-3, Bogotá\n',
                encoding='utf-8',
            )
            desde_archivo = decouple.Config(decouple.RepositoryEnv(str(ruta)))
            entorno = {k: v for k, v in os.environ.items() if not k.startswith('LABORATORIO_')}
            with mock.patch.object(decouple, 'config', desde_archivo), mock.patch.dict(os.environ, entorno, clear=True):
                spec = importlib.util.spec_from_file_location('settings_prueba_env', RUTA_SETTINGS)
                settings = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(settings)
        self.assertEqual(settings.LABORATORIO_NOMBRE, 'Laboratorio Ficticio — Anatomía Patológica')
        self.assertEqual(settings.LABORATORIO_DIRECCION, 'Carrera Ficticia 1 # 2-3, Bogotá')


class NumProxiesTests(SimpleTestCase):
    """
    Hallazgo O-17 de docs/historial-patholab/auditoria-owasp.md: NUM_PROXIES dice cuántos proxies hay
    delante de Django. Sin definir vale 0: DRF usa la IP de la conexión y no la
    cabecera X-Forwarded-For, que el cliente puede inventar.
    """

    def test_num_proxies_vale_0_si_no_se_define(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertEqual(settings.REST_FRAMEWORK['NUM_PROXIES'], 0)

    def test_num_proxies_se_lee_del_entorno(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests', 'NUM_PROXIES': '1'})
        self.assertEqual(settings.REST_FRAMEWORK['NUM_PROXIES'], 1)


class LimitePeticionesUsuarioTests(SimpleTestCase):
    """
    Fase de Cypress: el límite de peticiones por usuario se puede subir con
    LIMITE_PETICIONES_USUARIO (solo lo hace npm run e2e, que va más rápido que una persona).
    El del login no cambia.
    """

    def test_sin_variable_es_120_por_minuto(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertEqual(settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['user'], '120/minute')

    def test_se_lee_del_entorno_y_no_cambia_el_del_login(self):
        settings = cargar_settings(
            {'SECRET_KEY': 'clave-de-prueba-solo-para-tests', 'LIMITE_PETICIONES_USUARIO': '2000/minute'}
        )
        self.assertEqual(settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['user'], '2000/minute')
        self.assertEqual(settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['login'], '10/minute')


class ArchivoSqliteTests(SimpleTestCase):
    """
    Fase de Cypress: las pruebas de punta a punta usan su propia base SQLite
    (SQLITE_NOMBRE), para no tocar la base de desarrollo. Sin la variable, la de siempre.
    """

    def test_sin_variable_usa_db_sqlite3(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertEqual(settings.DATABASES['default']['NAME'], settings.BASE_DIR / 'db.sqlite3')

    def test_el_archivo_se_lee_del_entorno(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests', 'SQLITE_NOMBRE': 'e2e_db.sqlite3'})
        self.assertEqual(settings.DATABASES['default']['NAME'], settings.BASE_DIR / 'e2e_db.sqlite3')
        # Las pruebas del backend siguen usando su propio archivo.
        self.assertEqual(settings.DATABASES['default']['TEST']['NAME'], settings.BASE_DIR / 'test_db.sqlite3')


class RegistrosTests(SimpleTestCase):
    """
    Hallazgo O-21 de docs/historial-patholab/auditoria-owasp.md: sin LOGGING, con DEBUG=False los errores 500
    iban a `mail_admins` con ADMINS vacío, es decir, a ningún lado. Ahora van a la consola
    (la recoge el servidor), igual que los registros de seguridad, sin depender de DEBUG.
    """

    def manejadores(self, settings, logger):
        configuracion = settings.LOGGING
        nombres = configuracion['loggers'][logger]['handlers']
        return [configuracion['handlers'][nombre] for nombre in nombres]

    def test_los_errores_500_van_a_la_consola_con_debug_false(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        self.assertFalse(settings.DEBUG)
        manejadores = self.manejadores(settings, 'django.request')
        self.assertTrue(any(m['class'] == 'logging.StreamHandler' for m in manejadores))
        # Sin el filtro require_debug_true, que los dejaría fuera en producción.
        self.assertTrue(all('require_debug_true' not in m.get('filters', []) for m in manejadores))

    def test_el_registro_de_seguridad_va_a_la_consola(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests'})
        manejadores = self.manejadores(settings, 'seguridad')
        self.assertTrue(any(m['class'] == 'logging.StreamHandler' for m in manejadores))
        self.assertEqual(settings.LOGGING['loggers']['seguridad']['level'], 'INFO')

    def test_el_nivel_se_lee_del_entorno(self):
        settings = cargar_settings({'SECRET_KEY': 'clave-de-prueba-solo-para-tests', 'LOG_LEVEL': 'WARNING'})
        self.assertEqual(settings.LOGGING['loggers']['seguridad']['level'], 'WARNING')
