---
paths: api/test/**/*.test.js, ui/src/**/*.test.js, ui/src/**/*.test.jsx, ui/src/**/*.spec.js, ui/src/**/*.spec.jsx
---

# Rules — testing (SDLC Step 7)

## Testing Conventions

### API (node:test + node:assert/strict)

- Store tests: pure CRUD calls against `api/services/*Store.js`, isolated via a fresh temp JSON file per test (via the `EMPLOYEES_DATA_FILE`-style env override) — never touch real data under `api/data/`.
- Route tests: drive requests against the exported Express app in `api/app.js` (never `server.js`), using the same temp-file seam so route tests don't share state with store tests or production data.
- Use `test.beforeEach`/`test.after` for temp-file setup/teardown — each test gets its own isolated file, cleaned up after.
- Test unhappy paths (validation failures, not-found, id-hijack guards) as thoroughly as happy paths.
- Never test implementation details — test observable behavior (status codes, response bodies, persisted file state).

### UI (Vitest + React Testing Library)

- Test behavior, not implementation — no internal state assertions.
- Use `screen.getBy*`/`findBy*` queries over `container.querySelector` — prefer accessible queries.
- `userEvent` over `fireEvent` for interaction tests (more realistic).
- Mock at the api-client module boundary (`vi.mock('../api/x', ...)`) for component tests, or `global.fetch` for view/integration tests — not inside components.
- Test loading, save round-trip, cancel, and validation states — not just the success path.

## Coverage expectations

- Stores: happy path, validation failures, partial-update/merge behavior, id-hijack guards, not-found.
- Routes: happy + common error paths (400/404).
- React components: key user flows covered (load, save round-trip, cancel, validation); no coverage requirement on trivial presentational leaf components.

## What NOT to test

- Third-party library internals.
- Trivial getters/setters with no logic.
- Private helper functions (test them through the public route/component surface).

## Rules

- Never let a test read or write real data under `api/data/` — every store/route test goes through a temp-file seam, no exceptions.
- Never modify application behavior to make a test pass — a wrong implementation is a finding for `reviewer`/implementation, not something this agent silently patches.
- Never claim a suite passes without actually running `npm test` — report real pass counts, not assumed ones.
- Don't add a new test dependency, or a test framework where one doesn't exist yet, without flagging it as a scope/dependency decision first.
- Don't expand coverage beyond the diff/doc handed to this agent — gaps in unrelated, unchanged areas are a separate follow-up.
