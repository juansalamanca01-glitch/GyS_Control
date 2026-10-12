import io
import os
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Usuario

from .models import Comentario, ImagenPublicacion, Publicacion

CARPETA_MEDIA_PRUEBAS = tempfile.mkdtemp(prefix='patolab-media-pruebas-')


def imagen_png(nombre='foto.png', lado=64):
    """PNG válido. Con píxeles al azar pesa varios KB (lado=64 → unos 12 KB)."""
    buffer = io.BytesIO()
    Image.frombytes('RGB', (lado, lado), os.urandom(lado * lado * 3)).save(buffer, format='PNG')
    return SimpleUploadedFile(nombre, buffer.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=CARPETA_MEDIA_PRUEBAS, FORO_MAX_TAMANO_IMAGEN=1024)
class SubidaImagenesForoTests(APITestCase):
    """
    Hallazgo I-6 de docs/auditoria-inicial.md: no había un límite real de tamaño
    para las imágenes del foro, y tampoco se comprobaba que el archivo fuera una
    imagen. En estas pruebas el límite se baja a 1 KB para no fabricar archivos grandes.
    """

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(CARPETA_MEDIA_PRUEBAS, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.patologo = Usuario.objects.create_user(
            username='patologo_foro',
            password='ClaveSegura-2026',
            rol=Usuario.Rol.PATOLOGO,
        )
        self.publicacion = Publicacion.objects.create(autor=self.patologo, titulo='Caso', contenido='Texto')
        self.url = f'/api/foro/publicaciones/{self.publicacion.id}/imagenes/'
        self.client.force_authenticate(self.patologo)

    def subir(self, *archivos):
        return self.client.post(self.url, {'imagenes': list(archivos)}, format='multipart')

    def test_rechaza_imagen_mas_grande_que_el_limite(self):
        respuesta = self.subir(imagen_png(lado=64))  # ~12 KB > 1 KB
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tamaño', respuesta.data['detail'])
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_si_una_imagen_es_muy_grande_no_se_guarda_ninguna(self):
        respuesta = self.subir(imagen_png('pequena.png', lado=1), imagen_png('grande.png', lado=64))
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_rechaza_archivo_que_no_es_imagen(self):
        falso = SimpleUploadedFile('foto.png', b'<html><script>alert(1)</script></html>', content_type='image/png')
        respuesta = self.subir(falso)
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_acepta_imagen_valida_dentro_del_limite(self):
        # Control: una imagen real y pequeña se sigue subiendo normalmente.
        respuesta = self.subir(imagen_png(lado=1))
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ImagenPublicacion.objects.count(), 1)


def imagen_en_bytes(formato, tamano=(4, 4), **opciones):
    """Imagen pequeña de un color en el formato pedido (PNG, JPEG, GIF, WEBP)."""
    buffer = io.BytesIO()
    Image.new('RGB', tamano, (200, 30, 30)).save(buffer, format=formato, **opciones)
    return buffer.getvalue()


