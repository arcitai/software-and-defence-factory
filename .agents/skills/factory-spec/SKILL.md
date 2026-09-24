---
name: factory-spec
description: Write an implementable factory task with observable acceptance criteria, required capabilities and a bounded verification plan.
---

# factory-spec

Use the supplied business outcome and repository facts to write a short task: problem, intended behavior, allowed changes, exclusions, required capabilities, verification, risk and recovery. For uncertain implementation choices, propose a small experiment with a stop condition.

A new feature may need both product behavior and technical approach; do not force two long documents for a simple repair. Reference the relevant code and existing test commands. Unknown facts stay unknown. Specify which evidence would settle them.

Plan substantial implementation as vertical slices: each delivers one observable behavior through the necessary layers, with an executable check and relevant failure case. Identify the first runnable slice and a short extension order. Do not make database, backend and frontend separate delivery phases. Tie prerequisite work to its consuming slice; small fixes may be one slice. Slice boundaries organize work within the accepted scope and do not create additional approval gates.

The owner accepts title, body, repository, profile, capability requirements and acceptance criteria as one scope. Any later change invalidates that approval. Produce the proposed scope; do not invent approval or start an implementation job.
