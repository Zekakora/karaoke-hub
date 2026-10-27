'use strict';

const token = document.querySelector('meta[name="launcher-token"]').content;

const I18N = {
  en: {
    'app.title': 'LC AACHEN Karaoke Console',
    'app.heading': 'LC AACHEN Karaoke Console',
    'app.version': 'Console v{version}',
    'app.language': 'Language',
    'app.running': 'running',
    'button.start': 'Start service',
    'button.restart': 'Restart service',
    'button.stop': 'Stop service',
    'button.tunnelStart': 'Enable tunnel',
    'button.tunnelStop': 'Disable tunnel',
    'button.tunnelConnecting': 'Connecting…',
    'button.tunnelRetry': 'Retry tunnel',
    'button.settings': 'Settings',
    'button.copy': 'Copy',
    'button.clear': 'Clear',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.restartNow': 'Restart now',
    'button.show': 'Show',
    'button.hide': 'Hide',
    'chip.service.running': 'Service · Running',
    'chip.service.starting': 'Service · Starting',
    'chip.service.stopping': 'Service · Stopping',
    'chip.service.stopped': 'Service · Stopped',
    'chip.service.failed': 'Service · Failed',
    'chip.tunnel.on': 'Tunnel · On',
    'chip.tunnel.connecting': 'Tunnel · Connecting',
    'chip.tunnel.stopping': 'Tunnel · Closing',
    'chip.tunnel.off': 'Tunnel · Off',
    'chip.tunnel.failed': 'Tunnel · Failed',
    'address.local': 'Local',
    'address.lan': 'LAN',
    'address.public': 'Public',
    'address.notDetected': 'No LAN address detected',
    'address.publicConnecting': 'Assigning a public address…',
    'address.publicOff': 'Off',
    'log.title': 'Runtime log',
    'settings.title': 'Settings',
    'settings.desc': 'Port and DJ password take effect after a service restart.',
    'settings.port': 'Service port',
    'settings.portHint': 'Guests and the DJ console use this port (default 3000).',
    'settings.password': 'DJ password',
    'settings.passwordHint': 'Generated on first launch; change it to something easy to type.',
    'settings.apiKey': 'YouTube API key (optional)',
    'settings.apiKeyHint': 'Applies immediately; leave empty to use the built-in demo catalog.',
    'settings.cloudflared': 'cloudflared path (optional)',
    'settings.cloudflaredHint': 'Empty: bin\\cloudflared.exe or the system PATH is used.',
    'settings.cloudflaredFound': 'Found: {path}',
    'settings.cloudflaredMissing': 'cloudflared not found — run scripts\\get-cloudflared.cmd first.',
    'settings.fixedUrl': 'Fixed public URL (optional)',
    'settings.fixedUrlHint': 'For your own domain or a named tunnel; quick tunnels override it.',
    'settings.autoStart': 'Open the tunnel automatically when the service starts',
    'notice.restartRequired': 'Settings changed — restart the service to apply.',
    'notice.saved': 'Saved.',
    'notice.savedRestart': 'Saved. Restart the service to apply.',
    'notice.copied': 'Address copied.',
    'notice.copyFailed': 'Copy failed — please select the address manually.',
    'confirm.stopWithTunnel': 'Stopping the service will also close the tunnel and invalidate the public address. Continue?',
    'title.startFirst': 'Start the service first',
    'error.request': 'Request failed ({status})'
  },

  zh: {
    'app.title': 'LC AACHEN Karaoke 控制台',
    'app.heading': 'LC AACHEN Karaoke 控制台',
    'app.version': '控制台 v{version}',
    'app.language': '语言',
    'app.running': '运行中',
    'button.start': '开启服务',
    'button.restart': '重启服务',
    'button.stop': '关闭服务',
    'button.tunnelStart': '开启穿透',
    'button.tunnelStop': '关闭穿透',
    'button.tunnelConnecting': '连接中…',
    'button.tunnelRetry': '重试穿透',
    'button.settings': '环境设置',
    'button.copy': '复制',
    'button.clear': '清屏',
    'button.cancel': '取消',
    'button.save': '保存',
    'button.restartNow': '立即重启',
    'button.show': '显示',
    'button.hide': '隐藏',
    'chip.service.running': '服务 · 运行中',
    'chip.service.starting': '服务 · 启动中',
    'chip.service.stopping': '服务 · 停止中',
    'chip.service.stopped': '服务 · 已停止',
    'chip.service.failed': '服务 · 异常',
    'chip.tunnel.on': '穿透 · 已开启',
    'chip.tunnel.connecting': '穿透 · 连接中',
    'chip.tunnel.stopping': '穿透 · 关闭中',
    'chip.tunnel.off': '穿透 · 未开启',
    'chip.tunnel.failed': '穿透 · 异常',
    'address.local': '本机',
    'address.lan': '局域网',
    'address.public': '公网',
    'address.notDetected': '未检测到局域网地址',
    'address.publicConnecting': '正在分配公网地址…',
    'address.publicOff': '未开启',
    'log.title': '运行日志',
    'settings.title': '环境设置',
    'settings.desc': '端口和 DJ 密码修改后需要重启服务；API Key 保存后立即生效。',
    'settings.port': '服务端口',
    'settings.portHint': '观众点歌和 DJ 控制台都通过这个端口访问，默认 3000。',
    'settings.password': 'DJ 密码',
    'settings.passwordHint': '首次使用时自动生成，可以改成现场好输入的密码。',
    'settings.apiKey': 'YouTube API Key（可选）',
    'settings.apiKeyHint': '保存后立即生效；留空则使用内置演示曲库。',
    'settings.cloudflared': 'cloudflared 路径（可选）',
    'settings.cloudflaredHint': '留空则自动使用 bin\\cloudflared.exe 或系统 PATH 中的版本。',
    'settings.cloudflaredFound': '已找到：{path}',
    'settings.cloudflaredMissing': '未找到 cloudflared，请先运行 scripts\\get-cloudflared.cmd 下载。',
    'settings.fixedUrl': '固定公网地址（可选）',
    'settings.fixedUrlHint': '使用自己的域名或命名隧道时填写；快速隧道的地址会自动覆盖它。',
    'settings.autoStart': '开启服务后自动开启穿透',
    'notice.restartRequired': '设置已修改，重启服务后生效。',
    'notice.saved': '设置已保存。',
    'notice.savedRestart': '设置已保存，重启服务后生效。',
    'notice.copied': '地址已复制。',
    'notice.copyFailed': '复制失败，请手动选中地址。',
    'confirm.stopWithTunnel': '关闭服务会同时关闭穿透，公网地址将失效。确定吗？',
    'title.startFirst': '请先开启服务',
    'error.request': '请求失败（{status}）'
  },

  de: {
    'app.title': 'LC AACHEN Karaoke-Konsole',
    'app.heading': 'LC AACHEN Karaoke-Konsole',
    'app.version': 'Konsole v{version}',
    'app.language': 'Sprache',
    'app.running': 'läuft',
    'button.start': 'Dienst starten',
    'button.restart': 'Neu starten',
    'button.stop': 'Dienst stoppen',
    'button.tunnelStart': 'Tunnel starten',
    'button.tunnelStop': 'Tunnel beenden',
    'button.tunnelConnecting': 'Verbinde…',
    'button.tunnelRetry': 'Tunnel erneut',
    'button.settings': 'Einstellungen',
    'button.copy': 'Kopieren',
    'button.clear': 'Leeren',
    'button.cancel': 'Abbrechen',
    'button.save': 'Speichern',
    'button.restartNow': 'Jetzt neu starten',
    'button.show': 'Anzeigen',
    'button.hide': 'Verbergen',
    'chip.service.running': 'Dienst · Läuft',
    'chip.service.starting': 'Dienst · Startet',
    'chip.service.stopping': 'Dienst · Stoppt',
    'chip.service.stopped': 'Dienst · Gestoppt',
    'chip.service.failed': 'Dienst · Fehler',
    'chip.tunnel.on': 'Tunnel · Aktiv',
    'chip.tunnel.connecting': 'Tunnel · Verbindet',
    'chip.tunnel.stopping': 'Tunnel · Schließt',
    'chip.tunnel.off': 'Tunnel · Aus',
    'chip.tunnel.failed': 'Tunnel · Fehler',
    'address.local': 'Lokal',
    'address.lan': 'Netzwerk',
    'address.public': 'Öffentlich',
    'address.notDetected': 'Keine Netzwerkadresse gefunden',
    'address.publicConnecting': 'Öffentliche Adresse wird zugewiesen…',
    'address.publicOff': 'Aus',
    'log.title': 'Laufendes Protokoll',
    'settings.title': 'Einstellungen',
    'settings.desc': 'Port und DJ-Passwort werden nach einem Neustart des Dienstes übernommen.',
    'settings.port': 'Dienstport',
    'settings.portHint': 'Gäste und DJ-Konsole erreichen die Seite über diesen Port (Standard 3000).',
    'settings.password': 'DJ-Passwort',
    'settings.passwordHint': 'Wird beim ersten Start erzeugt; gern auf etwas leicht Tippbares ändern.',
    'settings.apiKey': 'YouTube API-Key (optional)',
    'settings.apiKeyHint': 'Wird sofort übernommen; leer lassen für den Demo-Katalog.',
    'settings.cloudflared': 'cloudflared-Pfad (optional)',
    'settings.cloudflaredHint': 'Leer: bin\\cloudflared.exe oder der System-PATH wird verwendet.',
    'settings.cloudflaredFound': 'Gefunden: {path}',
    'settings.cloudflaredMissing': 'cloudflared nicht gefunden – zuerst scripts\\get-cloudflared.cmd ausführen.',
    'settings.fixedUrl': 'Feste öffentliche URL (optional)',
    'settings.fixedUrlHint': 'Für eigene Domain oder benannten Tunnel; Schnell-Tunnel hat Vorrang.',
    'settings.autoStart': 'Tunnel beim Dienststart automatisch öffnen',
    'notice.restartRequired': 'Einstellungen geändert – Dienst neu starten.',
    'notice.saved': 'Gespeichert.',
    'notice.savedRestart': 'Gespeichert. Dienst neu starten, damit es wirkt.',
    'notice.copied': 'Adresse kopiert.',
    'notice.copyFailed': 'Kopieren fehlgeschlagen – bitte manuell markieren.',
    'confirm.stopWithTunnel': 'Der Tunnel wird ebenfalls geschlossen und die öffentliche Adresse ungültig. Fortfahren?',
    'title.startFirst': 'Zuerst den Dienst starten',
    'error.request': 'Anfrage fehlgeschlagen ({status})'
  }
};