@override_settings(MEDIA_ROOT=CARPETA_MEDIA_PRUEBAS)
class SeguridadImagenesForoTests(APITestCase):
    """
    Hallazgos O-13 y O-5 (puntos 1 y 2) de docs/auditoria-owasp.md: el archivo se
    guardaba con el nombre y la extensión que mandaba el usuario, así que un PNG
    válido con HTML al final y nombre «ataque.html» quedaba servido como página web
    (XSS almacenado). Además, la ruta era previsible y la imagen conservaba EXIF.
    """

    PATRON_NOMBRE = r'^foro/publicaciones/{}/[0-9a-f]{{32}}\.{}$'

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(CARPETA_MEDIA_PRUEBAS, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.patologo = Usuario.objects.create_user(
            username='patologo_imagenes',
            password='ClaveSegura-2026',
            rol=Usuario.Rol.PATOLOGO,
        )
        self.publicacion = Publicacion.objects.create(autor=self.patologo, titulo='Caso', contenido='Texto')
        self.url = f'/api/foro/publicaciones/{self.publicacion.id}/imagenes/'
        self.client.force_authenticate(self.patologo)

    def subir(self, nombre, contenido, tipo='image/png'):
        archivo = SimpleUploadedFile(nombre, contenido, content_type=tipo)
        return self.client.post(self.url, {'imagenes': [archivo]}, format='multipart')

    def guardada(self):
        imagen = ImagenPublicacion.objects.get()
        with imagen.imagen.open('rb') as archivo:
            return imagen.imagen.name, archivo.read()

    def test_rechaza_html_que_tambien_es_un_png_valido(self):
        poliglota = imagen_en_bytes('PNG') + b'<html><script>alert(document.domain)</script></html>'
        respuesta = self.subir('ataque.html', poliglota)
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ataque.html', respuesta.data['detail'])
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_rechaza_extensiones_que_no_son_de_imagen(self):
        for nombre in ['foto.svg', 'foto.php', 'foto.png.html', 'foto']:
            with self.subTest(nombre=nombre):
                respuesta = self.subir(nombre, imagen_en_bytes('PNG'))
                self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_rechaza_svg(self):
        svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        respuesta = self.subir('dibujo.svg', svg, tipo='image/svg+xml')
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_rechaza_formatos_de_imagen_no_permitidos(self):
        # Pillow abre un BMP, pero no está en la lista de formatos permitidos.
        respuesta = self.subir('foto.bmp', imagen_en_bytes('BMP'), tipo='image/bmp')
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ImagenPublicacion.objects.count(), 0)

    def test_quita_el_contenido_agregado_al_final_de_la_imagen(self):
        poliglota = imagen_en_bytes('PNG') + b'<html><script>alert(document.domain)</script></html>'
        respuesta = self.subir('foto.png', poliglota)
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        _, contenido = self.guardada()
        self.assertNotIn(b'<script', contenido)
        Image.open(io.BytesIO(contenido)).verify()

    def test_guarda_con_nombre_aleatorio_y_la_extension_del_formato_real(self):
        respuesta = self.subir('IMG_0001.png', imagen_en_bytes('PNG'))
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        nombre, _ = self.guardada()
        self.assertRegex(nombre, self.PATRON_NOMBRE.format(self.publicacion.id, 'png'))
        self.assertNotIn('IMG_0001', respuesta.data[0]['imagen'])

    def test_la_extension_sale_del_formato_y_no_del_nombre(self):
        # Un JPEG con nombre .png se acepta (pasa con fotos renombradas), pero se guarda como .jpg.
        respuesta = self.subir('foto.png', imagen_en_bytes('JPEG'), tipo='image/png')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        nombre, contenido = self.guardada()
        self.assertRegex(nombre, self.PATRON_NOMBRE.format(self.publicacion.id, 'jpg'))
        self.assertEqual(Image.open(io.BytesIO(contenido)).format, 'JPEG')

    def test_quita_los_metadatos_exif(self):
        exif = Image.Exif()
        exif[0x010F] = 'Fabricante de prueba'  # Make
        exif[0x0132] = '2026:10:12 10:00:00'  # DateTime
        respuesta = self.subir('foto.jpg', imagen_en_bytes('JPEG', exif=exif), tipo='image/jpeg')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        _, contenido = self.guardada()
        self.assertNotIn(b'Fabricante de prueba', contenido)
        self.assertEqual(len(Image.open(io.BytesIO(contenido)).getexif()), 0)

    def test_respeta_la_orientacion_de_la_foto_al_quitar_el_exif(self):
        # Orientación 6 = girada 90°: sin aplicarla, la foto saldría acostada al quitar el EXIF.
        exif = Image.Exif()
        exif[0x0112] = 6
        respuesta = self.subir('foto.jpg', imagen_en_bytes('JPEG', tamano=(8, 4), exif=exif), tipo='image/jpeg')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        _, contenido = self.guardada()
        self.assertEqual(Image.open(io.BytesIO(contenido)).size, (4, 8))

    def test_conserva_la_animacion_de_un_gif(self):
        cuadros = [Image.new('RGB', (4, 4), color) for color in [(255, 0, 0), (0, 255, 0), (0, 0, 255)]]
        buffer = io.BytesIO()
        cuadros[0].save(buffer, format='GIF', save_all=True, append_images=cuadros[1:], duration=100, loop=0)
        respuesta = self.subir('animada.gif', buffer.getvalue(), tipo='image/gif')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        nombre, contenido = self.guardada()
        self.assertTrue(nombre.endswith('.gif'))
        self.assertEqual(Image.open(io.BytesIO(contenido)).n_frames, 3)

    def test_acepta_los_formatos_permitidos(self):
        for formato, nombre, extension in [
            ('PNG', 'a.png', 'png'),
            ('JPEG', 'b.jpeg', 'jpg'),
            ('GIF', 'c.gif', 'gif'),
            ('WEBP', 'd.webp', 'webp'),
        ]:
            with self.subTest(formato=formato):
                respuesta = self.subir(nombre, imagen_en_bytes(formato))
                self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
                imagen = ImagenPublicacion.objects.latest('id')
                self.assertTrue(imagen.imagen.name.endswith(f'.{extension}'))


