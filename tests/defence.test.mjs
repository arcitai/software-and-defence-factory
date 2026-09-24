import test from "node:test";
import assert from "node:assert/strict";
import { assessRecovery, coverageAt, triage } from "../experiments/defence-operations/flow.mjs";

const now = "2026-09-24T12:00:00.000Z";
const service = {
  tenant: "demo", service: "booking", environment: "production", repository: "example/booking", owner: "service-owner",
  deployedRelease: "release-a", coverage: [{ id: "uptime", capability: "availability", lastSuccessAt: now, maxAgeMinutes: 5 }],
  requiredVerificationChecks: ["booking-journey"], minimumObservationMinutes: 10, verificationMaxAgeMinutes: 15,
};
const signal = {
  id: "event-1", source: "monitor", tenant: "demo", service: "booking", environment: "production", episode: "outage-1",
  condition: "booking-fails", kind: "availability", severity: "warning", observedAt: "2026-09-24T11:00:00.000Z",
  deployedRelease: "release-a", summary: "Synthetic booking failure", evidenceRefs: ["evidence:fixture-1"],
};

test("defence groups one episode, ignores redelivery and retains escalation; recurrence is a new case", () => {
  const escalation = { ...signal, id: "event-2", severity: "critical", observedAt: "2026-09-24T11:01:00.000Z" };
  const repeat = { ...signal, id: "event-3", episode: "outage-2" };
  const cases = triage(service, [signal, signal, escalation, repeat], now);
  assert.equal(cases.length, 2);
  assert.equal(cases[0].occurrences, 2);
  assert.equal(cases[0].route, "on-call-now");
  assert.equal(cases[0].handoff.status, "draft-not-dispatched");
  assert.notEqual(cases[0].id, cases[1].id);
  assert.equal(triage(service, [escalation, signal], now)[0].id, cases[0].id);
});

test("defence refuses cross-customer/environment input, conflicting IDs and raw-log extras", () => {
  for (const changes of [{ tenant: "other" }, { environment: "staging" }, { rawLog: "private data" }, { observedAt: "2026-09-25T00:00:00.000Z" }, { evidenceRefs: ["https://logs.invalid/?token=secret"] }])
    assert.throws(() => triage(service, [{ ...signal, ...changes }], now));
  assert.throws(() => triage(service, [signal, { ...signal, severity: "critical" }], now), /Conflicting/);
  assert.notEqual(triage(service, [signal], now)[0].id, triage({ ...service, environment: "staging" }, [{ ...signal, environment: "staging" }], now)[0].id);
});

test("defence does not equate missing or stale sensor evidence with healthy operation", () => {
  assert.equal(coverageAt(service, now).status, "fresh");
  assert.equal(coverageAt({ ...service, coverage: [] }, now).status, "incomplete");
  for (const lastSuccessAt of [null, "2026-09-24T10:00:00.000Z", "2026-09-25T10:00:00.000Z"])
    assert.equal(coverageAt({ ...service, coverage: [{ ...service.coverage[0], lastSuccessAt }] }, now).status, "incomplete");
});

test("dependency matches remain maintenance candidates; unknown deployment or absent repo remains explicit", () => {
  const result = triage({ ...service, repository: null }, [{ ...signal, kind: "dependency", deployedRelease: "unmapped-release" }], now)[0];
  assert.equal(result.classification, "maintenance");
  assert.equal(result.releaseMismatch, true);
  assert.equal(result.handoff.destination, "service-owner-or-vendor");
  assert.equal(result.status, "triage-required");
});

test("recovery requires the right deployed release, fresh coverage, full window and passing production evidence", () => {
  const incident = triage(service, [signal], now)[0];
  const recoveredService = { ...service, deployedRelease: "release-b" };
  const evidence = {
    caseId: incident.id, tenant: "demo", service: "booking", environment: "production",
    targetRelease: "release-b", observedRelease: "release-b", changeRef: "change:fixture-fix", recordedBy: "fixture-verifier",
    deployedAt: "2026-09-24T11:40:00.000Z", windowStartedAt: "2026-09-24T11:45:00.000Z", windowEndedAt: now,
    checks: [{ id: "booking-journey", result: "passed", observedAt: now, release: "release-b", evidenceRefs: ["evidence:journey-pass"] }],
    evidenceRefs: ["evidence:deployed-release"],
  };
  const result = assessRecovery(recoveredService, incident, evidence, now);
  assert.equal(result.decision, "ready-for-closure-review");
  assert.equal(result.automaticallyClosed, false);
  assert.equal(result.basis, "submitted-record-only");
  for (const changes of [
    { observedRelease: "release-a" }, { caseId: "other-case" }, { tenant: "other" }, { environment: "staging" },
    { checks: [] }, { windowStartedAt: "2026-09-24T11:59:00.000Z" },
    { windowEndedAt: "2026-09-24T12:01:00.000Z" },
    { checks: [{ ...evidence.checks[0], result: "skipped" }] },
    { checks: [{ ...evidence.checks[0], result: "failed" }] },
    { checks: [{ ...evidence.checks[0], release: "release-a" }] },
    { checks: [{ ...evidence.checks[0], observedAt: "2026-09-24T11:00:00.000Z" }] },
  ]) assert.equal(assessRecovery(recoveredService, incident, { ...evidence, ...changes }, now).decision, "keep-open", JSON.stringify(changes));
  assert.equal(assessRecovery({ ...recoveredService, coverage: [] }, incident, evidence, now).decision, "keep-open");
  assert.equal(assessRecovery(recoveredService, { ...incident, releaseMismatch: true }, evidence, now).decision, "keep-open");
  assert.ok(assessRecovery(recoveredService, incident, evidence, "2026-09-24T13:00:00.000Z").reasons.includes("verification-stale"));
  assert.throws(() => assessRecovery(recoveredService, incident, { ...evidence, checks: [evidence.checks[0], evidence.checks[0]] }, now), /Duplicate/);
});
