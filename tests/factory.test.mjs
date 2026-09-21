import test from "node:test";
import http from "node:http";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  newTask,
  approveScope,
  prepare,
  complete,
  accept,
  canAccept,
  hashScope,
  metrics,
} from "../src/domain.mjs";
import { Store } from "../src/store.mjs";
import { importIssue, processWebhook, readGitHub } from "../src/github.mjs";
import { jobBundle } from "../src/jobs.mjs";
import { createFactory } from "../src/server.mjs";
import {
  validateEvaluation,
  summarizeEvaluations,
  inputDigest,
} from "../src/evaluations.mjs";
const task = () =>
  newTask({
    title: "A bounded change",
    body: "Fix a concrete issue.",
    acceptance: "The regression check passes.",
    repo: "example/pilot",
  });
const ready = () => {
  const t = task();
  approveScope(t);
  prepare(t);
  return t;
};
const evidence = (t) => ({
  attemptId: t.attempts.at(-1).id,
  scopeHash: hashScope(t),
  head: "a".repeat(40),
  checks: [{ name: "Regression", status: "passed", head: "a".repeat(40) }],
  security: "reviewed",
  costs: [
    { component: "inference", amount: 0.3, currency: "EUR", basis: "actual" },
  ],
  costComplete: true,
  activeMs: 10000,
  reviewMinutes: 2,
});
test("scope approval, evidence and exact commit are required for acceptance", () => {
  const t = task();
  assert.throws(() => prepare(t));
  approveScope(t);
  prepare(t);
  assert.throws(() => prepare(t));
  assert.throws(() => accept(t, "a".repeat(40)));
  complete(t, evidence(t));
  assert.equal(canAccept(t), true);
  assert.throws(() => accept(t, "b".repeat(40)));
  accept(t, "a".repeat(40));
  assert.equal(t.stage, "accepted");
});
test("stale scope, stale checks and unresolved security cannot be accepted", () => {
  const a = ready(),
    e = evidence(a);
  a.body = "New instructions";
  assert.throws(() => complete(a, e));
  const b = ready();
  complete(b, {
    ...evidence(b),
    checks: [{ name: "stale", status: "passed", head: "b".repeat(40) }],
  });
  assert.equal(canAccept(b), false);
  const c = ready();
  complete(c, { ...evidence(c), security: "inconclusive" });
  assert.equal(canAccept(c), false);
});
test("unknown/running workers cannot be cleared by evidence import", () => {
  for (const status of ["running", "unknown"]) {
    const t = ready();
    t.attempts[0].status = status;
    assert.throws(() => complete(t, evidence(t)));
  }
  const t = ready();
  t.attempts[0].status = "awaiting-evidence";
  complete(t, evidence(t));
  assert.equal(t.stage, "review");
});
test("retry limit and empty complete-cost claims are rejected", () => {
  const t = ready();
  assert.throws(() => complete(t, { ...evidence(t), costs: [] }));
  for (let i = 0; i < 3; i++) {
    if (i) {
      t.stage = "blocked";
      approveScope(t);
      prepare(t);
    }
    complete(t, evidence(t));
  }
  t.stage = "blocked";
  approveScope(t);
  assert.throws(() => prepare(t));
});
test("aggregate costs include failed attempts and missing costs remain unknown", () => {
  const a = ready();
  complete(a, evidence(a));
  accept(a, "a".repeat(40));
  const b = ready();
  b.attempts[0].status = "failed";
  b.attempts[0].costs = [{ amount: 0.5 }];
  b.attempts[0].costComplete = true;
  assert.equal(metrics([a, b]).costPerAcceptedEUR, 0.8);
  b.attempts[0].costComplete = false;
  assert.equal(metrics([a, b]).costPerAcceptedEUR, null);
  assert.equal(metrics([]).medianActiveMs, null);
  assert.equal(metrics([ready()]).knownCostEUR, null);
  assert.equal(metrics([ready()]).reviewMinutes, null);
});
test("invalid task fields and shell-like profile names never become commands", () => {
  assert.throws(() => newTask({ ...task(), profile: "codex;whoami" }));
  assert.throws(() => newTask({ ...task(), repo: "https://attacker.test/a" }));
  const t = ready();
  t.body = "$(touch bad)";
  t.approval.hash = hashScope(t);
  t.attempts[0].scopeHash = hashScope(t);
  const j = jobBundle(t);
  assert.equal(j.command.executable, "codex");
  assert.equal(j.command.args.includes("$(touch bad)"), false);
  assert.match(j.prompt, /\$\(touch bad\)/);
});
test("OSS and Cursor bundles preserve explicit configuration gaps", () => {
  const t = task();
  t.profile = "codex-oss";
  approveScope(t);
  prepare(t);
  assert.ok(jobBundle(t).command.args.includes("--oss"));
  const c = task();
  c.profile = "cursor-cloud";
  approveScope(c);
  prepare(c);
  assert.equal(
    jobBundle(c).cursor.repos[0].startingRef,
    "REPLACE_WITH_REVIEWED_COMMIT_SHA",
  );
  assert.equal(jobBundle(c).cursor.autoCreatePR, false);
});
test("SQLite state persists and revisions reject stale mutations", () => {
  const dir = mkdtempSync(join(tmpdir(), "factory-store-"));
  try {
    let s = new Store(join(dir, "state.sqlite"));
    const t = task();
    s.insert(t);
    s.mutate(t.id, 1, approveScope);
    assert.throws(() => s.mutate(t.id, 1, prepare));
    s.close();
    s = new Store(join(dir, "state.sqlite"));
    assert.equal(s.get(t.id).stage, "ready");
    assert.equal(s.delivery("one", () => ({ ok: true })).ok, true);
    assert.equal(
      s.delivery("one", () => {
        throw Error();
      }).duplicate,
      true,
    );
    s.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("GitHub imports deduplicate and changed source invalidates approval", () => {
  const s = new Store(":memory:");
  try {
    const i = {
      number: 4,
      title: "Issue",
      body: "Initial",
      state: "open",
      labels: [],
    };
    let t = importIssue(s, "example/pilot", i);
    assert.throws(() => approveScope(t));
    t.acceptance = "Concrete independent test";
    approveScope(t);
    prepare(t);
    s.save(t);
    t = importIssue(s, "example/pilot", { ...i, body: "Changed" });
    assert.equal(s.all().length, 1);
    assert.equal(t.approval, null);
    assert.equal(t.attempts[0].status, "cancelled");
  } finally {
    s.close();
  }
});
test("webhooks enforce signatures, repo, trusted actor and replay protection", () => {
  const s = new Store(":memory:");
  try {
    const base = {
      repository: { full_name: "example/pilot" },
      action: "labeled",
      issue: { number: 7, title: "Test", body: "Context", state: "open" },
      label: { name: "factory:ready" },
      sender: { type: "User", login: "stranger" },
    };
    const call = (payload, delivery, over = {}) => {
      const raw = Buffer.from(JSON.stringify(payload));
      return processWebhook(s, {
        raw,
        signature:
          "sha256=" +
          createHmac("sha256", "test-only-secret").update(raw).digest("hex"),
        eventName: "issues",
        delivery,
        secret: "test-only-secret",
        repo: "example/pilot",
        maintainers: ["owner"],
        ...over,
      });
    };
    assert.throws(() => call(base, "a", { signature: "wrong" }));
    assert.throws(() =>
      call({ ...base, repository: { full_name: "elsewhere/private" } }, "a"),
    );
    assert.equal(call(base, "a").stage, "inbox");
    assert.equal(call(base, "a").duplicate, true);
    assert.equal(
      call({ ...base, sender: { type: "User", login: "owner" } }, "b").stage,
      "spec",
    );
  } finally {
    s.close();
  }
});
test("GitHub GET is bounded, excludes PRs and does not follow redirects", async () => {
  const result = await readGitHub("example/pilot", "", async (url, options) => {
    assert.match(url, /per_page=100/);
    assert.equal(options.redirect, "error");
    return new Response(
      JSON.stringify([{ number: 1 }, { number: 2, pull_request: {} }]),
      { headers: { link: '<next>; rel="next"' } },
    );
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.limited, true);
});
test("HTTP flow: CSRF denial, revision conflict, live simulation denial, private files denial", async (t) => {
  const { server } = createFactory({ dbPath: ":memory:", demo: false });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const state = await (await fetch(base + "/api/state")).json();
  const post = (path, body, headers = {}) =>
    fetch(base + path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-factory-session": state.csrf,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  assert.equal(
    (await post("/api/tasks", task(), { "x-factory-session": "" })).status,
    403,
  );
  assert.equal(
    (await post("/api/tasks", task(), { origin: "https://other.example" }))
      .status,
    403,
  );
  const created = await (await post("/api/tasks", task())).json();
  assert.ok(created.id);
  const approved = await (
    await post(`/api/tasks/${created.id}/approve`, {
      revision: created.revision,
    })
  ).json();
  assert.equal(approved.stage, "ready");
  assert.equal(
    (
      await post(`/api/tasks/${created.id}/prepare`, {
        revision: created.revision,
      })
    ).status,
    409,
  );
  const prepared = await (
    await post(`/api/tasks/${created.id}/prepare`, {
      revision: approved.revision,
    })
  ).json();
  assert.equal(
    (
      await post(`/api/tasks/${created.id}/simulate`, {
        revision: prepared.revision,
      })
    ).status,
    403,
  );
  assert.equal((await fetch(base + "/.factory/state.sqlite")).status, 404);
  assert.equal(
    await new Promise((resolve, reject) => {
      const r = http.get(
        base + "/",
        { headers: { host: "evil.example" } },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        },
      );
      r.on("error", reject);
    }),
    403,
  );
  assert.match(
    (await fetch(base + "/")).headers.get("content-security-policy"),
    /frame-ancestors 'none'/,
  );
  assert.equal(
    (
      await post(`/api/tasks/${created.id}/cancel`, {
        revision: prepared.revision,
      })
    ).status,
    200,
  );
});
const evaluation = () => ({
  suite: "factory-core-v1",
  inputDigest,
  caseId: "E01",
  repetition: 1,
  outcome: "accepted",
  activeMs: 1000,
  reviewMinutes: 2,
  costEUR: 0.1,
  costBasis: "actual",
  costComplete: true,
  rubricPassed: 4,
  configuration: "fixture-config",
  model: "fixture-model",
  harness: "fixture-harness",
  environment: "test-only",
  verifier: "fixture-reviewer",
  evidence: "test-artifact",
});
test("benchmark import rejects mismatched inputs, duplicates and invented zero", () => {
  assert.throws(() =>
    validateEvaluation({ ...evaluation(), inputDigest: "stale" }),
  );
  assert.throws(() => validateEvaluation({ ...evaluation(), costEUR: null }));
  assert.throws(() => validateEvaluation({ ...evaluation(), rubricPassed: 3 }));
  const s = new Store(":memory:");
  try {
    const e = validateEvaluation(evaluation());
    s.insertEvaluation(e);
    assert.throws(() => s.insertEvaluation(e));
    const groups = summarizeEvaluations(s.evaluations());
    assert.equal(groups[0].cases, 1);
    assert.equal(groups[0].costPerAcceptedEUR, 0.1);
  } finally {
    s.close();
  }
});
