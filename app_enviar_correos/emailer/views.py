from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings

def home(request):
    if request.method == 'POST':
        asunto = request.POST.get('asunto')
        mensaje = request.POST.get('mensaje')
        destinatarios = request.POST.get('destinatarios')

        # Verificar si se proporcionaron destinatarios
        if destinatarios is None or destinatarios.strip() == "":
            return render(request, 'email_form.html', {'error': 'No se proporcionaron destinatarios.'})

        # Dividir la cadena de destinatarios en una lista (por comas o saltos de línea)
        lista_destinatarios = [d.strip() for d in destinatarios.split(',') if d.strip()] 
        # O si prefieres separarlos por saltos de línea:
        # lista_destinatarios = [d.strip() for d in destinatarios.splitlines() if d.strip()]

        for destinatario in lista_destinatarios:
            try:
                # Enviar el correo individualmente
                send_mail(
                    asunto,
                    mensaje,
                    settings.EMAIL_HOST_USER,
                    [destinatario],
                    fail_silently=False,
                )
            except Exception as e:
                # Manejar errores de envío de correo (opcional)
                print(f"Error al enviar correo a {destinatario}: {e}")

        # Redirigir a una página de éxito
        return redirect('exito')  

    return render(request, 'email_form.html')

def exito(request):  # Nueva vista para la página de éxito
    return render(request, 'exito.html')