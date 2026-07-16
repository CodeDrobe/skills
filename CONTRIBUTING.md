# Contributing

## Add or change a Skill

1. Put each installable Skill at `skills/<skill-name>/SKILL.md`.
2. Use lowercase hyphenated names and make the folder match the frontmatter `name`.
3. Keep frontmatter limited to `name` and a trigger-complete `description`.
4. Keep `SKILL.md` concise and move app-specific or advanced material into one-level `references/` files.
5. Keep runtime code out of Skills. Add CLI, adapters, package parsing, CDP, host settings, and deterministic runtime behavior to [`CodeDrobe/core`](https://github.com/CodeDrobe/core).
6. Include matching `agents/openai.yaml` metadata with a default prompt that names the Skill.
7. Do not add a root `SKILL.md`; it can shadow the multi-Skill catalog during discovery.
8. Do not commit generated `.codedrobe-theme` packages, screenshots, credentials, tokens, private reference images, or application binaries. Curated source-theme assets are allowed only when their provenance and redistribution status are documented in a directly linked Skill reference.

## Validate

```bash
npm test
```

This uses the official `skills` CLI to discover the repository catalog. Also run the Skill Creator validator when it is available locally:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/codedrobe-theme
python3 /path/to/skill-creator/scripts/quick_validate.py skills/codedrobe-adapter-dev
```

Forward-test substantial workflow changes against realistic prompts without exposing the expected answer to the evaluating agent.

## Publishing Skill gate

Do not create or expose `codedrobe-publish-theme` until all of these are implemented and reviewed:

- user authentication and refresh/revocation behavior
- publisher identity and theme ownership
- scoped upload credentials and least-privilege authorization
- package signature/hash verification and server-side package validation
- moderation, abuse reporting, takedown, and audit history
- version conflicts, rollback, and publisher-visible error handling

Until then, theme creation and local package export remain available; remote publishing does not.
