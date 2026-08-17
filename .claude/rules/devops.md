---
paths: .github/workflows/**/*.yml, api/package.json, ui/package.json
---

# Rules — devops (CI/CD)

- Never weaken or skip a CI check (`api-tests`/`ui-tests` in `.github/workflows/ci.yml`) to make a run pass — fix the underlying failure instead.
- CI must run tests the same way they're run locally (`npm test` in `api/` and in `ui/`) — never add a separate CI-only test invocation that diverges from the npm scripts.
- Never commit secrets/tokens into workflow files, `package.json`, or any CI config.
- This app is local-use only with no database and no auth (per `CLAUDE.md`) — adding a deploy/publish job, external service credentials, or environment-specific config is a scope decision, not a silent add; flag it first.
- New CI infrastructure (caching, matrix builds, service containers, new Actions) requires confirmation before adding — don't expand the pipeline beyond what the task needs.
