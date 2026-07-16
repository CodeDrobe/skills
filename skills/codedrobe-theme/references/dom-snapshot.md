# Dynamic CSS from a live DOM snapshot

Use Core's read-only snapshot before creating or repairing detailed CSS. A template is a starting structure, not current compatibility evidence.

## Capture every context

Start the application with loopback CDP when needed, then navigate the application manually to each relevant context and capture separate files:

```bash
codedrobe launch --app <app-id> --port <port>
codedrobe dom snapshot --app <app-id> --port <port> \
  --output /absolute/dom-home.json
codedrobe dom snapshot --app <app-id> --port <port> \
  --max-nodes 1500 --output /absolute/dom-conversation.json
```

The command does not launch, restart, or mutate the app. Never add `--restart-existing` to the launch step without user authorization. Add `--include-hidden` only when a hidden dialog or route must be styled.

## Read the snapshot

Each target contains:

- `activeTheme`: whether computed styles include an already applied CodeDrobe theme.
- `landmarks`: adapter root, sidebar, workspace, and composer selector results.
- `nodes[].parentIndex` and `depth`: structural relationships without text content.
- `semanticClasses`: classes after common CSS-module/hash classes are removed.
- `selectors`: candidate selectors with document match counts and syntax validity.
- `rect`, `states`, and `styles`: geometry, interaction state, and theme-relevant computed style.
- `summary.truncated`: whether `--max-nodes` must be increased.

Useful queries:

```bash
jq '.targets[].result.summary' /absolute/dom-home.json
jq '.targets[].result.landmarks' /absolute/dom-home.json
jq '.targets[].result.nodes[] | select(.semanticClasses | length > 0) |
  {index, parentIndex, tag, semanticClasses, selectors, rect}' /absolute/dom-home.json
jq '.targets[].result.nodes[] | select(.states.editable)' /absolute/dom-home.json
```

## Choose selectors

Prefer, in order:

1. product-owned stable ids, semantic classes, or `data-testid`/`data-feature` attributes;
2. stable roles combined with nonlocalized state attributes;
3. a short structural selector anchored to a stable semantic parent;
4. generated or positional selectors only when no alternative exists.

Prefer candidates with a small expected match count. Recheck selectors in every context where the rule applies. Never use snapshot order or `node.index` as a CSS selector.

For a new theme, capture the unthemed application baseline. If `activeTheme.installed` is true, do not silently treat themed computed styles as native values; either use the snapshot only for selector discovery or ask before restoring the active theme and recapturing. For repairing that same active theme, themed styles are useful evidence.

If a necessary selector is brittle, put it in target CSS and add a named theme verification requirement. Do not move page-layout assumptions into the Core adapter.

## Privacy boundary

The snapshot excludes text, input values, accessible names, query/hash data, links, and media sources. Do not replace it with arbitrary `document.body.innerText`, `outerHTML`, or form-value dumps. Ask for explicit permission before collecting content beyond the Core snapshot contract.

## Iterate

After editing CSS:

```bash
codedrobe theme pack /absolute/theme.json --output /absolute/theme.codedrobe-theme --force
codedrobe probe --app <app-id> --theme /absolute/theme.codedrobe-theme
codedrobe apply --app <app-id> --theme /absolute/theme.codedrobe-theme
codedrobe verify --app <app-id> --theme /absolute/theme.codedrobe-theme \
  --screenshot /absolute/theme.png
```

When `adapter:<name>` fails, inspect and repair Core. When `theme:<name>` fails, update the target CSS and theme verification nodes from a fresh snapshot.