const el = {
  version: document.getElementById('version'),
  chipService: document.getElementById('chip-service'),
  chipTunnel: document.getElementById('chip-tunnel'),
  language: document.getElementById('language-select'),
  btnStart: document.getElementById('btn-start'),
  btnRestart: document.getElementById('btn-restart'),
  btnStop: document.getElementById('btn-stop'),
  btnTunnel: document.getElementById('btn-tunnel'),
  btnSettings: document.getElementById('btn-settings'),
  addrLocal: document.getElementById('addr-local'),
  addrLan: document.getElementById('addr-lan'),
  addrPublic: document.getElementById('addr-public'),
  notice: document.getElementById('notice'),
  log: document.getElementById('log'),
  logFile: document.getElementById('log-file'),
  clearLog: document.getElementById('btn-clear-log'),
  dialog: document.getElementById('settings-dialog'),
  form: document.getElementById('settings-form'),
  settingsCancel: document.getElementById('btn-settings-cancel'),
  settingsPath: document.getElementById('settings-path'),
  cloudflaredHint: document.getElementById('cloudflared-hint'),
  reveal: document.getElementById('btn-reveal')
};

const state = {
  status: null,
  language: 'en',
  languagePending: false,
  localBusy: false,
  lastError: '',
  stickyNotice: false,
  noticeTimer: null
};

