import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "../src/store.mjs";
import {
  newTask,
  approveScope,
  prepare,
  complete,
  hashScope,
} from "../src/domain.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
function fixture() {
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
test("worker completes a real subprocess handoff without model calls; unknown costs stay missing", () => {
  const f = fixture();
  try {
    writeFileSync(
      join(f.bin, "codex"),
      '#!/bin/sh\ncat >/dev/null\nprintf "stub only\\n" > result.txt\n',
      { mode: 0o700 },
    );
    execFileSync(process.execPath, f.args, {
      cwd: root,
      env: f.env,
      stdio: "pipe",
    });
    const s = new Store(f.db);
    try {
      const t = s.get(f.task.id),
        a = t.attempts[0];
      assert.equal(a.status, "awaiting-evidence");
      assert.equal(a.uncommitted, true);
      assert.deepEqual(a.costs, []);
      assert.equal(t.stage, "review");
      assert.equal(
        readFileSync(join(f.workspace, "result.txt"), "utf8"),
        "stub only\n",
      );
      complete(t, {
        attemptId: a.id,
        scopeHash: a.scopeHash,
        head: a.head,
        checks: [],
        security: "unassessed",
        costs: [],
        costComplete: false,
      });
      assert.equal(t.attempts[0].status, "completed");
    } finally {
      s.close();
    }
  } finally {
    f.cleanup();
  }
});
test("worker refuses execution without explicit isolation setup", () => {
  const f = fixture();
  try {
    assert.throws(() =>
      execFileSync(process.execPath, f.args, {
        env: { ...f.env, FACTORY_WORKER_ISOLATED: "" },
        stdio: "pipe",
      }),
    );
    const s = new Store(f.db);
    assert.equal(s.get(f.task.id).attempts[0].status, "prepared");
    s.close();
  } finally {
    f.cleanup();
  }
});
test("stop request ends the stub process and records cancellation", async () => {
  const f = fixture();
  let child;
  try {
    writeFileSync(
      join(f.bin, "codex"),
      "#!/bin/sh\ncat >/dev/null\nexec sleep 30\n",
      { mode: 0o700 },
    );
    child = spawn(process.execPath, f.args, {
      cwd: root,
      env: f.env,
      stdio: "ignore",
    });
    const done = new Promise((resolve) => child.on("close", resolve));
    const s = new Store(f.db);
    try {
      const deadline = Date.now() + 5000;
      while (s.get(f.task.id).attempts[0].status !== "running") {
        assert.ok(Date.now() < deadline, "worker failed to start");
        await new Promise((r) => setTimeout(r, 20));
      }
      s.transaction(() => {
        const t = s.get(f.task.id);
        t.stopRequested = true;
        s.save(t);
      });
      assert.equal(await done, 1);
      assert.equal(s.get(f.task.id).attempts[0].status, "cancelled");
    } finally {
      s.close();
    }
  } finally {
    child?.kill("SIGKILL");
    f.cleanup();
  }
});
