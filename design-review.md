# Design Review: EPMCDMETST-60862 — Constrain department field to a fixed list in Employee Directory (add/edit)

## Summary
Reviewed `architecture.md` against `requirement.md` and the current `EmployeeDirectory.jsx` / `EmployeeRow.jsx` / test implementations. The overall design (shared `DEPARTMENTS` constant + `<select>` in both forms, no API/store change) is sound and correctly scoped. Three findings, all resolved below — no changes to the recommended technology or component structure.

## Findings
| Finding | Risk / Impact | Resolution |
|---|---|---|
| Today `department` is optional (free-text, can be left blank); a `<select>` with only the 5 fixed options has no way to represent "no department," which would silently make the field mandatory — a behavior change beyond what the story asked for. | Add form would default to whichever option renders first even if the user never touches the dropdown, and an employee with no department couldn't be edited back to "none." | **Fixed** — add a blank `-- No department --` placeholder option (`value=""`) as the first `<option>` in both selects, preserving today's optional behavior exactly. |
| Existing tests (`EmployeeRow.test.jsx`, `EmployeeDirectory.test.jsx`) locate the department field via `getByPlaceholderText('Department')`, which only exists on `<input>`, not `<select>`. | Both test files will fail to compile/locate the field once the field becomes a `<select>` — pre-existing coverage would silently rot if not updated. | **Fixed** — implementation phase must update these tests to query the field by accessible name (see next finding) instead of placeholder text. Low-risk mechanical fix, no decision needed. |
| A `<select>` has no `placeholder` attribute, so the app's existing placeholder-as-pseudo-label convention (used everywhere else, e.g. `placeholder="Name"`) doesn't carry over. | Without an accessible name, the field is harder to test and less accessible than the input it replaces. | **Fixed** — add `aria-label="Department"` to both selects; tests then query via `getByRole('combobox', { name: 'Department' })`, matching this app's existing testing-library conventions. |

## Agreed Design Decisions
- **Blank placeholder option to preserve optionality.** Confirmed with the requester: rather than making department mandatory (defaulting to the first fixed entry), both selects get an explicit blank `-- No department --` option so the field stays exactly as optional as it is today. This is the only decision that materially changes `architecture.md`'s data flow (see update below); the other two findings are mechanical and don't change the design.

## Follow-up / Out-of-scope Risks
- **No server-side enforcement of the fixed list** (already noted in `architecture.md` → Notes / Deferred Concerns) — accepted, unchanged by this review; consistent with `employeeStore`'s pre-existing no-validation behavior across the whole app.
- **No admin UI for managing the list, no data migration** — both already out of scope per `requirement.md`; unchanged by this review.

## Architecture.md Update Applied
Updated the Data Flow section (steps 2–3) and Key Components table to reflect the agreed blank-placeholder-option decision and the `aria-label="Department"` accessibility fix.

## Source
- `architecture.md` (this repo, root)
- `requirement.md` (this repo, root)
- Jira: EPMCDMETST-60862 — "Constrain department field to a fixed list in Employee Directory (add/edit)"
