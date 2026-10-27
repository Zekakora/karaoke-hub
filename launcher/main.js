'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');

const { ConfigStore } = require('./config');
const { LogHub } = require('./logs');
const { ServiceManager } = require('./service');
const { TunnelManager } = require('./tunnel');
const { translate } = require('./i18n');

const ROOT = path.resolve(__dirname, '..');
const UI_DIR = path.join(__dirname, 'ui');
const LAUNCHER_PORT = Number(process.env.KARAOKE_LAUNCHER_PORT) || 8787;
const VERSION = (() => {
  try { return require(path.join(ROOT, 'package.json')).version || '0.0.0'; } catch { return '0.0.0'; }
})();

// 浏览器拿不到这两个值，所以本地控制接口不会被外部网页随意调用。
const TOKEN = crypto.randomBytes(24).toString('hex');
const INTERNAL_TOKEN = crypto.randomBytes(24).toString('hex');

const store = new ConfigStore(ROOT);
const log = new LogHub(path.join(ROOT, 'logs'));

let busy = null;
let shuttingDown = false;
const sseClients = new Set();

let service;
let tunnel;

function msg(key, params) {
  return translate(store.get().language, key, params);
}

function lanAddresses() {
  const all = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family !== 'IPv4' || item.internal) continue;
      if (item.address.startsWith('169.254.')) continue;
      all.push({ name, address: item.address });
    }
  }
  const virtual = /(vmware|virtualbox|vbox|hyper-v|vethernet|wsl|docker|loopback|tailscale|zerotier|tap|tun|npcap)/i;
  const physical = all.filter(item => !virtual.test(item.name));
  const list = physical.length ? physical : all;
  const score = item => item.address.startsWith('192.168.') ? 0
    : item.address.startsWith('10.') ? 1
      : /^172\.(1[6-9]|2\d|3[01])\./.test(item.address) ? 2 : 3;
  return list.sort((a, b) => score(a) - score(b));
}

function buildStatus() {
  const serviceStatus = service.status();
  const tunnelStatus = tunnel.status();
  const addresses = lanAddresses();
  return {
    version: VERSION,
    busy,
    language: store.get().language,
    service: serviceStatus,
    tunnel: tunnelStatus,
    lanUrl: addresses[0] ? `http://${addresses[0].address}:${serviceStatus.port}` : '',
    lanUrls: addresses.map(item => `http://${item.address}:${serviceStatus.port}`),
    publicUrl: tunnelStatus.url || store.get().tunnel.fixedPublicUrl || '',
    cloudflared: tunnel.info(),
    configPath: store.file,
    logFile: log.file
  };
}

function sendEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch {}
  }
}

function broadcast() {
  sendEvent('status', buildStatus());
}

async function syncServiceConfig() {
  const port = service.activePort();
  if (!port) return;
  const config = store.get();
  const payload = {
    tunnelUrl: tunnel.status().url || '',
    fixedUrl: config.tunnel.fixedPublicUrl || '',
    youtubeApiKey: config.youtubeApiKey || ''
  };
  try {
    const response = await fetch(`http://127.0.0.1:${port}/internal/public-url`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-token': INTERNAL_TOKEN },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(1500)
    });
    if (!response.ok) log.line('launcher', msg('launcher.syncFailed', { message: `HTTP ${response.status}` }));
  } catch (error) {
    log.line('launcher', msg('launcher.syncFailed', { message: error.message }));
  }
}

function onServiceChange() {
  broadcast();
  if (service.state === 'failed' && (tunnel.state === 'on' || tunnel.state === 'connecting')) {
    tunnel.stop().catch(() => {}).finally(() => syncServiceConfig());
    return;
  }
  if (service.state === 'stopped') syncServiceConfig();
}

function onTunnelChange() {
  broadcast();
  if (['on', 'off', 'failed'].includes(tunnel.state)) syncServiceConfig();
}

service = new ServiceManager({ root: ROOT, store, log, internalToken: INTERNAL_TOKEN, onChange: onServiceChange });
tunnel = new TunnelManager({ root: ROOT, store, log, onChange: onTunnelChange });

async function startService() {
  await service.start();
  await syncServiceConfig();
  if (store.get().tunnel.autoStart && tunnel.state === 'off') {
    try {
      await tunnel.start();
      await syncServiceConfig();
    } catch (error) {
      log.line('launcher', msg('launcher.autoTunnelFailed', { message: error.message }));
    }
  }
}

async function restartService() {
  await service.stop();
  await new Promise(resolve => setTimeout(resolve, 250));
  await service.start();
  await syncServiceConfig();
}

async function stopService() {
  if (tunnel.state !== 'off') {
    try { await tunnel.stop(); } catch {}
  }
  await service.stop();
}

async function startTunnel() {
  if (service.state !== 'running') {
    const error = new Error(msg('main.serviceRequired'));
    error.statusCode = 409;
    throw error;
  }
  await tunnel.start();
  await syncServiceConfig();
}

async function stopTunnel() {
  await tunnel.stop();
  await syncServiceConfig();
}

const operations = {
  '/api/service/start': { name: 'service-start', run: startService },
  '/api/service/restart': { name: 'service-restart', run: restartService },
  '/api/service/stop': { name: 'service-stop', run: stopService },
  '/api/tunnel/start': { name: 'tunnel-start', run: startTunnel },
  '/api/tunnel/stop': { name: 'tunnel-stop', run: stopTunnel }
};

function run(name, task) {
  if (busy) {
    const error = new Error(msg('main.busy'));
    error.statusCode = 409;
    return Promise.reject(error);
  }
  busy = name;
  broadcast();
  return Promise.resolve()
    .then(task)
    .finally(() => {
      busy = null;
      broadcast();
    });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error(msg('main.badJson'));
    error.statusCode = 400;
    throw error;
  }
}

