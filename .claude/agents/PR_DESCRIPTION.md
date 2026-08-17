# PR: EPMCDMETST-60121 — Edit employee details from the Employee Directory

> **Retroactive PR record.** Every commit below already landed directly on `main` (no feature branch was used — see `git log`), so no GitHub pull request object exists for this cycle. This document is the permanent PR-equivalent record: Summary, Changes Made, Test Evidence, Known Limitations, and Reviewer Checklist, covering the full agentic SDLC run for this story from Requirements through QA-agent hardening.
>
> Commit range: `e752828..94b1edc` (17 commits, see `git log e752828..HEAD --oneline`).

## Summary

Added inline edit/delete to the Employee Directory (`EPMCDMETST-60121`): each row gets Edit/Delete buttons, Edit opens a pre-filled inline form (single row at a time), Save `PUT`s the change and refreshes the list, Cancel discards with no network call, and empty names are blocked client-side. Alongside the feature, this cycle stood up the repo's full agentic SDLC pipeline (`requirements` → `architecture` → `design-review` → `impl-plan` → implementation → `reviewer`/code-review → `QAEngineer`), added the first automated test suites for both the API and UI, and closed out a pre-existing "no tests" gap that `architecture.md` had explicitly flagged as needing separate tracking.

## Changes Made

**Feature implementation**
- `ui/src/components/EmployeeRow.jsx` (new) — extracted row component; view mode (name/department + Edit/Delete) and inline edit mode (form + Save/Cancel), with `required`/`.trim()` empty-name guard.
- `ui/src/views/EmployeeDirectory.jsx` — wired `EmployeeRow` in; added `editingId` state so only one row is editable at a time, plus save/cancel/error handlers.
- `ui/src/api/employees.js` — added `updateEmployee(id, patch)` client function (`PUT /api/employees/:id`).
- `api/services/employeeStore.js` — added `EMPLOYEES_DATA_FILE` env-var override so the store's backing file can be swapped in tests without touching production data.
- `api/app.js` (new) — the configured Express app extracted from `server.js`, exported for direct use by route tests.
- `api/server.js` — reduced to just `require('./app')` + `.listen()`, so the test suite can exercise the app without binding a port.
- `api/package.json`, `ui/package.json`, `ui/package-lock.json`, `ui/vite.config.js` — added `node:test` wiring (API, no new dependency) and Vitest + React Testing Library + jsdom (UI, new dev dependencies).

**Test coverage (new — first automated tests in this repo)**
- `api/test/store.test.js` (new) — 8 tests: create/getById/update (partial merge, id-hijack guard, missing id)/remove, against a temp-file-backed store.
- `api/test/employees.route.test.js` (new) — 5 tests: POST validation, PUT happy-path + persistence + 404, DELETE + 404, against `api/app.js` with the same temp-file seam.
- `ui/src/components/EmployeeRow.test.jsx` (new) — 8 tests: view-mode rendering/callbacks, edit-mode rendering, Cancel makes no API call, Save calls `updateEmployee` with trimmed values, save-error path, empty-name blocked.
- `ui/src/views/EmployeeDirectory.test.jsx` (new) — 6 tests: initial load, single-edit-mode exclusivity, Save persists + refreshes, Cancel discards, empty-name blocked — against a mocked `fetch`.
- `ui/src/test/setup.js` (new) — `@testing-library/jest-dom/vitest` wiring for the whole UI suite.

**SDLC pipeline (agents + skills + docs)**
- `.claude/agents/requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `reviewer.md` (new) — Steps 1–5 of the pipeline as invokable subagents.
- `.claude/agents/QAEngineer.md` (new, this session) — codifies the exact test-authoring conventions established above (temp-file store seam, `app.js`-not-`server.js`, fetch/client mocking) so future coverage work follows the same pattern and treats new test dependencies as a flagged decision, not a silent add.
- `.claude/skills/dev/SKILL.md` (new) — orchestrator routing a Jira issue to the New Feature pipeline or a lighter Bug Fix path.
- `.claude/skills/code-review/SKILL.md` (new) — triggers the `reviewer` agent and turns its findings into `code-review.md`.
- `requirements.md`, `architecture.md`, `impl-plan.md`, `code-review.md` (repo root, new) — this story's actual Step 1/2/4/5 output docs.
- `CLAUDE.md`, `setup.md` — project structure guidance and Jira MCP connectivity setup, needed before the pipeline could run against real Jira data.

## Test Evidence

API (`cd api && npm test`), run fresh at `2026-08-17`:
```
✔ POST /api/employees creates an employee and GET /api/employees lists it (87.1766ms)
✔ POST /api/employees without a name returns 400 (5.53ms)
✔ PUT /api/employees/:id updates name and department and persists the change (15.2251ms)
✔ PUT /api/employees/:id for an unknown id returns 404 (3.4345ms)
✔ DELETE /api/employees/:id removes the employee (7.8929ms)
✔ getAll returns an empty array for a fresh store (3.1419ms)
✔ create assigns a prefixed id, persists the record, and returns it (2.3912ms)
✔ getById finds an existing record and returns null for an unknown id (1.7472ms)
✔ update merges a partial patch, keeps the original id, and returns the updated record (1.9313ms)
✔ update ignores an id field inside the patch, keeping the original record id (2.8561ms)
✔ update returns null when the id does not exist and leaves the store unchanged (1.3333ms)
✔ remove deletes an existing record and returns true (1.6449ms)
✔ remove returns false for an unknown id and leaves the store unchanged (1.5944ms)
ℹ tests 13, pass 13, fail 0
```

UI (`cd ui && npm test -- --run`), run fresh at `2026-08-17`:
```
✓ src/components/EmployeeRow.test.jsx (8 tests) 840ms
✓ src/views/EmployeeDirectory.test.jsx (6 tests) 1232ms

 Test Files  2 passed (2)
      Tests  14 passed (14)
