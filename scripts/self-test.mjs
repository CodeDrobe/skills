import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { applySettings, buildBaseThemeSettings, loadTheme, restoreSettings, skillRoot } from "./theme-lib.mjs";
import { buildThemePackage } from "./theme-package.mjs";

const theme = await loadTheme("dream");
assert.equal(theme.id, "dream");
assert.equal(theme.version, "1.1.0");

const themeIds = (await fs.readdir(path.join(skillRoot, "themes")))
  .filter((entry) => entry.endsWith(".json"))
  .map((entry) => entry.slice(0, -5))
  .sort();
assert.deepEqual(themeIds, ["dilraba-rose", "dream", "kun-stage"]);

for (const themeId of themeIds) {
  const candidate = await loadTheme(themeId);
  const candidateCss = await fs.readFile(candidate.cssPath, "utf8");
  assert.ok(candidateCss.length > 1_000, `${themeId} CSS should contain a complete theme`);
  const packaged = await buildThemePackage(themeId);
  assert.equal(packaged.bundle.manifest.id, themeId);
  assert.equal(packaged.bundle.manifest.css, "theme.css");
  assert.equal(Boolean(packaged.bundle.art), Boolean(candidate.artPath));
}

const originalConfig = `model = "gpt"\n\n[desktop]\nunrelated = true\nappearanceTheme = "dark"\n\n[other]\nkeep = "yes"\n`;
const applied = applySettings(originalConfig, buildBaseThemeSettings(theme, "darwin"));
assert.match(applied, /appearanceTheme = "light"/);
assert.match(applied, /code = "SF Mono"/);
assert.match(applied, /unrelated = true/);
assert.match(applied, /\[other\]\nkeep = "yes"/);

const duplicatedConfig = `model = "gpt"\n\n[desktop]\nappearanceTheme = "dark"\nappearanceTheme = "light"\nappearanceLightCodeThemeId = "one"\nappearanceLightCodeThemeId = "two"\nappearanceLightChromeTheme = { accent = "#111111", contrast = 1 }\nappearanceLightChromeTheme = { accent = "#222222", contrast = 2 }\nunrelated = true\n`;
const deduplicated = applySettings(duplicatedConfig, buildBaseThemeSettings(theme, "darwin"));
for (const key of ["appearanceTheme", "appearanceLightCodeThemeId", "appearanceLightChromeTheme"]) {
  assert.equal((deduplicated.match(new RegExp(`^${key}\\s*=`, "gm")) ?? []).length, 1, `${key} must be unique`);
}
const expandedChromeConfig = `model = "gpt"\n\n[desktop.appearanceLightChromeTheme.fonts]\ncode = "SF Mono"\nui = "PingFang SC"\n\n[desktop.appearanceLightChromeTheme.semanticColors]\nskill = "#fff"\n\n[sandbox_workspace_write]\nnetwork_access = true\nappearanceTheme = "light"\nappearanceLightChromeTheme = { accent = "#bad" }\n`;
const normalizedExpanded = applySettings(expandedChromeConfig, buildBaseThemeSettings(theme, "darwin"));
assert.doesNotMatch(normalizedExpanded, /^\[desktop\.appearanceLightChromeTheme/m);
assert.equal((normalizedExpanded.match(/^appearanceTheme\s*=/gm) ?? []).length, 1);
assert.equal((normalizedExpanded.match(/^appearanceLightChromeTheme\s*=/gm) ?? []).length, 1);
assert.match(normalizedExpanded, /\[sandbox_workspace_write\]\nnetwork_access = true/);
const emptyDesktop = applySettings(`[sandbox_workspace_write]\nnetwork_access = true\n\n[desktop]\n`, buildBaseThemeSettings(theme, "darwin"));
assert.match(emptyDesktop, /\[desktop\]\nappearanceTheme = "light"/);
assert.doesNotMatch(emptyDesktop, /network_access = true\nappearanceTheme/);
const duplicateDesktop = applySettings(`[desktop]\nunrelated = true\n\n[other]\nkeep = true\n\n[desktop]\nsecond = true\n`, buildBaseThemeSettings(theme, "darwin"));
assert.equal((duplicateDesktop.match(/^\[desktop\]$/gm) ?? []).length, 1);
assert.match(duplicateDesktop, /unrelated = true/);
assert.match(duplicateDesktop, /second = true/);
for (const key of ["accent", "contrast", "fonts", "ink", "opaqueWindows", "semanticColors", "surface"]) {
  assert.equal((buildBaseThemeSettings(theme, "darwin").appearanceLightChromeTheme.match(new RegExp(`\\b${key}\\s*=`, "g")) ?? []).length, 1, `chrome parameter ${key} must be unique`);
}
const restored = restoreSettings(applied, originalConfig, [
  "appearanceTheme",
  "appearanceLightCodeThemeId",
  "appearanceLightChromeTheme",
]);
assert.match(restored, /appearanceTheme = "dark"/);
assert.doesNotMatch(restored, /appearanceLightCodeThemeId/);
assert.match(restored, /unrelated = true/);

const restoredDuplicates = restoreSettings(deduplicated, duplicatedConfig, [
  "appearanceTheme",
  "appearanceLightCodeThemeId",
  "appearanceLightChromeTheme",
]);
for (const key of ["appearanceTheme", "appearanceLightCodeThemeId", "appearanceLightChromeTheme"]) {
  assert.equal((restoredDuplicates.match(new RegExp(`^${key}\\s*=`, "gm")) ?? []).length, 1, `restored ${key} must be unique`);
}

const [css, template, art] = await Promise.all([
  fs.readFile(theme.cssPath, "utf8"),
  fs.readFile(path.join(skillRoot, "assets", "renderer-inject.js"), "utf8"),
  fs.readFile(theme.artPath),
]);
const publicTheme = { id: theme.id, displayName: theme.displayName, version: theme.version, copy: theme.copy };
const payload = template
  .replace("__DREAM_CSS_JSON__", JSON.stringify(css))
  .replace("__DREAM_ART_JSON__", JSON.stringify(`data:image/png;base64,${art.toString("base64")}`))
  .replace("__DREAM_THEME_JSON__", JSON.stringify(publicTheme));
assert.doesNotMatch(payload, /__DREAM_(?:CSS|ART|THEME)_JSON__/);
assert.match(payload, /codedrobe-codex-skin/);
assert.match(payload, /CODEDROBE_CODEX_SKIN/);
new vm.Script(payload);

const { bundle, serialized } = await buildThemePackage("dream");
assert.equal(bundle.format, "codex-theme");
assert.equal(bundle.schemaVersion, 1);
assert.equal(bundle.manifest.css, "theme.css");
assert.equal(bundle.art?.mimeType, "image/png");
assert.ok(bundle.art?.base64.length > 0);
assert.match(serialized, /"format": "codex-theme"/);

const temp = await fs.mkdtemp(path.join(os.tmpdir(), "codedrobe-codex-"));
await fs.rm(temp, { recursive: true, force: true });
console.log(JSON.stringify({
  pass: true,
  theme: `${theme.id}@${theme.version}`,
  themes: themeIds,
  payloadBytes: Buffer.byteLength(payload),
  checks: ["all Skill themes", "theme schema", "mac base colors", "appearance key deduplication", "config restore", "payload syntax", "portable theme export"],
}, null, 2));
