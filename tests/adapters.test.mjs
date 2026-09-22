import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync, mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { Store } from "../src/store.mjs";
import { canAccept, complete } from "../src/domain.mjs";
import { privatePath, workerEnvironment } from "../src/worker-config.mjs";
import { runSecurity } from "../src/security-worker.mjs";
import { fixture, configure, root, launch } from "./helpers/worker-fixture.mjs";


function stub(f, mode = "ok") {
  writeFileSync(join(f.bin, "pi"), `#!${process.execPath}
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const mode = ${JSON.stringify(mode)};
const emit = value => process.stdout.write(JSON.stringify(value) + '\\n');
createInterface({ input: process.stdin }).on('line', line => {
 const c = JSON.parse(line);
 let data = {};
 if (c.type === 'get_state') data = { model: { provider: 'factory-probe', id: mode === 'wrong-model' ? 'other-model' : 'factory-probe' } };
 if (c.type === 'get_session_stats') data = { tokens: { input: 10, output: 2 }, cost: 0 };
 emit({ type: 'response', id: c.id, success: true, data });
 if (c.type === 'prompt') {
   if (mode === 'hang') {
     const descendant = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)']);
     writeFileSync('descendant.pid', String(descendant.pid));
     return;
   }
   if (mode === 'malformed') { process.stdout.write('broken JSON\\n'); return; }
   if (mode === 'ok') writeFileSync('result.txt', 'synthetic result');
   emit({ type: 'message_end', message: { role: 'assistant', stopReason: mode === 'error' ? 'error' : 'stop', content: 'LF\\u2028framing' } });
   emit({ type: 'agent_settled' });
 }
});
`, { mode: 0o700 });
}

test("Pi job reaches review with telemetry and preserves unknown price and independent review", async () => {
  const f = fixture("pi-custom");
  try {
    configure(f); stub(f);
    const result = await launch(f).done;
    assert.equal(result.code, 0, result.output);
    const store = new Store(f.db);
    try {
      const t = store.get(f.task.id), a = t.attempts[0];
      assert.equal(a.status, "awaiting-evidence");
      assert.equal(a.adapter, "pi");
      assert.equal(a.uncommitted, true);
      assert.deepEqual(a.costs, []);
      assert.equal(canAccept(t), false);
      const report = JSON.parse(readFileSync(join(root, ".factory/jobs", a.id, "worker-result.json")));
      assert.equal(report.usage.input, 10);
      assert.equal(report.reportedCost.basis, "harness-config-unverified");
      const duration = a.activeMs;
      complete(t, { attemptId: a.id, scopeHash: a.scopeHash, head: a.head, checks: [], security: "unassessed", costs: [] });
      assert.equal(a.activeMs, duration, "import must preserve observed duration");
    } finally { store.close(); }
  } finally { f.cleanup(); }
});

for (const mode of ["error", "malformed", "wrong-model"]) test(`Pi ${mode} cannot become a successful job`, async () => {
  const f = fixture("pi-custom");
  try {
    configure(f); stub(f, mode);
    const result = await launch(f).done;
    assert.equal(result.code, 1, result.output);
    const store = new Store(f.db);
    try {
      const t = store.get(f.task.id);
      assert.equal(t.attempts[0].status, "failed");
      assert.equal(t.stage, "blocked");
    } finally { store.close(); }
  } finally { f.cleanup(); }
});

test("Pi stop ends a descendant process as well as the agent", async () => {
  const f = fixture("pi-custom"); let running;
  try {
    configure(f); stub(f, "hang"); running = launch(f);
    const deadline = Date.now() + 5000;
    while (!existsSync(join(f.workspace, "descendant.pid"))) {
      assert.ok(Date.now() < deadline); await new Promise(r => setTimeout(r, 20));
    }
    const pid = Number(readFileSync(join(f.workspace, "descendant.pid"), "utf8"));
    const store = new Store(f.db);
    try {
      store.transaction(() => { const t = store.get(f.task.id); t.stopRequested = true; store.save(t); });
      assert.equal((await running.done).code, 1);
      assert.equal(store.get(f.task.id).attempts[0].status, "cancelled");
      assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
    } finally { store.close(); }
  } finally { running?.child.kill("SIGKILL"); f.cleanup(); }
});

