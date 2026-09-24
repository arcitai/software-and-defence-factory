---
name: factory-review
description: Review a factory result against its accepted scope and exact delivered revision. Use after an implementer produces evidence.
---

# factory-review

Read the accepted scope, diff and actual check artifacts. Use a distinct review context from implementation; preferably a separate verifier process or human. A different model name by itself does not establish independence.

Confirm the delivered commit, exercise the acceptance criteria and relevant regression paths, and assess correctness, maintainability and user-visible behavior. Tie every check to that full commit SHA. Changed scope or new code requires refreshed evidence. Never carry a previous attempt's check onto a new attempt.

Check the vertical slices against their claimed behavior: does each path run through the necessary layers, with integration and relevant failure evidence? Is the earlier working behavior preserved? Separate bounded prerequisite work and labeled mocks from completed behavior. A small diff or isolated layer tests alone do not establish a working slice. A slice checkpoint cannot establish completion of a larger accepted scope, and it does not require a new human approval merely because it is a checkpoint.

Compare before/after evidence where the claim needs it, using the same relevant workload and environment. Check that the required controls actually ran; an empty suite, placeholder command, or generic provider score cannot establish acceptance. Route specialist review by consequences such as authorization, data migration, dependencies or agent-policy changes, not merely diff size. Integration or rebase requires checking the resulting revision again. Keep review evidence private unless its destination is authorized.

Return accept recommendation, request changes or inconclusive with concrete evidence. Include limitations and measured review minutes. Review does not merge a PR or accept a task on the owner's behalf. If execution is still running or unknown, reconcile before further writers or acceptance. Use factory-security when a scoped security assessment is part of the accepted task.
