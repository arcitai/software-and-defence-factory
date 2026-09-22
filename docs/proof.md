# Delivery evidence — 21 September 2026

Status: a runnable local starter with documented integration boundaries. Source-level checks, deterministic integration tests and browser interaction checks passed. No paid model benchmark, production customer job or independent security audit was performed.

## Executed checks

| Check | Result |
| --- | --- |
| Canonical Agentic Project Template validation before generation | Passed |
| `npm run check` | Passed: JavaScript syntax, JSON parsing, 16 behavioral/integration tests |
| Scope and evidence gates | Reject missing approval, stale scope, wrong commit, incomplete security, duplicate prepared attempt and excess repairs |
| Persistent state | SQLite reopen, revision conflict and atomic webhook delivery deduplication exercised |
| GitHub/webhook boundary | HMAC, repository allowlist, maintainer actor, untrusted actor, replay, source edits and bounded GET tested |
| HTTP boundary | Missing CSRF, wrong Origin, wrong Host, live simulation attempt, private file read and stale revision rejected |
| Actual worker subprocess | Dedicated temporary Git fixture and a **synthetic local executable named codex**: export/launch/artifact flow, successful exit awaiting evidence, missing isolation refusal and stop/cancellation passed. No actual model invoked |
| Metrics/evaluations | Failed attempts retained in costs; missing values remain unknown; wrong input digest, invalid acceptance rubric and duplicate evaluation import rejected |
| GitHub live read | Unauthenticated read-only REST against public `warpdotdev/oz-for-oss`: 29 issues and 12 PRs, no pagination at the time of the check. No writes |
| Six portable skills | All passed skill-creator `quick_validate.py`; helper used an isolated PyYAML environment under authoring scratch, not a product dependency |
| Issue form | Parsed as YAML; not installed in a remote repository |
| Documentation | Local Markdown links checked; no missing targets at delivery |

The Node service was started successfully on 22.21.1; later checks ran on 22.22.3. SQLite's experimental warning is expected on this Node line. `doctor` detected Git, Codex and Pi on the authoring host; Ollama and Cursor's `agent` CLI were not detected. This does not establish browser, model, plugin or worker capability readiness.

## Browser proof

The actual localhost UI was exercised, including:

- Ready demo task → prepare job → explicitly synthetic simulation → review → local acceptance. State persisted across reload/restart.
- Create a local task, approve scope, prepare and cancel without a model call. Unknown prices/times remained visibly unknown.
- HTML-like task title rendered as text, not as an injected element; no console errors were observed in tested flows.
- Search with no results, clear through keyboard, and blocked-state filtering with matching visible count.
- Metrics, evaluation suite, capabilities, security, setup and PR views. GitHub-read button disabled without configured repository.
- Evaluation CLI import rendered a clearly named teststub row with 1/5 case coverage, 0/1 acceptance and unknown price/review. It was a UI fixture, not a model measurement, and is excluded from the final clean preview/source archive.
- Desktop inspection at **1440 CSS pixels** and narrow inspection at **320 CSS pixels**. Document scroll width matched viewport width; wide tables stayed in their containers. Native-dialog Escape dismissal and keyboard navigation were exercised.

The browser environment had a scale factor, so CSS dimensions were measured from the rendered DOM instead of inferred from screenshot size. Temporary viewport emulation is reset after testing. The screenshot capture was inspected directly; no claim of a complete accessibility audit is made.

## Review findings corrected during implementation

- Missing costs and missing human time initially risked rendering as zero; now unknown is retained.
- Evidence import accepts a completed worker handoff but cannot clear a still-running or unknown process.
- Imported default issue criteria cannot be approved as a real specification.
- Cloud payload requires a reviewed revision instead of assuming `main`.
- Repeated configuration names cannot silently pool different model/harness/environment descriptions.
- Price bars use SVG attributes compatible with the strict CSP; no inline-style exception was added.
- Search/filter count and a dedicated blocked filter now match displayed rows.

This was the implementing agent's scoped review and verification, not an independent specialist sign-off. The eval oracle explicitly requires a separate verifier for future model results.

## Boundaries still to prove in a pilot

