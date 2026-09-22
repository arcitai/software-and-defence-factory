import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { join } from "node:path";
import { Store } from "../src/store.mjs";
import { complete } from "../src/domain.mjs";
import { fixture, root } from "./helpers/worker-fixture.mjs";

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
