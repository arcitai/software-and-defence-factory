---
name: factory-review
description: Review a factory result against its accepted scope and exact delivered revision. Use after an implementer produces evidence.
---

# factory-review

Read the accepted scope, diff and actual check artifacts. Use a distinct review context from implementation; preferably a separate verifier process or human. A different model name by itself does not establish independence.

Confirm the delivered commit, exercise the acceptance criteria and relevant regression paths, and assess correctness, maintainability and user-visible behavior. Tie every check to that full commit SHA. Changed scope or new code requires refreshed evidence. Never carry a previous attempt's check onto a new attempt.

Return accept recommendation, request changes or inconclusive with concrete evidence. Include limitations and measured review minutes. Review does not merge a PR or accept a task on the owner's behalf. If execution is still running or unknown, reconcile before further writers or acceptance. Use factory-security when a scoped security assessment is part of the accepted task.
