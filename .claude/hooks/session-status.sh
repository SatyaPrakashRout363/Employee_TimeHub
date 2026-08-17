#!/usr/bin/env bash
# SessionStart — inject current SDLC pipeline state as context, and warn if
# the checked-out branch doesn't match what sdlc-state.json expects.
state="sdlc-state.json"

if [ ! -f "$state" ]; then
  echo "SDLC: no active session (no sdlc-state.json at repo root)."
  exit 0
fi

python3 -c "
import json
d = json.load(open('$state'))
steps = list(d.get('steps', {}).items())
idx = d.get('current_step', 1)
phase = steps[idx-1][0] if 0 < idx <= len(steps) else '?'
print(f\"SDLC: story {d.get('story_key','?')} - step {idx}/{len(steps)} ({phase}), branch {d.get('feature_branch','?')}\")
"

branch=$(git branch --show-current 2>/dev/null)
expected=$(python3 -c "import json; print(json.load(open('$state')).get('feature_branch',''))" 2>/dev/null)

if [ -n "$expected" ] && [ "$branch" != "$expected" ]; then
  echo "SDLC WARNING: checked-out branch is '$branch' but sdlc-state.json expects '$expected'."
fi

exit 0
