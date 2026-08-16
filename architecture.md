# Architecture: EPMCDMETST-60121 — Edit employee details from the Employee Directory

## Recommendation Summary
This is a UI-only feature that fits entirely within the existing Employee TimeHub stack (React/Vite frontend, Express backend, flat-JSON-file storage). No new technology, library, or backend endpoint is required — `requirements.md` explicitly puts backend changes out of scope, and `PUT /api/employees/:id` already exists and already works correctly for this use case.

The recommended approach: extend `EmployeeDirectory.jsx` with per-row "edit mode" state, extract the edit form into a small shared component (matching this app's existing convention of small components in `ui/src/components/`), and add one new client function (`updateEmployee`) to the existing per-domain API client module.

## Technology Choices

| Layer | Choice | Rationale |
|---|---|---|
| UI framework | React (existing) | Already used throughout `ui/src`; no new component library needed for an inline form. |
| Build tool | Vite (existing) | Already the dev/build tool for `ui/`; unaffected by this change. |
| State management | Local component state (`useState`) | Matches the existing pattern in `EmployeeDirectory.jsx` / `LeaveRequests.jsx`. No global store (Redux/Context) exists in this app and none is warranted for tracking which single row is being edited. |
| API client | Existing `fetchJson` wrapper (`ui/src/api/client.js`) | Reused as-is. Only a new `updateEmployee(id, data)` export is added to `ui/src/api/employees.js`, following the existing per-domain client module convention (see `leaveRequests.js`, `timesheets.js`). |
| Backend | Express (existing) | `PUT /api/employees/:id` in `api/routes/employees.js` already implements this; zero backend changes required. |
| Persistence | Flat JSON file via `api/utils/store.js` (existing) | `employeeStore.update()` already handles partial-patch semantics (`{ ...existing, ...patch, id }`) correctly for a name/department update. |

## Component Diagram

```mermaid
graph TD
    subgraph UI["ui/src"]
        ED["EmployeeDirectory.jsx<br/>(list + add form + refresh)"]
        Row["EmployeeRow.jsx (new)<br/>read-only row OR inline edit form"]
        EmpAPI["api/employees.js<br/>(+ updateEmployee)"]
        Client["api/client.js<br/>fetchJson"]
    end

    subgraph API["api/"]
        Route["routes/employees.js<br/>PUT /:id (existing, unchanged)"]
        Store["services/employeeStore.js"]
        Util["utils/store.js<br/>createStore"]
        Data["data/employees.json"]
    end

    ED -->|renders one per employee| Row
    Row -->|save: updateEmployee(id, data)| EmpAPI
    Row -->|delete: deleteEmployee(id)| EmpAPI
    ED -->|refresh: listEmployees()| EmpAPI
    EmpAPI --> Client
    Client -->|PUT /api/employees/:id| Route
    Client -->|GET /api/employees| Route
    Route --> Store
    Store --> Util
    Util --> Data
```

## Data Flow

1. **Initial load** — `EmployeeDirectory` calls `listEmployees()` → `GET /api/employees` → `employeeStore.getAll()` → renders one `EmployeeRow` per record.
2. **Enter edit mode** — user clicks "Edit" on a row. `EmployeeDirectory` sets `editingId` state to that employee's id. Only the row matching `editingId` renders its form; all others stay read-only (FR-3).
3. **Edit locally** — the form pre-fills from the employee object already in `EmployeeDirectory`'s `employees` state (no extra fetch needed) and holds `name`/`department` as local form state.
4. **Save** — on submit, if `name` is non-empty (native `required` validation, FR-6), `EmployeeRow` calls `updateEmployee(id, { name, department })` → `PUT /api/employees/:id` → `employeeStore.update()` persists to `employees.json` → response returns the updated record. `EmployeeDirectory` then calls `listEmployees()` again to refresh from the server (consistent with the existing `refresh()` pattern used after add/delete) and clears `editingId`.
5. **Cancel** — `EmployeeRow` discards local form state and clears `editingId` in the parent; no network call is made (FR-5).
6. **Persistence** — because step 4 writes through the existing JSON-file store, a page refresh reflects the saved values with no additional work.

## Key Components and Responsibilities

| Component | Location | Responsibility |
|---|---|---|
| `EmployeeDirectory` | `ui/src/views/EmployeeDirectory.jsx` | Owns the employee list, the add-employee form, and `editingId` (which row, if any, is in edit mode). Passes each employee + edit callbacks down to `EmployeeRow`. Triggers refresh after add/save/delete. |
| `EmployeeRow` *(new)* | `ui/src/components/EmployeeRow.jsx` | Renders either the read-only row (name, department, Edit/Delete buttons) or the inline edit form (pre-filled inputs, Save/Cancel buttons), based on whether it is the currently-editing row. Owns the transient in-progress edit values. |
| `api/employees.js` (client) | `ui/src/api/employees.js` | Thin per-domain HTTP client. Adds `updateEmployee(id, data)` alongside the existing `listEmployees`/`createEmployee`/`deleteEmployee`. |
| `api/client.js` | `ui/src/api/client.js` | Existing shared `fetchJson` wrapper (JSON headers, error handling) — unchanged, reused by the new call. |
| `routes/employees.js` (API) | `api/routes/employees.js` | Existing `PUT /:id` handler — unchanged. Delegates to `employeeStore.update`. |
| `employeeStore` | `api/services/employeeStore.js` | Existing per-entity CRUD store — unchanged. |
| `store.js` (API) | `api/utils/store.js` | Existing generic JSON-file CRUD factory — unchanged. |

## Notes / Deferred Concerns
- Server-side name validation on `PUT` remains absent (the store will happily persist an empty name if the API is called directly, e.g. via curl). This is a known gap but explicitly out of scope per `requirements.md`, since backend changes are excluded from this story.
- No new component library, styling framework, or state-management dependency is introduced; this keeps the change consistent with the rest of the app's minimal-dependency style.

## Source
Based on `requirements.md` for [EPMCDMETST-60121](https://jiraeu.epam.com/browse/EPMCDMETST-60121).
