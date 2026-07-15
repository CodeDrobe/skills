#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_ROOT="$HOME/Library/Application Support/CodeDrobe"
CONFIG_PATH="$HOME/.codex/config.toml"
BACKUP_PATH="$STATE_ROOT/config.before-codedrobe.toml"
PORT=9335
THEME=dream
NO_SHORTCUTS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --theme) THEME="$2"; shift 2 ;;
    --no-shortcuts) NO_SHORTCUTS=1; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

command -v node >/dev/null || { echo "Node.js is required." >&2; exit 1; }
[[ -f "$CONFIG_PATH" ]] || { echo "Codex config not found: $CONFIG_PATH" >&2; exit 1; }
mkdir -p "$STATE_ROOT"
node "$SCRIPT_DIR/theme-tool.mjs" apply \
  --theme "$THEME" --platform darwin --config "$CONFIG_PATH" --backup "$BACKUP_PATH"

if [[ "$NO_SHORTCUTS" -eq 0 ]]; then
  START_SHORTCUT="$HOME/Desktop/CodeDrobe.command"
  RESTORE_SHORTCUT="$HOME/Desktop/CodeDrobe - Restore.command"
  mkdir -p "$HOME/Desktop"
  printf '#!/bin/bash\nexec %q --port %q --theme %q\n' \
    "$SCRIPT_DIR/start-codedrobe.sh" "$PORT" "$THEME" > "$START_SHORTCUT"
  printf '#!/bin/bash\nexec %q --port %q\n' \
    "$SCRIPT_DIR/restore-codedrobe.sh" "$PORT" > "$RESTORE_SHORTCUT"
  chmod +x "$START_SHORTCUT" "$RESTORE_SHORTCUT"
fi

echo "CodeDrobe installed for macOS with theme '$THEME'."
