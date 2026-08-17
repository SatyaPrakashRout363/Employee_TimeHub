---
name: project-status
description: "Show git state, dev server health, and active SDLC pipeline sessions for this repo."
allowed-tools: Bash(git branch:*), Bash(git status:*), Bash(git log:*), Bash(curl:*), Bash(python3:*)
---

# Project Status

## Git

Branch: !git branch --show-current

Uncommitted files: !git status --short

Last commit: !git log --oneline -1

## Servers

Backend: !curl -s http://localhost:4000/health 2>/dev/null && echo "✓ running" || echo "✗ not running"

Frontend: !curl -s http://localhost:5173 > /dev/null 2>&1 && echo "✓ running" || echo "✗ not running"

## Active SDLC session
!if [ -f sdlc-state.json ]; then story=$(python3 -c "import json; print(json.load(open('sdlc-state.json'))['story_key'])" 2>/dev/null); step=$(python3 -c "import json; d=json.load(open('sdlc-state.json')); active=[k for k,v in d['steps'].items() if v['status']=='in_progress']; print(active[0] if active else 'all approved')" 2>/dev/null || echo "?"); echo "  $story — $step"; else echo "  none"; fi

## Quick commands

- Start/resume pipeline: `/start-sdlc CLAUD-N`
- Run tests: `/test`
- Review changes: `/review`
- Feature or bug entry point: `/dev CLAUD-N`
