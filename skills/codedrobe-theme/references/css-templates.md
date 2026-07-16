# CSS templates

## Neutral starter

Copy the complete multi-app starter from `assets/theme-starter/` into a new writable project directory. It contains:

- `theme.json`: Codex and WorkBuddy targets with context validation.
- `codex.css`: tokens, sidebar, main surface, header, home hero, suggestions, composer, content, focus, responsive, and reduced-motion rules.
- `workbuddy.css`: shell, sidebar, workspace, home hero, tabs/actions, home and conversation composers, content, focus, responsive, and reduced-motion rules.

Add named images to the copied manifest when needed:

```json
"images": {
  "hero": "assets/hero.png",
  "texture": "assets/texture.png"
}
```

The CSS already uses optional `--codedrobe-image-hero` and `--codedrobe-image-texture` variables. Missing optional images fall back to gradients or no texture.

## Adapt rather than copy blindly

1. Capture home and conversation DOM snapshots.
2. Compare every non-token selector in the selected app CSS with snapshot candidates.
3. Remove selectors for features the theme does not style.
4. Replace stale or generated selectors with semantic candidates from the current renderer.
5. Add named verification requirements for essential theme layout nodes.
6. Keep rules scoped under `html.codedrobe-host-codex` or `html.codedrobe-host-workbuddy`.

Do not place application-independent color and spacing decisions in the adapter. Do not turn a full example's layout selectors into Core landmarks.

## CSS order

Keep CSS in this order so later repairs remain local:

1. theme tokens and host root
2. application shell and background
3. sidebar/navigation
4. workspace/header
5. route-specific home layout
6. composer and controls
7. conversation/markdown/code content
8. focus, scrolling, responsive, and reduced motion

Use `!important` only where the host application's specificity or inline theme variables require it. Preserve native hit targets, scrolling, focus rings, menus, and composer behavior.