test("changed config cannot launch, credentials are allowlisted, symlinks cannot hide private files in checkout", async () => {
  const f = fixture("pi-custom");
  try {
    const { path, config, save } = configure(f); stub(f);
    writeFileSync(path, JSON.stringify({ ...config, model: "unapproved-model" }));
    assert.equal((await launch(f).done).code, 1);
    save();
    writeFileSync(config.policyFile, "Changed after preflight.");
    assert.equal((await launch(f).done).code, 1);
    const store = new Store(f.db);
    assert.equal(store.get(f.task.id).attempts[0].status, "prepared"); store.close();
    const env = workerEnvironment({ home: f.home, credentialEnv: ["TEST_API_KEY"] }, { PATH: "/bin", HOME: "/personal", TEST_API_KEY: "fixture", UNRELATED_KEY: "must-not-inherit" });
    assert.equal(env.HOME, f.home); assert.equal(env.UNRELATED_KEY, undefined);
    symlinkSync(join(f.workspace, "input.txt"), join(f.dir, "link"));
    assert.throws(() => privatePath(join(f.dir, "link"), f.workspace));
  } finally { f.cleanup(); }
});

test("security capability must be attested before the runner claims a scan", async () => {
  const f = fixture("codex-security");
  try {
    configure(f);
    const preflight = JSON.parse(readFileSync(f.preflight)); delete preflight.capabilities.security;
    writeFileSync(f.preflight, JSON.stringify(preflight));
    assert.equal((await launch(f).done).code, 1);
    const store = new Store(f.db);
    try { assert.equal(store.get(f.task.id).attempts[0].status, "prepared"); } finally { store.close(); }
  } finally { f.cleanup(); }
});

test("security adapter requires sealed results on the exact commit and always closes SDK", async () => {
  const f = fixture("codex-security");
  try {
    const outputDir = join(f.dir, "scan"); mkdirSync(outputDir);
    for (const name of ["report.md", "scan-manifest.json", "coverage.json", "findings.json"]) writeFileSync(join(outputDir, name), "fixture");
    let closed = 0, options, mode = "ok";
    class CodexSecurity {
      constructor(options) { assert.equal(options.pluginPath, undefined); }
      async run(workspace, supplied) {
        options = supplied; assert.equal(workspace, f.workspace);
        if (mode === "throw") throw new Error("provider failed");
        return { scanDir: outputDir, manifest: { scan: { id: "fixture", status: "completed", sealedAt: mode === "unsealed" ? null : "now", target: { revision: mode === "stale" ? "b".repeat(40) : f.git("rev-parse", "HEAD") } } }, findings: { findings: [{}] }, turnResult: { usage: null }, reportPath: join(outputDir, "report.md"), coveragePath: join(outputDir, "coverage.json") };
      }
      async close() { closed++; }
    }
    const args = { config: { model: "fixture", provider: "openai" }, workspace: f.workspace, base: f.git("rev-parse", "HEAD"), prompt: f.preflight, outputDir, SDK: { CodexSecurity } };
    assert.equal((await runSecurity(args)).findingsCount, 1);
    assert.equal(options.mock, false); assert.equal(options.mode, "standard");
    for (mode of ["stale", "unsealed", "throw"]) await assert.rejects(runSecurity(args));
    assert.equal(closed, 4);
    await assert.rejects(runSecurity({ ...args, config: { ...args.config, pluginPath: "/untrusted/plugin.zip" } }), /not supported/);
    assert.equal(closed, 4, "custom plugin must be rejected before SDK construction");
  } finally { f.cleanup(); }
});
