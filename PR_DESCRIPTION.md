# PR: chore/fix-sdlc-pipeline-gaps — Fix SDLC pipeline structural gaps found in .claude audit

## Summary

An audit of `.claude/` (agents, rules, commands, skills, hooks) against the 8-step Agentic SDLC pipeline turned up six structural gaps: two competing orchestrators for the New Feature flow, three commands referenced but never created, six rules files no agent ever read, a stale `project-status.md`, a `CLAUDE.md` pointing at the wrong Jira access method, and a couple of minor doc inconsistencies. This PR fixes all six, touching only `.claude/` tooling and `CLAUDE.md` — no application code (`api/`, `ui/`) changed.

## Changes Made

**Dual-orchestrator conflict**
- `.claude/skills/dev/SKILL.md` — the New Feature scenario no longer duplicates the 8-phase pipeline itself. It now delegates to the `orchestrator` agent (via the `Agent` tool), which already owns `sdlc-state.json` state tracking, literal-APPROVE gates, and branch/commit management. `dev/SKILL.md`'s frontmatter description and opening paragraph were reworded to reflect it as a routing entry point, not the orchestrator itself. The Bug Fix scenario is untouched — it has no `orchestrator.md` equivalent and stays as its own lightweight path.

**Missing commands**
- `.claude/commands/start-sdlc.md` (new) — invokes the `orchestrator` agent with an issue key argument.
- `.claude/commands/test.md` (new) — runs `npm test` in both `api/` and `ui/`.
- `.claude/commands/review.md` (new) — invokes the `code-review` skill.
  (All three were already referenced by `orchestrator.md` / `project-status.md` but didn't exist.)

**Orphaned rules files wired into their agents**
- `.claude/agents/requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md` — each now reads its corresponding `.claude/rules/*.md` file before starting its process.
- `.claude/agents/QAEngineer.md` — now reads `.claude/rules/testing.md`.
- `.claude/agents/reviewer.md` — now reads `.claude/rules/testing.md` always, and `.claude/rules/devops.md` conditionally when the diff touches `.github/workflows/**`, `api/package.json`, or `ui/package.json` (no dedicated devops agent exists, so code review is the closest checkpoint for CI/dependency-adjacent changes).

**`project-status.md` fixes**
- Backend health-check URL corrected from port 8000 to port 4000 (matches `CLAUDE.md`'s documented run command).
- "Active SDLC sessions" check corrected from a `docs/*`-glob scan to a single root-level `sdlc-state.json` read (that's where `orchestrator.md` actually writes it).
- Quick-commands list corrected to drop non-existent argument forms (`/test unit`, `/review code`, `/dev fix <description>`) and reference the newly-added `/start-sdlc`, `/test`, `/review` commands.
- Removed unused `Bash(find:*)` from frontmatter `allowed-tools`.

**`CLAUDE.md` Jira-access fix**
- External Services section rewritten to specify the direct Jira REST API (`JIRA_URL`/`JIRA_USERNAME`/`JIRA_API_TOKEN`, per `setup.md`) as the access method, and explicitly excludes the `mcp__atlassian__*` tools — those connect to a different Atlassian site and cannot reach this project's actual Jira instance (`jiraeu.epam.com`, project `EPMCDMETST`). This was previously stale/incorrect; `setup.md` and `dev/SKILL.md` already had the accurate version.

## Test Evidence

This change is `.claude/` tooling and documentation only — there is no application code diff and no automated test suite covers Claude Code config correctness. Verification performed manually:

- Confirmed every edited/new `.md` file under `.claude/` still has valid YAML frontmatter (`name`, `description`, `allowed-tools` where applicable) by inspection after each edit.
- Confirmed `.claude/commands/project-status.md`'s corrected backend check (`curl -s http://localhost:4000/health`) matches the port documented in `CLAUDE.md`'s `## Run` section.
- Confirmed `.claude/commands/start-sdlc.md` / `test.md` / `review.md` reference agent/skill names (`orchestrator`, `code-review`) that actually exist under `.claude/agents/` and `.claude/skills/`.
- Confirmed each new "read `.claude/rules/X.md`" line points at a file that exists under `.claude/rules/`.
- Ran `git diff --stat` against `main` to confirm only the intended 12 files changed (no accidental app-code edits):
  ```
  .claude/agents/QAEngineer.md       |  2 ++
  .claude/agents/architecture.md     |  2 ++
  .claude/agents/design-review.md    |  2 ++
  .claude/agents/impl-plan.md        |  2 ++
  .claude/agents/requirements.md     |  2 ++
  .claude/agents/reviewer.md         |  2 ++
  .claude/commands/project-status.md | 16 ++++++++--------
  .claude/commands/review.md         |  9 +++++++++
  .claude/commands/start-sdlc.md     | 13 +++++++++++++
  .claude/commands/test.md           | 19 +++++++++++++++++++
  .claude/skills/dev/SKILL.md        | 23 ++++++-----------------
  CLAUDE.md                          |  6 +++---
  12 files changed, 70 insertions(+), 28 deletions(-)
  ```
- Did **not** run `api`/`ui` `npm test` for this PR — no `api/` or `ui/` file is touched, so there is nothing for that suite to exercise.

## Known Limitations

- **No live run of the full 8-phase pipeline end-to-end.** The `dev` → `orchestrator` delegation was verified by reading both files and confirming the handoff contract (issue key in, phase-complete out), not by executing a real Jira issue through all 8 phases.
- **`reviewer.md`'s conditional `devops.md` read is a judgment call, not a structural fix.** There is still no dedicated devops agent; CI/dependency-adjacent changes get covered by code review only, not a standalone devops gate.
- **The home-directory `.claude/commands/pull-request.md`** (`C:\Users\Satyaprakash_Rout\.claude\commands\pull-request.md`) still describes a mismatched GitLab/pytest/Playwright workflow and was **not** touched by this PR — it lives outside this repo (`~/.claude/`, not `Employee_TimeHub/.claude/`) and is out of scope for a repo-scoped fix.
- **This `PR_DESCRIPTION.md` itself has no automated "Test Evidence" to point to** beyond the manual checks listed above, since the change under review is Claude Code configuration, not application behavior.

## Reviewer Checklist

- [ ] `dev/SKILL.md`'s New Feature scenario correctly delegates to `orchestrator` via the `Agent` tool, and no longer duplicates phase logic inline.
- [ ] `dev/SKILL.md`'s Bug Fix scenario (steps 1–7) is unchanged.
- [ ] `/start-sdlc`, `/test`, `/review` commands exist, have valid frontmatter, and reference real agents/skills.
- [ ] Each of `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `QAEngineer.md`, `reviewer.md` reads its correct `.claude/rules/*.md` file before its `## Process` section.
- [ ] `project-status.md` checks port 4000 (not 8000) and reads `sdlc-state.json` from the repo root (not a `docs/*` glob).
- [ ] `CLAUDE.md` → External Services matches `setup.md`'s documented Jira REST API method and explicitly excludes `mcp__atlassian__*`.
- [ ] No `api/` or `ui/` application files are included in this diff.

## Source

Originated from a `.claude/` structural audit against the 8-step Agentic SDLC pipeline capstone use case (no Jira issue — this is repo tooling maintenance, not a tracked story).
