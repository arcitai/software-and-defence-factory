import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "../src/store.mjs";
import { complete, requireThat } from "../src/domain.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
let store;
try {
  const [taskId, path] = process.argv.slice(2);
  requireThat(
    taskId && path,
    "Usage: node scripts/evidence.mjs TASK_ID evidence.json",
  );
  const evidence = JSON.parse(readFileSync(path, "utf8"));
  store = new Store(
    process.env.FACTORY_DB ?? resolve(root, ".factory/state.sqlite"),
  );
  store.transaction(() => {
    const task = store.get(taskId);
    complete(task, evidence);
    store.save(task);
  });
  console.log("Evidence imported. Human acceptance remains pending.");
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  store?.close();
}
