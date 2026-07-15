# Theme schema

Each selectable theme is a JSON manifest in `themes/` or an absolute manifest path passed with `--theme` / `-Theme`.

## Required fields

- `schemaVersion`: currently `1`.
- `id`: letters, digits, `_`, and `-`; start with a letter or digit.
- `displayName`: user-facing name.
- `version`: increment after any visible change.
- `css`: CSS path relative to the manifest.
- `art`: optional PNG/JPEG/WebP path relative to the manifest. Without artwork the injector supplies a transparent pixel.

## Copy

The optional `copy` object controls `brandTitle`, `brandSubtitle`, `signature`, `tagline`, `projectPrefix`, `projectLabel`, and `ribbon`. Values are inserted with `textContent` or escaped CSS strings, not as executable HTML.

## Base theme

`baseTheme` aligns Codex's official light-theme tokens with the injected CSS:

- `mode`, `codeTheme`, `accent`, `contrast`, `ink`, `surface`, and `opaqueWindows`.
- `fonts.windowsCode`, `fonts.windowsUi`, `fonts.macCode`, and `fonts.macUi`.
- `semanticColors.diffAdded`, `semanticColors.diffRemoved`, and `semanticColors.skill`.

The installer changes only `appearanceTheme`, `appearanceLightCodeThemeId`, and `appearanceLightChromeTheme` inside `[desktop]`. Each managed key and each generated Chrome-theme parameter is written exactly once because duplicate TOML keys can prevent Codex from starting. Restore merges one saved value for each key instead of replacing the complete config file.

## Portable `.codex-theme` package

Run `node scripts/export-theme.mjs --theme <id> --output /absolute/file.codex-theme` after verification. The resulting single JSON file contains:

- `format: "codex-theme"` and `schemaVersion: 1`.
- A normalized manifest whose CSS entry is `theme.css`.
- The full CSS source in `css`.
- Optional artwork with filename, MIME type, and Base64 content in `art`.

Packages are limited to 30MB and CSS containing external `url(...)` resources or `@import` is rejected. Embedded `data:` URLs are allowed.

The file is UTF-8 JSON, not a ZIP archive. Its top-level shape is:

```json
{
  "format": "codex-theme",
  "schemaVersion": 1,
  "exportedAt": "2026-07-15T00:00:00.000Z",
  "manifest": {
    "schemaVersion": 1,
    "id": "ocean-calm",
    "displayName": "Ocean Calm",
    "version": "1.0.0",
    "css": "theme.css",
    "art": "cover.png"
  },
  "css": "/* complete theme CSS */",
  "art": {
    "filename": "cover.png",
    "mimeType": "image/png",
    "base64": "..."
  }
}
```

Export normalizes `manifest.css` to `theme.css` and artwork to a safe basename, so no absolute source-machine path remains. When a theme has no artwork, the top-level `art` payload is omitted and `manifest.art` is `null`.

CodeDrobe Desktop applies these import rules:

- Reject unsupported format/schema versions, unsafe IDs, missing required fields, oversized packages, and external CSS resources.
- Reimporting the same user-created ID replaces the earlier imported copy.
- Store the decoded package entirely inside the CodeDrobe user-data `themes/<id>/` directory.

CLI export and Desktop export must remain mutually compatible. Run the Desktop repository integration test whenever the package contract changes.

## AI customization boundaries

- Prefer a cohesive palette with readable text contrast over changing every selector.
- Preserve `.codedrobe-codex-skin`, `#codedrobe-codex-skin-chrome`, `.dream-home`, and native Codex selector hooks used by verification.
- Keep decorations non-interactive and avoid hiding functional controls.
- Do not place secrets, user data, remote scripts, `@import` URLs, or tracking pixels in a theme.
- Use local theme assets. Record the source and distribution rights before publishing celebrity or third-party artwork.
- Keep palette values as ordinary CSS colors; do not encode network requests or executable content in manifest fields.
