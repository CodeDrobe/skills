# QA inventory

## User-visible claims

1. The home screen visibly matches the selected manifest's mood, artwork, palette, copy, and version while preserving native Codex cards, selector, composer, and navigation.
2. The sidebar and workspace receive the selected theme's intended treatment rather than merely changing the accent color.
3. All real Codex controls remain interactive; the skin is not a screenshot overlay.
4. The skin survives route changes and renderer reloads while the injector daemon runs.
5. The official Store package and `app.asar` remain unchanged.
6. Restore removes the injected DOM/CSS and install/restore can be repeated.
7. The selected theme id and version match the manifest; switching themes does not retain the previous artwork or copy.
8. Windows and macOS launch the signed official executable without modifying the application package.
9. CodeDrobe Desktop can list, select, apply, import, export, delete, and restore themes without requiring terminal knowledge or a separately installed Node.js runtime.
10. A `.codex-theme` exported by the Skill CLI can be imported by Desktop, and a Desktop-exported package is self-contained.

## Functional checks

- Home feature card: click one card and confirm the real composer is populated or the normal action occurs.
- Project selector: click the real project chip under the "选择项目" label and confirm the native project menu opens.
- Sidebar: open a real task, then return to New Task.
- Composer: type text, verify caret/readability, then clear it without sending.
- Reload: use CDP `Page.reload`, wait, and confirm the injection marker returns.
- Restore/reapply cycle: remove live skin, verify marker absent, apply again, verify marker present.
- Update resilience: resolve the current `OpenAI.Codex` Appx location dynamically; never store a versioned WindowsApps path.
- macOS discovery: resolve bundle id `com.openai.codex`; never modify or re-sign `ChatGPT.app`.
- Custom theme: scaffold a second theme, switch to it, verify its id/copy/artwork, then switch back without stale resources.
- Config round trip: applying and restoring a base theme preserves unrelated `[desktop]` keys and all other TOML sections.
- Restart consent: with Codex already open without CDP, Desktop and scripts stop before restart and require explicit authorization.
- Tray lifecycle: close the Desktop window, navigate/reload Codex, and confirm reinjection continues; then quit from the tray and confirm the watcher exits.
- Import/export: export a Skill theme, import it into Desktop, and verify CSS, copy, artwork, ID, and version survive the round trip.
- Import safety: reject packages over 30MB, external CSS resources, and unsafe IDs.
- Delete: remove an inactive imported theme directly; when deleting the active theme, restore the native Codex appearance first.
- Controller ownership: do not run Desktop and script watchers simultaneously; restore using the controller that applied the active theme.

## Visual checks

- 1280x820 initial home: hero, four native cards, real project selector, and composer are all visible without horizontal scrolling.
- Narrower window: accept Codex's native responsive reduction to two or three suggestion cards; no essential control is covered and the polaroid may intentionally hide.
- Normal task: messages remain readable and composer does not overlap content.
- Inspect the sidebar, header, hero edges, card labels, composer controls, scrollbar, ribbon, and bottom-right decoration.
- Reject black/transparent sidebar artifacts, clipped cards, duplicated/disconnected project labels, rasterized native controls, weak contrast, or decorations intercepting clicks.
- For `dream`, retain the pink-purple Fiona-specific art direction. For other themes, validate their own manifest rather than requiring Dream/Fiona imagery.

## Desktop manager checks

- macOS: launch the package for the declared target architecture, confirm bundle ID `app.codedrobe.desktop`, custom icon, tray behavior, bundled resources, and DMG/ZIP output. Test `arm64` and `x64` separately if both are published.
- Windows: install the Squirrel Setup EXE, confirm Start menu/shortcut behavior, official Store Codex discovery, application icon, and clean uninstall lifecycle.
- Window security: confirm context isolation and sandbox are enabled, renderer Node integration is disabled, and new-window requests are denied.
- Status card: verify installed/running/debug-ready/injector-active states on both platforms.
- Restart modal: preserve unsent user input by clearly warning before the user authorizes restart.
- Error handling: show concise messages for missing Codex, occupied port, invalid theme package, verification failure, and base-theme restore failure.

## Exploratory checks

- Start when the debug port is occupied: fail with a clear message or use a caller-selected port.
- Start after Codex updates: package discovery and injection still work without patching installed files.
- Leave a stale or unrelated PID in state: restore must not terminate that unrelated process.
- Reimport an existing user theme ID: confirm the imported copy updates in place.
- Export a theme without artwork: confirm the package imports with `art: null` and renders a safe fallback preview.
