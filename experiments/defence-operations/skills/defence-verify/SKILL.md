---
name: defence-verify
description: Assess whether a defence case has sufficient post-change evidence from the affected running environment for closure, and record remaining remediation, coverage and value measurements.
---

# Verify the running outcome

Experimental operations profile. This is not the full Defence Factory workflow.

Read the accepted case, service-specific checks and observation policy. Use `experiments/defence-operations/case.md` and `policy.md` when staged, or their `experiments/defence-operations/` equivalents in the source repository.

1. Independently inspect evidence for the affected tenant, service and environment. Confirm the actual deployed artifact/revision from an authorized source; do not infer deployment from branch HEAD or PR merge.
2. Run or inspect the authorized production checks appropriate to the case. Check the affected user journey and, for a vulnerability, the remediation and relevant deployed dependencies. A confirmed compromise may require additional incident-response evidence before closure. Do not cause destructive probes or real customer transactions without accepted scope.
3. Require fresh sensor coverage and an adequate observation window after the change. Failed, missing, skipped or stale evidence leaves uncertainty visible. A resolved alert alone does not establish cause removal.
4. Recommend closure, continued observation, further response or a new/reopened episode with reasons. Separate verified restoration, temporary mitigation and permanent fix. Link remaining tasks. Follow the installation's closure authority.
5. Record first-known-observation → acknowledgment → mitigation → verified restoration separately, plus noise/recurrence, coverage, all attempts, human time and actual/estimated costs. Compare with a recorded baseline only; synthetic replay is not measured customer value.

The optional offline `assessRecovery` helper checks submitted records for consistency. It authenticates no evidence and never closes a live case. Inspect source evidence even when the helper says ready for closure review.