const MAX_LOG_LINES = 800;

function t(key, params = {}) {
  const dict = I18N[state.language] || I18N.en;
  const template = dict[key] || I18N.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    params[name] === undefined || params[name] === null ? match : String(params[name])
  ));
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(state.language === 'zh' ? 'zh-CN' : state.language, { hour12: false });
  } catch {
    return '';
  }
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['content-type'] = 'application/json';
  headers['x-launcher-token'] = token;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || t('error.request', { status: response.status }));
  return data;
}

function applyStatic() {
  document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : state.language;
  el.language.value = state.language;
  el.language.setAttribute('aria-label', t('app.language'));
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  el.reveal.textContent = el.form.elements.djPassword.type === 'password' ? t('button.show') : t('button.hide');
}

function setChip(element, label, tone) {
  element.className = `chip ${tone}`;
  element.textContent = '';
  element.append(document.createElement('i'), document.createTextNode(label));
}

function hideNotice() {
  el.notice.hidden = true;
  el.notice.className = 'notice';
  state.stickyNotice = false;
}

function showNotice(message, kind = 'info', sticky = false, action = null) {
  el.notice.textContent = message;
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn tiny notice-action';
    button.textContent = action.label;
    button.addEventListener('click', action.onClick);
    el.notice.append(button);
  }
  el.notice.className = `notice ${kind}`;
  el.notice.hidden = false;
  state.stickyNotice = sticky;
  clearTimeout(state.noticeTimer);
  if (!sticky) {
    state.noticeTimer = setTimeout(() => {
      if (!state.stickyNotice) hideNotice();
    }, 7000);
  }
}

