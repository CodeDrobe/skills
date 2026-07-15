import fs from "node:fs/promises";
import path from "node:path";
import { applySettings, buildBaseThemeSettings, loadTheme, restoreSettings } from "./theme-lib.mjs";

function parseArgs(argv) {
  const command = argv.shift() ?? "info";
  const options = { command, theme: "dream", platform: process.platform };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--theme") options.theme = argv[++i];
    else if (arg === "--platform") options.platform = argv[++i];
    else if (arg === "--config") options.config = path.resolve(argv[++i]);
    else if (arg === "--backup") options.backup = path.resolve(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
if (options.command === "info") {
  const theme = await loadTheme(options.theme);
  console.log(JSON.stringify({
    id: theme.id,
    displayName: theme.displayName,
    version: theme.version,
    manifestPath: theme.manifestPath,
    cssPath: theme.cssPath,
    artPath: theme.artPath,
    copy: theme.copy,
    settings: buildBaseThemeSettings(theme, options.platform),
  }, null, 2));
} else if (options.command === "apply") {
  if (!options.config || !options.backup) throw new Error("apply requires --config and --backup");
  const theme = await loadTheme(options.theme);
  await fs.mkdir(path.dirname(options.backup), { recursive: true });
  try { await fs.copyFile(options.config, options.backup, fs.constants.COPYFILE_EXCL); } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
  const content = await fs.readFile(options.config, "utf8");
  const updated = applySettings(content, buildBaseThemeSettings(theme, options.platform));
  await fs.writeFile(options.config, updated, "utf8");
  console.log(JSON.stringify({ applied: true, theme: theme.id, config: options.config }));
} else if (options.command === "restore") {
  if (!options.config || !options.backup) throw new Error("restore requires --config and --backup");
  const [current, backup] = await Promise.all([
    fs.readFile(options.config, "utf8"),
    fs.readFile(options.backup, "utf8"),
  ]);
  const updated = restoreSettings(current, backup, [
    "appearanceTheme",
    "appearanceLightCodeThemeId",
    "appearanceLightChromeTheme",
  ]);
  await fs.writeFile(options.config, updated, "utf8");
  console.log(JSON.stringify({ restored: true, config: options.config }));
} else {
  throw new Error(`Unknown command: ${options.command}`);
}
