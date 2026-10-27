'use strict';

// 启动器自己产生的文字（日志、错误、提示）统一在这里翻译。
// 服务端和 cloudflared 的原始输出不做翻译，按原样进日志。
const MESSAGES = {
  en: {
    'launcher.started': 'Console ready: {url}',
    'launcher.configFile': 'Config file: {path}',
    'launcher.cloudflaredFound': 'cloudflared: {path}',
    'launcher.cloudflaredMissing': 'cloudflared not found — download it before using the tunnel',
    'launcher.alreadyRunning': 'Console is already running — opening the existing window',
    'launcher.portBusy': 'Port {port} is already used by another program. Close it and try again.',
    'launcher.shuttingDown': 'Shutting down ({reason})',
    'launcher.settingsSaved': 'Settings saved',
    'launcher.syncFailed': 'Service sync failed: {message}',
    'launcher.autoTunnelFailed': 'Auto tunnel failed: {message}',

    'service.alreadyRunning': 'Service is already running',
    'service.portInUse': 'Port {port} is busy: a previous service may still be running. Close it or choose another port in Settings.',
    'service.startTimeout': 'Service did not respond within {seconds}s (port {port})',
    'service.exited': 'Service exited unexpectedly (code {code}{signal}).',
    'service.spawnFailed': 'Could not start the service process: {message}',
    'service.startFailed': 'Service failed to start',
    'service.childExited': 'Service process exited',
    'service.started': 'Service started: {url}',
    'service.stopped': 'Service stopped',

    'tunnel.starting': 'Starting tunnel to {target} via {executable}',
    'tunnel.url': 'Public URL: {url}',
    'tunnel.stopped': 'Tunnel closed',
    'tunnel.missing': 'cloudflared was not found. Run scripts\\get-cloudflared.cmd first, or set its path in Settings.',
    'tunnel.timeout': 'Tunnel setup timed out after 30s — the network may not reach Cloudflare.',
    'tunnel.exited': 'cloudflared exited (code {code}{signal}).',
    'tunnel.spawnFailed': 'Could not start cloudflared: {message}',
    'tunnel.alreadyRunning': 'Tunnel is already running',
    'tunnel.startFailed': 'Tunnel failed to start',
    'tunnel.childExited': 'cloudflared is not running',

    'main.busy': 'Another operation is still running. Please wait.',
    'main.serviceRequired': 'Start the service before enabling the tunnel',
    'main.badJson': 'Request body is not valid JSON',
    'main.forbidden': 'The local console rejected this request',
    'main.notFound': 'Not found',
    'main.operationFailed': 'Operation failed',

    'config.portRange': 'Service port must be an integer between {min} and {max}',
    'config.passwordMin': 'DJ password must be at least 4 characters',
    'config.fixedUrl': 'Fixed public URL must start with http:// or https://',
    'config.language': 'Language must be one of en, zh or de'
  },

  zh: {
    'launcher.started': '控制台已启动：{url}',
    'launcher.configFile': '配置文件：{path}',
    'launcher.cloudflaredFound': 'cloudflared：{path}',
    'launcher.cloudflaredMissing': 'cloudflared：未找到，开启穿透前需要先下载',
    'launcher.alreadyRunning': '控制台已经在运行，打开现有窗口',
    'launcher.portBusy': '端口 {port} 被其他程序占用，请关掉占用它的程序后重试',
    'launcher.shuttingDown': '正在退出（{reason}）',
    'launcher.settingsSaved': '环境设置已保存',
    'launcher.syncFailed': '同步服务状态失败：{message}',
    'launcher.autoTunnelFailed': '自动开启穿透失败：{message}',

    'service.alreadyRunning': '服务已经在运行',
    'service.portInUse': '端口 {port} 已被占用：可能是上一次的服务没有关干净。请关闭占用该端口的程序，或在环境设置里换一个端口',
    'service.startTimeout': '服务启动超时（{seconds} 秒内没有响应，端口 {port}）',
    'service.exited': '服务异常退出（退出码 {code}{signal}）。',
    'service.spawnFailed': '无法启动服务进程：{message}',
    'service.startFailed': '服务启动失败',
    'service.childExited': '服务进程已退出',
    'service.started': '服务已启动：{url}',
    'service.stopped': '服务已停止',

    'tunnel.starting': '使用 {executable} 建立穿透：{target}',
    'tunnel.url': '公网地址：{url}',
    'tunnel.stopped': '穿透已关闭',
    'tunnel.missing': '没有找到 cloudflared，请先运行 scripts\\get-cloudflared.cmd 下载，或在环境设置里填写它的路径',
    'tunnel.timeout': '穿透建立超时（30 秒）：可能是网络连不上 Cloudflare',
    'tunnel.exited': 'cloudflared 已退出（退出码 {code}{signal}）。',
    'tunnel.spawnFailed': '无法启动 cloudflared：{message}',
    'tunnel.alreadyRunning': '穿透已经在运行',
    'tunnel.startFailed': '穿透建立失败',
    'tunnel.childExited': 'cloudflared 进程已退出',

    'main.busy': '正在处理上一个操作，请稍候',
    'main.serviceRequired': '请先开启服务，再开启穿透',
    'main.badJson': '请求体不是有效 JSON',
    'main.forbidden': '本地控制接口拒绝了这个请求',
    'main.notFound': '未找到接口',
    'main.operationFailed': '操作失败',

    'config.portRange': '服务端口必须是 {min}–{max} 之间的整数',
    'config.passwordMin': 'DJ 密码至少 4 个字符',
    'config.fixedUrl': '固定公网地址必须以 http:// 或 https:// 开头',
    'config.language': '语言必须是 en、zh 或 de 之一'
  },

  de: {
    'launcher.started': 'Konsole bereit: {url}',
    'launcher.configFile': 'Konfigurationsdatei: {path}',
    'launcher.cloudflaredFound': 'cloudflared: {path}',
    'launcher.cloudflaredMissing': 'cloudflared nicht gefunden – vor dem Tunnel herunterladen',
    'launcher.alreadyRunning': 'Konsole läuft bereits – vorhandenes Fenster wird geöffnet',
    'launcher.portBusy': 'Port {port} wird bereits von einem anderen Programm verwendet. Bitte schließen und erneut versuchen.',
    'launcher.shuttingDown': 'Wird beendet ({reason})',
    'launcher.settingsSaved': 'Einstellungen gespeichert',
    'launcher.syncFailed': 'Synchronisierung mit dem Dienst fehlgeschlagen: {message}',
    'launcher.autoTunnelFailed': 'Automatischer Tunnel fehlgeschlagen: {message}',

    'service.alreadyRunning': 'Der Dienst läuft bereits',
    'service.portInUse': 'Port {port} ist belegt: Möglicherweise läuft noch ein alter Dienst. Beende ihn oder wähle in den Einstellungen einen anderen Port.',
    'service.startTimeout': 'Der Dienst antwortete nicht innerhalb von {seconds} s (Port {port})',
    'service.exited': 'Der Dienst wurde unerwartet beendet (Code {code}{signal}).',
    'service.spawnFailed': 'Dienstprozess konnte nicht gestartet werden: {message}',
    'service.startFailed': 'Der Dienst konnte nicht gestartet werden',
    'service.childExited': 'Der Dienstprozess wurde beendet',
    'service.started': 'Dienst gestartet: {url}',
    'service.stopped': 'Dienst gestoppt',

    'tunnel.starting': 'Tunnel zu {target} wird über {executable} gestartet',
    'tunnel.url': 'Öffentliche URL: {url}',
    'tunnel.stopped': 'Tunnel geschlossen',
    'tunnel.missing': 'cloudflared wurde nicht gefunden. Starte zuerst scripts\\get-cloudflared.cmd oder trage den Pfad in den Einstellungen ein.',
    'tunnel.timeout': 'Tunnel-Aufbau nach 30 s abgebrochen – das Netzwerk erreicht Cloudflare möglicherweise nicht.',
    'tunnel.exited': 'cloudflared wurde beendet (Code {code}{signal}).',
    'tunnel.spawnFailed': 'cloudflared konnte nicht gestartet werden: {message}',
    'tunnel.alreadyRunning': 'Der Tunnel läuft bereits',
    'tunnel.startFailed': 'Tunnel konnte nicht gestartet werden',
    'tunnel.childExited': 'cloudflared läuft nicht mehr',

    'main.busy': 'Eine andere Aktion läuft noch. Bitte warten.',
    'main.serviceRequired': 'Starte zuerst den Dienst, dann den Tunnel',
    'main.badJson': 'Der Anfrageinhalt ist kein gültiges JSON',
    'main.forbidden': 'Die lokale Konsole hat diese Anfrage abgelehnt',
    'main.notFound': 'Nicht gefunden',
    'main.operationFailed': 'Aktion fehlgeschlagen',

    'config.portRange': 'Der Dienstport muss eine ganze Zahl zwischen {min} und {max} sein',
    'config.passwordMin': 'Das DJ-Passwort muss mindestens 4 Zeichen haben',
    'config.fixedUrl': 'Die feste öffentliche URL muss mit http:// oder https:// beginnen',
    'config.language': 'Die Sprache muss en, zh oder de sein'
  }
};

const LANGUAGES = ['en', 'zh', 'de'];

function normalizeLanguage(value) {
  return LANGUAGES.includes(value) ? value : 'en';
}

function translate(language, key, params = {}) {
  const dict = MESSAGES[normalizeLanguage(language)];
  const template = dict[key] || MESSAGES.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    params[name] === undefined || params[name] === null ? match : String(params[name])
  ));
}

module.exports = { MESSAGES, LANGUAGES, normalizeLanguage, translate };
