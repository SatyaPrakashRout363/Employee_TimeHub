---
paths:
  - ".github/workflows/**/*.yml"
  - "api/package.json"
  - "ui/package.json"
---

# Rules — devops (CI/CD)

## CI commands

cd api && npm test
cd ui && npm test

## CI job shape (actual: .github/workflows/ci.yml)

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install && npm test
        working-directory: api

  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install && npm test
        working-directory: ui

## Rules

- Never weaken or skip a CI check (`api-tests`/`ui-tests`) to make a run pass — fix the underlying failure instead.
- CI must run tests the same way they're run locally (`npm test` in `api/` and in `ui/`) — never add a separate CI-only test invocation that diverges from the npm scripts.
- Never commit secrets/tokens into workflow files, `package.json`, or any CI config.
- This app is local-use only with no database and no auth (per `CLAUDE.md`) — adding a deploy/publish job, external service credentials, or environment-specific config is a scope decision, not a silent add; flag it first.
- New CI infrastructure (caching, matrix builds, service containers, new Actions) requires confirmation before adding — don't expand the pipeline beyond what the task needs.
