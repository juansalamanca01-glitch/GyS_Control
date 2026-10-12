from django import forms
from django.contrib import admin
from django.core.files.uploadedfile import UploadedFile

from .imagenes import preparar_imagen
from .models import Comentario, ImagenPublicacion, Publicacion, TemaForo


class ImagenPublicacionForm(forms.ModelForm):
    """Aplica a las imágenes subidas en /admin/ la misma revisión y limpieza que la API (O-13, O-5)."""

    class Meta:
        model = ImagenPublicacion
        fields = ['publicacion', 'imagen', 'descripcion']

    def clean_imagen(self):
        imagen = self.cleaned_data.get('imagen')
        # Solo un archivo recién subido; si no se cambia, llega la imagen ya guardada.
        if isinstance(imagen, UploadedFile):
            return preparar_imagen(imagen)
        return imagen


class ImagenInline(admin.TabularInline):
    model = ImagenPublicacion
    form = ImagenPublicacionForm
    extra = 0


class ComentarioInline(admin.TabularInline):
    model = Comentario
    extra = 0
    readonly_fields = ['autor', 'contenido', 'fecha_creacion']
    can_delete = True


@admin.register(TemaForo)
class TemaForoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'activo', 'fecha_creacion']
    list_filter = ['activo']
    search_fields = ['nombre']


@admin.register(Publicacion)
class PublicacionAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'autor', 'tema', 'fijado', 'fecha_creacion']
    list_filter = ['tema', 'fijado']
    search_fields = ['titulo', 'contenido']
    inlines = [ImagenInline, ComentarioInline]
