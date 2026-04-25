<p align="center">
  <a href="README.md">🇪🇸 Español</a> · <a href="README_EN.md">🇬🇧 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SkyMailer-v2.0-6C63FF?style=for-the-badge&logo=gmail&logoColor=white" alt="SkyMailer v2.0"/>
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.12"/>
  <img src="https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">✈️ SkyMailer 2.0</h1>

<p align="center">
  <strong>Professional email outreach platform for batch sending with dynamic personalization.</strong><br>
  Built with Django · Designed for B2B sales teams · Google Workspace compatible
</p>

---

## 🎯 What is SkyMailer?

SkyMailer is a batch email sending tool that allows sales and marketing teams to manage outreach campaigns professionally. Upload an Excel file with your contacts, subjects, and personalized messages, and SkyMailer sends them one by one from your corporate account, simulating human behavior to maximize delivery rates.

### The problem it solves

If you've ever needed to send 30, 50, or 100 personalized emails to different recipients with different subjects and messages, you know doing it manually is a nightmare. And platforms like Mailchimp or SendGrid don't work for cold outreach because emails land in spam.

**SkyMailer sends from your own Gmail/Workspace account**, which means your emails land in the primary inbox, not the promotions folder.

---

## ✨ Key Features

### 📦 Batch Processing
Upload an `.xlsx` or `.csv` file with email, subject, and body columns. SkyMailer automatically detects columns using *fuzzy matching* — it doesn't matter if your file says `email`, `Email_Recipient`, or `correo` — it finds it anyway.

### 📑 Multi-Sheet Support (Excel)
Does your file have multiple tabs (Cold, Follow-up, Breakup)? SkyMailer detects sheets automatically and shows a visual selector to choose which one to process.

### ⏱️ Smart Anti-Spam Delay
Configurable slider from **3 to 120 seconds** between each send. The default (60s) is optimized to comply with Google Workspace limits and simulate human sending behavior.

### 🌐 Bilingual Interface (ES/EN)
Built-in language toggle. One click and the entire UI switches between Spanish and English.

### 👁️ Real-Time Preview
Before sending, click on any email in the queue to see exactly how it will look to the recipient, with fully rendered HTML.

### 📎 File Attachments
Attach PDFs, images, or documents that are automatically sent with every email in the batch.

### 🎨 Premium Interface
Dark mode UI with glassmorphism, micro-animations, and responsive design. It doesn't look like an internal tool — it looks like a SaaS product.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Backend** | Python 3.12, Django 5.x |
| **Frontend** | Vanilla JavaScript, CSS3 (variables, glassmorphism) |
| **Excel Parsing** | `openpyxl` |
| **Column Detection** | `fuzzywuzzy` (fuzzy matching) |
| **Email Sending** | Django's native SMTP (Gmail / Google Workspace) |
| **Configuration** | `python-decouple` (secure environment variables) |

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- A Gmail or Google Workspace account
- A Google App Password (see tutorial below)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/RanuK12/SkyMailer.git
cd SkyMailer

# 2. Create a virtual environment and install dependencies
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# 3. Configure environment variables (see next section)
# Create a .env file in the app_enviar_correos/ folder

# 4. Run migrations and start the server
cd app_enviar_correos
python manage.py migrate
python manage.py runserver
```

Open your browser at `http://127.0.0.1:8000/emailer/` and you're ready to go.

---

## 🔑 `.env` Configuration (Step-by-step Tutorial)

SkyMailer needs access to your email account to send. This is configured securely through a `.env` file that **never gets uploaded to GitHub**.

### Step 1: Enable 2-Step Verification

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under **"How you sign in to Google"**, enable **2-Step Verification** if you haven't already.

### Step 2: Generate an App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Under **"App name"**, type `SkyMailer` (or any name you want).
3. Click **"Create"**.
4. Google will show you a **16-character password** like: `abcd efgh ijkl mnop`
5. **Copy that password** — you'll need it in the next step.

> ⚠️ **Important**: This password can't be viewed again. If you lose it, just delete it and create a new one.

### Step 3: Create the `.env` file

Create a file called `.env` inside the `app_enviar_correos/` folder with the following content:

```env
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
```

**If you use Google Workspace** (custom domain like `you@yourcompany.com`), it works exactly the same:

```env
EMAIL_HOST_USER=you@yourcompany.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Verify it works

Start the server and you'll see your email in the header. Send a test email to yourself to confirm everything works.

---

## 📋 Excel File Format

SkyMailer expects an `.xlsx` or `.csv` file with at least these 3 columns (names are flexible):

| Column | Accepted Examples |
|---|---|
| **Email** | `email`, `Email_Recipient`, `correo`, `to` |
| **Subject** | `subject`, `asunto`, `Subject_Main` |
| **Body** | `body`, `message`, `email_1_body`, `content` |

The body can be **plain text or HTML**. If you send HTML, the email arrives with professional formatting (colors, buttons, tables).

---

## 🔐 Security

- Credentials are **never stored in code**. They're loaded from `.env` using `python-decouple`.
- The `.env` file is in `.gitignore`.
- Emails are sent via **TLS** (encrypted in transit).
- No recipient data is stored in the database.

---

## 📁 Project Structure

```
SkyMailer/
├── app_enviar_correos/
│   ├── app_enviar_correos/         # Django configuration
│   │   ├── settings.py             # General config + SMTP email
│   │   ├── urls.py                 # Main routes
│   │   └── views.py                # Root view
│   ├── emailer/                    # Main app
│   │   ├── static/emailer/
│   │   │   ├── css/style.css       # Dark mode UI + glassmorphism
│   │   │   └── js/app.js           # Frontend logic + i18n
│   │   ├── templates/
│   │   │   └── email_form.html     # Main interface
│   │   ├── views.py                # API: upload, send, templates
│   │   └── urls.py                 # API routes
│   └── manage.py
├── reformat_emails.py              # Utility: plain text → professional HTML
├── requirements.txt
├── LICENSE
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap

- [ ] Metrics dashboard (sent / failed / open rate)
- [ ] Scheduled sending (send tomorrow at 9:00 AM)
- [ ] Calendly integration for meeting tracking
- [ ] Test mode (send everything to yourself first)
- [ ] Multi-account SMTP support
- [ ] Production deployment (SaaS)

---

## 💡 Interested in this project?

If you'd like to use SkyMailer as a SaaS product, contribute to development, or explore a commercial collaboration, get in touch:

- 🌐 **[ranuk.dev](https://ranuk.dev)**
- 💼 **[LinkedIn — Emilio Ranucoli](https://www.linkedin.com/in/emilioranucoli/)**
- 📧 **emilio@ranuk.dev**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Emilio Ranucoli** — Systems Engineer  
Founder of [Ranuk IT Solutions](https://ranuk.dev)  
Ex-Booking.com (Amsterdam) · Ex-Accenture (Rome)

<p align="center">
  <sub>Made with ☕ in Córdoba, Argentina · <a href="https://ranuk.dev">ranuk.dev</a></sub>
</p>
