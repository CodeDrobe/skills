# Miku Future Beats / 初音未来 example

`assets/examples/miku-future-beats/` is a complete source theme for Codex, WorkBuddy, QoderWork, and TRAE SOLO. Copy the directory to a writable location before modifying it.

It demonstrates:

- one portable `theme.json` with four app targets and store catalog metadata;
- full per-app CSS rather than a screenshot overlay;
- shared `hero` and `texture` named images reused by every target;
- Codex transactional `baseTheme` settings and the trusted `codex-theme-v1` renderer profile;
- deep app-token overrides: QoderWork's `--color-*` system and TRAE SOLO's `--vscode-*` solo-lite tokens;
- app- and context-specific verification nodes, including conditional-class avoidance (`.chat-input-primary-glow`) and `:has()`-anchored composers;
- home hero art washes, decorative pseudo-element badges/polaroids kept `pointer-events: none`, responsive fallbacks, and reduced-motion handling.

Package it:

```bash
codedrobe theme pack /absolute/miku-future-beats/theme.json \
  --output /absolute/miku-future-beats-1.2.0.codedrobe-theme
codedrobe theme inspect /absolute/miku-future-beats-1.2.0.codedrobe-theme
```

Before applying it to a newer app version, capture fresh home and conversation snapshots and compare its detailed selectors with the live renderer. Treat the example as an authored design and learning resource, not a permanent DOM contract.

The bundled hero and texture are original generated artwork (prompts in `ASSET_PROMPTS.md`); they contain no copied UI, typography, logos, or screenshot framing. This is an unofficial fan work with no affiliation or endorsement from Crypton Future Media, OpenAI, Tencent, Alibaba, or ByteDance.
