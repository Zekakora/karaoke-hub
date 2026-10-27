'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { translate, normalizeLanguage } = require('./i18n');

const PORT_MIN = 1024;
const PORT_MAX = 65535;

function randomPassword(length = 10) {
  return crypto.randomBytes(16).toString('hex').slice(0, length);
}

function defaults() {
  return {
    language: 'en',
    service: { port: 3000, host: '0.0.0.0' },
    djPassword: randomPassword(),
    youtubeApiKey: '',
    tunnel: { cloudflaredPath: '', fixedPublicUrl: '', autoStart: false }
  };
}

function readLegacyEnv(root, key) {
  for (const name of ['.env', '.env.example']) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    let text = '';
    try { text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''); } catch { continue; }
    const match = text.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`, 'm'));
    if (!match) continue;
    const value = match[1].replace(/^['"]|['"]$/g, '').trim();
    if (value) return value;
  }
  return '';
}

// 旧版本把配置写在 .env 里，第一次生成 config.json 时顺手迁移，避免用户重新填一遍。
function applyLegacyEnv(config, root) {
  const port = Number(readLegacyEnv(root, 'PORT'));
  if (Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX) config.service.port = port;
  const password = readLegacyEnv(root, 'DJ_PASSWORD');
  if (password && password !== 'change-this-password') config.djPassword = password;
  const apiKey = readLegacyEnv(root, 'YOUTUBE_API_KEY');
  if (apiKey) config.youtubeApiKey = apiKey;
}

function normalize(raw) {
  const base = defaults();
  const source = raw && typeof raw === 'object' ? raw : {};
  const service = source.service && typeof source.service === 'object' ? source.service : {};
  const tunnel = source.tunnel && typeof source.tunnel === 'object' ? source.tunnel : {};
  const port = Number(service.port);
  return {
    language: normalizeLanguage(source.language),
    service: {
      port: Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX ? port : base.service.port,
      host: typeof service.host === 'string' && service.host.trim() ? service.host.trim() : base.service.host
    },
    djPassword: typeof source.djPassword === 'string' && source.djPassword.trim() ? source.djPassword.trim() : base.djPassword,
    youtubeApiKey: typeof source.youtubeApiKey === 'string' ? source.youtubeApiKey.trim() : '',
    tunnel: {
      cloudflaredPath: typeof tunnel.cloudflaredPath === 'string' ? tunnel.cloudflaredPath.trim() : '',
      fixedPublicUrl: typeof tunnel.fixedPublicUrl === 'string' ? tunnel.fixedPublicUrl.trim().replace(/\/+$/, '') : '',
      autoStart: Boolean(tunnel.autoStart)
    }
  };
}

class ConfigStore {
  constructor(root) {
    this.root = root;
    this.dir = path.join(root, 'config');
    this.file = path.join(this.dir, 'config.json');
    this.data = this.load();
  }

  load() {
    fs.mkdirSync(this.dir, { recursive: true });
    if (fs.existsSync(this.file)) {
      try {
        const text = fs.readFileSync(this.file, 'utf8').replace(/^\uFEFF/, '');
        return normalize(JSON.parse(text));
      } catch {
        const backup = `${this.file}.broken-${Date.now()}`;
        try { fs.renameSync(this.file, backup); } catch {}
      }
    }
    const fresh = defaults();
    applyLegacyEnv(fresh, this.root);
    this.write(fresh);
    return fresh;
  }

  write(data) {
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    fs.renameSync(temp, this.file);
  }

  get() {
    return JSON.parse(JSON.stringify(this.data));
  }

  save(patch) {
    const before = this.get();
    const input = patch && typeof patch === 'object' ? patch : {};
    const language = normalizeLanguage(input.language || before.language);
    if (input.language !== undefined && !['en', 'zh', 'de'].includes(input.language)) {
      throw new Error(translate(language, 'config.language'));
    }
    if (input.service && input.service.port !== undefined) {
      const port = Number(input.service.port);
      if (!Number.isInteger(port) || port < PORT_MIN || port > PORT_MAX) {
        throw new Error(translate(language, 'config.portRange', { min: PORT_MIN, max: PORT_MAX }));
      }
    }
    if (input.djPassword !== undefined && String(input.djPassword).trim().length < 4) {
      throw new Error(translate(language, 'config.passwordMin'));
    }
    const fixed = input.tunnel && input.tunnel.fixedPublicUrl !== undefined
      ? String(input.tunnel.fixedPublicUrl).trim().replace(/\/+$/, '')
      : '';
    if (fixed && !/^https?:\/\/[^\s]+$/i.test(fixed)) {
      throw new Error(translate(language, 'config.fixedUrl'));
    }

    const next = normalize({
      ...before,
      ...input,
      language,
      service: { ...before.service, ...(input.service || {}) },
      tunnel: { ...before.tunnel, ...(input.tunnel || {}) }
    });
    this.data = next;
    this.write(next);

    return {
      config: this.get(),
      requiresRestart: before.service.port !== next.service.port
        || before.djPassword !== next.djPassword
    };
  }
}

module.exports = { ConfigStore, PORT_MIN, PORT_MAX };
