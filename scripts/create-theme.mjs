import fs from "node:fs/promises";
import path from "node:path";
import { skillRoot } from "./theme-lib.mjs";

function parseArgs(argv) {
  const options = { name: null, art: null, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--id") options.id = argv[++i];
    else if (arg === "--name") options.name = argv[++i];
    else if (arg === "--art") options.art = path.resolve(argv[++i]);
    else if (arg === "--force") options.force = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(options.id ?? "")) throw new Error("--id must be a safe theme id");
  options.name ??= options.id;
  return options;
}

const options = parseArgs(process.argv.slice(2));
const themeDir = path.join(skillRoot, "themes");
const manifestPath = path.join(themeDir, `${options.id}.json`);
const cssPath = path.join(themeDir, `${options.id}.css`);
if (!options.force) {
  for (const target of [manifestPath, cssPath]) {
    try { await fs.access(target); throw new Error(`Refusing to overwrite ${target}; use --force`); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}
await fs.mkdir(themeDir, { recursive: true });
await fs.copyFile(path.join(skillRoot, "assets", "dream-skin.css"), cssPath);
const art = options.art ? path.relative(themeDir, options.art).split(path.sep).join("/") : null;
const manifest = {
  schemaVersion: 1,
  id: options.id,
  displayName: options.name,
  version: "0.1.0",
  css: `${options.id}.css`,
  art,
  copy: {
    brandTitle: `${options.name} 自定义皮肤`,
    brandSubtitle: "AI Crafted for Codex ✦",
    signature: `${options.name} ♡`,
    tagline: "把灵感写进每一天 ♡",
    projectPrefix: "选择项目 · ",
    projectLabel: "♡  选择项目",
    ribbon: "✦",
  },
  baseTheme: {
    mode: "light",
    codeTheme: "codex",
    accent: "#B65CFF",
    contrast: 64,
    ink: "#4A235F",
    surface: "#FFF4FA",
    opaqueWindows: true,
    fonts: { windowsCode: "Cascadia Code", windowsUi: "Microsoft YaHei UI", macCode: "SF Mono", macUi: "PingFang SC" },
    semanticColors: { diffAdded: "#BCE8CF", diffRemoved: "#F7B8CE", skill: "#C47BFF" },
  },
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ created: true, manifestPath, cssPath }, null, 2));
