// Opt-in proof using installed Pi and Security SDK, synthetic inference and disposable state.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Store } from "../src/store.mjs";
import { runSecurity } from "../src/security-worker.mjs";
import { fixture, configure, launch, root } from "../tests/helpers/worker-fixture.mjs";

const path = process.env.PATH;
// The proof cannot inherit provider or personal app credentials.
for (const key of Object.keys(process.env)) delete process.env[key];
process.env.PATH = path;
const version = spawnSync("pi", ["--version"], { encoding: "utf8", timeout: 5000, env: { PATH: path, PI_OFFLINE: "1", PI_TELEMETRY: "0" } });
assert.equal(version.status, 0, "Install Pi on the dedicated worker before this opt-in probe.");
const f = fixture("pi-custom");
let requests = 0, readResult = false, providerError, running;
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.url, "/v1/chat/completions");
    let body = "";
    for await (const chunk of req) { body += chunk; assert.ok(body.length < 256000); }
    const payload = JSON.parse(body);
    assert.equal(payload.model, "factory-probe");
    assert.deepEqual(payload.tools.map(t => t.function.name).sort(), ["bash", "edit", "read", "write"]);
    requests++;
    assert.ok(requests <= 2);
    const tool = requests === 1;
    if (!tool) readResult = payload.messages.some(m => m.role === "tool" && JSON.stringify(m.content).includes("fixture"));
    res.writeHead(200, { "content-type": "text/event-stream" });
    const chunk = (delta, finish = null, usage) => res.write(`data: ${JSON.stringify({ id: "synthetic", object: "chat.completion.chunk", created: 1, model: "factory-probe", choices: [{ index: 0, delta, finish_reason: finish }], ...(usage ? { usage } : {}) })}\n\n`);
    chunk({ role: "assistant", ...(tool ? { tool_calls: [{ index: 0, id: "read-fixture", type: "function", function: { name: "read", arguments: '{"path":"input.txt"}' } }] } : { content: "SYNTHETIC_RESULT\u2028one record" }) });
    chunk({}, tool ? "tool_calls" : "stop", { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 });
    res.end("data: [DONE]\n\n");
  } catch (error) { providerError = error; res.destroy(); }
});
try {
  process.env.HOME = f.home;
  process.env.CODEX_HOME = f.home;
  const { config, save } = configure(f);
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  writeFileSync(join(config.agentDir, "settings.json"), JSON.stringify({ defaultProjectTrust: "never", enableInstallTelemetry: false, retry: { enabled: false }, compaction: { enabled: false } }));
  writeFileSync(join(config.agentDir, "models.json"), JSON.stringify({ providers: { "factory-probe": {
    baseUrl: `http://127.0.0.1:${server.address().port}/v1`, api: "openai-completions", apiKey: "synthetic-no-key",
    models: [{ id: "factory-probe", reasoning: false, input: ["text"], contextWindow: 32768, maxTokens: 2048 }],
  } } }));
  save();
  running = launch(f);
  const timer = setTimeout(() => running.child.kill("SIGTERM"), 25000);
  let ended;
  try { ended = await running.done; } finally { clearTimeout(timer); }
  if (providerError) throw providerError;
  assert.equal(ended.code, 0, ended.output);
  assert.equal(requests, 2); assert.equal(readResult, true);
  const store = new Store(f.db);
  try {
    const a = store.get(f.task.id).attempts[0];
    assert.equal(a.status, "awaiting-evidence"); assert.deepEqual(a.costs, []);
    const result = JSON.parse(readFileSync(join(root, ".factory/jobs", a.id, "worker-result.json")));
    assert.equal(result.usage.input, 200); assert.equal(result.usage.output, 20);
  } finally { store.close(); }
  const context = join(f.dir, "scan-context.md"); writeFileSync(context, "Synthetic report contract probe only.");
  const security = await runSecurity({ config: { model: "synthetic", provider: "openai" }, workspace: f.workspace,
    base: f.git("rev-parse", "HEAD"), prompt: context, outputDir: join(f.dir, "scan"), mock: true });
  assert.equal(security.synthetic, true); assert.equal(security.findingsCount, 12);
  const noAuth = fixture("codex-security");
  try {
    const c = configure(noAuth);
    Object.assign(c.config, { provider: "openai", model: "synthetic", auth: "api-key", credentialEnv: [] }); c.save();
    const failed = await launch(noAuth).done;
    assert.equal(failed.code, 1);
    const log = readFileSync(join(root, ".factory/jobs", noAuth.task.attempts[0].id, "worker-output.log"), "utf8");
    assert.match(log, /API.key|credential|authentication/i, "SDK must fail for missing authentication");
    const journal = new Store(noAuth.db);
    try { assert.equal(journal.get(noAuth.task.id).attempts[0].status, "failed"); } finally { journal.close(); }
  } finally { noAuth.cleanup(); }
  console.log(JSON.stringify({ result: "passed", provenance: "synthetic", piVersion: version.stdout.trim(),
    securitySDK: "0.1.29", securityPlugin: security.pluginVersion,
    checks: ["prepared job through real Pi RPC and read tool to journal", "usage preserved; unknown billing stays unknown", "official Security SDK mock emits sealed report, findings and coverage on exact commit", "real Security adapter records missing authentication as failure"],
    externalModelCalls: 0, limitations: ["No real model-quality/security evaluation", "No OS sandbox proof", "No browser, desktop, Kastanje or live billing trial"] }, null, 2));
} finally {
  running?.child.kill("SIGTERM");
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  f.cleanup();
}
