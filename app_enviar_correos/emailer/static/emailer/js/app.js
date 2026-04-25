/* ═══════════════════════════════════════════
   SkyMailer v2 — JavaScript Application
   ═══════════════════════════════════════════ */

const App = {
  recipients: [],
  attachments: [],
  templates: [],
  availableVars: ['email', 'nombre'],
  batchMode: false,
  batchPreviewIndex: 0,

  init() {
    this.bindEvents();
    this.loadTemplates();
    this.updatePreview();
  },

  // ── Event Binding ──
  bindEvents() {
    // Recipients input
    const rInput = document.getElementById('recipientsInput');
    if (rInput) {
      rInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
          e.preventDefault();
          this.addRecipientsFromText(rInput.value);
          rInput.value = '';
        }
      });
      rInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        this.addRecipientsFromText(text);
        rInput.value = '';
      });
    }

    // CSV upload
    const csvBtn = document.getElementById('csvUploadBtn');
    const csvInput = document.getElementById('csvFileInput');
    if (csvBtn && csvInput) {
      csvBtn.addEventListener('click', () => csvInput.click());
      csvInput.addEventListener('change', (e) => this.handleCSVUpload(e));
    }

    // Attachments
    const attBtn = document.getElementById('attachBtn');
    const attInput = document.getElementById('attachFileInput');
    if (attBtn && attInput) {
      attBtn.addEventListener('click', () => attInput.click());
      attInput.addEventListener('change', (e) => this.handleAttachments(e));
    }

    // Subject & message preview
    const subject = document.getElementById('asunto');
    const message = document.getElementById('mensaje');
    if (subject) subject.addEventListener('input', () => this.updatePreview());
    if (message) message.addEventListener('input', () => this.updatePreview());

    // Send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); this.sendEmails(); });
    const sendBtnBatch = document.getElementById('sendBtnBatch');
    if (sendBtnBatch) sendBtnBatch.addEventListener('click', (e) => { e.preventDefault(); this.sendEmails(); });

    // Batch attachment input
    const attInputBatch = document.getElementById('attachFileInputBatch');
    if (attInputBatch) attInputBatch.addEventListener('change', (e) => this.handleAttachments(e));

    // Delay slider
    const delaySlider = document.getElementById('delaySlider');
    if (delaySlider) {
      delaySlider.addEventListener('input', () => {
        document.getElementById('delayValue').textContent = delaySlider.value + 's';
      });
    }

    // Drag & drop on recipients zone
    const zone = document.getElementById('recipientsZone');
    if (zone) {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          const csvIn = document.getElementById('csvFileInput');
          csvIn.files = e.dataTransfer.files;
          this.handleCSVUpload({ target: csvIn });
        }
      });
    }

    // Close progress overlay
    const closeBtn = document.getElementById('closeProgress');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      document.getElementById('progressOverlay').classList.remove('active');
    });
  },

  // ── Recipients ──
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  addRecipientsFromText(text) {
    const parts = text.split(/[,;\n\r\t]+/);
    parts.forEach(p => {
      const email = p.trim();
      if (email && !this.recipients.find(r => r.email === email)) {
        this.recipients.push({
          email: email,
          nombre: email.split('@')[0],
          _valid: this.validateEmail(email)
        });
      }
    });
    this.renderRecipients();
    this.updatePreview();
  },

  removeRecipient(index) {
    this.recipients.splice(index, 1);
    this.renderRecipients();
    this.updatePreview();
  },

  clearRecipients() {
    this.recipients = [];
    this.batchMode = false;
    this.batchPreviewIndex = 0;
    this.toggleBatchMode(false);
    this.renderRecipients();
    this.updatePreview();
  },

  renderRecipients() {
    const container = document.getElementById('recipientChips');
    const counter = document.getElementById('recipientCount');
    const zone = document.getElementById('recipientsZone');

    container.innerHTML = this.recipients.map((r, i) => `
      <span class="chip ${r._valid ? '' : 'invalid'}" title="${r.nombre || r.email}">
        ${r._valid ? '✓' : '✗'} ${r.email}
        <span class="remove" onclick="App.removeRecipient(${i})">×</span>
      </span>
    `).join('');

    const valid = this.recipients.filter(r => r._valid).length;
    counter.innerHTML = `<span class="count">${valid}</span> destinatarios válidos de ${this.recipients.length}`;
    zone.classList.toggle('has-recipients', this.recipients.length > 0);

    // Update send button(s)
    const sendBtn = document.getElementById('sendBtn');
    const sendBtnBatch = document.getElementById('sendBtnBatch');
    if (sendBtn) sendBtn.disabled = valid === 0;
    if (sendBtnBatch) sendBtnBatch.disabled = valid === 0;

    this.renderVariables();
  },

  renderVariables() {
    const bar = document.getElementById('variablesBar');
    if (!bar) return;
    const vars = new Set(['email', 'nombre']);
    this.recipients.forEach(r => {
      Object.keys(r).forEach(k => { if (!k.startsWith('_')) vars.add(k); });
    });
    this.availableVars = [...vars];
    bar.innerHTML = '<span style="font-size:0.75em;color:var(--text-muted);margin-right:4px;">Variables:</span>' +
      this.availableVars.map(v => `<span class="var-tag" onclick="App.insertVariable('${v}')">{${v}}</span>`).join('');
  },

  insertVariable(name) {
    const msg = document.getElementById('mensaje');
    if (msg) {
      const start = msg.selectionStart;
      const end = msg.selectionEnd;
      const text = msg.value;
      const insert = `{${name}}`;
      msg.value = text.substring(0, start) + insert + text.substring(end);
      msg.selectionStart = msg.selectionEnd = start + insert.length;
      msg.focus();
      this.updatePreview();
    }
  },

  // ── CSV/Excel Upload ──
  _pendingFile: null,

  async handleCSVUpload(event, sheetName) {
    const file = sheetName ? this._pendingFile : event.target.files[0];
    if (!file) return;

    // Store file reference for potential sheet re-upload
    if (!sheetName) this._pendingFile = file;

    const formData = new FormData();
    formData.append('file', file);
    if (sheetName) formData.append('sheet_name', sheetName);

    try {
      const resp = await fetch('/emailer/api/upload-csv/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': this.getCSRF() }
      });

      const data = await resp.json();
      if (!resp.ok) {
        this.showToast(data.error || 'Error al cargar el archivo', 'error');
        return;
      }

      // Excel with multiple sheets: show sheet selector
      if (data.needs_sheet_selection) {
        this.showSheetSelector(data.sheets);
        return;
      }

      // Merge recipients
      data.recipients.forEach(r => {
        r._valid = this.validateEmail(r.email);
        if (!this.recipients.find(x => x.email === r.email)) {
          this.recipients.push(r);
        }
      });

      // Check if batch mode
      if (data.batch_mode) {
        this.batchMode = true;
        this.batchPreviewIndex = 0;
        this.toggleBatchMode(true);
        this.renderBatchQueue();
        this.showToast(`📦 Modo por lotes: ${data.count} emails únicos cargados`, 'success');
      } else {
        this.showToast(`${data.count} destinatarios importados desde CSV`, 'success');
      }

      this.renderRecipients();
      this.updatePreview();
    } catch (err) {
      this.showToast('Error de conexión al subir archivo', 'error');
    }

    if (!sheetName && event.target) event.target.value = '';
  },

  showSheetSelector(sheets) {
    // Remove existing selector if any
    document.getElementById('sheetOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sheetOverlay';
    overlay.className = 'progress-overlay active';
    overlay.innerHTML = `
      <div class="progress-card" style="max-width:420px">
        <h2 class="progress-title">📊 Seleccionar Hoja</h2>
        <p class="progress-subtitle">Tu archivo Excel tiene varias hojas. ¿De cuál quieres importar?</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin:20px 0">
          ${sheets.map(s => `
            <button class="btn btn-secondary" style="width:100%;justify-content:center" 
                    onclick="App.selectSheet('${s.replace(/'/g, "\\'")}')">
              📄 ${s}
            </button>
          `).join('')}
        </div>
        <button class="btn btn-secondary" style="margin-top:8px" onclick="document.getElementById('sheetOverlay').remove()">
          Cancelar
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  selectSheet(sheetName) {
    document.getElementById('sheetOverlay')?.remove();
    this.handleCSVUpload(null, sheetName);
  },

  // ── Attachments ──
  handleAttachments(event) {
    const files = Array.from(event.target.files);
    files.forEach(f => {
      if (!this.attachments.find(a => a.name === f.name)) {
        this.attachments.push(f);
      }
    });
    this.renderAttachments();
    event.target.value = '';
  },

  removeAttachment(index) {
    this.attachments.splice(index, 1);
    this.renderAttachments();
  },

  renderAttachments() {
    const container = document.getElementById('attachmentsList');
    if (!container) return;

    container.innerHTML = this.attachments.map((f, i) => {
      const size = f.size < 1024 ? f.size + ' B' :
                   f.size < 1024*1024 ? (f.size/1024).toFixed(1) + ' KB' :
                   (f.size/1024/1024).toFixed(1) + ' MB';
      const icon = f.type.startsWith('image/') ? '🖼️' :
                   f.type.includes('pdf') ? '📄' :
                   f.type.includes('sheet') || f.type.includes('excel') ? '📊' : '📎';
      return `<div class="attachment-item">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${f.name}</span>
        <span class="file-size">${size}</span>
        <span class="remove-att" onclick="App.removeAttachment(${i})">✗</span>
      </div>`;
    }).join('');
  },

  // ── Templates ──
  async loadTemplates() {
    try {
      const resp = await fetch('/emailer/api/templates/');
      const data = await resp.json();
      this.templates = data.templates;
      this.renderTemplates();
    } catch (e) {
      console.error('Could not load templates:', e);
    }
  },

  renderTemplates() {
    const grid = document.getElementById('templateGrid');
    if (!grid) return;
    grid.innerHTML = this.templates.map(t => {
      const emoji = t.name.match(/^(\S+)/)?.[1] || '📝';
      const label = t.name.replace(/^\S+\s*/, '');
      return `<div class="template-card" data-id="${t.id}" onclick="App.selectTemplate('${t.id}')">
        <span class="emoji">${emoji}</span>
        ${label}
      </div>`;
    }).join('');
  },

  selectTemplate(id) {
    const tpl = this.templates.find(t => t.id === id);
    if (!tpl) return;

    document.getElementById('asunto').value = tpl.subject;
    document.getElementById('mensaje').value = tpl.body;

    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`.template-card[data-id="${id}"]`)?.classList.add('active');

    this.updatePreview();
  },

  // ── Batch Mode ──
  toggleBatchMode(on) {
    const composeCard = document.getElementById('composeCard');
    const batchCard = document.getElementById('batchCard');
    const templateCard = document.getElementById('templateCard');
    const previewNav = document.getElementById('previewNav');
    if (composeCard) composeCard.style.display = on ? 'none' : '';
    if (batchCard) batchCard.style.display = on ? '' : 'none';
    if (templateCard) templateCard.style.display = on ? 'none' : '';
    if (previewNav) previewNav.style.display = on ? 'flex' : 'none';
  },

  renderBatchQueue() {
    const container = document.getElementById('batchQueue');
    const countEl = document.getElementById('batchCount');
    if (!container) return;

    const valid = this.recipients.filter(r => r._valid);
    if (countEl) countEl.textContent = `${valid.length} emails`;

    container.innerHTML = valid.map((r, i) => {
      const subj = (r._asunto || '').substring(0, 50) + ((r._asunto || '').length > 50 ? '...' : '');
      const isActive = i === this.batchPreviewIndex;
      return `<div class="batch-item ${isActive ? 'active' : ''}" onclick="App.previewBatchItem(${i})">
        <span class="batch-num">#${i + 1}</span>
        <div class="batch-info">
          <div class="batch-email">${r.email}</div>
          <div class="batch-subject">${subj || '<em>Sin asunto</em>'}</div>
        </div>
      </div>`;
    }).join('');
  },

  previewBatchItem(index) {
    this.batchPreviewIndex = index;
    this.renderBatchQueue();
    this.updatePreview();
  },

  // ── Preview ──
  updatePreview() {
    const previewBody = document.getElementById('previewBody');
    const previewSubject = document.getElementById('previewSubject');
    const previewTo = document.getElementById('previewTo');
    const previewCounter = document.getElementById('previewCounter');

    if (this.batchMode && this.recipients.length > 0) {
      // Batch mode: show the selected email
      const valid = this.recipients.filter(r => r._valid);
      const r = valid[this.batchPreviewIndex] || valid[0];
      if (!r) return;

      let subject = r._asunto || '';
      let message = r._mensaje || '';

      // Replace variables
      for (const [key, val] of Object.entries(r)) {
        if (key.startsWith('_')) continue;
        subject = subject.replaceAll(`{${key}}`, `<span style="color:#6C63FF;font-weight:600">${val}</span>`);
        message = message.replaceAll(`{${key}}`, `<span style="color:#6C63FF;font-weight:600">${val}</span>`);
      }

      if (previewSubject) previewSubject.innerHTML = subject || '<em style="color:#999">Sin asunto</em>';
      if (previewTo) previewTo.textContent = r.email;
      if (previewBody) previewBody.innerHTML = message || '<em style="color:#999">Sin mensaje</em>';
      if (previewCounter) previewCounter.textContent = `${this.batchPreviewIndex + 1} / ${valid.length}`;
    } else {
      // Normal mode
      const subject = document.getElementById('asunto')?.value || '';
      const message = document.getElementById('mensaje')?.value || '';
      const sample = this.recipients[0] || { email: 'destinatario@ejemplo.com', nombre: 'Nombre' };

      let subjectPreview = subject;
      let messagePreview = message;

      for (const [key, val] of Object.entries(sample)) {
        if (key.startsWith('_')) continue;
        subjectPreview = subjectPreview.replaceAll(`{${key}}`, `<span style="color:#6C63FF;font-weight:600">${val}</span>`);
        messagePreview = messagePreview.replaceAll(`{${key}}`, `<span style="color:#6C63FF;font-weight:600">${val}</span>`);
      }

      if (previewSubject) previewSubject.innerHTML = subjectPreview || '<em style="color:#999">Sin asunto</em>';
      if (previewTo) previewTo.textContent = sample.email;
      if (previewBody) previewBody.innerHTML = messagePreview || '<em style="color:#999">Escribe tu mensaje...</em>';
      if (previewCounter) previewCounter.textContent = '';
    }
  },

  // ── Send Emails ──
  async sendEmails() {
    const validRecipients = this.recipients.filter(r => r._valid);
    if (validRecipients.length === 0) {
      this.showToast('No hay destinatarios válidos', 'error');
      return;
    }

    const subject = document.getElementById('asunto')?.value || '';
    if (!this.batchMode && !subject.trim()) {
      this.showToast('El asunto no puede estar vacío', 'error');
      return;
    }

    const message = document.getElementById('mensaje')?.value || '';
    const delayEl = this.batchMode ? document.getElementById('delaySliderBatch') : document.getElementById('delaySlider');
    const delay = delayEl?.value || 3;

    // Prepare form data
    const formData = new FormData();
    formData.append('asunto', subject);
    formData.append('mensaje', message);
    formData.append('batch_mode', this.batchMode ? 'true' : 'false');
    formData.append('destinatarios', JSON.stringify(validRecipients.map(r => {
      const clean = { ...r };
      delete clean._valid;
      return clean;
    })));
    formData.append('is_html', 'true');
    formData.append('delay', delay);

    // Add attachments
    this.attachments.forEach((f, i) => formData.append(`attachment_${i}`, f));

    // Show progress overlay
    const overlay = document.getElementById('progressOverlay');
    const progressBar = document.getElementById('progressBarFill');
    const progressLog = document.getElementById('progressLog');
    const progressTitle = document.getElementById('progressTitle');
    const progressSubtitle = document.getElementById('progressSubtitle');
    const successCount = document.getElementById('successCount');
    const errorCount = document.getElementById('errorCount');
    const totalCount = document.getElementById('totalCount');
    const closeBtn = document.getElementById('closeProgress');
    const downloadBtn = document.getElementById('downloadLog');

    overlay.classList.add('active');
    progressBar.style.width = '0%';
    progressLog.innerHTML = '';
    successCount.textContent = '0';
    errorCount.textContent = '0';
    totalCount.textContent = validRecipients.length;
    progressTitle.textContent = 'Enviando correos...';
    progressSubtitle.textContent = `0 de ${validRecipients.length} procesados`;
    closeBtn.style.display = 'none';
    downloadBtn.style.display = 'none';

    let successes = 0;
    let errors = 0;
    const logEntries = [];

    try {
      const response = await fetch('/emailer/api/send/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': this.getCSRF() }
      });

      if (!response.ok) {
        const err = await response.json();
        this.showToast(err.error || 'Error al enviar', 'error');
        overlay.classList.remove('active');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const result = JSON.parse(line);
            const processed = successes + errors + 1;

            if (result.status === 'success') {
              successes++;
              successCount.textContent = successes;
            } else {
              errors++;
              errorCount.textContent = errors;
            }

            const icon = result.status === 'success' ? '✅' : '❌';
            const entry = `<div class="log-entry">
              <span class="status-icon">${icon}</span>
              <span class="log-email">${result.email}</span>
              <span style="color:var(--text-muted);font-size:0.9em">${result.message}</span>
            </div>`;
            progressLog.innerHTML += entry;
            progressLog.scrollTop = progressLog.scrollHeight;

            logEntries.push(result);

            const pct = (processed / validRecipients.length) * 100;
            progressBar.style.width = pct + '%';
            progressSubtitle.textContent = `${processed} de ${validRecipients.length} procesados`;
          } catch (e) { /* skip malformed lines */ }
        }
      }

      progressTitle.textContent = errors === 0 ? '✅ ¡Todos los correos enviados!' : '⚠️ Envío completado con errores';
      progressSubtitle.textContent = `${successes} enviados, ${errors} fallidos`;
      closeBtn.style.display = '';
      downloadBtn.style.display = '';
      downloadBtn.onclick = () => this.downloadLog(logEntries);

    } catch (err) {
      progressTitle.textContent = '❌ Error de conexión';
      progressSubtitle.textContent = err.message;
      closeBtn.style.display = '';
    }
  },

  // ── Utilities ──
  getCSRF() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
           document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; }, 3000);
    setTimeout(() => toast.remove(), 3500);
  },

  downloadLog(entries) {
    const csv = 'Email,Estado,Mensaje\n' +
      entries.map(e => `"${e.email}","${e.status}","${e.message}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'skymailer_log.csv'; a.click();
    URL.revokeObjectURL(url);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
