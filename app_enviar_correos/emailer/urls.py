from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/send/', views.send_emails_ajax, name='send_emails'),
    path('api/upload-csv/', views.upload_csv, name='upload_csv'),
    path('api/templates/', views.get_templates, name='get_templates'),
    path('preview/', TemplateView.as_view(template_name='preview_all.html'), name='preview'),
]