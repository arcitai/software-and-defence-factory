import { readFileSync } from "node:fs";
import { assessRecovery, triage } from "./flow.mjs";

// Deliberately replays only the bundled synthetic fixture: no arguments, network,
// operational persistence, model calls, notifications or production actions.
if (process.argv.length > 2) {
  console.error("Usage: node replay.mjs (bundled synthetic fixture only)");
  process.exitCode = 1;
} else {
  const fixture = JSON.parse(readFileSync(new URL("./examples/scenario.json", import.meta.url), "utf8"));
  if (fixture.synthetic !== true) throw new Error("Expected synthetic fixture");
  const cases = triage(fixture.service, fixture.signals, fixture.asOf);
  const incident = cases[0];
  const evidence = { ...fixture.verification, caseId: incident.id };
  const updatedService = { ...fixture.service, deployedRelease: evidence.targetRelease };
  console.log(JSON.stringify({
    synthetic: true,
    description: "Offline replay; no real signals, deployment, messages or evidence authenticated.",
    asOf: fixture.asOf,
    inputDeliveries: fixture.signals.length,
    cases,
    wrongRelease: assessRecovery(updatedService, incident, { ...evidence, observedRelease: "release-a" }, fixture.asOf),
    consistentRecord: assessRecovery(updatedService, incident, evidence, fixture.asOf),
  }, null, 2));
}
