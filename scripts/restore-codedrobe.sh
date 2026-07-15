#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INJECTOR="$SCRIPT_DIR/injector.mjs"
STATE_ROOT="$HOME/Library/Application Support/CodeDrobe"
STATE_PATH="$STATE_ROOT/state.json"
CONFIG_PATH="$HOME/.codex/config.toml"
BACKUP_PATH="$STATE_ROOT/config.before-codedrobe.toml"
PORT=""
UNINSTALL=0
RESTORE_BASE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    --restore-base-theme) RESTORE_BASE=1; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

safe_stop_injector() {
  local pid="$1" command
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  command="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  if [[ "$command" == *"$INJECTOR"* && "$command" == *"--watch"* ]]; then
    kill "$pid" 2>/dev/null || true
  fi
}

if [[ -f "$STATE_PATH" ]]; then
  STATE_VALUES="$(node -e 'try { const s=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log(`${s.port || ""}\t${s.injectorPid || ""}`) } catch {}' "$STATE_PATH")"
  STATE_PORT="${STATE_VALUES%%$'\t'*}"
  STATE_PID="${STATE_VALUES#*$'\t'}"
  [[ -z "$PORT" ]] && PORT="$STATE_PORT"
  [[ -n "$STATE_PID" ]] && safe_stop_injector "$STATE_PID"
  rm -f "$STATE_PATH"
fi
PORT="${PORT:-9335}"
sleep 0.25
node "$INJECTOR" --remove --port "$PORT" --timeout-ms 3000 >/dev/null 2>&1 || true

if [[ "$UNINSTALL" -eq 1 ]]; then
  rm -f "$HOME/Desktop/CodeDrobe.command" "$HOME/Desktop/CodeDrobe - Restore.command"
fi
if [[ "$RESTORE_BASE" -eq 1 ]]; then
  [[ -f "$BACKUP_PATH" ]] || { echo "No pre-install config backup is available." >&2; exit 1; }
  node "$SCRIPT_DIR/theme-tool.mjs" restore --config "$CONFIG_PATH" --backup "$BACKUP_PATH"
fi
echo "The live CodeDrobe was removed."