function authorized(req, url) {
  const token = req.headers['x-launcher-token'] || url.searchParams.get('token');
  if (token !== TOKEN) return false;
  const origin = req.headers.origin;
  const allowed = [`http://127.0.0.1:${LAUNCHER_PORT}`, `http://localhost:${LAUNCHER_PORT}`];
  if (origin && !allowed.includes(origin)) return false;
  const site = req.headers['sec-fetch-site'];
  if (site && !['same-origin', 'none'].includes(site)) return false;
  return true;
}

function configView() {
  const config = store.get();
  const info = tunnel.info();
  return {
    version: VERSION,
    language: config.language,
    service: config.service,
    djPassword: config.djPassword,
    youtubeApiKey: config.youtubeApiKey,
    tunnel: { ...config.tunnel, resolvedPath: info.executable },
    cloudflared: info,
    configPath: store.file,
    logFile: log.file
  };
}

function streamEvents(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write(`event: status\ndata: ${JSON.stringify(buildStatus())}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const method = req.method;

  if (pathname === '/api/ping') {
    return sendJson(res, 200, { app: 'karaoke-launcher', version: VERSION });
  }
  if (pathname === '/api/events') {
    if (!authorized(req, url)) return sendError(res, 403, msg('main.forbidden'));
    return streamEvents(req, res);
  }
  if (!authorized(req, url)) return sendError(res, 403, msg('main.forbidden'));

  if (method === 'GET' && pathname === '/api/status') return sendJson(res, 200, buildStatus());
  if (method === 'GET' && pathname === '/api/logs') return sendJson(res, 200, { lines: log.recent(500), file: log.file });
  if (method === 'GET' && pathname === '/api/config') return sendJson(res, 200, configView());

  if (method === 'PUT' && pathname === '/api/config') {
    const body = await readBody(req);
    const result = store.save(body);
    tunnel.invalidateInfo();
    log.line('launcher', msg('launcher.settingsSaved'));
    if (service.state === 'running') await syncServiceConfig();
    broadcast();
    return sendJson(res, 200, { ...result, status: buildStatus() });
  }

  if (method === 'POST' && operations[pathname]) {
    const operation = operations[pathname];
    await run(operation.name, operation.run);
    return sendJson(res, 200, buildStatus());
  }

  return sendError(res, 404, msg('main.notFound'));
}

function serveStatic(req, res, url) {
  const name = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
  if (!['index.html', 'app.js', 'styles.css', 'ICON.png'].includes(name)) return sendError(res, 404, msg('main.notFound'));
  const file = name === 'ICON.png' ? path.join(ROOT, 'public', 'ICON.png') : path.join(UI_DIR, name);
  if (!fs.existsSync(file)) return sendError(res, 404, msg('main.notFound'));
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
  res.writeHead(200, {
    'Content-Type': types[path.extname(file)] || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  if (name === 'index.html') {
    return res.end(fs.readFileSync(file, 'utf8').replace('__LAUNCHER_TOKEN__', TOKEN));
  }
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${LAUNCHER_PORT}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    if (!res.headersSent) sendError(res, error.statusCode || 500, error.message || msg('main.operationFailed'));
  }
});

function openWindow() {
  const url = `http://127.0.0.1:${LAUNCHER_PORT}/`;
  const candidates = [
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe')
  ].filter(Boolean);
  const browser = candidates.find(candidate => {
    try { return fs.existsSync(candidate); } catch { return false; }
  });
  if (browser) {
    spawn(browser, [`--app=${url}`, '--window-size=1080,780'], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

async function existingLauncher() {
  try {
    const response = await fetch(`http://127.0.0.1:${LAUNCHER_PORT}/api/ping`, { signal: AbortSignal.timeout(800) });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data && data.app === 'karaoke-launcher');
  } catch {
    return false;
  }
}

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    if (await existingLauncher()) {
      log.line('launcher', msg('launcher.alreadyRunning'));
      if (!process.argv.includes('--no-open')) openWindow();
      setTimeout(() => process.exit(0), 300);
      return;
    }
    console.error(msg('launcher.portBusy', { port: LAUNCHER_PORT }));
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});

log.on('line', entry => {
  for (const client of sseClients) {
    try { client.write(`event: log\ndata: ${JSON.stringify(entry)}\n\n`); } catch {}
  }
});

setInterval(() => {
  for (const client of sseClients) {
    try { client.write(': ping\n\n'); } catch {}
  }
}, 15000).unref();

server.listen(LAUNCHER_PORT, '127.0.0.1', () => {
  log.line('launcher', msg('launcher.started', { url: `http://127.0.0.1:${LAUNCHER_PORT}` }));
  log.line('launcher', msg('launcher.configFile', { path: store.file }));
  const info = tunnel.info();
  log.line('launcher', info.available
    ? msg('launcher.cloudflaredFound', { path: info.executable })
    : msg('launcher.cloudflaredMissing'));
  console.log(`Karaoke console: http://127.0.0.1:${LAUNCHER_PORT}`);
  if (!process.argv.includes('--no-open')) openWindow();
});

async function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.line('launcher', msg('launcher.shuttingDown', { reason }));
  try { await tunnel.stop(); } catch {}
  try { await service.stop(); } catch {}
  for (const client of sseClients) {
    try { client.end(); } catch {}
  }
  server.close();
  log.close();
  setTimeout(() => process.exit(0), 200);
}

process.on('SIGINT', () => shutdown('Ctrl+C'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('exit', () => {
  service.killSync();
  tunnel.killSync();
});
