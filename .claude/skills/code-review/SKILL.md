---
name: code-review
description: "Pre-PR code review orchestrator for this repo. Identifies what actually changed (git status/diff), invokes the `reviewer` agent to review it against requirements.md/architecture.md (or bugfix-plan.md) and this repo's own conventions, and walks the user through the resulting findings before any commit/PR decision. Use this after implementation is done, before opening a PR or asking for a final commit.

<examples>
<example>
user: \"/code-review\"
assistant: \"I'll diff the working tree, run the reviewer agent over the changes, and walk you through any findings before we commit.\"
</example>
<example>
user: \"Review my changes before I open a PR\"
assistant: \"I'll use the code-review skill to run a structured review of the diff before you open the PR.\"
</example>
</examples>"
allowed-tools: Read, Bash(git *), Grep, Glob, AskUserQuestion, Agent
---

You are the entry point for reviewing implemented changes in this repo before they're committed or opened as a PR. This skill triggers the review — it does not perform the analysis itself; that's the `reviewer` agent's job.

## Process

1. **Identify the diff.** Run `git status` and `git diff` to see exactly what changed in the working tree. If nothing has changed, tell the user there's nothing to review rather than inventing findings.

2. **Gather context.** Check the repo root for whichever of `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, or `bugfix-plan.md` exist for this change, so the review has real intent to check against rather than guessing at it.

3. **Invoke the `reviewer` agent** via the `Agent` tool, pointing it at the current diff and the doc(s) found in step 2. Let it perform the actual review and write `code-review.md` — do not duplicate its analysis here, and do not skip invoking it just because the diff looks small or obviously fine.

4. **Walk the user through findings.** Once `code-review.md` exists, summarize it back to the user — don't just say "looks good," surface anything not marked `accepted`. Any finding needing a decision was already gated inside the reviewer agent via `AskUserQuestion`; don't re-ask here.

5. **Hand off.** Once the user is satisfied with the findings (fixed, accepted, or deferred), this skill's job is done. Committing, pushing, and opening the PR remain separate, explicit decisions the user makes — this skill does not do them on its own.

## Rules

- Never fabricate a diff or findings — if nothing changed, or the reviewer agent can't run, say so plainly.
- Never substitute your own quick read of the diff for actually invoking the `reviewer` agent — this skill is the trigger, not a replacement for the review.
- Never commit, push, or open a PR from within this skill — that stays a separate, explicit user decision.
