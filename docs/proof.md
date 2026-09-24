# Delivery evidence — 21 September 2026

> Dette er historik for prototype og research. Se [v0.2-platformens afprøvning](platform-proof.md) for den nye CLI/Machinist-pakke.

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

## Pi and Security worker adapters — 22 September 2026

Implemented Pi RPC and official Codex Security SDK adapters behind the existing CLI runner, retaining its single-writer claim, scope/base checks, process-group stop, timeout and independent evidence gate. Added private worker configuration, a fingerprint binding Pi settings/models/policy, credential allowlisting, canonical path checks, per-attempt telemetry/artifacts and preservation of measured duration during evidence import. No automatic approval, billing claim or background dispatch was introduced.

`npm run check` passed **24 tests**, including eight new adapter cases. Regression checks cover a late Pi provider error, malformed RPC output, unexpected model selection, changed configuration/policy, symlink paths, missing security capability, cancellation of a real descendant process, incomplete/stale SDK artifacts, SDK cleanup and rejection of custom plugins. A symlink regression initially failed because a macOS temporary-directory alias was not canonicalized on both sides; the corrected comparison passed. No required check was weakened.

`npm run probe:workers` passed with **real Pi 0.85.1**, a local synthetic Chat Completions server and a real built-in read-tool/result roundtrip. A prepared task traversed the actual runner and SQLite journal to `awaiting-evidence`. Synthetic usage was retained in private artifacts; missing prices remained missing in the journal. The same probe ran the **official npm Security SDK 0.1.29/plugin 0.1.95** in its documented mock mode and checked sealed manifest, exact commit, report, coverage and 12 synthetic findings. A real SDK launch with no authentication then failed clearly and became `failed` in the journal. Provider credentials were removed, temporary state was cleaned up and there were **zero external model calls**. The installed SDK's bundled Codex executable reported 0.154.0; npm package provenance is locked separately from the previously inspected GitHub main tree.

The optional SDK was installed only under `profiles/security/node_modules` with install scripts disabled. It is ignored by Git and excluded from the source archive. No plugin source was copied into the MIT project. The core still has no npm dependencies. Third-party packages retain their own licenses.

**Dependency audit did not pass:** npm reported high advisories in `extract-zip` and its SDK dependent. The supported adapter uses the bundled plugin directory and rejects custom plugins; source tracing and a regression check support that limited mitigation. The upstream dependency remains unpatched and the audit remains non-green. See [the dependency review](security-dependency-review.md); this is not a security sign-off for the whole SDK or the factory.

Browser inspection of a disposable local demo confirmed the revised Setup and Agents pages, including the distinct synthetic integration/model-preflight labels, at desktop and narrow layouts. The browser's temporary viewport was reset and the tab closed. Local Markdown targets resolved and `git diff --check` passed.

This was the implementing agent's scoped review, not an independent specialist review. Live inference, model quality, provider billing, customer scanning, OS sandbox containment, browser/desktop capability integration and unattended GitHub-to-PR execution remain pilot work. [Current setup and boundaries](worker-integrations.md).

## BuilderIO simplification — 23 September 2026

Read the complete 17:34 English auto-generated transcript for Steve (Builder.io)'s `pNmfMi-yjZk`, including all 596 timestamped segments. The browser export initially reported no transcript; after the actual video and transcript panel loaded, export succeeded. The private scratch manifest records the source ID, description links, language and transcript SHA-256 `1f41d3ae2ba002ffc07108825b5cca96ba51974e56b0dd89a4a66fb96179744f`. The full transcript is excluded from this repository and its archive.

Read the Factory guide, configuration convention, all nine Factory skills, general agent-watchdog, catalog and plugin/MCP configuration at BuilderIO/skills revision `9e4f7beb3def2d785a6fa347fd946fd1a063f522`. Followed the second description link to BuilderIO/agent-native at `67cf8bbeca31c3c43b795cf5b9b89b60c011421f`, inspecting the shared-action documentation, package metadata, Factory template and selected dispatch/automation source. No upstream installer, app or workflow was run; this was not a dependency or security audit.

