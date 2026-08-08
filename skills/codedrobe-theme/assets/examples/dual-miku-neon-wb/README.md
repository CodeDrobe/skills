# Miku Future Beats + Neon Skyline / 初音未来 × 霓虹天际

A **dual-mode** WorkBuddy theme that automatically switches between two visual styles based on the app's light/dark mode setting.

| Mode | Theme | Vibe |
|------|-------|------|
| **Light** | Miku Future Beats | Soft pastel, aqua-teal, gentle character artwork |
| **Dark** | Neon Skyline | Deep navy, neon-cyan, futuristic cityscape with character |

## How it works

The CSS uses scoped selectors to bind each theme to a specific mode:

- **Light mode**: All Miku rules are scoped under `html.codedrobe-host-workbuddy:not(.dark)` — they only activate when the `.dark` class is **absent**
- **Dark mode**: All Neon Skyline rules are scoped under `html.codedrobe-host-workbuddy.dark` — they only activate when the `.dark` class is **present**

Toggle WorkBuddy's light/dark theme switch and the correct skin loads automatically — no restart or re-injection needed.

## Assets (4 images)

| Key | File | Mode | Usage |
|-----|------|------|-------|
| `miku-hero` | `assets/miku-hero.png` | Light | Home-page hero background (Miku character) |
| `miku-texture` | `assets/miku-texture.png` | Light | Sidebar/surface texture overlay |
| `hero` | `assets/hero.png` | Dark | Home-page hero background (neon city + character) |
| `miku-wink` | `assets/miku-wink.png` | Dark | Input-box polaroid photo frame (wink Miku) |

## Build and apply

```bash
# Pack into .codedrobe-theme package
node ./bin/codedrobe.mjs theme pack skills/codedrobe-theme/assets/examples/dual-miku-neon-wb/theme.json \
  --output dual-miku-neon-wb-1.0.0.codedrobe-theme --force

# Apply to running WorkBuddy (with CDP debug port)
node ./bin/codedrobe.mjs apply --app workbuddy \
  --theme dual-miku-neon-wb-1.0.0.codedrobe-theme \
  --app-path "F:/WorkBuddy" --port 9336 --no-launch

# Verify with screenshot
node ./bin/codedrobe.mjs verify --app workbuddy \
  --theme dual-miku-neon-wb-1.0.0.codedrobe-theme \
  --app-path "F:/WorkBuddy" --port 9336 \
  --screenshot dual-miku-neon-preview.png
```

## Persistence (auto-apply on launch)

For the theme to persist across WorkBuddy restarts, use a launcher that:

1. Starts WorkBuddy with `--remote-debugging-port=9336`
2. Runs `codedrobe apply --watch` in the background to auto-inject when CDP port becomes available

Example VBS launcher:

```vbscript
Set Shell = CreateObject("WScript.Shell")
Shell.Run "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File watch-apply.ps1", 0, False
Shell.Run """F:\WorkBuddy\WorkBuddy.exe"" --remote-debugging-port=9336", 1, False
```

Where `watch-apply.ps1` polls port 9336 and runs `codedrobe apply --watch --no-launch` once the port is open.

## Credits

- **Miku Future Beats** (light mode): Original character theme adapted from CodeDrobe store, re-scoped for WorkBuddy light mode
- **Neon Skyline** (dark mode): Originally `neon-skyline-codex` for Codex, migrated and adapted for WorkBuddy dark mode by [anhao](https://github.com/s17765152890)
- **Dual-mode merge**: CSS scoping strategy combining both themes into a single auto-switching package
