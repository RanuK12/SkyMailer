#!/usr/bin/env python3
"""
Finance Daily Report Generator
Automatiza extracción de datos financieros diarios y genera PDF con ranukita_report.py
"""

import os
import json
import argparse
from datetime import datetime
import requests
from requests.exceptions import RequestException

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
REPORT_PY = os.path.join(PROJECT_ROOT, "scripts", "ranukita_report.py")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output", "finance")
LOGO_PATH = os.path.join(PROJECT_ROOT, "assets", "brand", "ranukita-logo-official.png")
MINILOGO_PATH = os.path.join(PROJECT_ROOT, "assets", "brand", "minilogo2.png")

# FinanzasYA API (gratis, sin key requerida para cotizaciones)
FINANZASYA_API = "https://api.finanzasya.com/v1"


def fetch_cotizaciones():
    """Extrae cotizaciones clave: Dólar Blue, Euro, BTC/USD, Oro, S&P/NASDAQ"""
    endpoints = {
        "dolar_blue": f"{FINANZASYA_API}/cotizacion/dolar_blue",
        "euro": f"{FINANZASYA_API}/cotizacion/euro",
        "btc": f"{FINANZASYA_API}/cotizacion/btc",
        "oro": f"{FINANZASYA_API}/cotizacion/oro",
        "sp500": f"{FINANZASYA_API}/indices/sp500",
    }
    
    data = {}
    for key, url in endpoints.items():
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data[key] = resp.json()
        except RequestException as e:
            data[key] = {"error": str(e), "value": None, "change": None}
    
    return data


def fetch_noticias():
    """Extrae noticias económicas recientes (últimas 24h)"""
    try:
        url = f"{FINANZASYA_API}/noticias/ultimas?sector=economia&limit=5"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except RequestException as e:
        return [{"error": str(e), "title": "No se pudieron cargar noticias", "date": "-"}]


def build_report_data(cotizaciones, noticias):
    """Construye estructura para el template de ranukita_report.py"""
    today = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    cotizaciones_tabla = []
    if cotizaciones.get("dolar_blue"):
        d = cotizaciones["dolar_blue"]
        cotizaciones_tabla.append(["Dólar Blue", f"${d.get('value', 'N/D')}", f"{d.get('change', 'N/C')}%"])
    if cotizaciones.get("euro"):
        e = cotizaciones["euro"]
        cotizaciones_tabla.append(["Euro", f"€{e.get('value', 'N/D')}", f"{e.get('change', 'N/C')}%"])
    if cotizaciones.get("btc"):
        b = cotizaciones["btc"]
        cotizaciones_tabla.append(["BTC/USD", f"${b.get('value', 'N/D')}", f"{b.get('change', 'N/C')}%"])
    if cotizaciones.get("oro"):
        o = cotizaciones["oro"]
        cotizaciones_tabla.append(["Oro (oz)", f"${o.get('value', 'N/D')}", f"{o.get('change', 'N/C')}%"])
    if cotizaciones.get("sp500"):
        s = cotizaciones["sp500"]
        cotizaciones_tabla.append(["S&P 500", f"{s.get('value', 'N/D')}", f"{s.get('change', 'N/C')}%"])

    noticias_list = []
    for n in noticias:
        title = n.get("title", "Sin título")
        date = n.get("date", "-")
        link = n.get("link", "#")
        noticias_list.append(f"• [{date}] {title} → [Leer más]({link})")

    return {
        "date": today,
        "cotizaciones_tabla": cotizaciones_tabla,
        "noticias": "\n".join(noticias_list),
    }


def generate_pdf(report_data):
    """Genera PDF con ranukita_report.py"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_pdf = os.path.join(OUTPUT_DIR, f"finance_daily_{datetime.now().strftime('%Y%m%d')}.pdf")
    
    spec = {
        "title": f"Reporte Financiero Diario — {report_data['date']}",
        "template": "finance_daily",
        "logo": LOGO_PATH,
        "watermark": MINILOGO_PATH,
        "content": [
            {"type": "header", "text": f"Reporte Financiero Diario — {report_data['date']}"},
            {
                "type": "table",
                "header": ["Mercado", "Valor", "Variación"],
                "rows": report_data["cotizaciones_tabla"],
            },
            {"type": "header", "text": "Noticias Económicas"},
            {"type": "text", "text": report_data["noticias"]},
        ],
    }
    
    spec_path = os.path.join(OUTPUT_DIR, "spec.json")
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)

    cmd = f"python3 {REPORT_PY} {spec_path} {output_pdf}"
    result = os.system(cmd)
    if result != 0:
        raise RuntimeError(f"Error generando PDF: exit code {result}")
    
    return output_pdf


def main():
    parser = argparse.ArgumentParser(description="Generar reporte financiero diario")
    parser.add_argument("--no-email", action="store_true", help="Saltar envío por email")
    args = parser.parse_args()

    print("📊 [finance-daily.py] Iniciando extracción de datos...")
    
    cotizaciones = fetch_cotizaciones()
    noticias = fetch_noticias()
    report_data = build_report_data(cotizaciones, noticias)
    
    print("📄 Generando PDF...")
    pdf_path = generate_pdf(report_data)
    print(f"✅ PDF generado: {pdf_path}")
    
    if not args.no_email:
        print("📧 Enviando por email (SkyMailer)...")
        # Integrar con SkyMailer queda para producción; hoy solo generamos el PDF
        print("(Simulado: SkyMailer integrado en producción)")
    
    return pdf_path


if __name__ == "__main__":
    try:
        pdf = main()
        print(f"🎯 Tarea completada: {pdf}")
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