The [research](builderio-review.md) distinguishes instructions from host capabilities and from the larger Factory app. Updated next-runtime priorities to use the existing runner for a manual pilot before considering another controller. Added a manual human-decision template and recurrence field in the review packet. Existing skill instructions, runtime code, schemas and UI behavior were not changed; the skill index now explains the three-step presentation.

All 101 local Markdown file targets resolved and `git diff --check` passed. Runtime tests were not repeated for this documentation-only change; the latest runtime validation remains the 24-test run above. No new UI behavior is claimed, and no model execution, installation, scheduler, external message, PR or deployment was performed. Review was by the authoring agent, not an independent reviewer.

## Warp measurement method — 24 September 2026

Read the user-opened Warp email dated 22 September in iCloud and the six official pages for Scorers, measurement/improvement, benchmarks, self-improvement, dashboard metrics and factory definitions. Inspected the MIT-licensed `warpdotdev/warp-factory-examples` at `84e7c952f1506c4bd2784d96fd40a6f4d6398cad`, including its issue-to-PR guide and two scorer definitions. No upstream code was executed. Documentation/example differences are recorded as source observations, not proven runtime defects.

Read the designated bachelor's task for its current direction. Corrected the older factory research's stale description of that work; the bachelor's repository and its research questions were not changed. No raw mail, personal tracking links or private task transcript is included in this delivery.

Added an original manual measurement card, an evidence-quality rubric and a before/after research protocol to the existing value guide. Updated the runtime plan and review packet to reference the method. The protocol includes all human work, unsuccessful attempts, unknown measurements, judge disagreement and post-acceptance observation. Runtime code, eval schema, fixed cases and dashboard behavior are unchanged. Automatic judging, sampling and assessment history remain proposed capabilities; no model experiment or measured saving is claimed.

Checked all 37 Markdown files: **121 local file targets and eight heading anchors resolved**. `git diff --check` passed. Runtime tests were not repeated for this documentation-only change; the latest runtime validation remains the 24-test run above. No new UI, paid job, installation, automation, external message, issue, PR or deployment was performed. Review was by the authoring agent, not an independent reviewer.

## Short decision overview — 24 September 2026

Added a self-contained Danish HTML overview for Gustav: current implementation, synthetic-only evidence, the recommended next build stage and its completion criteria. The roughly two-minute overview uses the existing repository sources; it is a proposal, not a completed runtime increment. README links to the offline file.

Inspected desktop and narrow browser renderings. The browser reported CSS widths of 2000 and 375 respectively; document width matched viewport width in both. Status labels remain meaningful without color, the workflow reflows vertically, and keyboard Tab reached the first source link. Temporary viewport settings were reset. The page has no JavaScript or external asset dependencies. Runtime tests were not repeated because runtime behavior is unchanged.

## Dex, diagrams and community playbook — 24 September 2026

Read the supplied X article, its continuation in the author's combined article, and the complete 58:36 English auto-generated video transcript: 1,980 timestamped segments, 0:00–58:35. The private transcript hash is `ae400dd3fc72d509b2fa1d557eca9c234dcc16fb8f609b40f26f52fd61617a8e`. Visually inspected six central illustrations. Read the author's time-allocation essay and later benchmark-correction opening, and verified the SlopCodeBench v2 abstract/version history. This was not a full benchmark-method audit or model experiment. The [research note](dex-review.md) records coverage, timestamps, pinned sources and limitations.

Read both README and SKILL.md in the user-supplied Maciejdziuba gist at `112d6ba3d533bd07895774e37d169ce585f6317d`. Treated the skill text as reference material; no installation or execution. Its mandatory approval sequence and overbroad pre-change test rule were not adopted. No newsletter form was submitted, and identity with the separate email download remains unverified.

Updated the short overview, next-runtime plan and existing review/measurement templates with proportionate design before coding, small end-to-end changes, explicit uncertain decisions and resumable status. Added a proposed later-change pilot observation while retaining the five measurement dimensions. No runtime, installed skill, worker policy, eval case or importer was changed; no savings or maintainability result is claimed.

The updated overview contains 388 whitespace-separated visible words (about two minutes). Inspected its desktop and narrow layouts at measured CSS widths 2000 and 375 with no horizontal overflow; the four perspectives reflow to one column. Keyboard Tab reached the first source link with a visible focus outline. The browser's full-page capture showed a stitching overlap near the narrow footer; the DOM contained one footer and one roadmap. Local document links/anchors and `git diff --check` were checked. The page remains offline with no JavaScript or remote assets. Runtime tests were not repeated for this documentation change; the latest runtime validation remains 24 tests above. Review was by the authoring agent.

