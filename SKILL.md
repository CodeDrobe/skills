---
name: codedrobe-codex-theme
description: Apply, create, AI-customize, export, share, launch, verify, repair, update, or restore decorative themes for the Windows or macOS Codex desktop app. Use whenever the user asks to reskin Codex beyond official color settings, generate or export a portable .codex-theme package, build a theme from a visual brief or reference image, use the Dream/Fiona interface, reapply a skin after a Codex update, or safely roll back without modifying WindowsApps, the macOS app bundle, or app.asar.
compatibility: Windows 10/11 or macOS 12+, the official Codex desktop app, and a loopback CDP port. Direct script workflows require Node.js with global fetch and WebSocket; packaged CodeDrobe Desktop bundles its own Electron runtime.
---

# CodeDrobe Codex Skill

Apply reversible renderer themes through Chromium DevTools Protocol while launching the official Codex executable. Preserve the signed application package and user data. Use CodeDrobe Desktop for a visual one-click workflow and the bundled scripts for agent-driven creation, repair, and verification.

## Choose the control surface

- Use the companion `codedrobe-desktop` repository when the user asks for software, one-click launch, a beginner-friendly workflow, theme management, or `.codex-theme` import/export. Read `references/desktop-manager.md` before changing the Core/Desktop integration contract.
- Use `scripts/` when an agent needs to create or repair a theme, automate platform launch, capture verification screenshots, or diagnose CDP/runtime failures. Read `references/runtime-notes.md` for platform behavior.
- Both surfaces use the same manifests, CSS, injector, loopback port, and official Codex executable. Do not run both controllers at the same time because they can start competing watch injectors on the same port.

## Choose a workflow

### Use CodeDrobe Desktop

For local development:

```bash
cd /path/to/codedrobe-desktop
npm install
npm start
```

Select a theme and choose **应用并启动**. If Codex is already open without the loopback debugging port, wait for the explicit restart confirmation before closing it. Use **导入主题包** for a `.codex-theme` file, **导出** to create one, and **恢复原生** to remove the live skin and restore the saved base-theme keys.

Closing the main window keeps CodeDrobe in the tray so route changes and renderer reloads remain covered. Quit the tray process only when persistent reinjection is no longer needed.

### Apply an existing theme

1. Resolve the theme name from `themes/<name>.json`; use `dream` when the user did not request another theme.
2. For the script workflow, run the platform installer once. It applies matching official base colors and creates launch/restore shortcuts.
3. Launch the themed Codex app. Restart an already-open Codex only after the user authorizes it.
4. Run platform verification with an absolute screenshot path. Treat a missing native home hero, native suggestion cards, composer, sidebar, theme marker, or matching theme version as failure.
5. Inspect both the home screen and a normal task against `references/qa-inventory.md`.

Windows:

```powershell
scripts/install-codedrobe.ps1 -Theme dream
scripts/start-codedrobe.ps1 -Theme dream
scripts/verify-codedrobe.ps1 -Theme dream -ScreenshotPath C:\absolute\dream.png
```

macOS:

```bash
scripts/install-codedrobe.sh --theme dream
scripts/start-codedrobe.sh --theme dream
scripts/verify-codedrobe.sh --theme dream --screenshot /absolute/dream.png
```

### Create a theme with AI

1. Capture a short design brief: mood, light/dark preference, primary colors, decorative density, desired copy, and whether the user supplied or wants generated artwork.
2. Scaffold a safe theme package:

```bash
node scripts/create-theme.mjs --id <safe-slug> --name "<display name>" --art /absolute/art.png
```

3. Read `references/theme-schema.md`, then edit only `themes/<id>.json` and `themes/<id>.css`. Keep native Codex controls and labels live; use generated artwork only in decorative regions.
4. If the user requests new artwork, use an available image-generation skill, save the result as a local theme asset, and point the manifest `art` field to it. Do not silently upload private reference images to an unapproved service.
5. Increment the manifest version whenever CSS, copy, or artwork changes so verification can distinguish stale injection.
6. Apply, launch, screenshot, and verify the new theme on the user's platform. Iterate from the screenshot rather than claiming success from static CSS alone.
7. Export the verified theme as a portable package for CodeDrobe Desktop:

