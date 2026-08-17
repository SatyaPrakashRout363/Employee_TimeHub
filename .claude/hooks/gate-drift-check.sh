#!/usr/bin/env bash
# Stop — informational only (never blocks). Flags a phase still sitting at
# the literal-APPROVE gate, and any approved step whose recorded commit sha
# isn't actually in git log (state drifted from reality).
state="sdlc-state.json"
[ -f "$state" ] || exit 0

python3 -c "
import json, subprocess
d = json.load(open('$state'))
steps = d.get('steps', {})

pending = [k for k, v in steps.items() if v.get('status') == 'in_progress']
if pending:
    print(f\"SDLC: '{pending[0]}' is in_progress - awaiting literal APPROVE from you.\")

for name, v in steps.items():
    if v.get('status') == 'approved' and v.get('commit'):
        sha = v['commit']
        found = subprocess.run(['git', 'log', '--oneline', sha, '-1'], capture_output=True, text=True)
        if found.returncode != 0 or not found.stdout.strip():
            print(f\"SDLC WARNING: step '{name}' recorded commit {sha} but it is not in git log - state may be stale.\")
" 2>/dev/null

exit 0