## Vertical slices as an explicit owner requirement — 24 September 2026

Made vertical slices the required development approach in AGENTS.md and the original specification, implementation and review skills, following Gustav's explicit instruction. Each slice delivers observable behavior through its necessary layers and is verified before extension. Instructions cover bounded prerequisites, API/CLI/security work without artificial UI, honest mock evidence, continued work within accepted scope and the distinction between a slice checkpoint and whole-job acceptance. The existing review packet now records slice evidence, revision and next action; the build plan and short overview reflect the requirement.

All three changed skills passed the skill-creator validator using an already cached PyYAML package after the default Python environments lacked that module. No dependency was installed. Checked the instruction flow for scope preservation, single-slice fixes, multi-slice features and bounded prerequisite work; this was author review, not an observed worker experiment. Local document links and `git diff --check` passed. Inspected the revised overview at measured CSS widths 1562 and 375 with no horizontal overflow; it now has 394 visible words. Reset the temporary viewport and closed the test tab. Runtime code and schemas are unchanged, so runtime tests were not repeated. The instructions do not constitute automatic runtime enforcement or measured agent compliance.

## Cloud component map and Cloudroom review — 24 September 2026

Read the Cloudroom Core documentation and selected implementation at `cc2a655f168abc700efb378a33f1e9bf15802e5f`; scope and source links are in cloud-setup.md and ownership.md. This was not a complete code audit or runtime exercise. Read current primary documentation for Codex Cloud, environments, subscription limits, GitHub integration, Agents API and hosted environments; Cursor Cloud Agent; Daytona sandbox/computer-use and billing; GitHub Actions billing; and Hetzner Cloud. Account entitlements and provider integration were not tested.

Added a component table, a quick manual Codex Cloud pilot route, and an open Pi/Daytona target with the existing controller on a small VM. Cloudroom remains design inspiration rather than a new dependency. Updated the short review, README, setup entry, Pi blueprint and runtime plan to agree on one first remote adapter and three vertical slices. Subscription allowances, separate API/inference/compute costs and unknown EU/data coverage are distinguished. Checked the illustrative CPU/RAM arithmetic with decimal calculations; no cost or quality benchmark was run.

The overview now has 523 visible words and eight component rows. Inspected desktop and narrow renderings at measured CSS widths 1562 and 375: document width matched the viewport, and table/text cells had no horizontal overflow. Keyboard Tab reached the first detail link with a visible-style focus outline. The narrow full-page screenshot had a stitching overlap; DOM inspection confirmed one status section and one roadmap. Reset the viewport and closed only the agent-created test tab. The temporary local preview server was stopped.

Checked 40 documentation files: 151 local targets and 10 heading anchors resolved. The review has unique element IDs, no scripts and no remote assets. `git diff --check` passed. Runtime code, schemas and skills are unchanged; runtime tests were not repeated, and the latest runtime validation remains 24 tests above. Review was by the authoring agent. No server, account, paid task, external message, PR or deployment was created.

## Portable adoption kit and conventional CI/CD — 24 September 2026

Reframed the product around a portable kit for existing app repositories, following the owner's correction. GitHub may be the full control surface; the existing runner, dashboard and concrete cloud stacks are optional. Added original policy, project installation record, delivery/evidence template and inactive CI example. The installation record is explicitly documentation, not an executable config. Added an allowlisted export command that refuses existing destinations and records content hashes. Adjusted specification, implementation and evaluation skills to avoid mandatory local runtime files while preserving evidence, authority and vertical-slice boundaries.

Revisited the pinned Ras Mic and BuilderIO sources and current primary Agent Skills, GitHub and OpenAI CLI/CI documentation. The low-cost profile distinguishes self-hosted runner compute from GitHub-hosted minute allowances, local inference from a local scanner process, and optional SARIF entitlements from private report review. TDD stays in development; Actions runs ordinary reproducible CI/CD and relevant checks. No claim is made that every local model supports Codex Security or that hardware/cloudcompute has zero total cost.

