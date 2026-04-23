---
name: branch-workflow
description: >-
  Git and GitHub flow for this repository: work on develop, never open pull
  requests from feature/fix branches into main. Use when choosing a base or
  head branch, planning a PR, answering how to ship changes, or git setup for
  this project.
---

# Branch workflow (this repo)

Canonical policy is in [`.cursor/rules/branch-workflow.mdc`](../../rules/branch-workflow.mdc) (`alwaysApply: true`). Summary:

| Branch | Role |
|--------|------|
| `develop` | Default work branch; local work, feature PRs target this. |
| `main` | Release / production; **only** updated by merging **`develop` → `main`**. |

**Do not** open PRs from `feature/…`, `fix/…`, or other head branches **into** `main`. CI enforces this in [`.github/workflows/merge-to-main-guard.yml`](../../../.github/workflows/merge-to-main-guard.yml).

**Do** branch from `develop`, open PRs into `develop`, then when ready open **one** PR `develop` → `main`.

After clone: `git checkout develop && git pull` (remote default branch is `develop`).