```

Manual verification (via the `run` skill, this session): launched the API on `:4000` and the UI dev server on `:5173`, and confirmed in-browser: Edit opens a pre-filled inline form with Save/Cancel; only one row can be in edit mode at a time; Save persists a name/department change and refreshes the list; Cancel discards with zero network calls; submitting an empty name is blocked by the `required` validation.

No CI pipeline exists in this repo yet — all evidence above is from local runs, not a CI link.

## Known Limitations

- **Not Found / out of scope:** No CI workflow (e.g. GitHub Actions) runs these suites automatically — added tests execute locally only, per `impl-plan.md`'s explicit scope (adding a test framework/CI was noted as "a separate, pre-existing gap," and only the test-framework half was picked up this cycle, at explicit user request).
- **Known dependency advisory (accepted, not fixed):** `npm audit` in `ui/` currently reports 5 vulnerabilities (3 moderate, 1 high, 1 critical) in the `esbuild → vite → vitest` transitive chain; `npm audit fix --force` would resolve them but requires a breaking bump to `vite@8`. Reviewed and accepted in `code-review.md` — the vulnerable path (`vitest --ui`/browser mode) is not what this project's `test` script (`vitest run`) invokes. Follow-up: re-run `npm audit` and take the breaking bump once a non-breaking patched release exists, tracked outside this story.
- **`requirements.md` staleness (documented, not corrected):** `requirements.md`'s Assumptions section states empty-name validation "uses only the native `required` attribute," but `architecture.md` and the shipped code both add a `.trim()` check on top of that. `architecture.md`/code are authoritative; `requirements.md` was not retroactively edited since it's a closed, committed story doc — noted here for anyone reading it in isolation.
- **No auth/authz:** unchanged from the rest of the app — `CLAUDE.md` documents this app as local-use-only, no database, no auth; this diff doesn't add or remove any access control.
- **No optimistic UI / concurrency handling beyond the documented stale-edit 404 path:** if two clients edit the same employee simultaneously, the second Save will 404 (handled — clears edit mode via `onSaveError`) rather than merge or warn about the conflict. This matches what `architecture.md` scoped for this story; true concurrent-edit UX was not requested and is out of scope.

## Reviewer Checklist

- [ ] Confirmed `EmployeeRow.jsx` view/edit modes match `requirements.md` FR-1–FR-4 (Edit/Delete buttons, pre-filled inline form, single-row edit exclusivity).
- [ ] Confirmed Save (`EmployeeRow.jsx` → `updateEmployee` → `EmployeeDirectory.jsx` refresh) and Cancel (no network call) behave as described, either by reading the tests or re-running the manual browser check.
- [ ] Confirmed empty-name validation (`required` + `.trim()`) blocks submission on both the row form and the directory-level integration test.
- [ ] Confirmed the `api/app.js` / `server.js` split didn't change the route-mounting list or any production behavior (`CLAUDE.md` → Structure).
- [ ] Confirmed `EMPLOYEES_DATA_FILE` env-var override in `employeeStore.js` falls back to the original hardcoded path when unset (no prod behavior change).
- [ ] Ran `cd api && npm test` and `cd ui && npm test -- --run` locally and got 13/13 and 14/14 passing respectively (or reviewed the pasted evidence above as equivalent).
- [ ] Reviewed and is comfortable with the accepted `npm audit` advisory in `ui/`'s `vitest`/`vite`/`esbuild` chain, and the plan to defer the breaking `vite@8` bump.
- [ ] Reviewed `code-review.md` and confirms no unresolved accept/fix disagreements remain.
- [ ] Spot-checked that `.claude/agents/QAEngineer.md`'s documented conventions (temp-file store seam, `app.js`-not-`server.js`, client/fetch mocking) actually match what's implemented in the four new test files.
- [ ] Confirmed no unrelated changes were bundled in (this diff intentionally excludes any other pending working-tree changes at the time each commit was made).
