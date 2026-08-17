#!/usr/bin/env bash
# PreToolUse(Bash) — refuse git commit/push on main|master while sdlc-state.json
# shows an in-flight story with unapproved phases.
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

case "$cmd" in
  *"git commit"*|*"git push"*) ;;
  *) exit 0 ;;
esac

state="sdlc-state.json"
[ -f "$state" ] || exit 0

branch=$(git branch --show-current 2>/dev/null)
case "$branch" in
  main|master) ;;
  *) exit 0 ;;
esac

incomplete=$(python3 -c "
import json
d = json.load(open('$state'))
steps = d.get('steps', {})
print('yes' if any(v.get('status') != 'approved' for v in steps.values()) else 'no')
" 2>/dev/null)

if [ "$incomplete" = "yes" ]; then
  story=$(python3 -c "import json; print(json.load(open('$state')).get('story_key','?'))" 2>/dev/null)
  echo "Blocked: sdlc-state.json shows story '$story' with unapproved phases, but current branch is '$branch'. Commit/push on the story's feature branch instead." >&2
  exit 2
fi

exit 0
