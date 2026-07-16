---
name: codedrobe-theme
description: Create, inspect, convert, apply, replace, verify, troubleshoot, update, or restore reversible CodeDrobe themes for supported Chromium/Electron AI desktop apps, including OpenAI Codex and Tencent WorkBuddy. Use for .codedrobe-theme packages, app-specific CDP ports or installation paths, theme images and CSS, DOM compatibility failures, screenshots, or migration from legacy .codex-theme files.
---

# CodeDrobe Theme

Use the published `@codedrobe/core` CLI as the only runtime. Keep this Skill instruction-only: do not recreate injectors, launch scripts, package parsers, or application patchers inside the Skill.

## Route the request

1. Identify the target app explicitly. Run `codedrobe apps --json` when support or defaults are uncertain.
2. Read [references/cli.md](references/cli.md) before choosing an installed, npm, or Bun command runner.
3. Read only the target-specific reference:
   - Codex: [references/codex.md](references/codex.md)
   - WorkBuddy: [references/workbuddy.md](references/workbuddy.md)
4. For theme creation, images, CSS, packaging, or legacy conversion, read [references/theme-authoring.md](references/theme-authoring.md).
5. For probe, verification, screenshots, missing nodes, CDP failures, or app updates, read [references/verification.md](references/verification.md).

## Apply an existing theme

1. Inspect the package before applying it.
2. Detect the application and resolve any user-provided installation path or CDP port.
3. Probe the live renderer with the selected theme. Treat missing required adapter or theme nodes as incompatibility.
4. Apply the theme. Never add `--restart-existing` unless the user authorized closing and restarting the running application.
5. Verify the installed theme and capture an absolute-path screenshot when visual confirmation matters.
6. Inspect both the home screen and a normal conversation when the theme styles both contexts.

Use these command shapes after selecting the runner described in `references/cli.md`:

```bash
codedrobe theme inspect /absolute/theme.codedrobe-theme
codedrobe probe --app <app-id> --theme /absolute/theme.codedrobe-theme
codedrobe apply --app <app-id> --theme /absolute/theme.codedrobe-theme
codedrobe verify --app <app-id> --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
```

## Create or repair a theme

1. Start from a source `theme.json`, app-specific CSS files, and local image assets.
2. Keep shared artwork in named `images`; keep app-specific selectors under the relevant target CSS.
3. Keep adapter landmarks generic and theme layout assumptions in theme-specific verification nodes.
4. Pack with Core, inspect the output, then probe and apply it on a real renderer.
5. Iterate from screenshots. Do not claim success from static CSS or package validation alone.

## Restore

Use Core restore instead of deleting application data or manually editing host settings:

```bash
codedrobe restore --app <app-id>
```

Confirm that the CodeDrobe renderer state and theme style are gone. For Codex, also confirm that the transactional base-theme backup was restored when one existed.

## Guardrails

- Never patch, replace, re-sign, or take ownership of application bundles, `app.asar`, or WindowsApps files.
- Bind CDP to loopback only and use one consistent port for launch, apply, watch, verify, and restore.
- Do not terminate or restart an existing application without explicit user authorization.
- Do not run competing theme watchers against the same renderer.
- Treat theme packages as untrusted input. Do not evaluate theme JavaScript or allow external CSS resources.
- Keep decorative layers noninteractive and preserve native navigation, composer, menus, and accessibility behavior.
- Do not upload private reference images to an unapproved image service.
- Do not publish themes through an improvised endpoint. Theme publishing remains unavailable until the dedicated authentication flow is released.
