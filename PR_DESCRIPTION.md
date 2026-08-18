# PR: EPMCDMETST-60862 — Constrain department field to a fixed list in Employee Directory (add/edit)

## Summary

Replaced the free-text department `<input>` with a `<select>` bound to a single fixed department list (`Engineering`, `Research`, `Platform`, `Sales`, `Marketing`) on both the add-employee form and the inline edit form in the Employee Directory. The list lives in exactly one place (`ui/src/constants/departments.js`) and is imported by both forms. An employee whose stored department falls outside the fixed list (pre-existing free-text data) still renders and opens for editing without crashing, via a fallback option. No API, store, or server-side validation changes — this is a UI-only constraint, as scoped in `requirement.md`.

## Changes Made

- `ui/src/constants/departments.js` (new) — the single shared `DEPARTMENTS` list.
- `ui/src/views/EmployeeDirectory.jsx` — add-employee department field converted from `<input placeholder="Department">` to `<select aria-label="Department">`, with a blank `-- No department --` placeholder option (preserves optional department) followed by the fixed list.
- `ui/src/components/EmployeeRow.jsx` — inline edit department field converted the same way, pre-selected to the employee's current department; adds a `Current: {department}` fallback `<option>` when the stored value isn't in the fixed list, so out-of-list data doesn't throw or silently blank out.
- `ui/src/components/EmployeeRow.test.jsx` — updated the existing save test to query the field via `getByRole('combobox', { name: 'Department' })` + `userEvent.selectOptions` (was `getByPlaceholderText` + `userEvent.clear/type`, which only apply to text inputs); added a new test covering the out-of-list fallback rendering.
- `ui/src/views/EmployeeDirectory.test.jsx` — no changes needed; its existing `getByDisplayValue('Engineering')`-style assertions match a `<select>`'s selected-option display text the same way they matched the old `<input>`'s value (confirmed by running the suite).

**SDLC pipeline docs** (repo root, new): `requirement.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `code-review.md` — this story's Step 1–6 output, produced via the `orchestrator` agent pipeline.

## Test Evidence

API (`cd api && npm test`):
```
tests 13, pass 13, fail 0
```
Unaffected by this UI-only diff, as expected — no API/store code changed.

UI (`cd ui && npm test -- --run`):
```
✓ src/components/EmployeeRow.test.jsx (9 tests)
✓ src/views/EmployeeDirectory.test.jsx (6 tests)

 Test Files  2 passed (2)
      Tests  15 passed (15)
```

Manual verification: no browser-automation tool was available in this environment, so no literal interactive click-through was performed. As a substitute, the department flow was exercised end-to-end against an already-running local dev API (`:4000`): created an employee with a blank department, updated it to a fixed-list value (`Sales`), then to an out-of-list value (`Contracting`, exercising the FR-5 fallback case), confirmed each transition persisted via `GET`, then deleted the test record. All transitions round-tripped correctly. The `<select>` rendering/interaction itself is covered by the passing RTL suite (`userEvent.selectOptions` against real jsdom DOM), not by an actual browser click-through — see `sdlc-state.json`'s `verify` step notes for the full record.

## Known Limitations

- **No dedicated test for the blank-department save path** (accepted as-is in `code-review.md`): the negotiated blank-placeholder behavior (department stays optional) has no test asserting a save with the blank option persists `department: ''`. Low risk — behavior is simple and visually obvious.
- **Small DRY duplication** (accepted as-is in `code-review.md`): `EmployeeDirectory.jsx` and `EmployeeRow.jsx` each render a near-identical blank-placeholder-option + `DEPARTMENTS.map(...)` block (~4 lines). Not extracted into a shared component — the app's minimal, no-component-library convention doesn't clearly call for it yet.
- **No manual browser click-through** — see Test Evidence above; this environment has no browser-automation tool, so verification of the department flow was done via direct API calls against a live dev server plus the existing RTL suite, not an actual rendered-browser interaction.
- **Server-side validation intentionally out of scope**: the API still accepts any string for `department` (per `requirement.md`'s Assumptions) — this is a UI-only constraint by design, since a free-text-capable API is what lets an out-of-list stored value exist for FR-5 in the first place.
- **Existing free-text department data is not migrated or normalized** — explicitly out of scope per `requirement.md`.

## Reviewer Checklist

- [ ] Confirmed the add-employee form (`EmployeeDirectory.jsx`) and inline edit form (`EmployeeRow.jsx`) both render `<select aria-label="Department">` bound to the same `DEPARTMENTS` list from `ui/src/constants/departments.js` (FR-1–FR-4).
- [ ] Confirmed the fixed list contains exactly Engineering, Research, Platform, Sales, Marketing (FR-4).
- [ ] Confirmed an out-of-list stored department renders and opens for editing without crashing, via the fallback option (FR-5) — either by reading `EmployeeRow.test.jsx`'s new test or spot-checking manually.
- [ ] Confirmed selecting a department and saving still persists through the existing POST/PUT flow and survives a refresh (FR-6).
- [ ] Ran `cd api && npm test` and `cd ui && npm test -- --run` locally and got 13/13 and 15/15 passing respectively (or reviewed the pasted evidence above as equivalent).
- [ ] Reviewed `code-review.md` and is comfortable with the two accepted-as-is findings (missing blank-department test, small JSX duplication).
- [ ] Comfortable with the "no live browser click-through" limitation given the API-level round-trip check and RTL coverage described above.
- [ ] Confirmed no API/store/server code was touched — this diff is UI-only, per `architecture.md`'s scope.

## Source

- `requirement.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `code-review.md` (this repo, root)
- `sdlc-state.json` — full phase-by-phase approval record (commits, timestamps, notes) for this story
- Jira: EPMCDMETST-60862 — "Constrain department field to a fixed list in Employee Directory (add/edit)"
- Branch: `feature/EPMCDMETST-60862-department-fixed-list` (base `main` at `f57623e`)
