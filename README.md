# CodeDrobe Skills

[![GitHub stars](https://img.shields.io/github/stars/CodeDrobe/skills?style=flat-square)](https://github.com/CodeDrobe/skills/stargazers)
[![Validate Skills](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

Installable Agent Skills for creating and managing reversible themes across supported Chromium/Electron AI desktop apps. Runtime behavior lives in [`@codedrobe/core`](https://github.com/CodeDrobe/core); this repository contains concise workflows and app-specific guidance only.

[简体中文](README_zh.md)

## Skill catalog

| Skill | Audience | Status |
| --- | --- | --- |
| [`codedrobe-theme`](skills/codedrobe-theme/SKILL.md) | Users and theme authors | Available |
| [`codedrobe-adapter-dev`](skills/codedrobe-adapter-dev/SKILL.md) | Core maintainers and contributors | Available |
| `codedrobe-publish-theme` | Theme publishers | Planned after registry authentication is complete |

`codedrobe-theme` supports the application targets currently provided by Core, including OpenAI Codex and Tencent WorkBuddy. New apps are added to Core adapters rather than creating one user Skill per application.

## Install

The installer command is `npx skills` (plural).

List the Skills in this repository:

```bash
npx skills add CodeDrobe/skills --list
```

Install the user-facing theme Skill globally for Codex:

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-theme \
  --global \
  --agent codex \
  --yes
```

Install the adapter-development Skill separately:

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-adapter-dev \
  --global \
  --agent codex \
  --yes
```

`--agent codex` selects the AI agent that receives the Skill. It does not select the desktop app to theme. The target app is selected later through `codedrobe --app codex` or `codedrobe --app workbuddy`.

## Ask the AI

After installing `codedrobe-theme`, attach a reference image when relevant and describe the target app. For example:

> Use this reference image to create a Codex skin. Preserve the native interaction, create a portable theme package, and verify both the home and conversation screens in the real app.

Other useful requests:

- “Turn this visual style into one theme for both Codex and WorkBuddy.”
- “Use the bundled Doll Sister example as a starting point and make a blue Codex version.”
- “This WorkBuddy theme broke after an app update. Analyze the live CDP DOM and repair it.”
- “Inspect, apply, and verify this `.codedrobe-theme` file in Codex.”
- “Restore Codex to its native look and confirm the theme left nothing behind.”
- “Fill in the store listing metadata and publish this theme to the CodeDrobe store.”

The Skill uses the image for art direction and a privacy-preserving live CDP DOM snapshot for selectors. It styles the real application instead of placing a screenshot overlay over the interface. Applying a theme may require the user to launch the app with CDP enabled; restarting an existing app still requires explicit approval.

## Runtime

Install Core once:

```bash
npm install --global @codedrobe/core
codedrobe apps
```

Or run it without a global install:

```bash
npx --yes @codedrobe/core@latest apps
bunx @codedrobe/core@latest apps
```

Example:

```bash
codedrobe dom snapshot --app workbuddy --output /absolute/workbuddy-dom.json
codedrobe apply --app workbuddy --theme /absolute/theme.codedrobe-theme
codedrobe verify --app workbuddy --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
codedrobe restore --app workbuddy
```

## Theme authoring resources

The installed `codedrobe-theme` Skill includes two copyable source resources:

- `assets/theme-starter/`: a complete neutral Codex/WorkBuddy CSS starting point.
- `assets/examples/doll-sister/`: the complete Doll Sister / 玩偶姐姐 multi-app theme with generated hero and texture artwork.

Templates are not treated as permanent application DOM contracts. The Skill captures a privacy-preserving `codedrobe dom snapshot` from each live home/conversation context, selects semantic candidates from that snapshot, then packs, probes, applies, screenshots, and repairs the theme.

## Repository layout

```text
skills/
├── codedrobe-theme/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── references/
│   └── assets/
└── codedrobe-adapter-dev/
    ├── SKILL.md
    ├── agents/openai.yaml
    └── references/
```

There is intentionally no root `SKILL.md`: the standard `skills/<name>/SKILL.md` layout allows `npx skills` to discover and install each Skill independently.

## Project boundaries

- [`CodeDrobe/core`](https://github.com/CodeDrobe/core): CLI, adapters, CDP runtime, host settings, package validation, and public API.
- [`CodeDrobe/skills`](https://github.com/CodeDrobe/skills): installable agent workflows and references.
- [`CodeDrobe/desktop`](https://github.com/CodeDrobe/desktop): visual theme manager built on Core.
- Theme publishing: intentionally withheld until authentication, ownership, moderation, and revocation are implemented.

See [CONTRIBUTING.md](CONTRIBUTING.md) before adding or changing a Skill.

## License and trademarks

Instructions and documentation are available under the [Apache License 2.0](LICENSE). Product names and trademarks belong to their respective owners. CodeDrobe is an independent project and is not endorsed by OpenAI or Tencent.
