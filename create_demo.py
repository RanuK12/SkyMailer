import openpyxl

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Demo_Linkedin'

headers = ['Email', 'Empresa', 'Subject', 'Body']
ws.append(headers)

# Row 1
html1 = """<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#2d2d2d;line-height:1.75;font-size:15px">
<p>Hola equipo de <strong>TechSolutions Arg</strong>,</p>
<p>Soy Emilio, ingeniero en sistemas. Estuve analizando la arquitectura de su sitio web y noté que los tiempos de carga en dispositivos móviles están por encima de los 4 segundos, lo cual impacta directamente en el SEO y las conversiones.</p>
<p>Implementando una caché distribuida y optimizando el bundle de JS, podríamos reducir ese tiempo a menos de 1 segundo.</p>
<p>¿Tendrían 15 minutos la próxima semana para charlar sobre esto? Sin compromisos.</p>
<p style="margin-top:20px;"><strong>Emilio Ranucoli</strong><br><span style="color:#888;font-size:13px">Ingeniero de Software | Ex-Booking.com</span></p>
</div>"""
ws.append(['ceo@techsolutions.com.ar', 'TechSolutions Arg', 'Observaciones sobre el rendimiento de su web', html1])

# Row 2
html2 = """<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#2d2d2d;line-height:1.75;font-size:15px">
<p>Hola equipo de <strong>Innova Cordoba</strong>,</p>
<p>Soy Emilio, ingeniero en sistemas. Revisando su plataforma e-commerce, noté que la pasarela de pagos actual presenta cierta fricción en el paso final, causando abandono de carritos.</p>
<p>Tengo experiencia integrando soluciones modernas (Stripe/MercadoPago con Webhooks) que aumentan la conversión hasta un 18%.</p>
<p>¿Les interesaría que les prepare una demo de 10 minutos la semana que viene?</p>
<p style="margin-top:20px;"><strong>Emilio Ranucoli</strong><br><span style="color:#888;font-size:13px">Ingeniero de Software | Ex-Booking.com</span></p>
</div>"""
ws.append(['contacto@innovacba.com', 'Innova Cordoba', 'Oportunidad de aumentar conversiones en su e-commerce', html2])

# Row 3
html3 = """<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#2d2d2d;line-height:1.75;font-size:15px">
<p>Hola equipo de <strong>AgroTech Sur</strong>,</p>
<p>Soy Emilio, ingeniero en sistemas. Vi que su sistema de gestión de inventarios sigue dependiendo de procesos manuales en gran medida.</p>
<p>Trabajé desarrollando sistemas internos en Europa que automatizan estos flujos completamente, conectando el ERP con su plataforma web en tiempo real.</p>
<p>Me gustaría mostrarles cómo podrían aplicar esta misma tecnología en Argentina.</p>
<p style="margin-top:20px;"><strong>Emilio Ranucoli</strong><br><span style="color:#888;font-size:13px">Ingeniero de Software | Ex-Booking.com</span></p>
</div>"""
ws.append(['gerencia@agrotechsur.com.ar', 'AgroTech Sur', 'Automatización de su sistema de inventarios', html3])

file_path = r'C:\Users\emilio\Desktop\Oficina Ranuk\Ranuk-Outreach\demo_linkedin_skymailer.xlsx'
wb.save(file_path)
print('Demo Excel created at:', file_path)
