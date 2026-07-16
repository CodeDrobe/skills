# Codex target

Use app id `codex`. Read current defaults and the last verified application version from `codedrobe apps --json`; do not treat this reference as a version registry. The built-in default CDP port is currently `9335`, but an explicit `--port` must win.

## Apply behavior

Codex themes may declare a `baseTheme`. Core updates only its managed `[desktop]` appearance keys in `~/.codex/config.toml` and creates a transactional backup in the CodeDrobe state directory.

- If Codex is already running and those host settings change, Core requires `--restart-existing` for a complete result.
- Do not add that flag or close Codex until the user authorizes the restart.
- Do not edit `config.toml` manually to work around the guard.
- Repeated applies replace renderer CSS, copy, profile state, and image URLs. Restore returns host settings to the saved pre-CodeDrobe state.

## Verification surface

Keep the adapter limited to cross-route landmarks such as the main surface, left sidebar, and composer. Keep home hero, suggestion-card, project-selector, and other layout assumptions in the theme package.

Capture separate home and normal-task snapshots before adapting `assets/theme-starter/codex.css` or `assets/examples/doll-sister/codex.css`. Do not assume the example's structural home selectors survived a Codex update.

Verify at least:

1. Home context, hero, suggestion cards, project selector, and composer.
2. A normal task with prose, code blocks, tool output, scrolling, and the composer.
3. No horizontal overflow and no decorative layer intercepting clicks.
4. Theme id, version, named images, renderer profile, and required theme nodes.

## Watchers

Use one Core-owned watcher for route changes and renderer reloads. Old Skill or Desktop injectors can overwrite a newly applied theme after navigation; stop or migrate competing watchers instead of layering another one.
