---
name: factory-evaluate
description: Run or assess a controlled comparison of factory configurations using fixed cases, evidence and complete cost accounting.
---

# factory-evaluate

Read evals/suite.json for cases and the matching inputDigest. Freeze model/version, harness/version, worker resources, tools, context, limits and input revision. Give the implementer only the designated fixture and case; keep evals/oracle.md for the verifier.

Include the factory revision and the actual workflow/prompt/skill versions in the private evidence artifact. A change to these inputs is a different configuration even if the model name stays the same. Start with an explicit hypothesis; use matched inputs to assess it. For best-of-N, retain every candidate and charge the selection/review work to the cohort. Do not let a worker edit its own evaluation or automatically adopt a proposed skill change.

Use at least three repetitions per case/configuration for the pilot comparison. Keep failures, timeouts and capability blocks. Record inference, review-model and compute cost, allocation assumptions, active time, human review minutes and reproducible artifacts. Unknown is null, not zero. Mark estimates explicitly.

An independent reviewer scores the four rubric criteria, including whether the requested behavior actually works. Import its record with scripts/import-evaluation.mjs. This command validates format and duplicate identity; it does not authenticate the reviewer or prove the evidence.

Compare only matched case/repetition cohorts. Show acceptance rate and total cost per accepted result alongside human time, per-case variation and missed/false security findings. Do not use the operational demo, tokens/second or a single judge score as a claim of business ROI.