Actual Codex/OpenAI execution under the worker profile; Codex/Ollama on the Z13 hardware; Kastanje Responses/tool-calling/region/usage; Cursor create/poll/stop and billing; security plugin/Daybreak availability on the intended execution surface; outer sandbox containment; authenticated remote ingress; unattended recovery and financial spend caps.

These are visible setup and product-roadmap boundaries. The starter does not claim automatic dispatch, production multi-tenancy, full GitHub reconciliation or an authenticated evidence provenance system. See architecture.md, SECURITY.md and profiles/ before operating on customer material.

## Six-video research follow-up — 21 September 2026

All six user-supplied YouTube videos were opened, their descriptions expanded, and their English auto-generated transcripts exported and read. Relevant technical description links were followed, including the redirects to Matt Pocock's and Michael Shimeles' skill repositories. The source audit records timestamps, inspected revisions, unavailable/member-only material and links classified as promotional or social.

Read-only source inspection covered Machinist's runtime/security/roadmap, SSSF's real check implementation and adapter stub, Inkwell's environment lifecycle, Sandcastle, the linked skill collections and Owain Lewis' PR-review demo. No third-party workflow code was executed. Only the publicly accessible part of the Pragmatic Engineer article was read. Full transcripts and third-party clones remain outside the deliverable archive.

Changes are limited to research, the proposed next runtime, a manual review-packet template and three existing skills. No runtime or dashboard behavior changed. The existing 16 behavioral/integration tests passed again. New financial controls, provenance collection, before/after collection and production observation are documented requirements, not implemented capabilities. No live model, sandbox-service, inference-billing or production trial was performed.

The three changed skills passed `quick_validate.py`; all local Markdown file targets resolved and `git diff --check` passed. The six local transcript exports were checked against their video IDs and recorded with SHA-256 hashes in the private research scratch manifest.

## Pi research and synthetic protocol probe — 22 September 2026

Read the supplied X post and its source replies, HarnessTax's expanded experiment setup, and the published chart JSON at the recorded revision. Inspected Pi core/security/models/RPC/containerization and concrete browser, desktop, search, MCP and sandbox candidates. Pinned source provenance is in [pi-sources.json](pi-sources.json). This is a source review, not a security audit of those dependencies.

Executed [probe-pi.mjs](../scripts/probe-pi.mjs) against the host's already installed **Pi 0.85.1**, using a temporary isolated configuration, synthetic fixture and loopback-only fake Chat Completions endpoint. No provider secrets were inherited, no external inference request was made, no extension was installed, and temporary state was removed. Seven checks passed: custom provider selection; RPC prompt plus a real built-in read-tool/result roundtrip; LF JSON framing with U+2028; synthetic token/configured-price accounting; clear_queue plus abort cancelling a stalled HTTP request; accepted prompt followed by a surfaced provider error; exclusion of a project-local extension fixture.

The probe uses controlled responses and artificial usage/prices. It is **not** a model benchmark, a cost-saving measurement, a sandbox boundary test, a process-tree cancellation proof, or a test of Kastanje, browser/desktop extensions or scanner accuracy. It is not wired into dashboard job execution. New Pi profiles are documented blueprints; the operational capabilities register and UI remain unchanged.

`npm run check` passed all 16 existing behavioral/integration tests and JavaScript syntax checks after the optional probe was added. All nine deliverable JSON files parsed, and local Markdown file links resolved. No UI behavior was changed in this follow-up.

## Codex component reuse — 22 September 2026

Verified the official Codex platform, browser and Security SDK documentation, the public `openai/codex-security` repository, its Apache-2.0 license and plugin 0.1.95 manifest, and the security-scan skill's host/script dependencies. Compared these with installed plugin manifests and read the installed Codex 0.155.1 CLI help. The public Security source is distinct from the older installed plugin 0.1.24, which declares a proprietary license. The resulting correction and proposed SDK integration are in [codex-reuse.md](codex-reuse.md).

Documentation only; no package installation, source redistribution, scan, model call or runtime change. `git diff --check` passed. Existing runtime tests were not repeated for this documentation update. A real SDK job, provider access, worker isolation and result import remain unverified.
