# TRAE SOLO target

Use app id `traework`. It covers both editions — global TRAE SOLO (`TRAE SOLO.app`, `com.trae.solo.app`) and TRAE SOLO CN (`TRAE SOLO CN.app`, `cn.trae.solo.app`) — which share a byte-identical solo-lite UI stylesheet. Read current defaults and the last verified application version from `codedrobe apps --json`.

## Apply behavior

TRAE SOLO is a VS Code (Code-OSS) derivative, but its main window is the custom "solo-lite" shell (React under `#root`), not the Monaco workbench. It uses renderer-only theming.

- The app does not self-publish a debug port. Launch it with a standard `--remote-debugging-port` (quit it first if already running; never restart it without authorization), then pass the same `--port` to probe/apply/verify/restore.
- The main renderer URL is `vscode-file://…/electron-browser/solo/solo-lite.html`; auxiliary windows (process explorer, file preview) are separate pages the adapter already rejects.
- Do not patch the app bundle or its unpacked `Resources/app` directory.

## Verification surface

Keep the adapter limited to stable cross-route landmarks (verified across the Work, Code, and Design home routes plus task conversations):

- root: `#root .panel-container` (home) or `#root .solo-lite-layout` (conversation)
- sidebar: `.task-list-base`
- workspace: `.panel-container` or `.solo-lite-layout`
- composer: `.chat-input-v2-input-box-editable[contenteditable='true']`

Keep home and conversation layout rules in the theme package. Useful theming levers observed on `0.1.36`:

- The shell defines `--vscode-*` design tokens on plain `body` selectors inside style tags, so `html.codedrobe-host-traework body` always outranks them; the high-traffic tokens are `--vscode-foreground`, `--vscode-icube-colorDefaultText`, `--vscode-descriptionForeground`, `--vscode-textLink-foreground`, `--vscode-button-background`, `--vscode-icube-colorLine1/2`, `--vscode-icube-colorBg1/2/3`, and the hover fills.
- Home routes render `.panel-content`; conversations render `.solo-lite-chat-panel-container`; both carry `.solo-lite-panel-border` for a shared card treatment.
- Home-only surfaces: `.initial-chat-panel`, `.welcomeTitleWrapper` (the animated per-mode title — decorate around it rather than replacing its text).
- Conversation surfaces: `.session-view`, `.chat-session`, `.virtualized-message-list-view`, `.turn__user-message` / `.turn__agent-message`, `.user-message__text-box`.
- The composer component `chat-input-v2` is shared between home and conversation; `.messageInputContainer` is its positioned wrapper.
- Avoid the CSS-module hashes (`container-YafeHb`, `index-module__…`) that pervade the header and mode switcher.

Capture separate Work-home and conversation snapshots before adapting `assets/theme-starter/traework.css` or `assets/examples/miku-future-beats/traework.css`. Prefer the live semantic classes over any stale example selector.

1. Home welcome title, composer, send button, and named images across all three mode tabs.
2. A task conversation with history, message bubbles, and the conversation composer.
3. Sidebar task list, mode switcher, hover states, and focus rings.
4. No horizontal overflow or hidden native actions.