function render(status) {
  if (!status) return;
  state.status = status;

  if (status.language && !state.languagePending && status.language !== state.language) {
    state.language = status.language;
    applyStatic();
    state.lastError = '';
  }

  const service = status.service || {};
  const tunnel = status.tunnel || {};
  const busy = Boolean(status.busy) || state.localBusy;
  const running = service.state === 'running';

  el.version.textContent = t('app.version', { version: status.version || '0.0.0' });
  document.title = running ? `${t('app.title')} · ${t('app.running')}` : t('app.title');

  const serviceTones = { running: 'on', starting: 'busy', stopping: 'busy', stopped: 'off', failed: 'error' };
  setChip(el.chipService, t(`chip.service.${serviceTones[service.state] ? service.state : 'stopped'}`), serviceTones[service.state] || 'off');

  const tunnelTones = { on: 'on', connecting: 'busy', stopping: 'busy', off: 'off', failed: 'error' };
  setChip(el.chipTunnel, t(`chip.tunnel.${tunnelTones[tunnel.state] ? tunnel.state : 'off'}`), tunnelTones[tunnel.state] || 'off');

  const port = service.port || service.configuredPort || 3000;
  el.addrLocal.textContent = `http://127.0.0.1:${port}`;
  el.addrLan.textContent = status.lanUrl || t('address.notDetected');
  if (tunnel.state === 'connecting') el.addrPublic.textContent = t('address.publicConnecting');
  else if (status.publicUrl) el.addrPublic.textContent = status.publicUrl;
  else el.addrPublic.textContent = t('address.publicOff');

  el.btnStart.disabled = busy || !['stopped', 'failed'].includes(service.state);
  el.btnRestart.disabled = busy || !running;
  el.btnStop.disabled = busy || !['running', 'starting'].includes(service.state);
  el.btnSettings.disabled = busy;

  const tunnelOn = tunnel.state === 'on';
  el.btnTunnel.textContent = tunnel.state === 'connecting' ? t('button.tunnelConnecting')
    : tunnelOn ? t('button.tunnelStop')
      : tunnel.state === 'failed' ? t('button.tunnelRetry')
        : t('button.tunnelStart');
  el.btnTunnel.disabled = busy
    || tunnel.state === 'connecting'
    || tunnel.state === 'stopping'
    || (!tunnelOn && !running);
  el.btnTunnel.title = !tunnelOn && !running ? t('title.startFirst') : '';

  const errorText = service.error || tunnel.error || '';
  if (errorText && errorText !== state.lastError) showNotice(errorText, 'error', true);
  if (!errorText && state.stickyNotice && el.notice.classList.contains('error')) hideNotice();
  state.lastError = errorText;

  if (!errorText && service.restartRequired && !state.stickyNotice) {
    showNotice(t('notice.restartRequired'), 'info', true, {
      label: t('button.restartNow'),
      onClick: () => act('/api/service/restart')
    });
  }
  if (!errorText && !service.restartRequired && state.stickyNotice && el.notice.classList.contains('info')) hideNotice();

  if (status.logFile) el.logFile.textContent = String(status.logFile).split(/[\\/]/).pop();
}

async function act(path) {
  if (state.localBusy) return;
  state.localBusy = true;
  render(state.status);
  try {
    await api(path, { method: 'POST' });
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    state.localBusy = false;
    if (state.status) render(state.status);
  }
}

function appendLog(entry) {
  const atBottom = el.log.scrollHeight - el.log.scrollTop - el.log.clientHeight < 48;
  const line = document.createElement('div');
  line.className = `log-line ${entry.source || 'launcher'}`;

  const time = document.createElement('span');
  time.className = 't';
  time.textContent = formatTime(entry.at);
  const source = document.createElement('span');
  source.className = 'src';
  source.textContent = entry.source || '';
  const message = document.createElement('span');
  message.className = 'msg';
  message.textContent = entry.text || '';

  line.append(time, source, message);
  el.log.append(line);
  while (el.log.childElementCount > MAX_LOG_LINES) el.log.firstElementChild.remove();
  if (atBottom) el.log.scrollTop = el.log.scrollHeight;
}

async function loadLogs() {
  try {
    const data = await api('/api/logs');
    el.log.textContent = '';
    for (const entry of data.lines || []) appendLog(entry);
    el.log.scrollTop = el.log.scrollHeight;
  } catch {}
}