`npm run check` passed **27 tests**, including three new export tests: complete portable output with matching hashes/local references; refusal to overwrite an existing app or repeat export; and no false source identity when a source ZIP is unpacked inside another Git repository. The last case prompted a provenance fix before the successful final check. Six skills passed the skill-creator validator using the already cached PyYAML dependency, without installing packages. Parsed the inactive CI YAML and ran its shell step against isolated fixtures: missing setup exits 1, an app check's exit 17 stays 17, and a successful check exits 0. No GitHub workflow or provider action was run; no live integration or model-quality result is implied.

Inspected the 438-word review at measured CSS widths 1562 and 375 with no horizontal overflow. Keyboard focus reached the first detail link with a solid focus outline. A narrow full-page capture again showed a stitching overlap; the DOM had one profiles section and one roadmap. The page has no scripts or remote assets. Reset temporary viewport settings and closed only the agent-created tab. Checked 46 documentation files: 166 local links and 12 heading anchors resolved; `git diff --check` passed. Review was by the authoring agent.

The optional runtime code and active GitHub integration were not changed. No app adoption, runner registration, account configuration, scheduled automation, paid scan, remote publication or deployment was performed. A real selected-app pilot remains the next qualification step.

## Product naming and Defense boundary — 24 September 2026

Applied the owner-selected **Arcitai Software & Defence Factory** name to the README, instructions, research/design headings, review page, dashboard, CLI display and exported kit. The issue form, label blueprint and optional Pi profile now use `security` for this product's work track. Stable repository/package/storage identifiers and third-party source titles are preserved. No existing external labels or installed app copies were migrated.

Documented the separate proposed Defense Factory responsibility for ongoing operational monitoring, logs, incidents and dependency/advisory observation, including software built elsewhere. Scoped findings can come here for verified repairs and return to operations for confirmation after release. Security work here still includes post-release changes; this naming update adds no runtime integration or monitoring service.

`npm run check` passed. Because a concurrent Defense task was adding untracked tests in the shared checkout, also ran the four tracked test suites explicitly: **27 tests passed**. The unrelated work was excluded from this change. Parsed the issue YAML and checked the label/profile identifiers; searched all tracked files for superseded product names and track IDs. Checked 47 documentation files: 174 local targets and 19 heading anchors resolved. `git diff --check` passed.

Inspected the updated review and dashboard in the browser at measured CSS widths 1562 and 375. Full product names wrap visibly with no page or brand/footer horizontal overflow. The dashboard used a separate temporary SQLite database with synthetic demo data; no live GitHub integration or model was started. Reset the viewport, closed only the test tabs and stopped both temporary servers. Review was by the authoring agent.

## Defence definition research and operations experiment — 24 September 2026

Investigated OpenAI's Defense Factory definition, architecture/workflow text, Daybreak use cases, product-direction job description and the official Codex Security plugin quickstart. Compared selected Cloudflare harness sections, Ramp's February workflow and May model/pipeline study, and Google's Chrome security lifecycle. Read Marco Lancini's X post and mrinal's reply directly in the browser. Detailed coverage and limitations are in [defence-research.md](defence-research.md); no upstream implementation or full article is redistributed.

The resulting proposal separates responsibility rather than imposing a pre-/post-release boundary: the existing Software & Defence Factory delivers changes, while the separately proposed Defence solution owns continuing security investigation and remediation follow-up. Operational monitoring is an attached profile. Repository/runtime division and providers remain undecided. No existing product instruction was silently rewritten to make this proposal binding.

The operations code begun before that research is explicitly retained under `experiments/defence-operations/`, outside active skills, runtime and the software export allowlist. It reads a synthetic fixture and produces draft records only. The first slice covered grouping, replay conflicts, source/customer/environment scope and missing coverage; after four passing tests, the next slice added submitted recovery-record checks. Five behavioral tests cover these paths, including wrong release, missing/skipped/failed checks, inadequate or stale observation and lack of sensor freshness. A consistent record is only ready for closure review, never an authenticated production result or automatically closed case.

