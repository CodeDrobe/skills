# Caishen Readable example

`assets/examples/caishen-readable/` is a Codex-only source theme example. Copy
the directory to a writable location before modifying it.

It demonstrates:

- one portable `theme.json` with store catalog metadata for a single Codex
  target;
- a public-safe Caishen hero image with right-side visual focus and left-side
  negative space for native Codex text;
- a warm low-contrast texture reused by the Codex CSS;
- light `baseTheme` settings for readable panels, code blocks, sidebar, and
  composer surfaces;
- theme-specific recommended verification nodes for home and conversation
  contexts.

Package it:

```bash
codedrobe theme pack /absolute/caishen-readable/theme.json \
  --output /absolute/caishen-readable-1.0.0.codedrobe-theme
codedrobe theme inspect /absolute/caishen-readable-1.0.0.codedrobe-theme
```

Before applying it to a newer Codex version, capture fresh home and conversation
snapshots and compare the detailed selectors with the live renderer. Treat the
example as an authored design and learning resource, not a permanent DOM
contract.

The bundled hero and texture are public-safe assets from the MIT-licensed
`ChannelerH/codex-skin-packs` Caishen Readable pack. They contain no private
Codex workspace screenshots, task names, chats, sidebars, file paths, project
files, or application chrome.