function connectEvents() {
  const source = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);
  source.addEventListener('status', event => {
    try { render(JSON.parse(event.data)); } catch {}
  });
  source.addEventListener('log', event => {
    try { appendLog(JSON.parse(event.data)); } catch {}
  });
}

async function changeLanguage(language) {
  if (!I18N[language] || language === state.language) return;
  state.language = language;
  state.languagePending = true;
  state.lastError = '';
  hideNotice();
  applyStatic();
  if (state.status) render(state.status);
  try {
    const result = await api('/api/config', { method: 'PUT', body: JSON.stringify({ language }) });
    if (result.status) render(result.status);
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    state.languagePending = false;
  }
}

async function openSettings() {
  try {
    const config = await api('/api/config');
    const form = el.form;
    form.elements.port.value = config.service.port;
    form.elements.djPassword.value = config.djPassword;
    form.elements.djPassword.type = 'password';
    el.reveal.textContent = t('button.show');
    form.elements.youtubeApiKey.value = config.youtubeApiKey || '';
    form.elements.cloudflaredPath.value = config.tunnel.cloudflaredPath || '';
    form.elements.fixedPublicUrl.value = config.tunnel.fixedPublicUrl || '';
    form.elements.autoStart.checked = Boolean(config.tunnel.autoStart);

    if (config.cloudflared && config.cloudflared.available) {
      el.cloudflaredHint.textContent = t('settings.cloudflaredFound', { path: config.cloudflared.executable });
      el.cloudflaredHint.classList.remove('warn');
    } else {
      el.cloudflaredHint.textContent = t('settings.cloudflaredMissing');
      el.cloudflaredHint.classList.add('warn');
    }
    el.settingsPath.textContent = config.configPath || '';
    el.dialog.showModal();
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function saveSettings(event) {
  event.preventDefault();
  const form = el.form;
  const payload = {
    service: { port: Number(form.elements.port.value) },
    djPassword: form.elements.djPassword.value,
    youtubeApiKey: form.elements.youtubeApiKey.value.trim(),
    tunnel: {
      cloudflaredPath: form.elements.cloudflaredPath.value.trim(),
      fixedPublicUrl: form.elements.fixedPublicUrl.value.trim(),
      autoStart: form.elements.autoStart.checked
    }
  };
  try {
    const result = await api('/api/config', { method: 'PUT', body: JSON.stringify(payload) });
    el.dialog.close();
    showNotice(result.requiresRestart ? t('notice.savedRestart') : t('notice.saved'), 'info');
    if (result.status) render(result.status);
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

async function copyAddress(button) {
  const target = document.getElementById(button.dataset.copy);
  const text = target ? target.textContent.trim() : '';
  if (!/^https?:\/\//i.test(text)) return;
  try {
    await navigator.clipboard.writeText(text);
    showNotice(t('notice.copied'), 'info');
  } catch {
    showNotice(t('notice.copyFailed'), 'error');
  }
}

el.btnStart.addEventListener('click', () => act('/api/service/start'));
el.btnRestart.addEventListener('click', () => act('/api/service/restart'));
el.btnStop.addEventListener('click', () => {
  const tunnelOn = state.status && state.status.tunnel && state.status.tunnel.state === 'on';
  if (tunnelOn && !window.confirm(t('confirm.stopWithTunnel'))) return;
  act('/api/service/stop');
});
el.btnTunnel.addEventListener('click', () => {
  const tunnelOn = state.status && state.status.tunnel && state.status.tunnel.state === 'on';
  act(tunnelOn ? '/api/tunnel/stop' : '/api/tunnel/start');
});
el.btnSettings.addEventListener('click', openSettings);
el.form.addEventListener('submit', saveSettings);
el.settingsCancel.addEventListener('click', () => el.dialog.close());
el.reveal.addEventListener('click', () => {
  const input = el.form.elements.djPassword;
  const hidden = input.type === 'password';
  input.type = hidden ? 'text' : 'password';
  el.reveal.textContent = hidden ? t('button.hide') : t('button.show');
});
el.clearLog.addEventListener('click', () => { el.log.textContent = ''; });
el.language.addEventListener('change', event => changeLanguage(event.target.value));
for (const button of document.querySelectorAll('.copy')) {
  button.addEventListener('click', () => copyAddress(button));
}

applyStatic();
connectEvents();
loadLogs();
api('/api/status').then(render).catch(() => {});
setInterval(() => {
  api('/api/status').then(render).catch(() => {});
}, 5000);
