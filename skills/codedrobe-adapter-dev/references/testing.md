# Adapter testing

## Unit coverage

Add focused tests for:

- unique adapter id and default port
- platform discovery candidates and custom-path behavior
- strict target matching and rejection of unrelated pages
- required landmark names and selector lists
- short timeout diagnostics
- occupied custom port handling
- renderer payload namespacing, cleanup, and named image lifecycle
- rollback when host settings succeed but renderer injection fails
- public exports and TypeScript declarations

Run the Core repository's complete test, typecheck, package dry-run, and `git diff --check` commands.

## Real-app signoff

1. Record the installed application version/build.
2. Probe without a theme and confirm all adapter landmarks.
3. Pack a minimal theme with a target for the new adapter.
4. Probe with the theme and confirm theme-required nodes.
5. Apply to the real renderer and verify theme id/version, style, named images, profile state, and overflow.
6. Capture and inspect home and conversation screenshots.
7. Reapply another theme and confirm replacement cleanup.
8. Restore and confirm the renderer state, root class, style, image variables, observers, and host settings are clean.
9. Update `lastVerified` only after every applicable step passes.

## Failure reporting

Required-node failures must include:

- scope: adapter or theme
- context when applicable
- requirement name
- every attempted selector
- invalid selector details separately

Never convert a broken required node into a warning merely to make verification pass.
