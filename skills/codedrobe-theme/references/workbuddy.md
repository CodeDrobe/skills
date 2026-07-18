# WorkBuddy target

Use app id `workbuddy`. Read current defaults and the last verified application version from `codedrobe apps --json`. The built-in default CDP port is currently `9336`, but an explicit `--port` must win.

## Apply behavior

WorkBuddy currently uses renderer-only theming and does not require Codex-style host appearance settings. A reachable renderer can normally be themed without restarting the application.

- Use `--app-path` for a nonstandard installation.
- Do not patch `WorkBuddy.app`, its Electron resources, or `app.asar`.
- Apply and restore through Core so image object URLs, observers, styles, and root markers are cleaned consistently.

## Verification surface

Keep the adapter limited to stable cross-route landmarks:

- root: teams container
- sidebar: conversation sidebar/list
- workspace: teams main content, main content, or chat container
- composer: editable textbox

Keep home layout rules in the theme package. For a theme that styles the WorkBuddy home and conversation screens, verify at least:

Capture separate home and conversation snapshots before adapting `assets/theme-starter/workbuddy.css` or `assets/examples/miku-future-beats/workbuddy.css`. Prefer the live semantic classes over any stale example selector.

1. Home header/hero, scene tabs, quick actions, home composer, and named images.
2. A conversation with long text, tables or code, scrolling, and the conversation composer shell.
3. Sidebar selection, hover states, menus, input, microphone, model selector, and send controls.
4. No horizontal overflow or hidden native actions.
