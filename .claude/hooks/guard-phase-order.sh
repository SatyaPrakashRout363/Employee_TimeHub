#!/usr/bin/env bash
# PreToolUse(Edit|Write) — block edits to application code until
# sdlc-state.json's current_step has reached implementation (step 5).
input=$(cat)
path=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)

case "$path" in
  *"/api/"*|*"\\api\\"*) ;;
  *"/ui/src/"*|*"\\ui\\src\\"*) ;;
  *) exit 0 ;;
esac

case "$path" in
  *test*|*Test*|*.test.*|*.spec.*) exit 0 ;;
esac

state="sdlc-state.json"
[ -f "$state" ] || exit 0

step=$(python3 -c "
import json
d = json.load(open('$state'))
print(d.get('current_step', 99))
" 2>/dev/null)

if [ -n "$step" ] && [ "$step" -lt 5 ] 2>/dev/null; then
  echo "Blocked: sdlc-state.json is at step $step (pre-implementation) — requirements/architecture/design-review/impl-plan must all be approved before editing application code at $path." >&2
  exit 2
fi

exit 0
