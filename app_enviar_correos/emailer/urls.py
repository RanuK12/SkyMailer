from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('exito/', views.exito, name='exito'),  # Nueva URL
]