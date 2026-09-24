import { createHash } from "node:crypto";

// Offline reference flow, not an authenticated ingestion endpoint or case store.
const kinds = ["availability", "security", "dependency", "coverage"];
const severities = ["info", "warning", "critical"];
const serviceFields = ["tenant", "service", "environment", "repository", "owner", "deployedRelease", "coverage", "requiredVerificationChecks", "minimumObservationMinutes", "verificationMaxAgeMinutes"];
const signalFields = ["id", "source", "tenant", "service", "environment", "episode", "condition", "kind", "severity", "observedAt", "deployedRelease", "summary", "evidenceRefs"];

function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}
function shape(value, fields, label) {
  requireThat(value && typeof value === "object" && !Array.isArray(value), `${label}: expected object`);
  requireThat(Object.keys(value).length === fields.length && fields.every((key) => Object.hasOwn(value, key)), `${label}: missing or unknown fields`);
}
function text(value, label, max = 160) {
  requireThat(typeof value === "string" && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value), `${label}: invalid text`);
}
function timestamp(value, label) {
  requireThat(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, `${label}: expected UTC ISO timestamp`);
  return Date.parse(value);
}
function stringList(value, label, { min = 1 } = {}) {
  requireThat(Array.isArray(value) && value.length >= min && value.length <= 50, `${label}: invalid list`);
  for (const item of value) text(item, label);
  requireThat(new Set(value).size === value.length, `${label}: duplicate entries`);
}
function positive(value, label) {
  requireThat(Number.isFinite(value) && value > 0 && value <= 525600, `${label}: invalid positive number`);
}
function evidenceRefs(value) {
  stringList(value, "evidenceRefs");
  requireThat(value.every((ref) => /^evidence:[a-zA-Z0-9._-]+$/u.test(ref)), "Use opaque evidence IDs, not logs, URLs or credentials");
}

export function validateService(service) {
  shape(service, serviceFields, "service");
  for (const key of ["tenant", "service", "environment", "owner", "deployedRelease"]) text(service[key], key);
  if (service.repository !== null) text(service.repository, "repository");
  stringList(service.requiredVerificationChecks, "requiredVerificationChecks");
  positive(service.minimumObservationMinutes, "minimumObservationMinutes");
  positive(service.verificationMaxAgeMinutes, "verificationMaxAgeMinutes");
  requireThat(Array.isArray(service.coverage) && service.coverage.length <= 50, "coverage: invalid list");
  const ids = new Set();
  for (const sensor of service.coverage) {
    shape(sensor, ["id", "capability", "lastSuccessAt", "maxAgeMinutes"], "sensor");
    text(sensor.id, "sensor.id");
    text(sensor.capability, "sensor.capability");
    requireThat(!ids.has(sensor.id), "Duplicate sensor ID");
    ids.add(sensor.id);
    if (sensor.lastSuccessAt !== null) timestamp(sensor.lastSuccessAt, "lastSuccessAt");
    positive(sensor.maxAgeMinutes, "maxAgeMinutes");
  }
  return service;
}

export function coverageAt(service, asOf) {
  validateService(service);
  const now = timestamp(asOf, "asOf");
  const sensors = service.coverage.map((sensor) => {
    const age = sensor.lastSuccessAt === null ? null : now - Date.parse(sensor.lastSuccessAt);
    const status = age === null || age < 0 ? "unknown" : age > sensor.maxAgeMinutes * 60000 ? "stale" : "fresh";
    return { id: sensor.id, capability: sensor.capability, status };
  });
  return { status: sensors.length && sensors.every((sensor) => sensor.status === "fresh") ? "fresh" : "incomplete", sensors };
}

