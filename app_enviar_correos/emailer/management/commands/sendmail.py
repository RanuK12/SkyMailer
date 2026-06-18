"""sendmail — envío transaccional de UN email usando el motor de SkyMailer.

Mismo backend SMTP y credenciales que la UI (settings.py + .env). Pensado para que
otros sistemas (ej. el bot Ranukita) manden correos individuales SIN levantar el
server: cada invocación lee la config y envía, así sobrevive a reinicios/apagones
por diseño (no hay daemon que se caiga).

Uso:
    python manage.py sendmail --to dest@x.com --subject "Asunto" --html-file cuerpo.html
    python manage.py sendmail --to dest@x.com --subject "Hola" --body "texto plano"
    ... --attach informe.pdf --attach foto.png
    ... --inline ranuklogo=assets/logo.png      (imagen embebida via cid:ranuklogo)
    ... --reply-to otro@x.com   --from emilio@ranuk.dev

Salida: una línea JSON {"to","status":"sent|error","error?"}. exit 0 si envió.
"""
import json
import sys
from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Envía un email individual con el motor SMTP de SkyMailer (.env)."

    def add_arguments(self, parser):
        parser.add_argument("--to", required=True, help="Destinatario")
        parser.add_argument("--subject", default="", help="Asunto")
        parser.add_argument("--html-file", help="Ruta a archivo HTML con el cuerpo")
        parser.add_argument("--body", help="Cuerpo en texto/HTML inline (alternativa a --html-file)")
        parser.add_argument("--plain", action="store_true", help="Tratar el cuerpo como texto plano (no HTML)")
        parser.add_argument("--from", dest="from_email", default=None, help="Remitente (default: EMAIL_HOST_USER)")
        parser.add_argument("--reply-to", default=None, help="Reply-To")
        parser.add_argument("--attach", action="append", default=[], help="Ruta de adjunto (repetible)")
        parser.add_argument("--inline", action="append", default=[],
                            help="Imagen embebida CID, formato cid=ruta (repetible)")

    def handle(self, *args, **o):
        to = o["to"].strip()
        from_email = o["from_email"] or settings.EMAIL_HOST_USER

        if o["html_file"]:
            body = Path(o["html_file"]).expanduser().read_text(encoding="utf-8")
        elif o["body"] is not None:
            body = o["body"]
        else:
            raise CommandError("Falta el cuerpo: pasá --html-file o --body")

        is_html = not o["plain"]
        # text/plain de respaldo cuando es HTML (clientes sin HTML + mejor deliverability)
        text_body = body if not is_html else "Este email requiere un cliente con HTML."

        msg = EmailMultiAlternatives(
            subject=o["subject"], body=text_body, from_email=from_email, to=[to],
            reply_to=[o["reply_to"]] if o["reply_to"] else None,
        )
        if is_html:
            # 'related' permite imágenes inline (cid:) referenciadas desde el HTML
            msg.mixed_subtype = "related"
            msg.attach_alternative(body, "text/html")

        for spec in o["inline"]:
            if "=" not in spec:
                raise CommandError(f"--inline mal formado (esperaba cid=ruta): {spec}")
            cid, path = spec.split("=", 1)
            img = MIMEImage(Path(path).expanduser().read_bytes())
            img.add_header("Content-ID", f"<{cid}>")
            img.add_header("Content-Disposition", "inline", filename=Path(path).name)
            msg.attach(img)

        for path in o["attach"]:
            msg.attach_file(str(Path(path).expanduser()))

        try:
            msg.send(fail_silently=False)
        except Exception as e:
            sys.stdout.write(json.dumps({"to": to, "status": "error", "error": str(e)}) + "\n")
            raise CommandError(f"fallo el envío: {e}")
        sys.stdout.write(json.dumps({"to": to, "status": "sent", "from": from_email}) + "\n")
