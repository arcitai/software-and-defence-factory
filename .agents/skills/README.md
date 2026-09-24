# Factory skills

These six original, portable skills are project-local Markdown. They require no AIOS installation. A harness must discover `.agents/skills` or receive the selected SKILL.md explicitly. The export command `node scripts/export-kit.mjs NEW_OUTPUT_DIRECTORY` stages these skills with the portable adoption kit. Copy the needed folders into a target repository under its own accepted instructions before dispatch. Do not overwrite its AGENTS.md.

- [factory-triage](factory-triage/SKILL.md): Turn an incoming factory issue into a bounded disposition and capability request. Use before specification or implementation starts.
- [factory-spec](factory-spec/SKILL.md): Write an implementable factory task with observable acceptance criteria, required capabilities and a bounded verification plan.
- [factory-implement](factory-implement/SKILL.md): Implement one accepted factory job in its designated checkout and produce reproducible evidence for a separate review.
- [factory-review](factory-review/SKILL.md): Review a factory result against its accepted scope and exact delivered revision. Use after an implementer produces evidence.
- [factory-security](factory-security/SKILL.md): Perform the bounded security review requested by a factory task and separate candidate findings, validation and verified remediation.
- [factory-evaluate](factory-evaluate/SKILL.md): Run or assess a controlled comparison of factory configurations using fixed cases, evidence and complete cost accounting.

The human workflow has three steps: find and scope (`triage` + `spec`), implement and prove (`implement`, with `security` when needed), and review and hand back (`review`). `evaluate` is for controlled comparisons, not a mandatory extra agent on every job. Six instructions do not require six concurrent agents. See the [BuilderIO review](../../docs/builderio-review.md) from the repository root (`docs/builderio-review.md`).

The common skills work with a readable project installation record and issue/PR workflow; an Arcitai job bundle, server or dashboard is optional. Skills describe work; they do not install browsers, model endpoints, sandboxes or permissions. See [capabilities](../../config/profiles.json) through the repository root (`config/profiles.json`).
