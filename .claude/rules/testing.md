---
paths: api/test/**/*.test.js, ui/src/**/*.test.js, ui/src/**/*.test.jsx, ui/src/**/*.spec.js, ui/src/**/*.spec.jsx
---

# Rules — testing (SDLC Step 7)

- Never let a test read or write real data under `api/data/` — every store/route test goes through a temp-file seam, no exceptions.
- Never modify application behavior to make a test pass — a wrong implementation is a finding for `reviewer`/implementation, not something this agent silently patches.
- Never claim a suite passes without actually running `npm test` — report real pass counts, not assumed ones.
- Don't add a new test dependency, or a test framework where one doesn't exist yet, without flagging it as a scope/dependency decision first.
- Don't expand coverage beyond the diff/doc handed to this agent — gaps in unrelated, unchanged areas are a separate follow-up.
