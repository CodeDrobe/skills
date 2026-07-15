import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTheme } from "./theme-lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function parseArgs(argv) {
  const options = { port: 9335, mode: "watch", timeoutMs: 30000, screenshot: null, reload: false, theme: "dream" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port") options.port = Number(argv[++i]);
    else if (arg === "--once") options.mode = "once";
    else if (arg === "--watch") options.mode = "watch";
    else if (arg === "--verify") options.mode = "verify";
    else if (arg === "--remove") options.mode = "remove";
    else if (arg === "--timeout-ms") options.timeoutMs = Number(argv[++i]);
    else if (arg === "--screenshot") options.screenshot = path.resolve(argv[++i]);
    else if (arg === "--theme") options.theme = argv[++i];
    else if (arg === "--reload") options.reload = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) {
    throw new Error(`Invalid port: ${options.port}`);
  }
  return options;
}

class CdpSession {
  constructor(target, timeoutMs = 10000) {
    this.target = target;
    this.ws = new WebSocket(target.webSocketDebuggerUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.closed = false;
    this.timeoutMs = timeoutMs;
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP socket open timed out")), this.timeoutMs);
      this.ws.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener("error", (error) => { clearTimeout(timer); reject(error); }, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.onMessage(event));
    this.ws.addEventListener("close", () => {
      this.closed = true;
      for (const waiter of this.pending.values()) {
        clearTimeout(waiter.timer);
        waiter.reject(new Error("CDP socket closed"));
      }
      this.pending.clear();
    });
    await this.send("Runtime.enable");
    await this.send("Page.enable");
    return this;
  }

  onMessage(event) {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      clearTimeout(waiter.timer);
      if (message.error) waiter.reject(new Error(`${message.error.message} (${message.error.code})`));
      else waiter.resolve(message.result);
      return;
    }
    for (const listener of this.listeners.get(message.method) ?? []) listener(message.params ?? {});
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error("CDP session is closed"));
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP request timed out: ${method}`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: false,
    });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
      throw new Error(`Renderer evaluation failed: ${detail}`);
    }
    return result.result?.value;
  }

  close() {
    if (!this.closed) this.ws.close();
    this.closed = true;
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("CDP session closed"));
    }
    this.pending.clear();
  }
}

async function waitForTargets(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const targets = await response.json();
      const pages = targets.filter((item) => item.type === "page" && item.url.startsWith("app://"));
      if (pages.length) return pages;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`No Codex renderer target on 127.0.0.1:${port}: ${lastError?.message ?? "timed out"}`);
}

async function loadPayload(themeRef) {
  const theme = await loadTheme(themeRef);
  const [css, template, art] = await Promise.all([
    fs.readFile(theme.cssPath, "utf8"),
    fs.readFile(path.join(root, "assets", "renderer-inject.js"), "utf8"),
    theme.artPath ? fs.readFile(theme.artPath) : Promise.resolve(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/2eN+WQAAAABJRU5ErkJggg==", "base64")),
  ]);
  if (/@import\s|url\(\s*["']?https?:/i.test(css)) {
    throw new Error(`Theme ${theme.id} contains remote CSS resources; use local assets only`);
  }
  const artDataUrl = `data:image/png;base64,${art.toString("base64")}`;
  const publicTheme = { id: theme.id, displayName: theme.displayName, version: theme.version, copy: theme.copy };
  const expression = template
    .replace("__DREAM_CSS_JSON__", JSON.stringify(css))
    .replace("__DREAM_ART_JSON__", JSON.stringify(artDataUrl))
    .replace("__DREAM_THEME_JSON__", JSON.stringify(publicTheme));
  return { expression, theme: publicTheme };
}

async function connectTarget(target) {
  return new CdpSession(target).open();
}

async function applyToSession(session, payload) {
  return session.evaluate(payload);
}

async function removeFromSession(session) {
  return session.evaluate(`(() => {
    window.__CODEDROBE_CODEX_SKIN_DISABLED__ = true;
    const state = window.__CODEDROBE_CODEX_SKIN_STATE__;
    if (state?.cleanup) return state.cleanup();
    document.documentElement?.classList.remove('codedrobe-codex-skin');
    document.documentElement?.style.removeProperty('--dream-art');
    document.getElementById('codedrobe-codex-skin-style')?.remove();
    document.getElementById('codedrobe-codex-skin-chrome')?.remove();
    return true;
  })()`);
}

async function verifySession(session, expectedTheme = null) {
  const expected = JSON.stringify(expectedTheme);
  return session.evaluate(`(() => {
    const box = (node) => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const nativeHome = document.querySelector('[role="main"]:has([data-testid="home-icon"])');
    const home = document.querySelector('.dream-home');
    const suggestions = home?.querySelector('.group\\\\/home-suggestions') ?? null;
    const cards = suggestions ? [...suggestions.querySelectorAll('button')].map(box) : [];
    const result = {
      installed: document.documentElement.classList.contains('codedrobe-codex-skin'),
      themeId: window.__CODEDROBE_CODEX_SKIN_STATE__?.themeId ?? null,
      version: window.__CODEDROBE_CODEX_SKIN_STATE__?.version ?? null,
      stylePresent: Boolean(document.getElementById('codedrobe-codex-skin-style')),
      chromePresent: Boolean(document.getElementById('codedrobe-codex-skin-chrome')),
      chromePointerEvents: getComputedStyle(document.getElementById('codedrobe-codex-skin-chrome') || document.body).pointerEvents,
      nativeHomePresent: Boolean(nativeHome),
      homePresent: Boolean(home),
      suggestionsPresent: Boolean(suggestions),
      hero: box(home?.firstElementChild?.firstElementChild?.firstElementChild),
      cards,
      composer: box(document.querySelector('.composer-surface-chrome')),
      sidebar: box(document.querySelector('aside.app-shell-left-panel')),
      viewport: { width: innerWidth, height: innerHeight },
      documentOverflow: {
        x: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        y: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      },
    };
    const expected = ${expected};
    const visible = (value) => Boolean(value && value.width > 0 && value.height > 0);
    const themeMatches = !expected || (result.themeId === expected.id && result.version === expected.version);
    const homePass = !result.nativeHomePresent || (result.homePresent && visible(result.hero) &&
      result.suggestionsPresent && result.cards.length >= 2 && result.cards.length <= 4 &&
      result.cards.every(visible));
    result.pass = result.installed && result.stylePresent && result.chromePresent &&
      result.chromePointerEvents === 'none' && visible(result.composer) && visible(result.sidebar) &&
      !result.documentOverflow.x && themeMatches && homePass;
    return result;
  })()`);
}

async function waitForVerifiedSession(session, timeoutMs, expectedTheme) {
  const deadline = Date.now() + timeoutMs;
  let lastResult;
  while (Date.now() < deadline) {
    lastResult = await verifySession(session, expectedTheme);
    if (lastResult.pass) return lastResult;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return lastResult;
}

async function capture(session, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await session.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await session.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  const viewport = await session.evaluate("({ width: innerWidth, height: innerHeight })");
  await session.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: Math.round(viewport.width * 0.64),
    y: Math.round(viewport.height * 0.62),
    button: "none",
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const result = await session.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await fs.writeFile(outputPath, Buffer.from(result.data, "base64"));
}

async function runOneShot(options) {
  const targets = await waitForTargets(options.port, options.timeoutMs);
  const payload = options.mode !== "remove" ? await loadPayload(options.theme) : null;
  const results = [];
  for (const target of targets) {
    const session = await connectTarget(target);
    try {
      if (options.mode === "remove") await removeFromSession(session);
      else if (options.mode === "once") await applyToSession(session, payload.expression);
      if (options.mode === "once") {
        await new Promise((resolve) => setTimeout(resolve, 850));
      }
      if (options.reload) {
        await session.send("Page.reload", { ignoreCache: true });
        await new Promise((resolve) => setTimeout(resolve, 1600));
        if (options.mode !== "remove") await applyToSession(session, payload.expression);
      }
      const verified = options.mode === "remove"
        ? await session.evaluate("!document.documentElement.classList.contains('codedrobe-codex-skin')")
        : (options.reload || options.mode === "once")
          ? await waitForVerifiedSession(session, options.timeoutMs, payload.theme)
          : await verifySession(session, payload.theme);
      results.push({ targetId: target.id, title: target.title, url: target.url, result: verified });
      if (options.screenshot) await capture(session, options.screenshot);
    } finally {
      session.close();
    }
  }
  console.log(JSON.stringify({ mode: options.mode, port: options.port, targets: results }, null, 2));
  if ((options.mode === "verify" || options.mode === "once") && results.some((item) => !item.result.pass)) process.exitCode = 2;
}

async function runWatch(options) {
  const payload = await loadPayload(options.theme);
  const sessions = new Map();
  let stopping = false;
  const stop = () => { stopping = true; };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  while (!stopping) {
    let targets = [];
    try {
      targets = await waitForTargets(options.port, 2000);
    } catch (error) {
      console.error(`[codedrobe] ${new Date().toISOString()} ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    const activeIds = new Set(targets.map((target) => target.id));
    for (const [id, session] of sessions) {
      if (!activeIds.has(id) || session.closed) {
        session.close();
        sessions.delete(id);
      }
    }

    for (const target of targets) {
      if (sessions.has(target.id)) continue;
      try {
        const session = await connectTarget(target);
        session.on("Page.loadEventFired", () => {
          setTimeout(() => applyToSession(session, payload.expression).catch((error) => {
            console.error(`[codedrobe] reinject failed: ${error.message}`);
          }), 250);
        });
        await applyToSession(session, payload.expression);
        sessions.set(target.id, session);
        console.log(`[codedrobe] injected theme ${payload.theme.id} into target ${target.id} (${target.title || target.url})`);
      } catch (error) {
        console.error(`[codedrobe] inject failed for ${target.id}: ${error.message}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  for (const session of sessions.values()) session.close();
}

const options = parseArgs(process.argv.slice(2));
if (options.mode === "watch") await runWatch(options);
else await runOneShot(options);