```bash
node scripts/export-theme.mjs --theme <id> --output /absolute/<id>.codex-theme
```

The command refuses to overwrite an existing file unless `--force` is supplied. The package embeds the manifest, CSS, and optional artwork, so the recipient does not need the source theme directory.

### Export an existing theme

Export by theme ID:

```bash
node scripts/export-theme.mjs --theme dream --output /absolute/dream.codex-theme
```

An absolute manifest path is also accepted. Omit `--output` to write `<id>-<version>.codex-theme` in the current directory. Use `--force` only when replacing the destination is intentional.

The exported file is a self-contained JSON package rather than a ZIP archive. Read `references/theme-schema.md` for its contract, size limit, asset normalization, and import rules.

## Restore

Remove the live injection without touching user threads or authentication:

- CodeDrobe Desktop: choose **恢复原生**. This stops its watcher, removes the live DOM/CSS when Codex is reachable, and restores the base-theme backup.
- Script workflow: use the matching platform command below.

```powershell
scripts/restore-codedrobe.ps1
scripts/restore-codedrobe.ps1 -Uninstall -RestoreBaseTheme
```

```bash
scripts/restore-codedrobe.sh
scripts/restore-codedrobe.sh --uninstall --restore-base-theme
```

## Guardrails

- Never replace, patch, re-sign, or take ownership of files under `WindowsApps` or `/Applications/ChatGPT.app`.
- Bind CDP to `127.0.0.1`; if the requested port is occupied, stop with a clear error and choose another port consistently.
- Do not stop a PID from `state.json` unless its current command line is the CodeDrobe injector.
- Keep decorative layers `pointer-events: none` and real navigation, buttons, project selector, and composer above them.
- Do not use a reference screenshot as a fake whole-window overlay.
- Treat Codex DOM selectors as version-sensitive. Dynamic executable discovery does not prove renderer compatibility; verification does.
- Keep the injection daemon running for route/reload resilience. State and logs live in `%LOCALAPPDATA%\CodeDrobe` on Windows or `~/Library/Application Support/CodeDrobe` on macOS.
- Treat `.codex-theme` files as untrusted input. Keep the 30MB limit, reject external CSS resources, normalize packaged asset names, and never evaluate theme content as JavaScript.
- Keep the renderer isolated in CodeDrobe Desktop (`contextIsolation`, sandbox, no renderer Node integration) and expose only narrow IPC operations through the preload bridge.

## Resources

- `themes/*.json`: selectable theme manifests and copy/base-color settings.
- `scripts/create-theme.mjs`: deterministic AI-theme scaffold.
- `scripts/export-theme.mjs`: portable `.codex-theme` exporter compatible with CodeDrobe Desktop.
- `scripts/theme-package.mjs`: shared package builder and safety limits.
- `scripts/self-test.mjs`: theme schema, config round-trip, and assembled-payload smoke test.
- `scripts/injector.mjs`: cross-platform CDP connection, injection, verification, screenshot, and removal.
- Companion `codedrobe-desktop` repository: Electron Forge + React theme manager for macOS and Windows. It consumes a fixed `@codedrobe/codex-core` package instead of copying runtime source.
- `assets/renderer-inject.js`: idempotent DOM integration and cleanup.
- `references/theme-schema.md`: manifest contract and AI customization boundaries.
- `references/runtime-notes.md`: CLI and shared cross-platform runtime behavior and troubleshooting.
- `references/desktop-manager.md`: Electron architecture, user-data paths, import/export, and packaging behavior.
- `references/qa-inventory.md`: CLI, desktop, package, functional, and visual signoff coverage.
