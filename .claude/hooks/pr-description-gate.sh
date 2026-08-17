#!/usr/bin/env bash
# PreToolUse(Bash) — block `gh pr create` unless PR_DESCRIPTION.md exists at
# repo root and has all sections the pr phase (SDLC step 8) requires.
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

case "$cmd" in
  *"gh pr create"*) ;;
  *) exit 0 ;;
esac

doc="PR_DESCRIPTION.md"
if [ ! -f "$doc" ]; then
  echo "Blocked: $doc not found at repo root. Run the pr phase before opening a PR." >&2
  exit 2
fi

missing=""
for h in "Summary" "Changes Made" "Test Evidence" "Known Limitations" "Reviewer Checklist"; do
  grep -qi "^#\+ *$h" "$doc" || missing="$missing, $h"
done

if [ -n "$missing" ]; then
  echo "Blocked: $doc is missing required section(s):${missing#, }" >&2
  exit 2
fi

exit 0
