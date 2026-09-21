import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { boundedText, requireThat } from "./domain.mjs";

export const suite = JSON.parse(
  readFileSync(new URL("../evals/suite.json", import.meta.url)),
);
export const inputDigest = createHash("sha256")
  .update(JSON.stringify(suite))
  .update(
    readFileSync(new URL("../evals/fixture/catalog.mjs", import.meta.url)),
  )
  .digest("hex");
export function validateEvaluation(input) {
  requireThat(
    input && input.suite === suite.id && input.inputDigest === inputDigest,
    "Resultatet skal bruge den aktuelle suite og inputDigest.",
  );
  requireThat(
    suite.cases.some((c) => c.id === input.caseId),
    "Ukendt evalueringsopgave.",
  );
  requireThat(
    Number.isSafeInteger(input.repetition) &&
      input.repetition >= 1 &&
      input.repetition <= 100,
    "Ugyldig gentagelse.",
  );
  requireThat(
    ["accepted", "rejected", "blocked", "failed"].includes(input.outcome),
    "Ugyldigt resultat.",
  );
  for (const key of ["activeMs", "reviewMinutes", "costEUR"])
    requireThat(
      input[key] === null || (Number.isFinite(input[key]) && input[key] >= 0),
      `Ugyldigt ${key}; ukendt skal være null.`,
    );
  requireThat(
    ["actual", "estimated", "unknown"].includes(input.costBasis),
    "Ugyldigt prisgrundlag.",
  );
  requireThat(
    input.costComplete === false ||
      (input.costComplete === true &&
        Number.isFinite(input.costEUR) &&
        input.costBasis !== "unknown"),
    "Komplet pris kræver en kendt post.",
  );
  requireThat(
    Number.isInteger(input.rubricPassed) &&
      input.rubricPassed >= 0 &&
      input.rubricPassed <= 4,
    "Rubric skal være 0–4 beståede kriterier.",
  );
  requireThat(
    input.outcome !== "accepted" || input.rubricPassed === 4,
    "Accept kræver alle fire rubric-kriterier.",
  );
  const result = {
    suite: input.suite,
    inputDigest,
    caseId: input.caseId,
    repetition: input.repetition,
    outcome: input.outcome,
    activeMs: input.activeMs,
    reviewMinutes: input.reviewMinutes,
    costEUR: input.costEUR,
    costBasis: input.costBasis,
    costComplete: input.costComplete,
    rubricPassed: input.rubricPassed,
  };
  for (const key of [
    "configuration",
    "model",
    "harness",
    "environment",
    "verifier",
    "evidence",
  ])
    result[key] = boundedText(input[key], key, 1000);
  result.recordedAt = new Date().toISOString();
  result.id = createHash("sha256")
    .update(
      JSON.stringify([
        result.suite,
        inputDigest,
        result.configuration,
        result.caseId,
        result.repetition,
      ]),
    )
    .digest("hex");
  return result;
}
export function summarizeEvaluations(results) {
  const current = results.filter((r) => r.inputDigest === inputDigest);
  return [...new Set(current.map((r) => r.configuration))].map(
    (configuration) => {
      const runs = current.filter((r) => r.configuration === configuration),
        accepted = runs.filter((r) => r.outcome === "accepted").length;
      const price = runs.reduce((n, r) => n + (r.costEUR ?? 0), 0),
        complete = runs.every((r) => r.costComplete);
      const coverage = new Set(runs.map((r) => r.caseId)).size;
      return {
        configuration,
        runs: runs.length,
        accepted,
        cases: coverage,
        requiredCases: suite.cases.length,
        costEUR: runs.some((r) => r.costEUR !== null) ? price : null,
        costPerAcceptedEUR: complete && accepted ? price / accepted : null,
        completeCosts: complete,
        estimated: runs.some((r) => r.costBasis === "estimated"),
        reviewMinutes: runs.every((r) => r.reviewMinutes !== null)
          ? runs.reduce((n, r) => n + r.reviewMinutes, 0)
          : null,
      };
    },
  );
}
