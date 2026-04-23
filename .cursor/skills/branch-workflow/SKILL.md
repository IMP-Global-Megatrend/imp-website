---
name: branch-workflow
description: >-
  Git and GitHub flow for this repository: no direct pushes to develop or main;
  branch → PR → develop, then develop → main only. Use when choosing a base or
  head branch, planning a PR, or git setup for this project.
---

# Branch workflow (this repo)

Canonical policy is in [`.cursor/rules/branch-workflow.mdc`](../../rules/branch-workflow.mdc) (`alwaysApply: true`). Summary:

| Branch | Role |
|--------|------|
| `develop` | **Integration** branch. GitHub **rejects direct pushes**; land work only by merging a PR from another branch. |
| `main` | Release / production; **only** via PR **`develop` → `main`**. |

**Flow:** `git checkout develop && git pull` → `git checkout -b feature/…` (or `fix/…`) → implement → `git push -u origin feature/…` → open **PR into `develop`** → merge. No `git push origin develop`.

**Do not** open PRs from `feature/…` **into** `main`. CI: [`.github/workflows/merge-to-main-guard.yml`](../../../.github/workflows/merge-to-main-guard.yml).

**Release:** one PR **`develop` → `main`** when ready.
