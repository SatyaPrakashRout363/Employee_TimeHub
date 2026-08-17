---
name: review
description: "Review the current working-tree diff before commit/PR, via the code-review skill."
allowed-tools: Skill
---

# Review

Invoke the `code-review` skill. It diffs the working tree, runs the `reviewer` agent against `requirements.md`/`architecture.md`/`impl-plan.md` (or `bugfix-plan.md`), and walks the user through the findings in `code-review.md`. Do not duplicate that analysis here.
