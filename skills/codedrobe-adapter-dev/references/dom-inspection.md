# Real renderer inspection

## Establish CDP safely

1. Locate the installed application and current process command line.
2. Choose a free loopback port and launch with `--remote-debugging-address=127.0.0.1 --remote-debugging-port=<port>`.
3. If the app is already running without that port, request restart authorization instead of closing it silently.
4. Read `http://127.0.0.1:<port>/json/list` with a short timeout.
5. Reject DevTools, extension, helper, and unrelated pages before connecting to the renderer WebSocket.

Do not expose CDP on public interfaces.

After the adapter can identify the renderer, prefer Core's read-only snapshot over arbitrary page dumps:

```bash
codedrobe dom snapshot --app <app-id> --port <port> \
  --max-nodes 1500 --output /absolute/dom-<context>.json
```

Capture each route separately. The snapshot excludes text, form values, accessible names, links, and media sources while retaining selector candidates, match counts, geometry, computed style, and adapter landmark results.

## Collect evidence

Inspect every route the adapter must support:

- home/new task
- normal conversation
- project or workspace view when applicable
- settings or auxiliary routes that remain in the same renderer

Record:

- renderer title, URL scheme, type, and target id
- application version/build
- root container, sidebar/navigation, main workspace, and editable composer
- semantic classes, ids, roles, test ids, and accessibility attributes
- bounding boxes, visibility, overflow, and computed colors after injection

Use screenshots to verify visual behavior, not to derive selectors by appearance.

## Selector priority

Prefer selectors in this order:

1. stable ids or product-owned semantic classes
2. stable `data-testid` or nonlocalized roles/attributes
3. a small `any` set of verified semantic alternatives
4. structural selectors only inside theme-specific verification when unavoidable

Avoid:

- CSS-module hashes such as `_container_ab12c_7`
- localized visible text or localized `aria-label`
- `nth-child`, long direct-child chains, and styling-class names
- selectors observed on only one route

## Existing examples

Codex currently exposes semantic shell classes such as `main.main-surface`, `aside.app-shell-left-panel`, and `.composer-surface-chrome`.

WorkBuddy currently exposes semantic classes such as `.teams-container`, `.conversation-sidebar`, `.teams-main-content`, `.chat-container`, `.wb-home-page`, and `.wb-home-composer`.

Treat these as examples, not permanent facts. Re-read the live renderer before changing compatibility claims.
