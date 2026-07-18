---
name: codedrobe-theme
description: Create, inspect, convert, apply, replace, verify, troubleshoot, update, publish, or restore reversible CodeDrobe themes for supported Chromium/Electron AI desktop apps, including OpenAI Codex and Tencent WorkBuddy. Use when a user asks to turn an attached or local reference image into a Codex or WorkBuddy skin, reproduce a visual style with native UI, build a multi-app theme, work with .codedrobe-theme packages or theme images, analyze a live CDP DOM snapshot, repair DOM compatibility failures, use a custom port or installation path, capture verification screenshots, publish or submit a theme to the CodeDrobe store, or migrate a legacy .codex-theme file.
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
5. When the request includes an attached or local visual reference, read [references/reference-image.md](references/reference-image.md).
6. For new or repaired CSS, read [references/dom-snapshot.md](references/dom-snapshot.md) and [references/css-templates.md](references/css-templates.md).
7. For the complete Doll Sister / 玩偶姐姐 example, read [references/doll-sister-example.md](references/doll-sister-example.md).
8. For probe, verification, screenshots, missing nodes, CDP failures, or app updates, read [references/verification.md](references/verification.md).
9. To publish or submit a theme to the CodeDrobe store, read [references/publish.md](references/publish.md).

## Interpret common requests

- “参考这张图片，帮我生成一个 Codex 皮肤”：inspect the supplied image, create a Codex target from a live Codex DOM snapshot, package it, and verify the native UI in Codex.
- “把这个视觉风格同时做成 Codex 和 WorkBuddy 皮肤”：create one theme package with separate target CSS and shared named image assets.
- “用玩偶姐姐示例改成蓝色版本”：copy the bundled example to a writable project, change its tokens/assets, refresh live selectors, and verify both requested contexts.
- “这个主题更新应用后错位了”：capture fresh snapshots, repair theme CSS and theme-specific verification nodes, then repack and compare screenshots.
- “帮我安装这个 `.codedrobe-theme`”：inspect, probe, apply, and verify the supplied package; do not recreate it unless validation fails and the user asks for repair.
- “把这个主题发布到 CodeDrobe 商店”：complete the `theme.catalog` listing metadata, pack, confirm with the user, then `codedrobe theme publish` (and `--submit` only with separate confirmation).

Treat the named target app as explicit. If no target is named and it cannot be inferred from the supplied package or current task, ask one concise question before launching or applying anything.

## Apply an existing theme

1. Inspect the package before applying it.
2. Detect the application and resolve any user-provided installation path or CDP port.
3. Probe the live renderer with the selected theme. Compatibility is judged per window: a window missing required adapter or theme nodes is skipped, and the apply fails only when no window qualifies. A probe run while the app is still on its loading screen reports every landmark missing — wait for the root landmark before treating that as incompatibility.
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

1. Inspect any supplied reference image and turn it into a short visual brief before writing CSS. Never use the reference screenshot as a full-window overlay.
2. Copy `assets/theme-starter/` for a neutral base or `assets/examples/doll-sister/` for a complete multi-app example. Never edit the installed Skill in place.
3. Open each app context the theme will style and capture a separate `codedrobe dom snapshot`; do not infer selectors from the template alone.
4. Select semantic candidates from the snapshot, then write app-specific CSS under `html.codedrobe-host-<app-id>`.
5. Keep shared artwork in named `images`; keep app-specific selectors under the relevant target CSS.
6. Keep adapter landmarks generic and theme layout assumptions in theme-specific verification nodes.
7. Pack with Core, inspect the output, then probe and apply it on a real renderer.
8. Iterate from home and conversation screenshots. Do not claim success from static CSS, a snapshot, or package validation alone.

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
- Publish only through `codedrobe theme publish`, never through an improvised endpoint. Publishing and submitting for review each require the user's explicit confirmation, and sign-in stays a user-approved device flow.
