#!/usr/bin/env bash
# PostToolUse(Bash) — after npm install/ci, surface known-vulnerable
# dependencies immediately instead of waiting for the reviewer agent.
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

case "$cmd" in
  *"npm install"*|*"npm ci"*) ;;
  *) exit 0 ;;
esac

echo "Running npm audit after install..."
npm audit --audit-level=high 2>&1 | tail -n 20

exit 0
