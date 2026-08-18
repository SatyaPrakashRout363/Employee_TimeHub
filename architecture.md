# Architecture: EPMCDMETST-60862 — Constrain department field to a fixed list in Employee Directory (add/edit)

## Recommendation Summary
Introduce one new frontend-only constants module, `ui/src/constants/departments.js`, exporting the fixed `DEPARTMENTS` list. Replace the free-text department `<input>` in both `EmployeeDirectory.jsx` (add form) and `EmployeeRow.jsx` (inline edit form) with a `<select>` bound to that list. In the edit form, if the employee's current stored `department` isn't in the fixed list, render it as an additional, clearly-labeled option so it displays correctly and isn't silently overwritten. No API, store, or route changes — `api/routes/employees.js` and `employeeStore.js` already accept and persist any string for `department` unchanged.

## Technology Choices
| Layer | Choice | Rationale |
|---|---|---|
| UI constant | New `ui/src/constants/departments.js` (plain JS array export) | No existing shared-constant location in the codebase; a plain array matches the project's "plain functions, no framework dependency" convention (cf. `api/utils/hours.js`). No new dependency. |
| UI form fields | Native HTML `<select>` | Existing forms use plain native inputs with no form library; `<select>` requires no new dependency and follows the same controlled-component pattern already used for the `<input>`s it replaces. |
| API | No change | `POST /api/employees` and `PUT /api/employees/:id` already accept an arbitrary `department` string and pass it straight to `employeeStore`; the story explicitly scopes server-side enforcement out (see `requirement.md` → Out of Scope). |
| Data store | No change | `employeeStore.js` (built on `api/utils/store.js`) does no validation today and needs none added, per the same out-of-scope note. |

## Component Diagram
```mermaid
graph TD
    D["ui/src/constants/departments.js<br/>DEPARTMENTS = [Engineering, Research, Platform, Sales, Marketing]"]
    A["EmployeeDirectory.jsx<br/>(add-employee form)"]
    B["EmployeeRow.jsx<br/>(inline edit form)"]
    C["ui/src/api/employees.js<br/>createEmployee / updateEmployee"]
    E["api/routes/employees.js<br/>POST / PUT (unchanged)"]
    F["employeeStore.js<br/>(unchanged)"]

    D -->|import DEPARTMENTS| A
    D -->|import DEPARTMENTS| B
    A -->|createEmployee({name, department})| C
    B -->|updateEmployee(id, {name, department})| C
    C --> E
    E --> F
```

## Data Flow
1. Both `EmployeeDirectory.jsx` and `EmployeeRow.jsx` import `DEPARTMENTS` from `ui/src/constants/departments.js`.
2. **Add form:** the department `<select>` renders one `<option>` per entry in `DEPARTMENTS`, defaulting to the first entry (or an empty placeholder option) as `department` state's initial value; on submit, `createEmployee({ name, department })` sends the selected value via the existing `POST /api/employees` flow, unchanged from today.
3. **Edit form:** on `startEdit`, `department` state initializes to `employee.department || ''`. If that value is present but not in `DEPARTMENTS`, the `<select>` additionally renders one extra `<option>` for that value (e.g. `Current: <value>`), so it appears selected instead of falling back to whichever option is first.
4. On Save, `updateEmployee(id, { name, department })` sends the selected value via the existing `PUT /api/employees/:id` flow, unchanged from today.
5. Both flows persist through `employeeStore` to `api/data/employees.json` exactly as they do today — only the source of the `department` string changes (dropdown selection vs. free-typed text).
6. After save, the existing `refresh()` (`GET /api/employees`) reloads the list, so a page refresh or re-render shows the persisted value — satisfying FR-6 with no new code path.

## Key Components and Responsibilities
| Component | Location | Responsibility |
|---|---|---|
| `DEPARTMENTS` constant | `ui/src/constants/departments.js` (new) | Single source of truth for the fixed department list: `['Engineering', 'Research', 'Platform', 'Sales', 'Marketing']`. |
| Add-employee form | `ui/src/views/EmployeeDirectory.jsx` (modified) | Renders department `<select>` from `DEPARTMENTS`; submits via existing `createEmployee`. |
| Inline edit form | `ui/src/components/EmployeeRow.jsx` (modified) | Renders department `<select>` from `DEPARTMENTS`, plus a fallback `<option>` for an out-of-list stored value; submits via existing `updateEmployee`. |
| Employees API client | `ui/src/api/employees.js` (unchanged) | Already sends whatever `department` string it's given — no change needed. |
| Employees route | `api/routes/employees.js` (unchanged) | Already accepts and stores any `department` string. |

## Notes / Deferred Concerns
- **No server-side enforcement of the fixed list** — deliberately out of scope per `requirement.md`; the API remains free-text-accepting. This is what makes an out-of-list stored value possible in the first place (FR-5), and is an accepted, pre-existing app-wide characteristic (no validation anywhere in `employeeStore`), not a new gap introduced by this change.
- **No admin UI for managing the department list** — deliberately out of scope; the list is a static export, changed only by editing the constants file.
- **No migration of existing free-text data** — deliberately out of scope; FR-5's fallback-option behavior is the permanent handling for such values, not a one-time migration step.

## Source
- `requirement.md` (this repo, root)
- Jira: EPMCDMETST-60862 — "Constrain department field to a fixed list in Employee Directory (add/edit)"
