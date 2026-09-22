import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "../../src/store.mjs";
import { newTask, approveScope, prepare, hashScope } from "../../src/domain.mjs";
import { loadWorkerConfig } from "../../src/worker-config.mjs";
export const root = fileURLToPath(new URL("../../", import.meta.url));
export function fixture(profile = "codex-local") {
  const dir = mkdtempSync(join(tmpdir(), "factory-worker-")),
    workspace = join(dir, "checkout"),
    bin = join(dir, "bin"),
    home = join(dir, "codex");
  for (const p of [workspace, bin, home]) mkdirSync(p);
  const git = (...args) =>
    execFileSync("git", ["-C", workspace, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init", "-q");
  git("config", "user.name", "Factory Test");
  git("config", "user.email", "factory-test@example.invalid");
  git("remote", "add", "origin", "https://github.com/example/pilot");
  writeFileSync(join(workspace, "input.txt"), "fixture\n");
  git("add", ".");
  git("commit", "-qm", "fixture");
  const t = newTask({
    profile,
    title: "Fixture only",
    body: "Test stub execution",
    acceptance: "Test fixture evidence exists",
    repo: "example/pilot",
  });
  approveScope(t);
  prepare(t);
  const db = join(dir, "state.sqlite");
  const s = new Store(db);
  s.insert(t);
  s.close();
  const preflight = join(dir, "preflight.json");
  writeFileSync(
    preflight,
    JSON.stringify({
      profile: t.profile,
      scopeHash: hashScope(t),
      baseCommit: git("rev-parse", "HEAD"),
      verifiedAt: new Date().toISOString(),
      capabilities: { files: true, shell: true, git: true, tests: true },
    }),
  );
  const env = {
    ...process.env,
    PATH: bin + ":" + process.env.PATH,
    FACTORY_DB: db,
    FACTORY_WORKER_ISOLATED: "1",
    FACTORY_CODEX_HOME: home,
  };
  return {
    dir,
    git,
    home,
    workspace,
    bin,
    db,
    task: t,
    preflight,
    env,
    args: [
      join(root, "scripts/run-job.mjs"),
      "--task",
      t.id,
      "--workspace",
      workspace,
      "--preflight",
      preflight,
      "--execute",
    ],
    cleanup() {
      rmSync(dir, { recursive: true, force: true });
      rmSync(join(root, ".factory/jobs", t.attempts[0].id), {
        recursive: true,
        force: true,
      });
    },
  };
}
export function configure(f) {
  const agentDir = join(f.dir, "pi");
  mkdirSync(agentDir);
  const policyFile = join(f.dir, "policy.md");
  writeFileSync(policyFile, "Synthetic test job only. Read input.txt. Do not publish.\n");
  const config = { home: f.home, agentDir, policyFile, provider: "factory-probe", model: "factory-probe", thinking: "off" };
  const path = join(f.dir, "worker.json");
  const save = () => {
    const bytes = JSON.stringify(config);
    writeFileSync(path, bytes);
    const preflight = { profile: f.task.profile, scopeHash: hashScope(f.task), baseCommit: f.git("rev-parse", "HEAD"),
      verifiedAt: new Date().toISOString(), capabilities: { files: true, shell: true, git: true, tests: true, security: true }, workerConfigHash: loadWorkerConfig(path, f.workspace, f.task.profile === "pi-custom" ? "pi" : "security").hash };
    writeFileSync(f.preflight, JSON.stringify(preflight));
  };
  f.env.FACTORY_WORKER_CONFIG = path;
  save();
  return { config, path, save };
}

export function launch(f) {
  const child = spawn(process.execPath, f.args, { env: f.env, cwd: root, stdio: "pipe" });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  const done = new Promise((resolve, reject) => { child.on("error", reject); child.on("close", code => resolve({ code, output })); });
  return { child, done };
}