@override_settings(MEDIA_ROOT=CARPETA_MEDIA_PRUEBAS)
class AdminImagenesForoTests(APITestCase):
    """En /admin/, las imágenes del foro pasan por la misma revisión y limpieza que en la API (O-13, O-5)."""

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(CARPETA_MEDIA_PRUEBAS, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        autor = Usuario.objects.create_user(username='autor_admin_foro', password='ClaveSegura-2026')
        self.publicacion = Publicacion.objects.create(autor=autor, titulo='Caso', contenido='Texto')

    def formulario(self, nombre, contenido):
        from .admin import ImagenPublicacionForm

        archivo = SimpleUploadedFile(nombre, contenido, content_type='image/png')
        return ImagenPublicacionForm(data={'publicacion': self.publicacion.id}, files={'imagen': archivo})

    def test_el_inline_usa_el_formulario_que_limpia(self):
        from .admin import ImagenInline, ImagenPublicacionForm

        self.assertIs(ImagenInline.form, ImagenPublicacionForm)

    def test_rechaza_formatos_no_permitidos(self):
        formulario = self.formulario('foto.bmp', imagen_en_bytes('BMP'))
        self.assertFalse(formulario.is_valid())
        self.assertIn('imagen', formulario.errors)

    def test_guarda_una_copia_limpia_con_nombre_aleatorio(self):
        exif = Image.Exif()
        exif[0x010F] = 'Fabricante de prueba'
        poliglota = imagen_en_bytes('JPEG', exif=exif) + b'<script>alert(1)</script>'
        formulario = self.formulario('IMG_0001.jpeg', poliglota)
        self.assertTrue(formulario.is_valid(), formulario.errors)
        imagen = formulario.save()
        self.assertRegex(imagen.imagen.name, rf'^foro/publicaciones/{self.publicacion.id}/[0-9a-f]{{32}}\.jpg$')
        with imagen.imagen.open('rb') as archivo:
            contenido = archivo.read()
        self.assertNotIn(b'<script', contenido)
        self.assertNotIn(b'Fabricante de prueba', contenido)


class LimitePorDefectoTests(APITestCase):
    def test_el_limite_por_defecto_es_10_mb(self):
        from django.conf import settings

        self.assertEqual(getattr(settings, 'FORO_MAX_TAMANO_IMAGEN', None), 10 * 1024 * 1024)


class CamposProtegidosForoTests(APITestCase):
    """
    Hallazgo I-8 de docs/auditoria-inicial.md:
    - solo un admin puede fijar publicaciones (lo dice el propio modelo);
    - un comentario no se puede mover a otra publicación editándolo.
    """

    def setUp(self):
        self.autor = Usuario.objects.create_user(
            username='patologo_autor_foro',
            password='ClaveSegura-2026',
            rol=Usuario.Rol.PATOLOGO,
        )
        self.admin = Usuario.objects.create_user(
            username='admin_foro',
            password='ClaveSegura-2026',
            rol=Usuario.Rol.ADMIN,
        )
        self.publicacion = Publicacion.objects.create(autor=self.autor, titulo='Caso', contenido='Texto')
        self.otra_publicacion = Publicacion.objects.create(autor=self.admin, titulo='Otro', contenido='Texto')

    def test_patologo_no_puede_crear_publicacion_fijada(self):
        self.client.force_authenticate(self.autor)
        respuesta = self.client.post(
            '/api/foro/publicaciones/',
            {'titulo': 'Nuevo', 'contenido': 'Texto', 'fijado': True},
            format='json',
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertFalse(Publicacion.objects.get(id=respuesta.data['id']).fijado)

    def test_autor_no_puede_fijar_su_publicacion(self):
        self.client.force_authenticate(self.autor)
        self.client.patch(f'/api/foro/publicaciones/{self.publicacion.id}/', {'fijado': True}, format='json')
        self.publicacion.refresh_from_db()
        self.assertFalse(self.publicacion.fijado)

    def test_admin_si_puede_fijar_publicaciones(self):
        # Control: la moderación del admin sigue funcionando.
        self.client.force_authenticate(self.admin)
        respuesta = self.client.patch(
            f'/api/foro/publicaciones/{self.publicacion.id}/', {'fijado': True}, format='json'
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.publicacion.refresh_from_db()
        self.assertTrue(self.publicacion.fijado)

    def test_autor_no_puede_mover_su_comentario_a_otra_publicacion(self):
        comentario = Comentario.objects.create(publicacion=self.publicacion, autor=self.autor, contenido='Hola')
        self.client.force_authenticate(self.autor)
        self.client.patch(
            f'/api/foro/comentarios/{comentario.id}/',
            {'publicacion': self.otra_publicacion.id},
            format='json',
        )
        comentario.refresh_from_db()
        self.assertEqual(comentario.publicacion_id, self.publicacion.id)

    def test_autor_si_puede_editar_el_texto_de_su_comentario(self):
        # Control: editar el contenido sigue permitido.
        comentario = Comentario.objects.create(publicacion=self.publicacion, autor=self.autor, contenido='Hola')
        self.client.force_authenticate(self.autor)
        respuesta = self.client.patch(
            f'/api/foro/comentarios/{comentario.id}/', {'contenido': 'Editado'}, format='json'
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        comentario.refresh_from_db()
        self.assertEqual(comentario.contenido, 'Editado')


class TemasInicialesTests(APITestCase):
    """Decisión D-5 (auditoría M-6): seed_data crea los temas iniciales del foro."""

    TEMAS = ['Casos clínicos', 'Dudas y consultas', 'Investigación', 'Técnicas de laboratorio']

    def ejecutar_seed(self):
        from io import StringIO

        from django.core.management import call_command

        call_command('seed_data', stdout=StringIO())

    def test_seed_data_crea_los_temas(self):
        self.ejecutar_seed()
        from .models import TemaForo

        self.assertEqual(sorted(TemaForo.objects.values_list('nombre', flat=True)), self.TEMAS)

    def test_ejecutar_seed_dos_veces_no_duplica(self):
        self.ejecutar_seed()
        self.ejecutar_seed()
        from .models import TemaForo

        self.assertEqual(TemaForo.objects.count(), 4)


class FiltrosNoValidosForoTests(APITestCase):
    """Hallazgo O-22 de docs/auditoria-owasp.md: ?tema= y ?publicacion= no válidos respondían 500."""

    def setUp(self):
        self.auditor = Usuario.objects.create_user(
            username='auditor_filtros_foro', password='ClaveSegura-2026', rol=Usuario.Rol.AUDITOR
        )
        self.client.force_authenticate(self.auditor)

    def test_valores_no_validos_responden_400(self):
        for url, parametro in [
            ('/api/foro/publicaciones/?tema=abc', 'tema'),
            ('/api/foro/comentarios/?publicacion=abc', 'publicacion'),
            ('/api/foro/comentarios/?publicacion=1.5', 'publicacion'),
        ]:
            with self.subTest(url=url):
                respuesta = self.client.get(url)
                self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(parametro, respuesta.data)

    def test_valores_validos_siguen_filtrando(self):
        for url in ['/api/foro/publicaciones/?tema=1', '/api/foro/comentarios/?publicacion=1']:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)
