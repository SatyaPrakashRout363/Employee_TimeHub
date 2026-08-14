# Employee TimeHub

A simple employee time-tracking app: clock in/out, an employee directory, timesheets, and leave requests.

## Run the API
```
cd api
npm install
npm start        # http://localhost:4000
```

## Run the UI
```
cd ui
npm install
npm run dev       # http://localhost:5173
```

The UI dev server proxies `/api/*` to the API on port 4000, so open http://localhost:5173 in your browser.

## Data

Each domain (employees, time entries, leave requests) is stored as a flat JSON file under `api/data/`. No database, no auth — this is meant to run locally.

## Extending it

The backend is built around three seams that make new functionality cheap to add without touching existing code:

- **`api/utils/store.js`** — a single JSON-file CRUD factory reused by every entity's store in `api/services/`. A new entity (or swapping JSON for a real database) means reusing or reimplementing this factory once, not duplicating file I/O per domain.
- **`api/server.js`** — route mounting is a flat list (`app.use('/api/x', require('./routes/x'))`). A new domain is one new route file plus one line here; it's also where per-route auth/role middleware would slot in later.
- **`api/utils/hours.js` / `api/utils/timesheet.js`** — hour computation and aggregation are plain functions with no Express dependency, so future features (overtime rules, notifications, reports) can reuse them directly.
