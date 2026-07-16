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
codedrobe probe --app <app-id> --port <port> --timeout-ms 5000
codedrobe apply --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme
codedrobe apply --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme --watch
codedrobe verify --app <app-id> --port <port> --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
codedrobe restore --app <app-id> --port <port>
```

Add `--no-launch` only when the renderer is already reachable. Add `--restart-existing` only after the user authorizes restarting the app.

## Theme operations

```bash
codedrobe theme inspect /absolute/theme.codedrobe-theme
codedrobe theme pack /absolute/theme.json --output /absolute/theme.codedrobe-theme
codedrobe theme pack /absolute/theme.json --output /absolute/theme.codedrobe-theme --force
codedrobe theme convert /absolute/legacy.codex-theme --output /absolute/theme.codedrobe-theme
```

Use `--force` only when replacing the destination is intentional.

## Updates

```bash
codedrobe update --check
codedrobe update
```

The Skill itself is updated separately through `npx skills update codedrobe-theme`.
