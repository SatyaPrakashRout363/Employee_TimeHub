# Changelog

## Unreleased

### Added
- Department field on the Employee Directory's add and inline-edit forms is now a `<select>` constrained to a fixed list — Engineering, Research, Platform, Sales, Marketing ([EPMCDMETST-60862](https://jiraeu.epam.com/browse/EPMCDMETST-60862)), defined once in `ui/src/constants/departments.js` and shared by both forms. An employee with a pre-existing out-of-list department still renders and opens for editing via a fallback option.
- Inline edit and delete for employees in the Employee Directory ([EPMCDMETST-60121](https://jiraeu.epam.com/browse/EPMCDMETST-60121)): click Edit on a row to open a pre-filled form (only one row editable at a time), Save persists the change and refreshes the list, Cancel discards with no request sent, and an empty name is blocked client-side.
- First automated test suites for this repo: `node:test` for the API (`api/test/`, 13 tests) and Vitest + React Testing Library for the UI (`ui/src/**/*.test.jsx`, 15 tests).
- Full agentic SDLC pipeline under `.claude/agents/` (`requirements`, `architecture`, `design-review`, `impl-plan`, `reviewer`, `QAEngineer`, `orchestrator`) and `.claude/skills/` (`dev` orchestrator, `code-review`), used to build and review both features end to end.
- `PR_DESCRIPTION.md` — pull-request record for the current cycle (Summary, Changes Made, Test Evidence, Known Limitations, Reviewer Checklist); overwritten each SDLC cycle to describe the branch awaiting PR.

### Changed
- `api/server.js` split into `api/app.js` (exported Express app) + a thin `server.js` (`.listen()` only), to allow the route tests to exercise the app without binding a port. No route-mounting or production behavior change.
- `api/services/employeeStore.js` gained an `EMPLOYEES_DATA_FILE` env-var override for test isolation; falls back to the original hardcoded path when unset.

### Known Limitations
- No CI workflow runs the new test suites automatically yet — local execution only.
- `ui/` carries an accepted `npm audit` advisory (esbuild → vite → vitest chain: 3 moderate, 1 high, 1 critical) with a breaking `vite@8` fix deferred as a follow-up; the vulnerable code path (`vitest --ui`) isn't invoked by this project's `test` script.
- Department fixed list is UI-only — the API still accepts any string, and existing free-text department values are not migrated (see `PR_DESCRIPTION.md` for EPMCDMETST-60862).
