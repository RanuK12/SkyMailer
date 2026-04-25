<p align="center">
  <img src="https://img.shields.io/badge/SkyMailer-v2.0-6C63FF?style=for-the-badge&logo=gmail&logoColor=white" alt="SkyMailer v2.0"/>
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.12"/>
  <img src="https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django"/>
</p>

<h1 align="center">✈️ SkyMailer 2.0</h1>

<p align="center">
  <strong>Plataforma de email outreach profesional para envíos por lotes con personalización dinámica.</strong><br>
  Construida con Django · Diseñada para equipos de ventas B2B · Compatible con Google Workspace
</p>

---

## 🎯 ¿Qué es SkyMailer?

SkyMailer es una herramienta de envío de correos electrónicos por lotes que permite a equipos de ventas y marketing gestionar campañas de outreach de forma profesional. Cargás un archivo Excel con tus contactos, asuntos y mensajes personalizados, y SkyMailer se encarga de enviarlos uno por uno desde tu cuenta corporativa, simulando el comportamiento humano para maximizar la tasa de entrega.

### El problema que resuelve

Si alguna vez necesitaste enviar 30, 50 o 100 correos personalizados a distintos destinatarios con distintos asuntos y mensajes, sabés que hacerlo manualmente es un infierno. Y las plataformas como Mailchimp o SendGrid no sirven para cold outreach porque los correos caen en spam.

**SkyMailer envía desde tu propia cuenta de Gmail/Workspace**, lo que significa que tus correos llegan a la bandeja principal, no a la carpeta de promociones.

---

## ✨ Características Principales

### 📦 Procesamiento por Lotes
Cargá un archivo `.xlsx` o `.csv` con columnas de email, asunto y cuerpo del mensaje. SkyMailer detecta automáticamente las columnas usando *fuzzy matching*, así no importa si tu archivo dice `email`, `Email_Destinatario` o `correo` — lo encuentra igual.

### 📑 Soporte Multi-Hoja (Excel)
¿Tu archivo tiene varias pestañas (Cold, Follow-up, Breakup)? SkyMailer detecta las hojas automáticamente y te muestra un selector visual para que elijas cuál procesar.

### ⏱️ Delay Inteligente Anti-Spam
Slider configurable de **3 a 120 segundos** entre cada envío. El valor por defecto (60s) está optimizado para cumplir con los límites de Google Workspace y simular envío humano. Con 36 correos y 60s de delay, todo sale en ~35 minutos sin riesgo de bloqueo.

### 👁️ Previsualización en Tiempo Real
Antes de enviar, podés hacer clic en cualquier correo de la cola para ver exactamente cómo va a llegar al destinatario. El previsualizador renderiza HTML completo con estilos inline.

### 📎 Archivos Adjuntos
Adjuntá PDFs, imágenes o documentos que se envían automáticamente con cada correo del lote.

### 🎨 Interfaz Moderna
UI con dark mode, glassmorphism, micro-animaciones y diseño responsive. No parece una herramienta interna — parece un producto SaaS.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Backend** | Python 3.12, Django 5.x |
| **Frontend** | Vanilla JavaScript, CSS3 (variables, glassmorphism) |
| **Parsing Excel** | `openpyxl` |
| **Detección de columnas** | `fuzzywuzzy` (fuzzy matching) |
| **Envío de correos** | SMTP nativo de Django (Gmail / Google Workspace) |
| **Configuración** | `python-decouple` (variables de entorno seguras) |

---

## 🚀 Instalación

### Requisitos previos
- Python 3.10+
- Una cuenta de Gmail o Google Workspace
- Una [contraseña de aplicación](https://myaccount.google.com/apppasswords) de Google (16 caracteres)

### Pasos

```bash
# 1. Cloná el repositorio
git clone https://github.com/RanuK12/SkyMailer.git
cd SkyMailer

# 2. Creá un entorno virtual e instalá dependencias
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# 3. Configurá las variables de entorno
# Creá un archivo .env en la carpeta app_enviar_correos/
```

```env
EMAIL_HOST_USER=tu_email@tudominio.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
```

```bash
# 4. Ejecutá las migraciones y arrancá el servidor
cd app_enviar_correos
python manage.py migrate
python manage.py runserver
```

Abrí tu navegador en `http://127.0.0.1:8000/emailer/` y listo.

---

## 📋 Formato del Archivo Excel

SkyMailer espera un archivo `.xlsx` o `.csv` con al menos estas 3 columnas (los nombres son flexibles):

| Columna | Ejemplos aceptados |
|---|---|
| **Email** | `email`, `Email_Destinatario`, `correo`, `to` |
| **Asunto** | `subject`, `asunto`, `Subject_Principal` |
| **Cuerpo** | `body`, `mensaje`, `email_1_body`, `contenido` |

El cuerpo puede ser **texto plano o HTML**. Si enviás HTML, el correo llega con formato profesional (colores, botones, tablas).

### Ejemplo de estructura

| Email | Empresa | Subject | Body |
|---|---|---|---|
| ceo@empresa.com | TechCorp | Observación técnica | `<div>Hola equipo de TechCorp...</div>` |
| info@startup.com | StartupX | Mejora en rendimiento | `<div>Hola equipo de StartupX...</div>` |

---

## 🔐 Seguridad

- Las credenciales **nunca se guardan en el código**. Se cargan desde un archivo `.env` usando `python-decouple`.
- El archivo `.env` está incluido en `.gitignore` para evitar que se suba al repositorio.
- Los correos se envían vía **TLS** (cifrado en tránsito).
- No se almacena ningún dato de los destinatarios en base de datos.

---

## 📁 Estructura del Proyecto

```
SkyMailer/
├── app_enviar_correos/
│   ├── app_enviar_correos/      # Configuración Django
│   │   ├── settings.py          # Config general + email SMTP
│   │   ├── urls.py              # Rutas principales
│   │   └── views.py             # Vista raíz
│   ├── emailer/                 # App principal
│   │   ├── static/
│   │   │   └── emailer/
│   │   │       ├── css/style.css   # UI dark mode + glassmorphism
│   │   │       └── js/app.js       # Lógica del frontend
│   │   ├── templates/
│   │   │   └── email_form.html     # Interfaz principal
│   │   ├── views.py                # API: upload, send, templates
│   │   └── urls.py                 # Rutas de la API
│   └── manage.py
├── reformat_emails.py           # Utilidad: convierte texto plano a HTML profesional
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🧰 Utilidades Incluidas

### `reformat_emails.py`
Script standalone que toma un archivo Excel con correos en texto plano y los convierte automáticamente a **plantillas HTML profesionales** con:
- Tipografía moderna (Segoe UI)
- Colores de marca personalizables
- Botones CTA con gradientes
- Tablas de propuesta de valor
- Firma profesional
- Footer de opt-out

---

## 🗺️ Roadmap

- [ ] Dashboard de métricas (correos enviados / fallidos / tasa de apertura)
- [ ] Programación de envíos (enviar mañana a las 9:00 AM)
- [ ] Integración con Calendly para tracking de reuniones agendadas
- [ ] Modo de prueba (enviar todo a tu propia cuenta antes de salir a producción)
- [ ] Soporte para múltiples cuentas SMTP

---

## 👨‍💻 Autor

**Emilio Ranucoli** — Ingeniero en Sistemas  
Fundador de [Ranuk IT Solutions](https://ranuk.dev/ranuk-it)  
Ex-Booking.com (Ámsterdam) · Ex-Accenture (Roma)

---

<p align="center">
  <sub>Hecho con ☕ en Córdoba, Argentina</sub>
</p>
