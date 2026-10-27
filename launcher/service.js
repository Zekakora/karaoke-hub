'use strict';

const path = require('path');
const { spawn, execFile } = require('child_process');
const { once } = require('events');
const { translate } = require('./i18n');

const READY_TIMEOUT_MS = 20000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class ServiceManager {
  constructor({ root, store, log, internalToken, onChange }) {
    this.root = root;
    this.store = store;
    this.log = log;
    this.internalToken = internalToken;
    this.onChange = onChange || (() => {});
    this.state = 'stopped';
    this.child = null;
    this.pid = null;
    this.port = null;
    this.startedAt = null;
    this.error = null;
    this.portConflict = false;
    this.lastLines = [];
  }

  config() {
    return this.store.get().service;
  }

  msg(key, params) {
    return translate(this.store.get().language, key, params);
  }

  setState(state, error) {
    this.state = state;
    if (error !== undefined) this.error = error;
    this.onChange();
  }

  tailHint() {
    const lines = this.lastLines.slice(-4).join(' ');
    return lines ? `：${lines}` : '';
  }

  status() {
    const config = this.store.get();
    const configuredPort = config.service.port;
    const passwordChanged = Boolean(this.startedWith && this.startedWith.djPassword !== config.djPassword);
    return {
      state: this.state,
      pid: this.pid,
      port: this.port || configuredPort,
      configuredPort,
      restartRequired: this.state === 'running' && (this.port !== configuredPort || passwordChanged),
      url: this.state === 'running' ? `http://127.0.0.1:${this.port}` : '',
      startedAt: this.startedAt,
      error: this.error
    };
  }

  activePort() {
    return this.state === 'running' ? this.port : null;
  }

  async start() {
    if (this.state === 'running' || this.state === 'starting') throw new Error(this.msg('service.alreadyRunning'));
    const config = this.store.get();
    const { port, host } = config.service;
    this.error = null;
    this.portConflict = false;
    this.lastLines = [];
    this.port = port;
    this.startedWith = null;
    this.setState('starting', null);

    const env = {
      ...process.env,
      PORT: String(port),
      HOST: host,
      DJ_PASSWORD: config.djPassword,
      YOUTUBE_API_KEY: config.youtubeApiKey,
      PUBLIC_URL: '',
      INTERNAL_TOKEN: this.internalToken
    };

    const child = (() => {
      try {
        return spawn(process.execPath, [path.join(this.root, 'server.js')], {
          cwd: this.root,
          env,
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } catch (error) {
        const message = this.msg('service.spawnFailed', { message: error.message });
        this.error = message;
        this.setState('failed', message);
        this.log.line('launcher', message);
        throw new Error(message);
      }
    })();
    this.child = child;
    this.pid = child.pid;

    const onChunk = chunk => {
      this.log.append('service', chunk);
      const text = String(chunk).replace(/\x1b\[[0-9;]*m/g, '');
      if (/EADDRINUSE|address already in use/i.test(text)) this.portConflict = true;
      for (const line of text.split(/\r?\n/)) {
        if (line.trim()) this.lastLines.push(line.trim());
      }
      if (this.lastLines.length > 20) this.lastLines.splice(0, this.lastLines.length - 20);
    };
    child.stdout.on('data', onChunk);
    child.stderr.on('data', onChunk);
    child.once('error', error => {
      this.child = null;
      this.pid = null;
      this.error = this.msg('service.spawnFailed', { message: error.message });
      this.setState('failed', this.error);
    });
    child.once('exit', (code, signal) => this.handleExit(code, signal));

    try {
      await this.waitReady(child, port);
    } catch (error) {
      const message = this.portConflict
        ? this.msg('service.portInUse', { port })
        : (error.message || this.msg('service.startFailed'));
      this.error = message;
      this.setState('failed', message);
      this.log.line('launcher', message);
      await this.killTree();
      throw new Error(message);
    }

    this.startedAt = new Date().toISOString();
    this.startedWith = { djPassword: config.djPassword };
    this.setState('running', null);
    this.log.line('launcher', this.msg('service.started', { url: `http://127.0.0.1:${port}` }));
  }

  async waitReady(child, port) {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    const endpoint = `http://127.0.0.1:${port}/api/state`;
    while (Date.now() < deadline) {
      if (this.state === 'failed') throw new Error(this.error || this.msg('service.startFailed'));
      if (this.child !== child) throw new Error(this.error || this.msg('service.childExited'));
      try {
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(800) });
        if (response.ok) return;
      } catch {}
      await delay(250);
    }
    throw new Error(this.msg('service.startTimeout', { seconds: READY_TIMEOUT_MS / 1000, port }));
  }

  handleExit(code, signal) {
    const previousState = this.state;
    this.child = null;
    this.pid = null;
    if (previousState === 'stopping' || previousState === 'stopped') {
      this.setState('stopped', null);
      return;
    }
    if (previousState === 'failed') return;
    const message = this.portConflict
      ? this.msg('service.portInUse', { port: this.port })
      : `${this.msg('service.exited', { code, signal: signal ? `, ${signal}` : '' })}${this.tailHint()}`;
    this.error = message;
    this.setState('failed', message);
    this.log.line('launcher', message);
  }

  async stop() {
    if (this.state === 'stopped') return;
    if (this.state === 'stopping') return;
    this.setState('stopping', null);
    await this.killTree();
    this.startedAt = null;
    this.startedWith = null;
    this.port = null;
    this.setState('stopped', null);
    this.log.line('launcher', this.msg('service.stopped'));
  }

  async restart() {
    await this.stop();
    await delay(250);
    await this.start();
  }

  async killTree() {
    const child = this.child;
    this.child = null;
    this.pid = null;
    if (!child || child.exitCode !== null) return;
    const pid = child.pid;
    if (pid) {
      if (process.platform === 'win32') {
        execFile('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => {});
      } else {
        try { process.kill(pid, 'SIGTERM'); } catch {}
      }
    }
    try { child.kill(); } catch {}
    await Promise.race([once(child, 'exit').catch(() => {}), delay(6000)]);
  }

  // 控制台关闭或崩溃时兜底清理，避免端口被幽灵进程占住。
  killSync() {
    if (this.child && this.child.pid) {
      try {
        execFile('taskkill', ['/PID', String(this.child.pid), '/T', '/F'], { windowsHide: true }, () => {});
      } catch {}
    }
  }
}

module.exports = { ServiceManager };
