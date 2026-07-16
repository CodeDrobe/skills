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
codedrobe apply --app workbuddy --theme /absolute/theme.codedrobe-theme
codedrobe verify --app workbuddy --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
codedrobe restore --app workbuddy
```

## Repository layout

```text
skills/
├── codedrobe-theme/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── references/
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
