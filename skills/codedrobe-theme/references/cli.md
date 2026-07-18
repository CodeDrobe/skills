# Core CLI

## Select one runner

Prefer an existing global command:

```bash
codedrobe --version
```

If it is unavailable, use one of these equivalent package runners:

```bash
npx --yes @codedrobe/core@latest <command> [options]
bunx @codedrobe/core@latest <command> [options]
```

For repeated local use, install the CLI globally:

```bash
npm install --global @codedrobe/core
```

Do not copy runtime files into the Skill. Do not confuse the Skill installer (`npx skills`) with the Core runner (`codedrobe`, `npx @codedrobe/core`, or `bunx @codedrobe/core`).

## Discover apps and paths

```bash
codedrobe apps --json
codedrobe detect --app <app-id> --json
codedrobe detect --app <app-id> --app-path /custom/application/path --json
```

Pass the same custom values to later commands:

```bash
codedrobe apply --app <app-id> --app-path /custom/application/path --port <port> --theme /absolute/theme.codedrobe-theme
```

## Renderer lifecycle

```bash
codedrobe launch --app <app-id> --port <port>
codedrobe dom snapshot --app <app-id> --port <port> --output /absolute/dom.json
codedrobe probe --app <app-id> --port <port> --timeout-ms 5000
codedrobe apply --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme
codedrobe apply --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme --watch
codedrobe verify --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
codedrobe restore --app <app-id> --port <port>
```

Add `--no-launch` only when the renderer is already reachable. Add `--restart-existing` only after the user authorizes restarting the app.

Port notes: QoderWork forces an app-chosen debug port, so omit `--port` and Core resolves it from the per-edition `DevToolsActivePort` files automatically (an explicit `--port` always wins). TRAE SOLO must be launched with `--remote-debugging-port` first; pass that same port to every later command.

`dom snapshot` is read-only and excludes text, form values, accessible names, links, and media sources. Use `--max-nodes 1500` when the default snapshot reports `summary.truncated: true`; use `--include-hidden` only for a hidden route or dialog that must be styled.

## Theme operations

```bash
codedrobe theme inspect /absolute/theme.codedrobe-theme
codedrobe theme pack /absolute/theme.json --output /absolute/theme.codedrobe-theme
codedrobe theme pack /absolute/theme.json --output /absolute/theme.codedrobe-theme --force
codedrobe theme convert /absolute/legacy.codex-theme --output /absolute/theme.codedrobe-theme
```

Use `--force` only when replacing the destination is intentional.

## Store search and download

```bash
codedrobe theme search <keywords> --app <app-id> --json
codedrobe theme download <slug> --json
```

No sign-in is required. Downloads land in `~/.codedrobe/themes/<slug>-<version>.codedrobe-theme` (`--output` overrides), are verified against the store's size and SHA-256 record before anything is written, and legacy-format store packages are converted automatically. Paid themes are refused with the store purchase link — never attempt payment from the CLI. After downloading, continue with the normal inspect → probe → apply → verify flow.

## Updates

```bash
codedrobe update --check
codedrobe update
```

The Skill itself is updated separately through `npx skills update codedrobe-theme`.
