import fs from "node:fs/promises";
import path from "node:path";
import { loadTheme } from "./theme-lib.mjs";

export const MAX_THEME_PACKAGE_BYTES = 30 * 1024 * 1024;
const REMOTE_CSS = /@import\s|url\(\s*["']?(?!data:)/i;

function mimeTypeFor(filename) {
  switch (path.extname(filename).toLowerCase()) {
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".gif": return "image/gif";
    default: return "image/png";
  }
}

function safeAssetName(filename, fallback = "art.png") {
  const basename = path.basename(filename).replace(/[^a-z0-9._-]/gi, "-");
  return basename || fallback;
}

export async function buildThemePackage(themeRef = "dream") {
  const theme = await loadTheme(themeRef);
  const [rawManifest, css] = await Promise.all([
    fs.readFile(theme.manifestPath, "utf8").then(JSON.parse),
    fs.readFile(theme.cssPath, "utf8"),
  ]);
  if (REMOTE_CSS.test(css)) {
    throw new Error("Theme CSS contains an external resource; only embedded data URLs are exportable.");
  }

  const manifest = { ...rawManifest, css: "theme.css" };
  let art;
  if (theme.artPath) {
    const filename = safeAssetName(rawManifest.art);
    art = {
      filename,
      mimeType: mimeTypeFor(theme.artPath),
      base64: (await fs.readFile(theme.artPath)).toString("base64"),
    };
    manifest.art = filename;
  } else {
    manifest.art = null;
  }

  const bundle = {
    format: "codex-theme",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    manifest,
    css,
    ...(art ? { art } : {}),
  };
  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
  if (Buffer.byteLength(serialized) > MAX_THEME_PACKAGE_BYTES) {
    throw new Error("Theme package exceeds the 30MB import limit.");
  }
  return { bundle, serialized };
}
