import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";
import { Store } from "../src/store.mjs";
import { requireThat, event, hashScope } from "../src/domain.mjs";
import { jobBundle } from "../src/jobs.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const has = (name) => args.includes(name);
let store, claimed;
try {
  requireThat(
    has("--task") && option("--task"),
    "Brug: npm run worker -- --task ID [--workspace /isolated/checkout --execute]",
  );
  store = new Store(
    process.env.FACTORY_DB ?? resolve(root, ".factory/state.sqlite"),
  );
  const task = store.get(option("--task"));
  const bundle = jobBundle(task);
  const jobDir = resolve(root, ".factory/jobs", bundle.attemptId);
  mkdirSync(jobDir, { recursive: true, mode: 0o700 });
  writeFileSync(join(jobDir, "job.json"), JSON.stringify(bundle, null, 2), {
    mode: 0o600,
  });
  writeFileSync(join(jobDir, "prompt.txt"), bundle.prompt, { mode: 0o600 });
  if (!has("--execute")) {
    console.log(
      `Job exported to ${jobDir}\nProfile: ${bundle.profile}\nNo agent started. Use docs/setup.md for local or cloud execution.`,
    );
  } else {
    requireThat(
      process.platform !== "win32",
      "Brug en POSIX-worker, fx WSL2. Windows process groups er ikke implementeret.",
    );
    requireThat(
      task.source !== "demo",
      "Demo-opgaver kan ikke sendes til en rigtig agent.",
    );
    requireThat(
      bundle.command,
      "Denne profil bruger en manuel/cloud-overdragelse. Se profiles/.",
    );
    requireThat(
      process.env.FACTORY_WORKER_ISOLATED === "1",
      "Kør på en separat worker/VM og sæt FACTORY_WORKER_ISOLATED=1 efter preflight. Flaget skaber ikke isolation.",
    );
    requireThat(
      has("--workspace") && option("--workspace"),
      "Angiv et dedikeret checkout med --workspace.",
    );
    const workspace = resolve(option("--workspace"));
    requireThat(
      workspace !== root &&
        !root.startsWith(workspace + "/") &&
        !workspace.startsWith(root),
      "Worker-checkout må ikke være controllerens repository eller overmappe.",
    );
    requireThat(
      process.env.FACTORY_CODEX_HOME &&
        existsSync(process.env.FACTORY_CODEX_HOME),
      "FACTORY_CODEX_HOME skal pege på workerens særskilte Codex-konfiguration.",
    );
    const git = (...argv) =>
      execFileSync("git", ["-C", workspace, ...argv], {
        encoding: "utf8",
        timeout: 15000,
        maxBuffer: 10 * 1024 * 1024,
      }).trim();
    requireThat(
      !git("status", "--porcelain"),
      "Worker-checkout skal være rent.",
    );
    const remote = git("remote", "get-url", "origin").replace(/\.git$/, "");
    requireThat(
      remote === `https://github.com/${task.repo}` ||
        remote === `git@github.com:${task.repo}`,
      "Checkout svarer ikke til opgavens repository.",
    );
    requireThat(
      has("--preflight") && option("--preflight"),
      "Angiv --preflight /privat/preflight.json uden for checkout.",
    );
    const preflight = JSON.parse(
      readFileSync(resolve(option("--preflight")), "utf8"),
    );
    requireThat(
      preflight.profile === task.profile &&
        preflight.scopeHash === hashScope(task),
      "Preflight skal gælde den valgte profil og det aktuelle scope.",
    );
    requireThat(
      task.requirements.every((c) => preflight.capabilities?.[c] === true),
      "En påkrævet capability er ikke afprøvet.",
    );
    requireThat(
      Number.isFinite(Date.parse(preflight.verifiedAt)) &&
        Date.now() - Date.parse(preflight.verifiedAt) >= 0 &&
        Date.now() - Date.parse(preflight.verifiedAt) < 86400000,
      "Preflight skal være mindre end et døgn gammel.",
    );
    if (bundle.command.modelRequired)
      requireThat(
        process.env.FACTORY_MODEL,
        "Vælg den afprøvede lokale model med FACTORY_MODEL.",
      );
    const base = git("rev-parse", "HEAD");
    const branch = `factory/${bundle.attemptId}`;
    requireThat(
      preflight.baseCommit === base,
      "Preflight skal gælde checkoutets aktuelle commit.",
    );
    store.transaction(() => {
      requireThat(
        !store
          .all()
          .some((t) =>
            t.attempts.some((a) => ["running", "unknown"].includes(a.status)),
          ),
        "En writer kører allerede eller har ukendt status.",
        409,
      );
      const fresh = store.get(task.id);
      const a = fresh.attempts.at(-1);
      requireThat(
        a.id === bundle.attemptId &&
          a.status === "prepared" &&
          a.scopeHash === hashScope(fresh),
        "Jobbet er ændret.",
        409,
      );
      Object.assign(a, {
        status: "running",
        startedAt: new Date().toISOString(),
        base,
        branch,
        workspace,
      });
      fresh.stage = "running";
      event(fresh, "start", "Codex startet på separat worker.");
      store.save(fresh);
    });
    claimed = { taskId: task.id, attemptId: bundle.attemptId };
    git("switch", "-c", branch);
    const commandArgs = [...bundle.command.args];
    if (process.env.FACTORY_MODEL)
      commandArgs.splice(-1, 0, "--model", process.env.FACTORY_MODEL);
    // Credential scopes are supplied by the dedicated worker, never by the issue or web UI.
    const child = spawn(bundle.command.executable, commandArgs, {
      cwd: workspace,
      detached: process.platform !== "win32",
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        TMPDIR: process.env.TMPDIR,
        CODEX_HOME: process.env.FACTORY_CODEX_HOME,
        OLLAMA_NO_CLOUD: task.profile === "codex-oss" ? "1" : undefined,
        KASTANJE_API_KEY:
          task.profile === "codex-kastanje"
            ? process.env.KASTANJE_API_KEY
            : undefined,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let logBytes = 0,
      stopping = false,
      terminationTimer;
    const chunks = [];
    const stop = () => {
      if (stopping) return;
      stopping = true;
      const signal = (s) => {
        try {
          if (process.platform === "win32") child.kill(s);
          else process.kill(-child.pid, s);
        } catch (e) {
          if (e.code !== "ESRCH") throw e;
        }
      };
      signal("SIGTERM");
      terminationTimer = setTimeout(() => signal("SIGKILL"), 4000);
    };
    const log = (chunk) => {
      logBytes += chunk.length;
      if (logBytes <= 4 * 1024 * 1024) chunks.push(chunk);
      else stop();
    };
    child.stdout.on("data", log);
    child.stderr.on("data", log);
    child.stdin.on("error", () => {});
    child.stdin.end(bundle.prompt);
    const started = Date.now(),
      timeout = setTimeout(stop, 45 * 60000);
    const poll = setInterval(() => {
      try {
        if (store.get(task.id).stopRequested) stop();
      } catch {
        stop();
      }
    }, 1000);
    const shutdown = () => stop();
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    let exitCode = null,
      errorMessage = null;
    try {
      exitCode = await new Promise((done, reject) => {
        child.once("error", reject);
        child.once("close", done);
      });
    } catch (e) {
      errorMessage = e.message;
    } finally {
      clearTimeout(timeout);
      clearInterval(poll);
      clearTimeout(terminationTimer);
      if (child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch (e) {
          if (e.code !== "ESRCH") throw e;
        }
      }
      process.off("SIGINT", shutdown);
      process.off("SIGTERM", shutdown);
    }
    // Raw output remains private on the worker; it is never rendered or uploaded automatically.
    writeFileSync(join(jobDir, "worker-output.log"), Buffer.concat(chunks), {
      mode: 0o600,
    });
    const head = git("rev-parse", "HEAD");
    writeFileSync(
      join(jobDir, "tracked.patch"),
      git("diff", "--binary", base),
      { mode: 0o600 },
    );
    const dirty = git("status", "--porcelain");
    writeFileSync(join(jobDir, "working-tree.txt"), dirty, { mode: 0o600 });
    store.transaction(() => {
      const fresh = store.get(task.id),
        a = fresh.attempts.find((a) => a.id === bundle.attemptId);
      Object.assign(a, {
        status: stopping
          ? "cancelled"
          : exitCode === 0
            ? "awaiting-evidence"
            : "failed",
        endedAt: new Date().toISOString(),
        activeMs: Date.now() - started,
        head,
        exitCode,
        error: errorMessage,
        uncommitted: !!dirty,
      });
      fresh.stage = exitCode === 0 && !stopping ? "review" : "blocked";
      fresh.stopRequested = false;
      event(
        fresh,
        "worker-finished",
        "Worker afsluttet. Commit, uafhængige checks og sikkerhedsreview mangler før accept.",
      );
      store.save(fresh);
    });
    console.log(
      `Worker ended: ${exitCode}. Artifacts: ${jobDir}\nUncommitted changes: ${!!dirty}. No push, PR, merge or deploy performed.`,
    );
    if (exitCode !== 0 || stopping) process.exitCode = 1;
  }
} catch (error) {
  if (claimed && store) {
    try {
      store.transaction(() => {
        const t = store.get(claimed.taskId),
          a = t.attempts.find((a) => a.id === claimed.attemptId);
        if (a.status === "running") {
          a.status = "unknown";
          t.stage = "blocked";
          event(
            t,
            "worker-unknown",
            "Worker afbrudt. Bekræft stop før nyt forsøg.",
          );
          store.save(t);
        }
      });
    } catch {}
  }
  console.error(error.message);
  process.exitCode = 1;
} finally {
  store?.close();
}
