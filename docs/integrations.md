# Repository and issue providers

Git source, issue tracking, execution and scheduling have different owners.
A Git remote does not guarantee an issue API, GitHub-compatible forms or a
particular CI system. Factory clones local Git source independently of the
optional issue integration.

| State | Owner |
| --- | --- |
| Source, branches, remote issues and their metadata | Selected repository/issue service |
| Queue, attempts, checks, approvals and evidence | Factory controller's private SQLite/files |
| External creation intent, correlation and receipt | SQLite; recovery bookkeeping, not an issue-backlog mirror |
| Schedules and scheduled-agent context | Selected harness, where it supports automations |
| Forms and actions | Dashboard and CLI over the same controller API |

## Current selection

`factory/issue-provider.mjs` selects an adapter from the configured Git origin.
Only public github.com origins select the implemented GitHub adapter. Its own
module owns GitHub API paths, host authentication, issue formats and recovery.
Unknown/self-hosted remotes, GitHub Enterprise, Forgejo/Gitea, GitLab and Cursor
Origin are **not implemented adapters**. They expose no remote-issue capability;
local brief execution and the method remain usable. Factory never sends GitHub
credentials to a guessed host or assumes a mirrored repo's original host.

The adapter contract supplies provider identity and explicit capabilities,
connection/acting identity, paged list, preview, templates/draft, publish and
read-only recovery. The generic submission store binds a request key to provider,
repository, identity and content before publication. Another provider can supply
these operations without changing the queue, controller routes or creation form.
Unsupported capabilities must fail visibly, not invent a compatible endpoint.
A non-GitHub test adapter exercises this boundary; it is not a shipped integration.

A future adapter must qualify its actual authentication, template/label model,
error behavior and ambiguous-write recovery. Add it at this boundary, with
matching CLI/API/UI support. Do not build a plugin loader, generalized OAuth
service or second database merely to reserve future extension points. Selecting
an issue tracker independently of the Git host remains a deliberate future
configuration extension, not an inferred mapping.

## GitHub adapter

The controller uses its existing `gh` identity. `issue connection` and the creation
form show the destination and acting user. GitHub enforces Issues write access;
label application needs suitable repository access. Browser GitHub login is not
required. Missing/revoked access produces a visible failure without execution.
No access token, browser cookie or host credential is passed to a job.

Creation sends the selected title/body/labels plus an opaque hidden correlation
marker. A lost response is recovered by bounded authenticated reads of issues
created by the original actor; no automatic second POST occurs. If the marker
was removed, the provider is unavailable or the bounded search cannot find it,
manual inspection is required. A receipt never claims current issue status;
read the provider again for current metadata. The published issue is the backlog.

Creation is separate from `issue start`. A remote issue never grants execution,
merge, deployment or production access. External harness automations use the same
explicit admission API and remain responsible for their own schedule/deduplication.

The managed updater’s OS timer maintains installed software; it is not a work-admission scheduler.

The dashboard derives its request key from the reviewed destination, identity,
title, body and labels. Reopening or reloading the same submission therefore
reuses its receipt, including a successful result whose browser response was
lost. No unsent draft is persisted by this mechanism. Identical browser content
returns the existing issue in that controller state; an intentional separate
copy requires a distinct CLI request key.
