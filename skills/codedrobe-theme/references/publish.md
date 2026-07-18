# Publish a theme to the CodeDrobe store

Publishing uploads a packed `.codedrobe-theme` file to the user's CodeDrobe store account. It is an outward-facing action: **always confirm with the user before running `theme publish`, and confirm separately before adding `--submit`** (which sends the version to review). Never publish speculatively.

## Prerequisites

1. A packed `.codedrobe-theme` file (`codedrobe theme pack …`). Fix lint warnings about missing catalog metadata before publishing instead of shipping a bare listing.
2. A signed-in account:

```bash
codedrobe auth status --json
codedrobe auth login    # device flow: the user must approve in their browser
```

Sign-in is interactive. If `auth status` reports signed out, ask the user to run or approve the login; do not attempt to bypass it.

## Fill the store listing in theme.json first

The listing is derived from the manifest — set it there so packs stay reproducible:

```json
"catalog": {
  "name": { "en": "Fortune Flow", "zh": "财神到" },
  "description": { "en": "A festive gold-and-red workspace.", "zh": "金红配色的新春工作台。" },
  "categories": ["festive", "guofeng"]
}
```

- `categories`: store slugs; the first entry is the primary shelf. The store owns the taxonomy — an unknown slug fails with a 422 that lists the valid slugs.
- Defaults when omitted: categories fall back to `other`; the description falls back to `theme.copy.tagline`. Prefer explicit values — `other` gets no shelf placement and review may reclassify.
- The listing cover comes from `images.cover` (falling back to `hero`, then `art`).

## Publish

```bash
codedrobe theme publish /absolute/theme.codedrobe-theme --json
codedrobe theme publish /absolute/theme.codedrobe-theme --submit --json   # also submit for review
```

Behavior to relay to the user:

- First publish creates the store theme (slug derived from `theme.id`, underscores → hyphens; override with `--slug`).
- Republishing the same slug uploads a **new version** of the user's own theme. Theme-level metadata (name, description, categories) is only backfilled when the store copy is blank — values edited on the web are never overwritten by the package.
- `--submit` requires at least one category and a validated package; the JSON result includes the review status and the store URL.

## Errors

| Error | Meaning / action |
| --- | --- |
| `Not logged in` | Run `codedrobe auth login` (user approves in browser). |
| `slug_taken` (with `--slug` hint) | The slug belongs to another creator — pick a new one with `--slug`. |
| `version_exists` | This version number is already uploaded — bump `theme.json` `version` and repack. |
| `validation_error` on categories | Unknown/inactive slug; the error lists valid slugs — fix `catalog.categories`. |

Do not retry a failed publish in a loop; surface the error and the fix to the user.
