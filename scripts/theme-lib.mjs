import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const skillRoot = path.resolve(here, "..");

const defaultCopy = {
  brandTitle: "Codex 自定义皮肤",
  brandSubtitle: "AI Crafted Theme ✦",
  signature: "Codex ♡",
  tagline: "把灵感写进每一天 ♡",
  projectPrefix: "选择项目 · ",
  projectLabel: "♡  选择项目",
  ribbon: "🎀",
};

function isNamedTheme(value) {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(value);
}

export function resolveThemeManifest(theme = "dream") {
  if (isNamedTheme(theme)) return path.join(skillRoot, "themes", `${theme}.json`);
  return path.resolve(theme);
}

function assertString(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
}

export async function loadTheme(theme = "dream") {
  const manifestPath = resolveThemeManifest(theme);
  const raw = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  if (raw.schemaVersion !== 1) throw new Error(`Unsupported theme schemaVersion in ${manifestPath}`);
  assertString(raw.id, "theme.id");
  assertString(raw.displayName, "theme.displayName");
  assertString(raw.version, "theme.version");
  assertString(raw.css, "theme.css");
  if (!isNamedTheme(raw.id)) throw new Error(`Invalid theme id: ${raw.id}`);

  const base = path.dirname(manifestPath);
  const cssPath = path.resolve(base, raw.css);
  const artPath = raw.art ? path.resolve(base, raw.art) : null;
  await fs.access(cssPath);
  if (artPath) await fs.access(artPath);

  return {
    ...raw,
    manifestPath,
    cssPath,
    artPath,
    copy: { ...defaultCopy, ...(raw.copy ?? {}) },
    baseTheme: raw.baseTheme ?? {},
  };
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

export function buildBaseThemeSettings(theme, platform = process.platform) {
  const base = theme.baseTheme ?? {};
  const fonts = base.fonts ?? {};
  const semantic = base.semanticColors ?? {};
  const isMac = platform === "darwin";
  const codeFont = isMac ? fonts.macCode : fonts.windowsCode;
  const uiFont = isMac ? fonts.macUi : fonts.windowsUi;
  const chromeParts = [
    `accent = ${tomlString(base.accent ?? "#B65CFF")}`,
    `contrast = ${Number.isFinite(base.contrast) ? base.contrast : 64}`,
    `fonts = { code = ${tomlString(codeFont ?? (isMac ? "SF Mono" : "Cascadia Code"))}, ui = ${tomlString(uiFont ?? (isMac ? "PingFang SC" : "Microsoft YaHei UI"))} }`,
    `ink = ${tomlString(base.ink ?? "#4A235F")}`,
    `opaqueWindows = ${base.opaqueWindows === false ? "false" : "true"}`,
    `semanticColors = { diffAdded = ${tomlString(semantic.diffAdded ?? "#BCE8CF")}, diffRemoved = ${tomlString(semantic.diffRemoved ?? "#F7B8CE")}, skill = ${tomlString(semantic.skill ?? "#C47BFF")} }`,
    `surface = ${tomlString(base.surface ?? "#FFF4FA")}`,
  ];
  return {
    appearanceTheme: `appearanceTheme = ${tomlString(base.mode ?? "light")}`,
    appearanceLightCodeThemeId: `appearanceLightCodeThemeId = ${tomlString(base.codeTheme ?? "codex")}`,
    appearanceLightChromeTheme: `appearanceLightChromeTheme = { ${chromeParts.join(", ")} }`,
  };
}

function desktopSection(content) {
  const match = /^\[desktop\]\s*\r?\n(?<body>.*?)(?=^\[|(?![\s\S]))/ms.exec(content);
  if (match) return { content, match };
  const next = `${content.trimEnd()}\n\n[desktop]\n`;
  return { content: next, match: /^\[desktop\]\s*\r?\n(?<body>.*?)(?=^\[|(?![\s\S]))/ms.exec(next) };
}

function replaceSectionBody(content, match, body) {
  // indexOf("") is zero, so an empty [desktop] body used to insert settings
  // before the table header and silently place them in the previous table.
  const index = match.index + match[0].length - match.groups.body.length;
  return content.slice(0, index) + body + content.slice(index + match.groups.body.length);
}

function settingPattern(key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}\\s*=.*(?:\\r?\\n|$)`, "gm");
}

function replaceUniqueSetting(body, key, line) {
  const withoutDuplicates = body.replace(settingPattern(key), "").trimEnd();
  return `${withoutDuplicates}${withoutDuplicates ? "\n" : ""}${line}\n`;
}

function removeManagedChromeTables(content) {
  return content.replace(
    /^\[desktop\.appearanceLightChromeTheme(?:\.[^\]]+)?\]\s*\r?\n.*?(?=^\[|(?![\s\S]))/gms,
    "",
  );
}

function removeMisplacedSettings(content, keys) {
  let updated = content;
  for (const key of keys) updated = updated.replace(settingPattern(key), "");
  return updated;
}

function mergeDesktopSections(content) {
  const pattern = /^\[desktop\]\s*\r?\n(?<body>.*?)(?=^\[|(?![\s\S]))/gms;
  const matches = [...content.matchAll(pattern)];
  if (matches.length <= 1) return content;
  const body = matches.map((match) => match.groups.body.trim()).filter(Boolean).join("\n");
  let result = "";
  let cursor = 0;
  for (const [index, match] of matches.entries()) {
    result += content.slice(cursor, match.index);
    if (index === 0) result += `[desktop]\n${body}${body ? "\n" : ""}`;
    cursor = match.index + match[0].length;
  }
  return result + content.slice(cursor);
}

export function applySettings(content, settings) {
  const cleaned = mergeDesktopSections(removeMisplacedSettings(removeManagedChromeTables(content), Object.keys(settings)));
  const section = desktopSection(cleaned);
  let body = section.match.groups.body;
  for (const [key, line] of Object.entries(settings)) {
    // TOML rejects duplicate keys. Always remove every previous occurrence
    // before writing the single canonical appearance setting.
    body = replaceUniqueSetting(body, key, line);
  }
  return replaceSectionBody(section.content, section.match, body);
}

export function restoreSettings(current, backup, keys) {
  const currentSection = desktopSection(removeMisplacedSettings(removeManagedChromeTables(current), keys));
  const backupMatch = /^\[desktop\]\s*\r?\n(?<body>.*?)(?=^\[|(?![\s\S]))/ms.exec(backup);
  let body = currentSection.match.groups.body;
  const savedBody = backupMatch?.groups.body ?? "";
  for (const key of keys) {
    const saved = [...savedBody.matchAll(settingPattern(key))].at(-1)?.[0]?.trimEnd();
    body = body.replace(settingPattern(key), "").trimEnd();
    if (saved) body = `${body}${body ? "\n" : ""}${saved}\n`;
  }
  return replaceSectionBody(currentSection.content, currentSection.match, body);
}
