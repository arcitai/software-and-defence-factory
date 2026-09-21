import { Store } from "../src/store.mjs";
import { event, requireThat } from "../src/domain.mjs";
import { fileURLToPath } from "node:url";
const [id, note] = process.argv.slice(2);
const store = new Store(
  process.env.FACTORY_DB ??
    fileURLToPath(new URL("../.factory/state.sqlite", import.meta.url)),
);
try {
  requireThat(
    id && note?.length >= 20,
    'Brug: node scripts/reconcile.mjs TASK_ID "Bevis for at worker og underprocesser er stoppet ..."',
  );
  store.transaction(() => {
    const t = store.get(id),
      a = t.attempts.at(-1);
    requireThat(
      a && ["running", "unknown"].includes(a.status),
      "Kun running/unknown kan afstemmes.",
    );
    a.status = "awaiting-evidence";
    a.endedAt = new Date().toISOString();
    a.reconciliation = note;
    t.stopRequested = false;
    t.stage = "review";
    event(
      t,
      "reconciled",
      "Operatør har bekræftet worker stoppet. Evidens mangler.",
    );
    store.save(t);
  });
  console.log(
    "Recorded operator stop confirmation. This command does not stop a process.",
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  store.close();
}
