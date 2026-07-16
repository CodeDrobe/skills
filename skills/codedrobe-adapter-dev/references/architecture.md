# Repository boundaries

## Core

Own these in `@codedrobe/core`:

- CLI commands and package API
- application discovery and launch
- CDP sessions, timeouts, target selection, apply/watch/verify/restore
- adapter registry and cross-route landmarks
- renderer profiles needed for compatibility with established theme contracts
- transactional host settings and rollback
- `.codedrobe-theme` validation, packaging, legacy conversion, image lifecycle, and safety limits
- public types and tests

## Theme package

Own these in theme source/package files:

- colors, typography, copy, artwork, named images, and CSS
- app-specific layout selectors
- context activation and theme-specific required/recommended nodes
- visual responsiveness and reduced motion

## Skills repository

Keep Skills instruction-only. Tell agents how to select and safely use the published Core. Do not copy Core runtime JavaScript, Bash, PowerShell, adapters, or theme binaries into installed Skill folders.

## Desktop

Treat Desktop as a Core consumer and visual controller. It may manage themes, confirmation UI, tray watchers, and screenshots, but it must not fork Core's adapter or package logic.

## Theme registry

Keep publishing separate from local theme authoring. Do not expose `codedrobe-publish-theme` until authentication, identity, ownership, moderation, and revocation are implemented end to end.
