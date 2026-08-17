---
name: project-status
description: "Show git state, dev server health, and active SDLC pipeline sessions for this repo."
allowed-tools: Bash(git branch:*), Bash(git status:*), Bash(git log:*), Bash(curl:*), Bash(find:*), Bash(python3:*)
---

# Project Status

## Git

Branch: !git branch --show-current

Uncommitted files: !git status --short

Last commit: !git log --oneline -1

## Servers

Backend: !curl -s http://localhost:8000/health 2>/dev/null && echo "✓ running" || echo "✗ not running"

Frontend: !curl -s http://localhost:5173 > /dev/null 2>&1 && echo "✓ running" || echo "✗ not running"

## Active SDLC sessions
!find docs -name "sdlc-state.json" 2>/dev/null | while read f; do story=$(basename $(dirname $f)); step=$(python3 -c "import json; d=json.load(open('$f')); active=[k for k,v in d['steps'].items() if v['status'] in ('in_progress','needs_revision')]; print(active[0] if active else 'all approved')" 2>/dev/null || echo "?"); echo "  $story — $step"; done || echo "  none"

## Quick commands

- Start pipeline: `/start-sdlc CLAUD-N`
- Run tests: `/test unit`
- Review changes: `/review code`
- Fix a bug: `/dev fix <description>`
