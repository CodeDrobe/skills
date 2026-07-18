# QoderWork target

Use app id `qoderwork`. It covers both editions — QoderWork CN (`QoderWork CN.app`, `com.qoder.work.cn`) and the global QoderWork (`QoderWork.app`, `com.qoder.work`) — whose renderer stylesheets are identical. Read current defaults and the last verified application version from `codedrobe apps --json`.

## Apply behavior

QoderWork uses renderer-only theming and does not require Codex-style host appearance settings. A reachable renderer can normally be themed without restarting the application.

- The main process forces `remote-debugging-port=0` in every edition, so a caller-chosen port never binds. Omit `--port` and Core resolves the live port from the per-edition `DevToolsActivePort` files automatically; an explicit `--port` always wins.
- Use `--app-path` for a nonstandard installation.
- Do not patch the app bundle, its Electron resources, or `app.asar`.
- Apply and restore through Core so image object URLs, observers, styles, and root markers are cleaned consistently.

## Verification surface

Keep the adapter limited to stable cross-route landmarks:

- root: agents layout root
- sidebar: agents sidebar
- workspace: agents content area or layout body
- composer: `.chat-input-editor-text[contenteditable='true']` (the editable div has a placeholder twin with the same class, so the attribute filter is load-bearing)

Keep home and conversation layout rules in the theme package. Useful theming levers observed on `0.9.12`:

- The app exposes an app-owned `--color-*` token system on `:root[data-theme=...]`; a `html:root.codedrobe-host-qoderwork` scope outranks every appearance mode, so token overrides restyle most controls at once.
- The main card `.agents-parchment-paper-surface` survives every appearance style despite its name; `.agents-chat-panel` marks conversation panels and `.workbench-aux-card` the right dock panel.
- The composer container carries only utility classes; anchor it with `div.bg-bg-base.squircle-xl:has(.chat-input-editor-text)` and cover it with a theme verification node.
- `.chat-input-primary-glow` is conditional (focus state) — never use it as a styling anchor.
- The send button `.SendButton-send` ships a near-black gradient by default.

Capture separate home, conversation, and settings snapshots before adapting `assets/theme-starter/qoderwork.css` or `assets/examples/miku-future-beats/qoderwork.css`. Prefer the live semantic classes over any stale example selector, and avoid the generated CSS-module hashes (`Scrollbar-_r_1p_` and similar).

1. Home welcome title, composer shell, send button, and named images.
2. A conversation with history, the task-monitor dock panel, tables or code, and the conversation composer.
3. Settings route: the sidebar changes and the composer disappears there, so keep those landmarks warning-level.
4. No horizontal overflow or hidden native actions.
