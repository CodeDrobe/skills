---
name: codedrobe-adapter-dev
description: Add, inspect, repair, or validate CodeDrobe Core adapters for Chromium/Electron AI desktop applications. Use when supporting a new app, updating Codex or WorkBuddy compatibility after an app release, discovering installation paths or CDP targets, selecting stable DOM landmarks, adding renderer profiles or transactional host settings, recording lastVerified versions, or writing adapter and real-renderer tests.
---

# CodeDrobe Adapter Development

Work in the `@codedrobe/core` repository. Keep the adapter lightweight and prove selectors against a real installed application; never infer renderer compatibility from an app name, executable path, or screenshot alone.

## Read the relevant references

- Read [references/architecture.md](references/architecture.md) before changing ownership between Core, adapters, renderer profiles, themes, Skills, or Desktop.
- Read [references/adapter-contract.md](references/adapter-contract.md) before editing adapter code, exports, host settings, or types.
- Read [references/dom-inspection.md](references/dom-inspection.md) before collecting CDP targets or choosing selectors.
- Read [references/testing.md](references/testing.md) before claiming support or updating `lastVerified`.

## Add or repair an adapter

1. Inspect the current Core tree, adapter registry, tests, CLI help, and working-tree changes.
2. Locate the actual installed app and record its app version/build. Do not overwrite unrelated local changes.
3. Launch the real app with loopback CDP on a configurable, unoccupied port. Do not restart or terminate it without authorization.
4. Inspect `/json/list`, select the actual renderer, and collect semantic DOM evidence from every relevant route.
5. Choose only cross-route landmarks for the adapter: root, sidebar/navigation, workspace/content, and composer/input.
6. Put app- or theme-specific layout nodes in theme verification contexts, not the adapter.
7. Implement the adapter, registry export, types, and focused tests. Add a renderer profile or host-settings module only when the application requires that behavior.
8. Probe the real renderer, then apply and verify a minimal package. Validate the home and conversation contexts separately.
9. Restore the renderer and any transactional host settings. Confirm cleanup before finishing.
10. Update `lastVerified` only after real-app verification succeeds, including the observed version/build and date.

## Compatibility failure workflow

1. Reproduce with `codedrobe probe --app <id> --theme <package>`.
2. Separate adapter landmark failures from theme-specific missing nodes.
3. Inspect the live DOM and computed layout; do not repair from stale documentation alone.
4. Prefer a stable alternative selector before broadening `any` lists.
5. Keep failure output concrete: requirement name plus every attempted selector.
6. Add a regression test before updating `lastVerified`.

## Guardrails

- Never patch application bundles, `app.asar`, code signatures, WindowsApps ownership, or user authentication data.
- Bind CDP to `127.0.0.1` and reject occupied custom ports instead of killing unknown processes.
- Avoid generated CSS-module hashes, localized text, deep child chains, and broad selectors such as `body *` in adapters.
- Keep optional decoration out of adapter requirements.
- Preserve custom installation paths and user-selected CDP ports throughout detect, launch, probe, apply, verify, watch, and restore.
- Do not add a public theme-publishing path until registry authentication and authorization are complete.
