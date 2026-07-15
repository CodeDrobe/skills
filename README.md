# CodeDrobe — OpenAI Codex Theme Skill & Runtime

[![Core CI](https://github.com/anhao/codedrobe-codex-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/anhao/codedrobe-codex-skill/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-43853d)](https://nodejs.org/)
[![macOS and Windows](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-6f4d62)](#supported-platforms)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-7c6cff)](SKILL.md)

[Chinese](README_zh.md)

Website: [codedrobe.app](https://codedrobe.app) · [Download the Desktop app](https://github.com/anhao/codedrobe-desktop/releases/latest)

CodeDrobe is an open-source OpenAI Codex theming Skill, AI theme generator, and cross-platform runtime for creating, applying, exporting, verifying, sharing, and restoring custom themes for the official Codex desktop app on macOS and Windows.

![CodeDrobe Desktop managing custom themes for the Codex app](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/desktop.png)

It changes the renderer through the local Chromium DevTools Protocol (CDP). It does not patch the Codex application bundle, modify `app.asar`, or replace the official executable.

## What this Skill can do

- Apply decorative themes while preserving native Codex controls and workflows.
- Create a new theme from a design brief, color palette, or local reference image.
- Help AI customize theme copy, CSS, artwork, and official base colors.
- Launch the official Codex app with a loopback-only CDP connection.
- Reapply a theme after navigation, renderer reloads, or Codex updates.
- Verify the active theme and capture screenshots for visual review.
- Export and share a self-contained `.codex-theme` file.
- Safely remove the injected theme and restore the previous Codex appearance settings.

## Supported platforms

- macOS 12 or later
- Windows 10 or Windows 11
- Node.js 20 or later for direct script usage
- The official Codex desktop app

## Install with npx

Make sure [Node.js](https://nodejs.org/) is installed, then run the following command in a terminal:

```bash
npx skills add anhao/codedrobe-codex-skill
```

The installer will detect supported AI coding agents and let you choose where to install the Skill. Use this command inside a project when you want a project-level installation.

To make the Skill available globally for your user account:

```bash
npx skills add anhao/codedrobe-codex-skill --global
```

Verify the installation:

```bash
npx skills list
npx skills list --global
```

Update the installed Skill later:

```bash
npx skills update codedrobe-codex-theme
npx skills update codedrobe-codex-theme --global
```

The CLI command is `skills` in the plural: use `npx skills`, not `npx skill`.

## Use it with Codex

After installing this repository as a Codex Skill, you can ask Codex naturally:

```text
Apply the Dream theme to Codex.
Create a dark ocean theme from this reference image.
Export the Dream theme as a .codex-theme file.
Verify the current theme and save a screenshot.
Restore the original Codex appearance.
```

Codex reads [`SKILL.md`](SKILL.md) to select the correct creation, launch, verification, export, or restore workflow for the current platform.

## Command-line usage

Install and launch an existing theme on macOS:

```bash
scripts/install-codedrobe.sh --theme dream
scripts/start-codedrobe.sh --theme dream
```

Install and launch an existing theme on Windows:

```powershell
scripts/install-codedrobe.ps1 -Theme dream
scripts/start-codedrobe.ps1 -Theme dream
```

Create and export a portable theme:

```bash
node scripts/create-theme.mjs --id ocean-calm --name "Ocean Calm" --art /absolute/cover.png
node scripts/export-theme.mjs --theme ocean-calm --output /absolute/ocean-calm.codex-theme
```

## Desktop app

Prefer a graphical one-click theme manager? See [anhao/codedrobe-desktop](https://github.com/anhao/codedrobe-desktop).

### Theme gallery

| KUN Stage | Dream / Fiona | Dilraba Rose |
| --- | --- | --- |
| ![KUN Stage theme for Codex](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-01.png) | ![Dream Fiona theme for Codex](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-02.png) | ![Dilraba Rose theme for Codex](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-03.png) |

## Development

Run the Core test suite and inspect the publishable package:

```bash
npm test
npm run pack:check
```

Repository: [anhao/codedrobe-codex-skill](https://github.com/anhao/codedrobe-codex-skill)

## Safety model

- CDP is bound to `127.0.0.1` only.
- The official Codex application package remains untouched.
- Theme packages contain data, CSS, and local artwork only; theme JavaScript is not accepted.
- Remote CSS resources are rejected during theme import.
- Applying and restoring themes preserve unrelated Codex configuration.

## License

The Skill, runtime code, theme format, and documentation are licensed under the [Apache License 2.0](LICENSE), except where another notice applies.

Binary artwork, third-party material, and paid theme content are not automatically covered by the code license. See [ASSETS_LICENSE.md](ASSETS_LICENSE.md). The Apache license does not grant rights to the CodeDrobe names or logos; see [TRADEMARKS.md](TRADEMARKS.md).