`npm run check` passed **32 tests** including the five experiment tests and the existing 27. The experiment's CLI was also exercised: three deliveries became two unique events in one draft; the wrong-release record stayed open and the consistent record required review. Three experimental skill drafts passed the skill validator using cached PyYAML; they are not installed or exported. Syntax/JSON checking now includes the experiments directory.

The 378-word Defence overview was inspected at measured CSS widths 1562 and 375: no page or text/table horizontal overflow; the flow reorders vertically and keyboard focus has a solid visible outline. The original review links to it. Eleven selected documents had 26 resolving local file references; both HTML pages have unique IDs, no scripts and no remote assets. `git diff --check` passed. Reset the viewport, closed only agent-created tabs and stopped the local preview server. Review was by the authoring agent.

Concurrent product/setup work in this shared checkout was detected and preserved. This work does not claim ownership of that work or a clean shared checkout. No customer source, sensor, webhook, model invocation, scheduled monitoring, outbound message, live scan, deployment or Defence package publication occurred. The next implementation proposal is a real bounded vulnerability-to-verified-remediation slice, not expansion of the synthetic operations demo into a monitoring platform.

## Onboarding, product form and runtime references — 24 September 2026

Shortened the main README to a three-step app adoption path and moved optional runtime details to setup.md. Reworked the exported kit guide around agent-assisted setup, an actual first issue and evidence before automation. Added a documentation index, comparison with Warp/BuilderIO, a bounded platform proposal and Fabro/Mastra/Cole research. These are documentation and product recommendations; no new installer, platform or cloud integration is claimed. Recorded the owner's explicit exclusion of Archon in AGENTS.md and the recommendations.

Read current primary Warp Factories overview, quickstart, workflow and infrastructure documentation plus oz-for-oss and BuilderIO onboarding sources. Inspected Fabro at `a2b39a2408d2f35b8882099728217254c24f0c7a`, Mastra at `4cb2f12d05b0de71a22127a76a16c1732bb674ec` and Cole Medin's factory at `e167ddc480d2f5c95d436f9d1c5cdcf37b092281`. Coverage includes selected README/setup/license files and the VPS guide, not full code audits. Visually inspected Fabro's board and run-detail repository screenshots; Mastra was assessed from documentation. No third-party source or image was copied into the product. Source links and limits are recorded in ui-references.md.

The three existing kit-export tests passed, including complete output/provenance/local references, refusal to overwrite an existing destination, and avoiding a false source revision inside another Git repository. Local documentation file links and heading anchors resolved; `git diff --check` passed. Runtime behavior and our HTML/dashboard were unchanged, so full runtime tests and browser checks were not repeated. Review was by the authoring agent. Fabro, Mastra and Archon were not installed; no VPS, paid service, model run, app adoption or deployment was created.

A separate local Defense commit was preserved and excluded from this documentation publication by preparing it in an isolated worktree based on the existing remote revision. The next qualification remains one real app issue through a selected runtime, including tests, security/review, stop/recovery and actual measurements where available. The research does not establish which runtime is cheapest or best in operation.

## Defence packaging dependency — 24 September 2026

Recorded the owner's instruction that Defence packaging should follow the Software Factory session's selected installer, runtime and work surface. Read that session's current product-experience/platform documents and repository instructions. The thread reader returned status but no turn text, so the alignment is based on those repository documents and the owner's message, not an inferred conversation transcript. Added a bounded integration direction to defence-research.md: independent agent/model/hosting choices, UI-neutral case/evidence handoff and reuse of the selected delivery path. No provider, new GUI, deployment or final product name was chosen here. This was a documentation-only change; runtime tests and browser checks were not repeated.

## Ready-to-run product direction, research and Machinist qualification — 24 September 2026

Recorded the owner's clarified outcome: a preassembled configurable factory with working defaults, VPS first and the same package in a local Linux environment. The subsequent owner decision selects Machinist as the foundation and one installation/dashboard for software, security and optional Defense/incident workflows. Updated the product contract, short review, build direction and portable installation/review guidance. Preserved the current runtime and separate Defense experiment; this is not a completed migration, installer or automatic pipeline. The six existing skills remain the method foundation.

