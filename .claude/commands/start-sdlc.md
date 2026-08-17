---
name: start-sdlc
description: "Launch (or resume) the full 8-phase SDLC pipeline for a Jira issue key, via the orchestrator agent."
allowed-tools: Agent
---

# Start SDLC

Issue key: $ARGUMENTS

Invoke the `orchestrator` agent (via the `Agent` tool) with this issue key. The orchestrator resolves `sdlc-state.json`, creates or resumes the feature branch, and drives all 8 phases with literal-APPROVE gates — do not re-implement any of that here, just hand off the issue key and relay the orchestrator's output back to the user.

If no issue key was given, ask the user for one before invoking the agent.
