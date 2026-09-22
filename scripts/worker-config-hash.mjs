import { realpathSync } from "node:fs";
import { loadWorkerConfig } from "../src/worker-config.mjs";
const [adapter, config, workspace] = process.argv.slice(2);
try {
  if (!["pi", "security"].includes(adapter) || !config || !workspace)
    throw new Error("Usage: node scripts/worker-config-hash.mjs pi|security /private/worker.json /worker/checkout");
  console.log(loadWorkerConfig(config, realpathSync(workspace), adapter).hash);
} catch (error) { console.error(error.message); process.exitCode = 1; }
