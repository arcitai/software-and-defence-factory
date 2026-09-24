# Arcitai Software and Security Factory visual direction

Audience: a business/technical owner deciding what needs attention, whether a result is supported by evidence and which setup is appropriate. Primary task: move a clearly scoped job through implementation and review with visible quality/cost boundaries.

The design uses a quiet off-white workspace, muted green navigation, dark green primary actions, thin borders and compact list rows. Persistent navigation separates work, GitHub PRs, metrics, capabilities, security and setup. Typography uses system fonts; no external font service, images or analytics. It is an original implementation, informed by Warp's issue-first workflow, not a clone of its branding or layout.

The work view prioritizes review count, accepted results, known cost and active time. A right-hand review panel identifies the next decision. Task dialogs disclose scope, requirements, exact evidence, costs and available actions. Demo, unknown and unconfigured states are explicit. Secondary data is available without turning every task into an interview.

Native dialogs, labeled form fields, visible focus, a skip link, semantic headings and reduced-motion styles support keyboard and accessibility basics. Narrow layouts stack the main panels and expose navigation horizontally; wide tables scroll within their panel rather than overflowing the page. Visual and interaction checks are recorded in docs/proof.md.

The benchmark area separates operational tasks from fixed-case evaluations. It must never use synthetic demo costs to declare a cheaper model or a quality winner. Implementation terms belong mainly under Setup/capability details and the repository docs.

## Next onboarding increment (proposed)

For the VPS/local package described in `docs/platform.md`, reuse Machinist’s existing UI first. The existing Arcitai visual system is a reference for necessary additions, not a requirement to replace its whole interface. The next flow is connect one repo, select an available worker and model, discover setup/check commands, run a real environment check, then start one small issue. Show missing access and unknown proof inline; never label copied skill files as a working installation. Machine provisioning is separate from app production hosting.

Prioritize Tasks, Review, Measurements and Setup. Put runtime/terminal details behind each job; no graph editor is required for the first task. Display concrete automation permissions, freshness, offline worker state and separate pause-new-work / stop-active-job actions. Preserve GitHub issue/PR links. The selected product direction shares one installation and dashboard across software, security and optional Defense workflows. Preserve workflow-specific authority, private evidence and incident-to-repair links; adding a tab alone does not implement these integrations. `DESIGN.md` governs presentation, not the adopting app's product mission or acceptance tests.
