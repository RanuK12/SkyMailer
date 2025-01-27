from django.contrib import admin
from django.urls import path, include
from app_enviar_correos import views  # Aquí importa tu redirect_to_emailer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.redirect_to_emailer),  # Redirige automáticamente a 'emailer'
    path('emailer/', include('emailer.urls')),  # Incluye las rutas de la app 'emailer'
]