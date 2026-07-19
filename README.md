# CodeDrobe Skills

[![GitHub stars](https://img.shields.io/github/stars/CodeDrobe/skills?style=flat-square)](https://github.com/CodeDrobe/skills/stargazers)
[![Validate Skills](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

Installable Agent Skills for creating and managing reversible themes across supported Chromium/Electron AI desktop apps, including OpenAI Codex and Tencent WorkBuddy. Runtime behavior lives in [`@codedrobe/core`](https://github.com/CodeDrobe/core); this repository contains concise workflows and app-specific guidance only.

[简体中文](README_zh.md)

Two Skills ship here:

- [`codedrobe-theme`](skills/codedrobe-theme/SKILL.md) — create, apply, verify, repair, restore, and [publish](skills/codedrobe-theme/references/publish.md) themes. For users and theme authors.
- [`codedrobe-adapter-dev`](skills/codedrobe-adapter-dev/SKILL.md) — adapter development workflows for Core maintainers and contributors.

New apps are added as Core adapters, not as new Skills.

## Install

The installer command is `npx skills` (plural):

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-theme \
  --global \
  --agent codex \
  --yes
```

`--agent codex` selects the AI agent that receives the Skill. It does not select the desktop app to theme — the target app is chosen later through `codedrobe --app codex` or `codedrobe --app workbuddy`. Maintainers install `codedrobe-adapter-dev` the same way, and `npx skills add CodeDrobe/skills --list` shows everything available.

## Ask the AI

After installing `codedrobe-theme`, attach a reference image when relevant and describe the target app. For example:

> Use this reference image to create a Codex skin. Preserve the native interaction, create a portable theme package, and verify both the home and conversation screens in the real app.

Other useful requests:

- “Turn this visual style into one theme for both Codex and WorkBuddy.”
- “Use the bundled Doll Sister example as a starting point and make a blue Codex version.”
- “This WorkBuddy theme broke after an app update. Analyze the live CDP DOM and repair it.”
- “Inspect, apply, and verify this `.codedrobe-theme` file in Codex.”
- “Find a retro theme in the CodeDrobe store and install it into Codex.”
- “Restore Codex to its native look and confirm the theme left nothing behind.”
- “Fill in the store listing metadata and publish this theme to the CodeDrobe store.”

The Skill uses the image for art direction and a privacy-preserving live CDP DOM snapshot for selectors — it styles the real application instead of overlaying a screenshot. Applying a theme may require launching the app with CDP enabled, and restarting a running app always requires your explicit approval.

## Runtime

The Skill drives the `@codedrobe/core` CLI; install it once (no-install runners like `npx`/`bunx` are covered inside the Skill):

```bash
npm install --global @codedrobe/core
codedrobe apps
```

Day-to-day commands — snapshot, apply, verify, restore — are run by the AI on your behalf. Publishing to the CodeDrobe store requires sign-in and your confirmation:

```bash
codedrobe auth login
codedrobe theme publish /absolute/theme.codedrobe-theme --submit
```

## Theme authoring resources

The installed `codedrobe-theme` Skill includes two copyable source resources:

- `assets/theme-starter/`: a complete neutral Codex/WorkBuddy CSS starting point.
- `assets/examples/doll-sister/`: the complete Doll Sister / 玩偶姐姐 multi-app theme with generated hero and texture artwork.

Templates are not permanent DOM contracts: the Skill captures a live `codedrobe dom snapshot` per app context, selects semantic nodes from it, then packs, probes, applies, screenshots, and repairs.

## Community

- Linux.do: https://linux.do/
- Theme store: https://codedrobe.app

## Related repositories

- [`CodeDrobe/core`](https://github.com/CodeDrobe/core): CLI, adapters, CDP runtime, host settings, package validation, and public API.
- [`CodeDrobe/desktop`](https://github.com/CodeDrobe/desktop): visual theme manager built on Core.
- Store publishing runs through `codedrobe theme publish`: device-flow sign-in, server-side package validation, and review before a listing goes live.

See [CONTRIBUTING.md](CONTRIBUTING.md) before adding or changing a Skill.

## License and trademarks

Instructions and documentation are available under the [Apache License 2.0](LICENSE). Product names and trademarks belong to their respective owners. CodeDrobe is an independent project and is not endorsed by OpenAI or Tencent.
