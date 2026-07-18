# Create a theme from a reference image

Use this workflow when the user attaches an image or provides a local image path and asks for a Codex or WorkBuddy skin inspired by it.

## Inspect before authoring

Use an available image-viewing tool to inspect the actual file. Record a concise visual brief covering:

- dominant and accent colors, surface opacity, contrast, and light/dark direction;
- material language such as glass, paper, metal, fabric, grain, glow, or shadow;
- reusable motifs such as ribbons, petals, grids, stars, cards, or borders;
- image focal point and safe crop zones for wide and narrow layouts;
- which qualities belong in CSS tokens and which require named image assets.

Do not guess image details from its filename. Do not extract or expose unrelated private content.

## Preserve the real application

Translate the visual language onto the live native interface. Do not paste the reference image or a generated mockup over the application window. Keep navigation, composer, menus, scrolling, focus, labels, and hit targets functional.

Use a live CDP DOM snapshot for selectors. The reference image decides the art direction; the renderer snapshot decides where CSS can safely attach.

## Create assets safely

- For a private local theme, reuse a user-provided image only when the user asked to use that file directly.
- For a distributable example or theme, prefer original artwork generated from high-level palette, composition, and motif guidance. Do not copy logos, UI chrome, text, or a recognizable screenshot composition into bundled assets.
- Store files under the copied theme project's `assets/` directory and declare them in `theme.json.images` with portable relative paths.
- Use descriptive names such as `hero`, `texture`, `sidebar`, or `composer`; never hardcode the original absolute path into CSS or the package.
- Do not upload private references to an external generation or editing service without permission.

## Build and verify

1. Copy the neutral starter or the closest complete example into a writable theme project.
2. Capture separate home and conversation snapshots for every requested app.
3. Define palette, surface, spacing, radius, border, and typography tokens before detailed component rules.
4. Add named image variables only where artwork materially improves the design; provide gradient or color fallbacks.
5. Pack, inspect, probe, and apply the theme with Core.
6. Capture real screenshots of each requested context and repair overflow, contrast, crop, focus, and stale selectors.
7. Return the source directory, packaged `.codedrobe-theme`, and verification screenshots with absolute paths.

If the target app is not named, ask whether the user wants Codex, WorkBuddy, or both. If applying the result requires closing or restarting an existing app, obtain explicit permission first.
