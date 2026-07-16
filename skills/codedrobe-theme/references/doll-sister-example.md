# Doll Sister / 玩偶姐姐 example

`assets/examples/doll-sister/` is a complete source theme for Codex and WorkBuddy. Copy the directory to a writable location before modifying it.

It demonstrates:

- one portable `theme.json` with two app targets;
- full Codex and WorkBuddy CSS rather than a screenshot overlay;
- shared `hero` and `texture` named images;
- Codex transactional `baseTheme` settings and the trusted `codex-theme-v1` renderer profile;
- app- and context-specific verification nodes;
- home, sidebar, composer, conversation, code/table, responsive, and reduced-motion styling.

Package it:

```bash
codedrobe theme pack /absolute/doll-sister/theme.json \
  --output /absolute/doll-sister-1.0.0.codedrobe-theme
codedrobe theme inspect /absolute/doll-sister-1.0.0.codedrobe-theme
```

Before applying it to a newer app version, capture fresh home and conversation snapshots and compare its detailed selectors with the live renderer. Treat the example as an authored design and learning resource, not a permanent DOM contract.

The bundled hero and texture were generated with OpenAI image generation on 2026-07-16. A user-supplied screenshot was used only as composition, wardrobe, motif, and palette reference; the bundled images contain original generated artwork without copied UI, typography, logos, or screenshot framing.
