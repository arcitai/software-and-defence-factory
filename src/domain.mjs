import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

export const profiles = JSON.parse(
  readFileSync(new URL("../config/profiles.json", import.meta.url)),
);
export const stages = [
  "inbox",
  "spec",
  "ready",
  "running",
  "review",
  "accepted",
  "blocked",
];
export const stageNames = {
  inbox: "Indbakke",
  spec: "Afklaring",
  ready: "Klar",
  running: "I arbejde",
  review: "Review",
  accepted: "Accepteret",
  blocked: "Blokeret",
};
export class Fault extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
export function requireThat(condition, message, status) {
  if (!condition) throw new Fault(message, status);
}
export function boundedText(value, name, max = 4000) {
  requireThat(
    typeof value === "string" && value.trim().length > 0 && value.length <= max,
    `${name} mangler eller er for langt.`,
  );
  return value.trim();
}
export function hashScope(task) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        task.repo,
        task.title,
        task.body,
        task.acceptance,
        task.requirements,
        task.profile,
      ]),
    )
    .digest("hex");
}
export function newTask(input, source = "local") {
  const profile = input.profile ?? "codex-local";
  requireThat(
    profiles.some((p) => p.id === profile),
    "Ukendt profil.",
  );
  const repo = boundedText(input.repo ?? "kastanje/pilot", "Repository", 160);
  requireThat(
    /^[\w.-]+\/[\w.-]+$/.test(repo),
    "Repository skal være owner/repo.",
  );
  const requirements = input.requirements ?? ["files", "shell", "git", "tests"];
  requireThat(
    Array.isArray(requirements) &&
      requirements.length <= 12 &&
      requirements.every((r) =>
        [
          "files",
          "shell",
          "git",
          "tests",
          "web",
          "browser",
          "computer",
          "security",
        ].includes(r),
      ),
    "Ugyldige capability-krav.",
  );
  return {
    id: randomUUID(),
    title: boundedText(input.title, "Titel", 200),
    body: boundedText(input.body, "Beskrivelse", 12000),
    acceptance: boundedText(input.acceptance, "Acceptkriterier", 5000),
    repo,
    profile,
    requirements,
    source,
    stage: "inbox",
    revision: 1,
    approval: null,
    attempts: [],
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
export function event(task, kind, text) {
  task.events.push({ kind, text, at: new Date().toISOString() });
  task.updatedAt = new Date().toISOString();
  task.revision++;
}
export function activeAttempt(task) {
  return task.attempts.find((a) =>
    ["prepared", "running", "unknown"].includes(a.status),
  );
}
export function approveScope(task) {
  requireThat(
    ["inbox", "spec", "blocked", "ready"].includes(task.stage) &&
      !activeAttempt(task),
    "Opgaven kan ikke godkendes i denne tilstand.",
    409,
  );
  requireThat(
    !task.acceptance.startsWith("Fastlæg konkrete acceptkriterier"),
    "Skriv konkrete acceptkriterier før godkendelse.",
    409,
  );
  task.approval = { hash: hashScope(task), at: new Date().toISOString() };
  task.stage = "ready";
  event(
    task,
    "approval",
    "Opgavens mål, profil og acceptkriterier er godkendt.",
  );
}
export function prepare(task) {
  requireThat(
    task.stage === "ready" && task.approval?.hash === hashScope(task),
    "Godkend det aktuelle scope først.",
    409,
  );
  requireThat(
    !activeAttempt(task),
    "Der findes allerede et aktivt forsøg.",
    409,
  );
  requireThat(
    task.attempts.filter((a) => !["cancelled", "prepared"].includes(a.status))
      .length < 3,
    "Grænsen på første forsøg og to reparationer er nået. Afklar en ny plan.",
    409,
  );
  const attempt = {
    id: randomUUID(),
    status: "prepared",
    profile: task.profile,
    scopeHash: hashScope(task),
    preparedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    head: null,
    costs: [],
    activeMs: null,
    reviewMinutes: null,
    checks: [],
    security: "unassessed",
    provenance: task.source === "demo" ? "synthetic" : "observed",
  };
  task.attempts.push(attempt);
  event(task, "prepared", "Jobpakke klar. Ingen agent er startet.");
  return attempt;
}
export function canAccept(task) {
  const a = task.attempts.at(-1);
  return !!(
    task.stage === "review" &&
    a?.status === "completed" &&
    a.head &&
    a.checks.length &&
    a.checks.every((c) => c.status === "passed" && c.head === a.head) &&
    a.security === "reviewed" &&
    task.approval?.hash === hashScope(task)
  );
}
export function accept(task, head) {
  requireThat(
    canAccept(task),
    "Accept kræver aktuelle checks, sikkerhedsreview og uændret scope.",
    409,
  );
  requireThat(
    head === task.attempts.at(-1).head,
    "Review gælder ikke den aktuelle commit.",
    409,
  );
  task.stage = "accepted";
  task.acceptedAt = new Date().toISOString();
  event(
    task,
    "accepted",
    "Resultat accepteret lokalt. GitHub merge og deploy er separate handlinger.",
  );
}
export function complete(task, evidence) {
  const a = task.attempts.at(-1);
  requireThat(
    a && ["prepared", "awaiting-evidence"].includes(a.status),
    "Forsøget skal være afsluttet eller en ekstern overdragelse før evidensimport.",
    409,
  );
  requireThat(
    evidence.attemptId === a.id &&
      evidence.scopeHash === a.scopeHash &&
      a.scopeHash === hashScope(task),
    "Beviset tilhører et andet forsøg eller scope.",
    409,
  );
  requireThat(
    /^[a-f0-9]{40}$/.test(evidence.head ?? ""),
    "Beviset kræver en fuld commit-SHA.",
  );
  requireThat(
    Array.isArray(evidence.checks) &&
      evidence.checks.length <= 30 &&
      evidence.checks.every(
        (c) =>
          typeof c.name === "string" &&
          c.name.length <= 200 &&
          ["passed", "failed", "unknown"].includes(c.status) &&
          /^[a-f0-9]{40}$/.test(c.head ?? ""),
      ),
    "Ugyldige checks.",
  );
  requireThat(
    ["unassessed", "reviewed", "finding", "inconclusive"].includes(
      evidence.security,
    ),
    "Ugyldig security-status.",
  );
  requireThat(
    evidence.activeMs == null ||
      (Number.isFinite(evidence.activeMs) && evidence.activeMs >= 0),
    "Ugyldig køretid.",
  );
  requireThat(
    evidence.reviewMinutes == null ||
      (Number.isFinite(evidence.reviewMinutes) && evidence.reviewMinutes >= 0),
    "Ugyldig reviewtid.",
  );
  requireThat(
    Array.isArray(evidence.costs) &&
      evidence.costs.length <= 30 &&
      evidence.costs.every(
        (c) =>
          Number.isFinite(c.amount) &&
          c.amount >= 0 &&
          c.currency === "EUR" &&
          ["actual", "estimated"].includes(c.basis) &&
          typeof c.component === "string" &&
          c.component.length <= 80,
      ),
    "Ugyldige omkostninger. Brug EUR; ukendt registreres som manglende.",
  );
  requireThat(
    !evidence.costComplete || evidence.costs.length > 0,
    "Komplet pris kræver mindst én post; registrér kendt nul eksplicit.",
  );
  Object.assign(a, {
    head: evidence.head,
    checks: evidence.checks,
    security: evidence.security,
    costs: evidence.costs,
    costComplete: evidence.costComplete === true,
    activeMs: evidence.activeMs ?? null,
    reviewMinutes: evidence.reviewMinutes ?? null,
    status: "completed",
    endedAt: new Date().toISOString(),
  });
  task.stage = "review";
  event(
    task,
    "evidence",
    "Bevis importeret fra operatøren. Klar til vurdering.",
  );
}
export function metrics(tasks) {
  const attempts = tasks.flatMap((t) => t.attempts);
  const accepted = tasks.filter((t) => t.stage === "accepted");
  const cost = attempts.reduce(
    (sum, a) => sum + a.costs.reduce((n, c) => n + c.amount, 0),
    0,
  );
  const known = attempts.filter((a) => a.costComplete === true).length;
  const durations = attempts
    .map((a) => a.activeMs)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const median = durations.length
    ? (durations[Math.floor((durations.length - 1) / 2)] +
        durations[Math.floor(durations.length / 2)]) /
      2
    : null;
  const review = attempts.map((a) => a.reviewMinutes).filter(Number.isFinite);
  return {
    tasks: tasks.length,
    attempts: attempts.length,
    accepted: accepted.length,
    knownCostEUR: attempts.some((a) => a.costs.length) ? cost : null,
    estimatedCosts: attempts.some((a) =>
      a.costs.some((c) => c.basis === "estimated"),
    ),
    costCoverage: attempts.length ? known / attempts.length : null,
    completeCosts: attempts.length > 0 && known === attempts.length,
    costPerAcceptedEUR:
      accepted.length && known === attempts.length
        ? cost / accepted.length
        : null,
    medianActiveMs: median,
    reviewMinutes: review.length ? review.reduce((a, b) => a + b, 0) : null,
    reviewCoverage: attempts.length ? review.length / attempts.length : null,
    repairs: tasks.reduce(
      (sum, t) => sum + Math.max(0, t.attempts.length - 1),
      0,
    ),
  };
}