export function triage(service, signals, asOf) {
  validateService(service);
  const now = timestamp(asOf, "asOf");
  requireThat(Array.isArray(signals) && signals.length <= 1000, "signals: expected bounded batch");
  const seen = new Map(), groups = new Map();
  for (const signal of signals) {
    shape(signal, signalFields, "signal");
    for (const key of signalFields.filter((key) => key !== "evidenceRefs")) text(signal[key], key, key === "summary" ? 500 : 160);
    for (const key of ["tenant", "service", "environment"]) requireThat(signal[key] === service[key], `Signal ${key} does not match selected service`);
    requireThat(timestamp(signal.observedAt, "observedAt") <= now, "Future signal requires clock reconciliation");
    requireThat(kinds.includes(signal.kind) && severities.includes(signal.severity), "Unknown kind or severity");
    evidenceRefs(signal.evidenceRefs);
    const eventKey = JSON.stringify([signal.source, signal.id]);
    const payload = JSON.stringify(signalFields.map((key) => signal[key]));
    if (seen.has(eventKey)) {
      requireThat(seen.get(eventKey) === payload, "Conflicting delivery for same source/event ID");
      continue;
    }
    seen.set(eventKey, payload);
    const key = JSON.stringify([signal.tenant, signal.service, signal.environment, signal.source, signal.kind, signal.condition, signal.episode]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(signal);
  }
  const coverage = coverageAt(service, asOf);
  return [...groups].map(([key, events]) => {
    events.sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.id.localeCompare(b.id));
    const first = events[0], last = events.at(-1);
    const severity = severities[Math.max(...events.map((signal) => severities.indexOf(signal.severity)))];
    const releaseMismatch = events.some((signal) => signal.deployedRelease !== service.deployedRelease);
    const classification = { availability: "incident-candidate", security: "security-candidate", dependency: "maintenance", coverage: "coverage-gap" }[first.kind];
    return {
      id: `defence-${createHash("sha256").update(key).digest("hex").slice(0, 24)}`,
      tenant: service.tenant, service: service.service, environment: service.environment,
      kind: first.kind, episode: first.episode, condition: first.condition,
      status: "triage-required", classification, severity,
      owner: service.owner, repository: service.repository,
      firstObservedAt: first.observedAt, lastObservedAt: last.observedAt,
      occurrences: events.length, signalIds: events.map((signal) => signal.id),
      summary: last.summary, deployedRelease: service.deployedRelease,
      evidenceRefs: [...new Set(events.flatMap((signal) => signal.evidenceRefs))],
      coverage, releaseMismatch,
      route: severity === "critical" ? "on-call-now" : first.kind === "dependency" ? "maintenance-review" : "owner-triage",
      handoff: {
        destination: service.repository === null ? "service-owner-or-vendor" : "software-factory-or-existing-team",
        status: "draft-not-dispatched",
        requestedOutcome: "Confirm impact and cause; define one bounded remediation slice with acceptance checks.",
        productionVerification: [...service.requiredVerificationChecks],
        missingBeforeDispatch: ["validated-impact", "accepted-change-scope", "reproduction-or-evidence-review", "rollback-or-recovery-plan"],
      },
    };
  });
}

// Checks the submitted record's consistency. It does not run production checks,
// authenticate attestations, prove causality or close an incident automatically.
export function assessRecovery(service, incident, evidence, asOf) {
  validateService(service);
  const now = timestamp(asOf, "asOf");
  shape(evidence, ["caseId", "tenant", "service", "environment", "targetRelease", "observedRelease", "changeRef", "deployedAt", "windowStartedAt", "windowEndedAt", "recordedBy", "checks", "evidenceRefs"], "verification");
  for (const key of ["caseId", "tenant", "service", "environment", "targetRelease", "observedRelease", "changeRef", "recordedBy"]) text(evidence[key], key);
  evidenceRefs(evidence.evidenceRefs);
  const deployed = timestamp(evidence.deployedAt, "deployedAt");
  const start = timestamp(evidence.windowStartedAt, "windowStartedAt");
  const end = timestamp(evidence.windowEndedAt, "windowEndedAt");
  const firstObserved = timestamp(incident.firstObservedAt, "firstObservedAt");
  const reasons = [];
  for (const key of ["tenant", "service", "environment"]) {
    if (evidence[key] !== service[key] || incident[key] !== service[key]) reasons.push(`${key}-mismatch`);
  }
  if (evidence.caseId !== incident.id) reasons.push("case-mismatch");
  if (incident.releaseMismatch !== false) reasons.push("baseline-release-unreconciled");
  if (evidence.targetRelease !== evidence.observedRelease || evidence.observedRelease !== service.deployedRelease) reasons.push("deployed-release-mismatch");
  if (deployed < firstObserved || start < deployed || end < start || end > now) reasons.push("invalid-observation-window");
  if (end - start < service.minimumObservationMinutes * 60000) reasons.push("observation-too-short");
  if (now - end > service.verificationMaxAgeMinutes * 60000) reasons.push("verification-stale");
  if (coverageAt(service, asOf).status !== "fresh") reasons.push("sensor-coverage-incomplete");
  requireThat(Array.isArray(evidence.checks) && evidence.checks.length <= 50, "checks: invalid list");
  const checks = new Map();
  for (const check of evidence.checks) {
    shape(check, ["id", "result", "observedAt", "release", "evidenceRefs"], "check");
    text(check.id, "check.id");
    text(check.release, "check.release");
    requireThat(["passed", "failed", "skipped", "unknown"].includes(check.result), "Invalid check result");
    requireThat(!checks.has(check.id), "Duplicate verification check");
    checks.set(check.id, check);
    evidenceRefs(check.evidenceRefs);
    const at = timestamp(check.observedAt, "check.observedAt");
    if (at < start || at > end || check.release !== evidence.observedRelease || check.result !== "passed") reasons.push(`check-not-qualified:${check.id}`);
  }
  for (const id of service.requiredVerificationChecks) if (!checks.has(id)) reasons.push(`missing-check:${id}`);
  return {
    caseId: incident.id,
    decision: reasons.length ? "keep-open" : "ready-for-closure-review",
    reasons,
    basis: "submitted-record-only",
    automaticallyClosed: false,
  };
}
