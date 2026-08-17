# Employee TimeHub

Employee time-tracking app: clock in/out, employee directory, timesheets, leave requests.

## Run

```
cd api && npm install && npm start   # http://localhost:4000
cd ui && npm install && npm run dev  # http://localhost:5173
```

The UI dev server proxies `/api/*` to the API on port 4000 — open the UI URL in the browser, not the API one.

## Structure

- `api/server.js` — Express app; routes mounted as a flat list (`app.use('/api/x', require('./routes/x'))`).
- `api/routes/*.js` — one file per domain (employees, timeEntries, leaveRequests, timesheets).
- `api/services/*Store.js` — per-entity CRUD, built on `api/utils/store.js`.
- `api/utils/store.js` — single JSON-file CRUD factory reused by every entity store.
- `api/utils/hours.js`, `api/utils/timesheet.js` — plain functions (no Express dependency) for hour computation and aggregation.
- `api/data/*.json` — flat-file storage per domain. No database, no auth. Local use only.
- `ui/src/api/*.js` — one client module per domain, built on `ui/src/api/client.js`.
- `ui/src/views/*.jsx` — one view per domain (ClockInOut, EmployeeDirectory, Timesheet, LeaveRequests).

## Adding a new domain

1. Add a JSON file under `api/data/` and a store in `api/services/` via `store.js`.
2. Add a route file in `api/routes/` and mount it in `server.js`.
3. Add a client module in `ui/src/api/` and a view in `ui/src/views/`.

Per-route auth/role middleware, if added later, slots into the route-mounting list in `server.js`.

## External Services

The project uses Jira as the source of User Stories, tracked in project **EPMCDMETST** on `jiraeu.epam.com`.

When a workflow requires Jira:

1. Use the direct Jira REST API via `JIRA_URL`/`JIRA_USERNAME`/`JIRA_API_TOKEN` env vars (see `setup.md`) — **not** the `mcp__atlassian__*` tools, which are connected to a different Atlassian site and cannot reach this project's Jira instance.
2. If the env vars are unset or authentication fails, direct the user to `setup.md`.
3. Do not guess credentials.
4. Do not ask the user to commit credentials.
5. Do not modify Jira unless the workflow explicitly requires it.
