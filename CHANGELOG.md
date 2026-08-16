# Changelog

## Unreleased

### Added
- Inline edit and delete for employees in the Employee Directory ([EPMCDMETST-60121](https://jiraeu.epam.com/browse/EPMCDMETST-60121)): click Edit on a row to open a pre-filled form (only one row editable at a time), Save persists the change and refreshes the list, Cancel discards with no request sent, and an empty name is blocked client-side.
- First automated test suites for this repo: `node:test` for the API (`api/test/`, 13 tests) and Vitest + React Testing Library for the UI (`ui/src/**/*.test.jsx`, 14 tests).
- Full agentic SDLC pipeline under `.claude/agents/` (`requirements`, `architecture`, `design-review`, `impl-plan`, `reviewer`, `QAEngineer`) and `.claude/skills/` (`dev` orchestrator, `code-review`), used to build and review this feature end to end.
- `PR_DESCRIPTION.md` — retroactive pull-request record for this cycle (Summary, Changes Made, Test Evidence, Known Limitations, Reviewer Checklist), since these commits landed directly on `main`.

### Changed
- `api/server.js` split into `api/app.js` (exported Express app) + a thin `server.js` (`.listen()` only), to allow the route tests to exercise the app without binding a port. No route-mounting or production behavior change.
- `api/services/employeeStore.js` gained an `EMPLOYEES_DATA_FILE` env-var override for test isolation; falls back to the original hardcoded path when unset.

### Known Limitations
- No CI workflow runs the new test suites automatically yet — local execution only.
- `ui/` carries an accepted `npm audit` advisory (esbuild → vite → vitest chain: 3 moderate, 1 high, 1 critical) with a breaking `vite@8` fix deferred as a follow-up; the vulnerable code path (`vitest --ui`) isn't invoked by this project's `test` script.
