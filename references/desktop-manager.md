# CodeDrobe Desktop manager

CodeDrobe Desktop is the beginner-facing Electron control surface maintained in the separate `codedrobe-desktop` repository. It consumes a fixed `@codedrobe/codex-core` package for the shared scripts and injector assets; it does not contain a second injector implementation and does not expose Skill templates as bundled Desktop themes.

## Supported workflow

1. Detect the official Codex desktop application on macOS or Windows.
2. List themes imported into the CodeDrobe user-data directory. A new Desktop installation has an empty wardrobe.
3. Let the user select a theme and choose **应用并启动**.
4. If Codex is already running without CDP, return a restart-required result and wait for explicit confirmation.
5. Apply only the supported Codex base-theme keys, launch the official executable with loopback CDP, start the shared watch injector, and run strict verification.
6. Keep the watcher alive in the tray after the main window closes.
7. Use **恢复原生** to stop the watcher, remove live injection, and restore the saved base-theme keys.

## Theme management

- Imported themes are stored as `themes/<id>/manifest.json` under the Electron user-data directory.
- Import accepts only a `.codex-theme` single-file JSON package up to 30MB.
- External CSS resources are rejected. Packaged artwork is decoded locally, its filename is normalized, and the manifest is rewritten to `theme.css` plus the local artwork filename.
- Reimporting an existing imported ID updates that imported theme.
- Export works for imported themes and produces the same package contract as `scripts/export-theme.mjs`.
- Delete removes the imported theme directory. If the theme is active, Desktop restores the original Codex appearance before deleting it.

## Runtime and state paths

Packaged CodeDrobe uses Electron's `userData` directory, normally:

- macOS: `~/Library/Application Support/CodeDrobe`
- Windows: `%APPDATA%\CodeDrobe`

It stores:

- `themes/`: imported theme sources.
- `manager-state.json`: active theme ID and CDP port.
- `runtime.log`: user-visible runtime events.
- `config.before-codedrobe.toml`: the Codex base-theme backup used by Desktop restore.

The legacy script workflow uses `CodeDrobe` state directories instead. Because the state files and watcher ownership are separate, do not operate the Desktop manager and platform launch scripts simultaneously.

## Security boundary

- The BrowserWindow uses context isolation, renderer sandboxing, and disabled renderer Node integration.
- The preload exposes only bootstrap/status, launch, restore, import, export, delete, reveal-in-folder, and runtime-log operations.
- New-window creation is denied and the renderer exposes no external navigation surface.
- Theme packages are data, CSS, and artwork only; they are never executed as JavaScript.
- CDP remains bound to `127.0.0.1`.

## Development and packaging

```bash
cd /path/to/codedrobe-desktop
npm install
npm run check
npm start
npm run make
```

- The Desktop repository vendors a versioned `codedrobe-codex-core-<version>.tgz` and installs it as `@codedrobe/codex-core`, so local and CI builds do not depend on a sibling checkout.
- Update Core by increasing its package version, creating a new tarball with `npm pack`, updating the Desktop file dependency, and regenerating the Desktop lockfile.
- macOS hosts produce DMG and ZIP artifacts.
- Windows hosts produce a Squirrel Setup EXE.
- The Desktop repository's `.github/workflows/build.yml` validates on Linux, then builds macOS ARM64 on `macos-14` and Windows x64 on `windows-latest`. Each job verifies the expected installer files and bundled runtime directories before uploading artifacts.
- Forge builds the current target architecture. The verified local macOS artifact is Apple Silicon (`arm64`); publish a separate `x64` build before claiming Intel Mac support.
- Public distribution requires Apple signing/notarization and Windows code signing. Unsigned packages are suitable only for local testing.
- Packaged resources must contain `scripts/` and injector `assets/`, and must not contain a `themes/` directory; verify this after any Forge configuration change.