Read selected setup, workflow, runner and verification sources from Cole's skills at `dfaa9105741fc5ba9b16b6a72551cad4bad70415` and dark-factory-experiment at `eaf804b4cad7606496d54298b9c42d47731119d0`, alongside the previously pinned factory VPS recipe. Distinguished the standalone Claude-shaped runner from the Archon-based repositories. Read both Dan Shapiro articles and Trycycle's README at `eb25b5141187b667096d948198617075f8e8e55a`. These inform bounded review and vertical slices; no upstream skill was installed or followed as authority. Inspected current Fabro hosting/backend documentation, Cloudflare Sandbox/Containers architecture/pricing, Docker's security model and Oracle's current Always Free allocation. Decimal arithmetic reproduced the illustrative Cloudflare totals; they are not measurements. Freshell received landing-page-only inspection. See foundation-review.md.

Re-read the complete cached English automatic captions for `yhLDivVIamQ`, from 0:00 through the final segment at 10:46. The file retrieved on 21 September has SHA-256 `c3d899d793522e1738fce93f0e52e729cc2a4ce6099c7be78e5dde259a140a40`. This was caption reuse, not fresh ASR or audio verification. Read the accessible sections of the Pragmatic Engineer article; the text after the subscription boundary was not accessed. Read Owain's separate incident-demo README, agent and domain code at `5b3d3c9a136dc797c0da1427406c9a53fefbee5c`. The demo uses read-only evidence tools and recommendations, not unattended recovery. Timestamped paraphrases and app-relative risk guidance are in relative-risk.md; no full third-party transcript is redistributed.

Inspected Machinist at `39435164faf1ff7fad49e41c38a7eb1a00538f21`: README, architecture, security, configuration, task/workflow/artifact and VM docs; runner/process supervision, worker heartbeat, control-plane lease/trigger code, analytics and the risk-delivery example. Coverage is targeted, not a full security audit. Important gaps include host-level executor access, different recovery semantics for raw commands, command-only scheduled triggers, and the distinction between self-reported workflow completion and independently verified quality. The example's skipped/neutral check handling is not adopted as Arcitai's required-check policy.

Built that pinned source inside a disposable Docker container with Go 1.26.6 (image digest `sha256:0d1d3a794be25f809dd2cb3160d8c73276c4056a9f8242a138e908ddeee7b6b6`). Ran `go test -json ./internal/runner ./internal/managedworker ./internal/controlplane`: **322 passing test/subtest results, two skips, no failures**. One skip is Darwin-specific cleanup on Linux; the other requires a disposable live GitHub repository and was deliberately not configured. Built the CLI successfully. No host home, credentials, customer repository or Docker socket was mounted. Only the pinned scratch source and test-output directory were mounted; module downloads used network access during the build.

Then exercised the built CLI and actual HTTP control plane/worker with synthetic Python executors in a disposable container with **network disabled**, no model credentials and resource limits. Six checks passed: repeatable init preserves config; workflow approval survives server/worker restart and returns artifacts; exit zero without a result stops progression; exit seven overrides a complete result; timeout stops a child process; and explicit cancellation stops the process group following heartbeat rejection. The fixture was corrected before the successful run (explicit unique step ID, actual response field and polling helper). These are real local process/API observations with synthetic work, not model-quality, customer isolation, live GitHub, VPS or end-to-end product results. Network-partition fencing and repo-wide exclusion still need an Arcitai integration proof. The test containers were removed after completion.

The three existing kit-export tests passed after the final policy/installation changes, including provenance, portable references and refusal to overwrite app files. Runtime code was not changed, so our full runtime suite was not repeated. Reviewed the 500-word HTML overview at measured CSS widths 2000 and 375: no page or text/table overflow, and keyboard focus reached a detail link with a solid outline. The narrow full-page capture showed stitching repetition; the DOM contains one roadmap and one footer, and viewport captures were inspected. Reset the viewport and closed only the test tab. Final check: 64 Markdown/HTML files, 236 local references and 20 anchors resolved; three runtime web routes were excluded from filesystem-link validation. An old section anchor was preserved for existing links. `git diff --check` passed.

Research, the transcript cache and Machinist source/build/test files remain in private task scratch under `work/`; no third-party code was copied into the product. No paid service, account change, VPS provisioning, real model run, GitHub write, merge, production action or incident connector was created. Existing published archives were not rebuilt from this checkout, which contains separate Defense work. Review was performed by the authoring agent.
