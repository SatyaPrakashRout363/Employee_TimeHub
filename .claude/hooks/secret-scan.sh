#!/usr/bin/env bash
# PreToolUse(Bash) — block `git commit` if the staged diff looks like it
# contains a secret/token. Motivated by a live Jira token found committed
# to a sibling repo's git history.
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

diff=$(git diff --cached 2>/dev/null)
[ -z "$diff" ] && exit 0

pattern='(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(api|jira|secret|access)[_-]?(key|token)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9/+_.-]{16,}|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,})'

hits=$(printf '%s' "$diff" | grep -E -i "$pattern")

if [ -n "$hits" ]; then
  echo "Blocked: staged diff looks like it contains a secret/token. Review before committing:" >&2
  echo "$hits" | sed 's/^/  /' >&2
  exit 2
fi

exit 0
