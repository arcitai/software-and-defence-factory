import { newTask, approveScope, prepare, complete, accept } from "./domain.mjs";
export function demoTasks() {
  const definitions = [
    [
      "Vis en forståelig fejl, når modellen ikke er tilgængelig",
      "review",
      "codex-kastanje",
      0.34,
      18,
    ],
    [
      "Kontrollér agentforbindelsen uden et betalt modelkald",
      "ready",
      "codex-local",
      null,
      null,
    ],
    [
      "Redigér følsomme felter i delbare fejlrapporter",
      "inbox",
      "codex-security",
      null,
      null,
    ],
    ["Afprøv tool calling på ROG Flow Z13", "spec", "codex-oss", null, null],
    [
      "Gør forbrugsoversigten tydelig ved en timeout",
      "accepted",
      "cursor-cloud",
      1.42,
      26,
    ],
    [
      "Dokumentér endpoint og projektnøgle i opsætningen",
      "accepted",
      "codex-kastanje",
      0.21,
      12,
    ],
    [
      "Bevar usikkert forbrug ved afbrudt upstream-kald",
      "blocked",
      "codex-local",
      null,
      null,
    ],
  ];
  return definitions.map(([title, stage, profile, cost, minutes], index) => {
    const t = newTask(
      {
        title,
        repo: "kastanje/pilot",
        profile,
        body: "Syntetisk pilotopgave til at afprøve factoryens arbejdsgang. Ingen kundeoplysninger eller live produktændringer.",
        acceptance:
          "Normaltilstand og fejltilstand afprøves. Ingen nøgler i output. Uafhængige checks følger den aktuelle commit.",
        requirements: [
          "files",
          "shell",
          "git",
          "tests",
          ...(index === 0 ? ["browser"] : []),
        ],
      },
      "demo",
    );
    t.displayNumber = 42 + index;
    if (["ready", "review", "accepted"].includes(stage)) approveScope(t);
    if (cost !== null) {
      const a = prepare(t);
      a.startedAt = new Date(Date.now() - minutes * 60000).toISOString();
      complete(t, {
        attemptId: a.id,
        scopeHash: a.scopeHash,
        head: String(index + 1).repeat(40),
        checks: [
          {
            name: "Regressionstest",
            status: "passed",
            head: String(index + 1).repeat(40),
          },
          {
            name: "UI-gennemgang",
            status: "passed",
            head: String(index + 1).repeat(40),
          },
        ],
        security: "reviewed",
        costs: [
          {
            component: "Inference",
            amount: cost,
            currency: "EUR",
            basis: "estimated",
          },
        ],
        costComplete: true,
        activeMs: minutes * 60000,
        reviewMinutes: 4 + index,
      });
      if (stage === "accepted") accept(t, a.head);
    } else t.stage = stage;
    return t;
  });
}
