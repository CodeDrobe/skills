# Verification and troubleshooting

## Understand the two checks

`probe` performs DOM preflight without installing the theme. It validates adapter landmarks plus active theme contexts and reports invalid selectors separately.

```bash
codedrobe probe --app <app-id> --theme /absolute/theme.codedrobe-theme --timeout-ms 5000
```

`verify` confirms the installed theme id/version, style, named images, profile state, required nodes, and overflow. It can capture a PNG.

```bash
codedrobe verify --app <app-id> --theme /absolute/theme.codedrobe-theme --screenshot /absolute/result.png
```

Compatibility is judged per renderer window: windows missing `required` landmarks are skipped (and reported with their title/url), and the apply fails only when no window qualifies. Loading screens whose root landmark has not rendered yet are re-probed for the full apply budget before failing.

Prefer `recommended` entries when authoring theme verification. Reserve `required` for landmarks without which the theme genuinely malfunctions — a `required` entry blocks the apply whenever that panel is hidden (popped-out chats, collapsed sidebars, secondary routes).

## Interpret failures

- `adapter:<name>` missing: the application renderer changed, the window is on a route without that landmark, or the wrong CDP target was selected. Check which window the error names before repairing Core's adapter.
- `theme:<name>` missing: the theme relies on an app-specific node that changed or is hidden in that window. Repair the target CSS and its verification entry, or demote the entry to `recommended` if the theme still works without the node.
- invalid selector: fix the selector syntax; do not silently drop the requirement.
- `installed: false`: apply did not run against this target or another watcher removed/replaced it.
- theme id/version mismatch: stale injection or a competing watcher is active.
- named image missing: repack the source manifest and confirm the image key/path.
- horizontal overflow: inspect the screenshot and repair fixed widths, transforms, or overlays.

## Connection failures

1. Pass a short explicit timeout while diagnosing.
2. Confirm the application was launched with the same loopback CDP port used by probe.
3. Check whether another process owns the port; choose a new port consistently instead of killing an unrelated process.
4. Use `codedrobe detect --app <app-id> --app-path <path> --json` for custom installations.
5. Do not assume a running Electron process exposes CDP.

## Safe iteration

Applying theme B replaces theme A in the same Core renderer session and revokes A's owned image URLs. A separate legacy or Desktop watcher may still inject again later; ensure one controller owns the renderer.

After testing, restore the app and confirm that the Core host state, style element, root host class, and theme dataset are absent.
