# Requirements: EPMCDMETST-60862 — Constrain department field to a fixed list in Employee Directory (add/edit)

## User Story
As an admin, I want to pick an employee's department from a predefined list instead of typing free text, so that department values stay consistent across records.

## Functional Requirements
FR-1: The add-employee form's department field is a `<select>` populated from one fixed, shared department list — not a free-text `<input>`.
FR-2: The inline edit form's department field is a `<select>` bound to the same fixed department list, pre-selected to the employee's current department when the form opens.
FR-3: The fixed department list is defined in exactly one place in the codebase and imported by both the add-employee form and the inline edit form.
FR-4: The fixed department list contains exactly: Engineering, Research, Platform, Sales, Marketing.
FR-5: An existing employee whose stored `department` value is not present in the fixed list still renders in the directory and opens the inline edit form without throwing or crashing.
FR-6: Selecting a department and saving persists the value through the existing POST (create) / PUT (update) flow, and the persisted value is still shown correctly after a page refresh.

## Non-Functional Requirements
(none identified beyond the functional requirements above)

## Assumptions
- The fixed department list (Engineering, Research, Platform, Sales, Marketing) was derived from the department values used consistently across the existing test fixtures (`EmployeeRow.test.jsx`, `EmployeeDirectory.test.jsx`, `employees.route.test.js`, `store.test.js`), since `api/data/employees.json` currently holds no real records to derive it from. Confirmed with the requester.
- The API (`api/routes/employees.js`) continues to accept any string for `department` and does not enforce the fixed list server-side — the story scopes this as a UI-only constraint (a free-text-capable API is what already lets an out-of-list stored value exist per FR-5).

## Out of Scope
- An admin UI for managing the department list itself.
- Migrating or normalizing existing free-text department values already in data.
- Server-side validation/enforcement of the fixed department list.

## Open Questions
(none — all ambiguities resolved with the requester)
