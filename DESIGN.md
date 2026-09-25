---
name: Software & Defence Factory
version: 1
---

# Project work, clearly presented

The operator should immediately understand which project is selected, what is
running and what needs a decision. The dashboard is the human interface to the
same runtime used by the CLI. This is the implemented direction for issue #1. Optional project colors remain
a separate follow-up in #27.

## Reference and ownership

The owner selected [Build by Warp](https://build.warp.dev/) as the visual
reference. Its rendered overview was inspected on 25 September 2026 in desktop,
light and dark modes, with a narrow view. Follow its composition closely: a
roughly 203px navigation rail; main content beginning around 56px from the rail
with about 40px top spacing; a 36px project heading; compact toolbar; status
filters beside a fine-divided task list; restrained controls and progressive
task detail. Use Factory's own mark, name, records and actions. Do not use Warp
logos, media or source code.

The desktop composition is the fidelity target. At 320–390px, adapt the layout
so navigation and status filters collapse into labelled controls, rows stack
their metadata and all project identity and actions remain available. The
reference's clipped narrow view is not part of the target.

## Composition and navigation

- Keep the configured project name prominent across routes. Let long names and
  paths wrap safely; expose the full configured path as a secondary disclosure.
  Do not infer an owner/repository, source revision or active model from a path.
- Make Tasks the main view and default to its searchable list. Keep Board as an
  alternate view. Use a compact left status rail on wide screens and a labelled
  status selector at narrow widths.
- Show real Factory state groups and counts. Include queued/running work,
  failed or blocked work, review revision availability, pending acceptance,
  completed work, cancellation and unknown states. Do not imply that a GitHub
  backlog has synchronized.
- Make the task title, actual state and workflow phase, last activity and next
  operator action scannable in each row. Use the runtime's `updated_at` for
  activity. Put result, workflow stages, instructions, execution details,
  history and artifact controls in progressive task detail.
- Keep workers, machines, triggers, analytics and workflow descriptions
  accessible as secondary views. Worker health is not the primary work
  overview. Preserve existing actions and stale-action protection.
- One project/controller per dashboard. There is no global project hub.

## Typography, color and spacing

Use the self-hosted, pinned Geist variable font with system sans-serif
fallbacks. Match the reference's readable hierarchy: 36px/40px, weight 600 for
the project heading; 14px/20px for task titles; 12px/16px muted task metadata;
and 14px/20px toolbar text. Search and view controls are about 36px tall with
8px corners. List the most recently active tasks first, using recorded timestamps. Keep rows compact, with 12–14px vertical padding and fine
horizontal separators. Use about 40–56px main margins on desktop, 4/8px spacing
increments and modest 6–8px corners. Prefer flat surfaces and rare shadows.

The default visual palette is monochrome. Light mode uses white surfaces,
#0a0a0a text and #e5e5e5 borders. Dark mode uses #09090b surfaces, #f5f5f5
text and subtle charcoal borders. Primary controls are black in light mode and
white in dark mode. Small semantic status colors may mark success, attention
and failure, with text labels so color is never the only signal.

An optional reviewed project accent belongs to issue #27. Until that shared
theme contract is implemented, missing, invalid or unreadable project colors
use the complete monochrome default. Markdown prose is not executable theme
configuration and cannot load arbitrary CSS. A project theme does not change
shared control colors or state meanings.

## Truthful states and actions

Preserve actual queued, running, failed, timed-out, blocked, interrupted,
awaiting-acceptance, cancelled and completed distinctions. A failed review with
revision available stays failed and retains its revision flow. A successful
review waits for operator approval before handoff. A completed Factory workflow
is distinct from an agent's summary: run summaries are claims, and missing PR,
cost, model, usage, source-pin or readiness data stays unknown.

An old snapshot after a failed refresh must be marked stale and offer recovery.
Keep loading, initial status error, no tasks, no search/filter results, stale
data and synthetic demo states distinct. Search and status filters combine;
provide a clear reset. Keep cancel, retry, request changes and approval
semantically separate, with current-run guards. Artifact previews/downloads and
prior attempts remain reachable. Do not render raw model reasoning or
credentials as a result summary.

## Responsive and accessible behavior

Use semantic links and buttons, labelled search and status controls, visible
keyboard focus, associated form errors and status text independent of color.
Keep task titles and identity available at 320px; long text wraps without
overflow. Avoid motion beyond useful feedback and respect reduced motion.
Inspect desktop and narrow layouts in light and dark themes, including search,
filter combinations, keyboard navigation, long text, empty and failure states.

## Scope discipline

Preserve Factory capabilities while rebuilding the presentation. The shared
CLI/API and dashboard contract is issue #37. Issue browsing, setup controls,
PR actions or source admission need real common backend support; do not add
decorative controls or a separate UI-only execution path. Publishing the UI
uses the existing npm package/update flow and never replaces a running job's
controller mid-attempt.
