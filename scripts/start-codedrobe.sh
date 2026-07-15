#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INJECTOR="$SCRIPT_DIR/injector.mjs"
STATE_ROOT="$HOME/Library/Application Support/CodeDrobe"
STATE_PATH="$STATE_ROOT/state.json"
STDOUT_PATH="$STATE_ROOT/injector.log"
STDERR_PATH="$STATE_ROOT/injector-error.log"
APP_LOG="$STATE_ROOT/app-launch.log"
PORT=9335
THEME=dream
PROFILE_PATH=""
RESTART_EXISTING=0
FOREGROUND=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --theme) THEME="$2"; shift 2 ;;
    --profile-path) PROFILE_PATH="$2"; shift 2 ;;
    --restart-existing) RESTART_EXISTING=1; shift ;;
    --foreground-injector) FOREGROUND=1; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT >= 1024 && PORT <= 65535 )) || {
  echo "Invalid port: $PORT" >&2; exit 2;
}
command -v node >/dev/null || { echo "Node.js is required." >&2; exit 1; }
command -v curl >/dev/null || { echo "curl is required." >&2; exit 1; }
mkdir -p "$STATE_ROOT"
node "$SCRIPT_DIR/theme-tool.mjs" info --theme "$THEME" --platform darwin >/dev/null

test_codex_debug_port() {
  local payload
  payload="$(curl --silent --show-error --fail --max-time 1 "http://127.0.0.1:$PORT/json/list" 2>/dev/null)" || return 1
  printf '%s' "$payload" | node -e '
    let data=""; process.stdin.on("data", c => data += c); process.stdin.on("end", () => {
      try { const rows=JSON.parse(data); process.exit(rows.some(x => x.type === "page" && String(x.url).startsWith("app://")) ? 0 : 1); }
      catch { process.exit(1); }
    });' >/dev/null 2>&1
}

find_app_bundle() {
  local candidate
  for candidate in "/Applications/ChatGPT.app" "$HOME/Applications/ChatGPT.app"; do
    if [[ -x "$candidate/Contents/MacOS/ChatGPT" ]]; then printf '%s\n' "$candidate"; return 0; fi
  done
  while IFS= read -r candidate; do
    if [[ "$candidate" == *.app && -x "$candidate/Contents/MacOS/ChatGPT" ]]; then printf '%s\n' "$candidate"; return 0; fi
  done < <(mdfind 'kMDItemCFBundleIdentifier == "com.openai.codex"' 2>/dev/null || true)
  return 1
}

main_pids() {
  ps -axo pid=,command= | awk '/\/ChatGPT\.app\/Contents\/MacOS\/ChatGPT([[:space:]]|$)/ { print $1 }'
}

safe_stop_injector() {
  local pid="$1" command
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  command="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  if [[ "$command" == *"$INJECTOR"* && "$command" == *"--watch"* ]]; then
    kill "$pid" 2>/dev/null || true
  fi
}

if ! test_codex_debug_port && [[ -z "$PROFILE_PATH" ]] && [[ -n "$(main_pids)" ]]; then
  if [[ "$RESTART_EXISTING" -ne 1 ]]; then
    echo "Codex is already running without CodeDrobe debugging on port $PORT." >&2
    echo "Close Codex or rerun with --restart-existing." >&2
    exit 1
  fi
  osascript -e 'tell application id "com.openai.codex" to quit' >/dev/null 2>&1 || true
  for _ in $(seq 1 40); do [[ -z "$(main_pids)" ]] && break; sleep 0.25; done
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
  done < <(main_pids)
  sleep 0.6
fi

if ! test_codex_debug_port; then
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $PORT is occupied by another process." >&2
    exit 1
  fi
  APP_BUNDLE="$(find_app_bundle)" || { echo "Codex app with bundle id com.openai.codex was not found." >&2; exit 1; }
  EXE="$APP_BUNDLE/Contents/MacOS/ChatGPT"
  ARGS=("--remote-debugging-address=127.0.0.1" "--remote-debugging-port=$PORT")
  if [[ -n "$PROFILE_PATH" ]]; then
    mkdir -p "$PROFILE_PATH"
    ARGS+=("--user-data-dir=$PROFILE_PATH")
  fi
  nohup "$EXE" "${ARGS[@]}" >"$APP_LOG" 2>&1 &
fi

READY=0
for _ in $(seq 1 75); do
  if test_codex_debug_port; then READY=1; break; fi
  sleep 0.4
done
[[ "$READY" -eq 1 ]] || { echo "Codex did not expose CDP on port $PORT within 30 seconds." >&2; exit 1; }

if [[ -f "$STATE_PATH" ]]; then
  OLD_PID="$(node -e 'try { console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).injectorPid || "") } catch {}' "$STATE_PATH")"
  [[ -n "$OLD_PID" ]] && safe_stop_injector "$OLD_PID"
fi

if [[ "$FOREGROUND" -eq 1 ]]; then
  exec node "$INJECTOR" --watch --port "$PORT" --theme "$THEME"
fi

nohup node "$INJECTOR" --watch --port "$PORT" --theme "$THEME" >"$STDOUT_PATH" 2>"$STDERR_PATH" &
DAEMON_PID=$!
node - "$STATE_PATH" "$PORT" "$DAEMON_PID" "$SKILL_ROOT" "$PROFILE_PATH" "$THEME" <<'NODE'
const fs = require("fs");
const [statePath, port, injectorPid, skillRoot, profilePath, theme] = process.argv.slice(2);
fs.writeFileSync(statePath, JSON.stringify({
  port: Number(port), injectorPid: Number(injectorPid), startedAt: new Date().toISOString(), skillRoot, profilePath, theme,
}, null, 2));
NODE

VERIFIED=0
for _ in $(seq 1 45); do
  sleep 0.7
  if node "$INJECTOR" --verify --port "$PORT" --theme "$THEME" --timeout-ms 3000 >/dev/null 2>&1; then
    VERIFIED=1
    break
  fi
done
if [[ "$VERIFIED" -ne 1 ]]; then
  safe_stop_injector "$DAEMON_PID"
  rm -f "$STATE_PATH"
  echo "CodeDrobe launched but verification failed. See $STDERR_PATH" >&2
  exit 1
fi
echo "CodeDrobe theme '$THEME' is active on port $PORT."
