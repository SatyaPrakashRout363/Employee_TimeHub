# Code Review: EPMCDMETST-60862 — Constrain department field to a fixed list in Employee Directory (add/edit)

## Summary
Reviewed the diff across `ui/src/constants/departments.js` (new), `ui/src/views/EmployeeDirectory.jsx`, `ui/src/components/EmployeeRow.jsx`, and `ui/src/components/EmployeeRow.test.jsx` against `requirement.md`, `architecture.md`, and `design-review.md`. The implementation fully conforms to the agreed design — no API/store changes, blank placeholder preserved, `aria-label="Department"` added, out-of-list fallback handled and tested. Two minor findings, both accepted as-is. **Verdict: approved.**

## Findings
| Dimension | Finding | Impact | Resolution |
|---|---|---|---|
| Requirements & architecture conformance | FR-1 through FR-6 all satisfied; matches `architecture.md`'s Data Flow and Key Components exactly (blank placeholder first, `DEPARTMENTS` options, `aria-label="Department"`, edit-form fallback option for out-of-list values, no API/store changes). | None — fully conformant. | Accepted. |
| Security | No injection/XSS surface introduced; department values render as React children (auto-escaped), no new dependency, no new input trust boundary. | None. | Accepted. |
| Error handling | Unchanged — `handleAdd`/`handleSave` still route through the same try/catch paths as before; no new failure mode introduced. | None. | Accepted. |
| Test coverage | The blank-placeholder behavior (department stays optional, negotiated in `design-review.md`) has no dedicated test asserting a save with the blank option persists `department: ''`. | Low — behavior is simple and visually obvious; a regression (e.g. accidentally defaulting to the first real option) wouldn't be caught by existing tests, but risk is small. | **Accepted as-is** — deferred, not worth a dedicated test for this story. |
| DRY / duplication | `EmployeeDirectory.jsx` and `EmployeeRow.jsx` each render a near-identical blank-placeholder-option + `DEPARTMENTS.map(...)` block (~4 lines duplicated). | Low — small, mechanical duplication. | **Accepted as-is** — extracting a shared `DepartmentOptions` component would be a small abstraction the app's minimal, no-component-library convention doesn't clearly call for yet. |
| Dependency safety | No new dependency added. | None. | Accepted. |
| Code clarity | Naming (`DEPARTMENTS`, `dept`) and structure are consistent with the app's existing plain-JS, no-framework conventions (cf. `api/utils/hours.js`). | None. | Accepted. |

Confirmed via `npm test` in `ui/`: **15/15 tests passed** (2 files) — `EmployeeRow.test.jsx` (9, including the new out-of-list fallback test) and `EmployeeDirectory.test.jsx` (6, unmodified, as predicted in `impl-plan.md`).

## Agreed Follow-ups
None — both findings above were explicitly accepted as-is by the requester; no follow-up work is owed to implementation.

## Source
- `requirement.md`, `architecture.md`, `design-review.md`, `impl-plan.md` (this repo, root)
- Diff: `ui/src/constants/departments.js`, `ui/src/views/EmployeeDirectory.jsx`, `ui/src/components/EmployeeRow.jsx`, `ui/src/components/EmployeeRow.test.jsx` (commit `0a23d12` on `feature/EPMCDMETST-60862-department-fixed-list`)
- Jira: EPMCDMETST-60862 — "Constrain department field to a fixed list in Employee Directory (add/edit)"
