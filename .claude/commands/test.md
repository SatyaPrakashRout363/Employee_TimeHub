---
name: test
description: "Run the API and UI test suites and report real pass/fail counts."
allowed-tools: Bash(npm test:*), Bash(cd:*)
---

# Test

Run both suites and report actual results — never claim a pass without running it:

```
cd api && npm test
```

```
cd ui && npm test
```

If either suite fails, show the actual failing test output. If the user is asking for coverage on newly written code rather than just a suite run, use the `QAEngineer` agent instead of this command.
