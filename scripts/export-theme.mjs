import fs from "node:fs/promises";
import path from "node:path";
import { buildThemePackage } from "./theme-package.mjs";

function parseArgs(argv) {
  const options = { theme: "dream", output: null, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--theme") {
      options.theme = argv[++index];
      if (!options.theme) throw new Error("--theme requires a theme id or manifest path");
    } else if (arg === "--output" || arg === "-o") {
      options.output = argv[++index];
      if (!options.output) throw new Error(`${arg} requires a file path`);
    }
    else if (arg === "--force") options.force = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.theme) throw new Error("--theme requires a theme id or manifest path");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { bundle, serialized } = await buildThemePackage(options.theme);
  const requestedPath = options.output
    ? path.resolve(options.output)
    : path.resolve(`${bundle.manifest.id}-${bundle.manifest.version}.codex-theme`);
  const outputPath = requestedPath.toLowerCase().endsWith(".codex-theme")
    ? requestedPath
    : `${requestedPath}.codex-theme`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await fs.writeFile(outputPath, serialized, { encoding: "utf8", flag: options.force ? "w" : "wx" });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Refusing to overwrite ${outputPath}; use --force`);
    }
    throw error;
  }

  console.log(JSON.stringify({
    exported: true,
    theme: bundle.manifest.id,
    version: bundle.manifest.version,
    outputPath,
    bytes: Buffer.byteLength(serialized),
  }, null, 2));
}

main().catch((error) => {
  console.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
