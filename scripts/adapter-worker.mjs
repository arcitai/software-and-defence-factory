import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runPi } from "../src/pi-worker.mjs";
import { runSecurity } from "../src/security-worker.mjs";

// Only the trusted launcher supplies this envelope; issue text is nested data.
const abort = new AbortController();
process.on("SIGTERM", () => abort.abort());
process.on("SIGINT", () => abort.abort());
try {
  const job = JSON.parse(readFileSync(0, "utf8"));
  const common = { config: job.config, workspace: process.cwd(), signal: abort.signal };
  const result = job.adapter === "pi"
    ? await runPi({ ...common, prompt: job.prompt, onEvent: event => process.stdout.write(JSON.stringify(event) + "\n") })
    : await runSecurity({ ...common, prompt: join(job.jobDir, "prompt.txt"), outputDir: join(job.jobDir, "scan"), base: job.base });
  if (abort.signal.aborted) throw new Error("Worker cancelled.");
  writeFileSync(join(job.jobDir, "worker-result.json"), JSON.stringify({
    version: 1, attemptId: job.attemptId, scopeHash: job.scopeHash, base: job.base,
    status: "completed", ...result,
  }, null, 2), { mode: 0o600, flag: "wx" });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
