import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Store } from "../src/store.mjs";
import { validateEvaluation, inputDigest } from "../src/evaluations.mjs";
if (!process.argv[2]) {
  console.log(
    `Usage: node scripts/import-evaluation.mjs result.json\nCurrent inputDigest: ${inputDigest}`,
  );
  process.exitCode = 1;
} else {
  const store = new Store(
    process.env.FACTORY_DB ??
      fileURLToPath(new URL("../.factory/state.sqlite", import.meta.url)),
  );
  try {
    const result = validateEvaluation(
      JSON.parse(readFileSync(process.argv[2], "utf8")),
    );
    store.transaction(() => store.insertEvaluation(result));
    console.log(
      `Imported ${result.caseId} / ${result.configuration} / repetition ${result.repetition}. Operator-supplied evidence; not independently authenticated by this script.`,
    );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    store.close();
  }
}
