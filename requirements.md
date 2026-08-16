# Requirements: EPMCDMETST-60121 — Edit employee details from the Employee Directory

## User Story
As an admin, I want to edit an employee's name and department from the Employee Directory, so that I can correct records without deleting and re-creating them.

## Functional Requirements
FR-1: Add an "Edit" action/button to each employee row in the Employee Directory, alongside the existing "Delete" button.
FR-2: Clicking "Edit" on a row reveals an inline form pre-filled with that employee's current name and department, replacing the row's read-only display.
FR-3: Only one employee row can be in edit mode at a time; other rows remain read-only while one is being edited.
FR-4: Saving the inline edit form calls the existing `PUT /api/employees/:id` endpoint with the updated name and department, then refreshes the employee list from the server.
FR-5: Canceling the inline edit form discards local changes without calling the API, and returns the row to its original read-only display with its original values.
FR-6: The edit form's name field is required, using the same native HTML5 `required` validation as the existing Add Employee form; attempting to submit with an empty name does not call the API.
FR-7: Add a client-side `updateEmployee(id, data)` function to `ui/src/api/employees.js` (calling `PUT /employees/:id`), since no update function currently exists there.

## Non-Functional Requirements
(None specified by the story or clarification — this is a UI-only change reusing an existing, already-functional endpoint.)

## Assumptions
- Edit form is inline within the row, not a modal (confirmed during clarification) — consistent with this app having no existing modal pattern anywhere.
- Empty-name validation uses only the native `required` attribute, matching Add Employee's actual current behavior — that form shows no custom inline error message today, only browser-native validation.
- Department remains optional on edit, consistent with its optional treatment in the Add Employee form.
- Edited values persist via the existing JSON-file-backed store (`api/data/employees.json`), so a page refresh reflects saved changes with no additional work.

## Out of Scope
- Backend changes — `PUT /api/employees/:id` already exists and is unchanged by this work.
- Search/filter functionality.
- Server-side validation on the PUT endpoint — it currently accepts any patch (including an empty name) with no validation. The story explicitly excludes backend changes, so this gap is not addressed here.

## Open Questions
(None outstanding — all ambiguities were resolved during clarification.)

## Source
Jira issue: [EPMCDMETST-60121](https://jiraeu.epam.com/browse/EPMCDMETST-60121) — "Edit employee details from the Employee Directory"
