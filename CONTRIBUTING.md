# Contributing to Software & Defence Factory

Start with [AGENTS.md](AGENTS.md), the relevant [documentation](docs/README.md)
and an accepted issue with observable acceptance criteria. The ordered
[todo](todo.md) links the current work; GitHub issues own the detailed scope.

## Local development

Use Node 22.13+ and Git. CI checks Node 22 and 24. Dependency lockfiles in the
root and `dashboard/` are committed; use `npm ci`, not an unconstrained install.

```sh
npm ci --ignore-scripts
npm run build:dashboard
npm run check
```

`build:dashboard` installs the locked frontend dependencies and builds the
assets into ignored `factory/ui/`. Run it before the package tests, which
install a real tarball and require those assets. `check` validates JavaScript
and JSON and runs the runtime/package and dashboard suites. It does not start
Docker or prove a model's judgment, browser behavior or production access.

| Area | Responsibility |
| --- | --- |
| `bin/` | CLI entrypoint and operator commands |
| `factory/` | Controller, queue, executor, services, updates and packaged UI |
| `dashboard/` | React interface and its tests; edit source here, not generated assets |
| `kit/`, `.agents/skills/` | Portable method and job-mounted specialist instructions |
| `tests/`, `scripts/` | Runtime/package regressions, validation and release helpers |
| `docs/` | Maintained setup, architecture, operation and proof |

UI changes need a real browser walkthrough at desktop and narrow sizes, in
both themes, exercising the changed interaction and its failure states.
Runtime isolation/recovery changes need relevant synthetic Docker qualification
as described in [proof](docs/proof.md) and [recovery](docs/recovery.md). Never run
`demo` or `qualify` against an application installation.

## Issue, candidate and PR

Use a short task branch from `main`, one writer per checkout and a PR back to
`main`. Keep the issue, source revision, relevant checks and review evidence
linked in the PR. A passing agent report is not independent acceptance.
Never commit credentials, operational state or raw model/customer evidence.

The repository's main protection requires up-to-date GitHub Actions checks
`check (22)` and `check (24)`, a PR and resolved conversations, including for
administrators. Force pushes and branch deletion are disabled. The solo-owner
workflow does not require a second GitHub identity's approval; candidate review
still happens before handoff. Reconcile the actual branch settings if this
policy changes; this document does not enforce them.

CI builds/checks PRs and main. Its existing npm release job publishes a new
version on main only when release configuration permits it; unchanged published
versions are skipped. Keep package and lockfile versions aligned for a release,
verify the installed artifact and follow [npm delivery](docs/npm.md).
Neither issue assignment nor Factory acceptance authorizes autonomous merge,
release or deployment. Do not replace a running controller from a source checkout.

For development through Factory on a worker, use the
[self-development recipe](docs/development.md).
