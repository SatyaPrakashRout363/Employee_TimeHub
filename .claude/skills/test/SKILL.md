---
name: test
description: "Run this repo's test suites (API unit, UI unit, or Playwright E2E) and report real pass/fail results, coverage, and failure analysis. Usage: /test unit | /test e2e [story] | /test all."
allowed-tools: Bash(cd:*), Bash(npm *), Bash(npx playwright:*), Bash(node --test:*), Read
---

# Test: $ARGUMENTS

## unit — API + UI unit tests

Backend (API) results:
```
cd api && npm test -- --experimental-test-coverage
```

Frontend (UI) unit results:
```
cd ui && npm test
```
(UI coverage needs `@vitest/coverage-v8`, not currently a dependency — see First-time setup below. Run `cd ui && npm test -- --coverage` once it's added.)

Analyze the results above and report:

- **Pass/Fail summary** — total passed, failed, skipped for API and UI.
- **Coverage** — overall percentage, files below 80% (API only until UI coverage tooling is added).
- **Failures** — for each: file, test name, error, likely cause, suggested fix.
- **Verdict** — mergeable state? What must be fixed first?

## e2e — Playwright E2E tests

Not yet part of this repo — there is no `ui/e2e/` directory and Playwright isn't a dependency. First-time setup:

```
cd ui && npm install -D @playwright/test && npx playwright install chromium
```

Adding this is a new test-framework/dependency decision — flag it to the user before installing, per `.claude/rules/testing.md`. Once set up, run:

```
# Specific story
cd ui && npx playwright test e2e/$ARGUMENTS.spec.ts --reporter=line

# All E2E tests
cd ui && npx playwright test --reporter=line
```

Report: total pass/fail, each failure with error snippet, acceptance-criteria coverage against the story's `requirement.md`.

## all — Full suite (unit + e2e)

Run the `unit` section first, then the `e2e` section (only if Playwright is already set up — don't silently install it as part of `all`).

Report combined: API unit, UI unit, E2E (if run) — overall verdict.

## Rules

- Never claim a pass without actually running the command — report real output, not assumed results.
- Never install Playwright or `@vitest/coverage-v8` without flagging it to the user first — both are new dependencies in this repo.
- If a suite fails, show the actual failing test output, not a paraphrase.
