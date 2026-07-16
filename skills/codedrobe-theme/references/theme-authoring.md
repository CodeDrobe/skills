# Theme authoring

## Source layout

Keep source themes outside the installed Skill. Use a project directory such as:

```text
my-theme/
├── theme.json
├── codex.css
├── workbuddy.css
└── assets/
    ├── hero.png
    └── texture.png
```

Use a manifest shaped like:

```json
{
  "schemaVersion": 1,
  "id": "my-theme",
  "displayName": "My Theme",
  "version": "1.0.0",
  "images": {
    "hero": "assets/hero.png",
    "texture": "assets/texture.png"
  },
  "copy": {
    "tagline": "Optional shared copy"
  },
  "targets": {
    "codex": {
      "css": "codex.css",
      "options": {
        "rendererProfile": "codex-theme-v1",
        "baseTheme": {
          "mode": "light",
          "accent": "#B688BA",
          "ink": "#4C3658",
          "surface": "#FFF9F7"
        }
      }
    },
    "workbuddy": {
      "css": "workbuddy.css"
    }
  }
}
```

Only include supported targets. A single package may support multiple apps and shares its embedded named images across targets.

For a new theme, copy `assets/theme-starter/`. For a complete authored example, copy `assets/examples/doll-sister/`. Read `references/dom-snapshot.md` and replace detailed selectors from a fresh snapshot before treating either source as compatible with the installed app version.

## Image variables

Reference named images from CSS:

```css
background-image: var(--codedrobe-image-hero);
background-image: var(--codedrobe-image-texture);
```

Use names containing letters, digits, `_`, or `-`. Keep at most 32 images and keep the final package at or below 30 MB. `hero` remains compatible with the legacy art alias, but new themes should use `images` rather than an app-specific `art` field.

## Verification nodes

Declare app-specific assumptions next to the target:

```json
{
  "verification": {
    "required": [
      { "name": "chat-surface", "any": [".chat-container", ".wb-cb-chat"] }
    ],
    "contexts": [
      {
        "name": "home",
        "when": { "any": [".wb-home-page"] },
        "required": [
          { "name": "home-hero", "any": [".wb-home-header"] }
        ],
        "recommended": [
          { "name": "quick-actions", "any": [".quick-actions"] }
        ]
      }
    ]
  }
}
```

Use `required` when missing nodes make the theme unusable. Use `recommended` for optional decoration or secondary polish. Name every requirement so failure output is actionable.

## CSS safety

- Scope every rule under `html.codedrobe-host-<app-id>` or the relevant renderer-profile class.
- Prefer stable semantic classes, roles, and test ids. Avoid generated hash classes, localized copy, and deep positional chains.
- Keep any unavoidable brittle selector in theme CSS and cover it with a theme-specific verification node.
- Do not use external `@import`, remote `url(...)`, scripts, event handlers, or fake full-window screenshot overlays.
- Use `pointer-events: none` for decorative overlays.
- Preserve contrast, focus, native labels, input behavior, scrolling, and reduced-motion preferences.

## Package and iterate

```bash
codedrobe dom snapshot --app workbuddy --output /absolute/workbuddy-home-dom.json
codedrobe theme pack /absolute/my-theme/theme.json --output /absolute/my-theme.codedrobe-theme
codedrobe theme inspect /absolute/my-theme.codedrobe-theme
codedrobe probe --app workbuddy --theme /absolute/my-theme.codedrobe-theme
```

Apply on a real renderer, capture screenshots, repair CSS, increment the theme version, repack, and verify again.
