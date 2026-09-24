import http from "node:http";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "./store.mjs";
import {
  newTask,
  profiles,
  stages,
  stageNames,
  Fault,
  requireThat,
  event,
  approveScope,
  prepare,
  complete,
  accept,
  metrics,
  activeAttempt,
} from "./domain.mjs";
import { jobBundle } from "./jobs.mjs";
import { demoTasks } from "./demo.mjs";
import { readGitHub, importIssue, processWebhook } from "./github.mjs";

import { suite, inputDigest, summarizeEvaluations } from "./evaluations.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 262144) throw new Fault("Anmodningen er for stor.", 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function createFactory({
  dbPath = resolve(root, ".factory/state.sqlite"),
  demo = true,
  repo = "",
  githubToken = "",
  webhookSecret = "",
  maintainers = [],
} = {}) {
  const store = new Store(dbPath),
    csrf = randomBytes(32).toString("hex");
  if (demo && store.all().length === 0)
    store.transaction(() => demoTasks().forEach((t) => store.insert(t)));
  let syncing = false;
  const server = http.createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(data));
    };
    try {
      const expected = new Set([
        `127.0.0.1:${server.address().port}`,
        `localhost:${server.address().port}`,
      ]);
      requireThat(expected.has(req.headers.host), "Host er ikke tilladt.", 403);
      const origin = req.headers.origin;
      if (origin)
        requireThat(
          [
            `http://127.0.0.1:${server.address().port}`,
            `http://localhost:${server.address().port}`,
          ].includes(origin),
          "Origin er ikke tilladt.",
          403,
        );
      if (req.headers["sec-fetch-site"] === "cross-site")
        throw new Fault("Cross-site adgang er ikke tilladt.", 403);
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (req.method === "POST" && url.pathname === "/api/webhooks/github") {
        const raw = await body(req);
        return send(
          202,
          processWebhook(store, {
            raw,
            signature: req.headers["x-hub-signature-256"],
            eventName: req.headers["x-github-event"],
            delivery: req.headers["x-github-delivery"],
            secret: webhookSecret,
            repo,
            maintainers,
          }),
        );
      }
      if (req.method === "GET" && url.pathname === "/api/state") {
        const tasks = store.all();
        return send(200, {
          evaluations: {
            suite: suite.id,
            inputDigest,
            groups: summarizeEvaluations(store.evaluations()),
          },
          tasks,
          pullRequests: store.metadata("pullRequests") ?? [],
          profiles,
          stages,
          stageNames,
          csrf,
          repo,
          mode: demo ? "demo" : "live",
          metrics: {
            demo: metrics(tasks.filter((t) => t.source === "demo")),
            live: metrics(tasks.filter((t) => t.source !== "demo")),
          },
          connection: {
            github: !!repo,
            access: githubToken ? "server token" : "public only",
            lastRead: "manual",
          },
          runtime: {
            execution: "handoff",
            message:
              "Jobpakker kan køres med worker-CLI. Web-UI starter ikke betalte agenter.",
          },
        });
      }
      if (req.method === "GET" && url.pathname === "/api/export") {
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="factory-evidence.json"',
        );
        return send(200, {
          version: 1,
          exportedAt: new Date().toISOString(),
          tasks: store.all(),
          evaluations: store.evaluations(),
        });
      }
      const jobMatch = url.pathname.match(/^\/api\/tasks\/([\w-]+)\/job$/);
      if (req.method === "GET" && jobMatch) {
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="factory-job.json"',
        );
        return send(200, jobBundle(store.get(jobMatch[1])));
      }
      if (req.method === "POST") {
        requireThat(
          req.headers["x-factory-session"] === csrf,
          "Session mangler. Genindlæs siden.",
          403,
        );
        requireThat(
          (req.headers["content-type"] ?? "").startsWith("application/json"),
          "Brug application/json.",
          415,
        );
        let input;
        try {
          input = JSON.parse(await body(req));
        } catch (error) {
          if (error instanceof Fault) throw error;
          throw new Fault("Ugyldig JSON.");
        }
        requireThat(
          input && typeof input === "object" && !Array.isArray(input),
          "Ugyldigt input.",
        );
        if (url.pathname === "/api/tasks") {
          const task = newTask(input);
          event(task, "created", "Opgave oprettet i den lokale kø.");
          store.insert(task);
          return send(201, task);
        }
        if (url.pathname === "/api/github/sync") {
          requireThat(repo, "Konfigurér FACTORY_REPO på serveren først.", 409);
          requireThat(!syncing, "Synkronisering kører allerede.", 409);
          syncing = true;
          try {
            const result = await readGitHub(repo, githubToken);
            store.transaction(() => {
              result.items.forEach((i) => importIssue(store, repo, i));
              store.setMetadata("pullRequests", result.pullRequests);
            });
            return send(200, {
              count: result.items.length,
              pullRequests: result.pullRequests.length,
              limited: result.limited,
            });
          } finally {
            syncing = false;
          }
        }
        const match = url.pathname.match(
          /^\/api\/tasks\/([\w-]+)\/(approve|prepare|cancel|accept|simulate|edit)$/,
        );
        requireThat(match, "Ukendt handling.", 404);
        const task = store.mutate(match[1], input.revision, (t) => {
          switch (match[2]) {
            case "approve":
              approveScope(t);
              break;
            case "prepare":
              prepare(t);
              break;
            case "edit": {
              requireThat(
                !activeAttempt(t) && t.stage !== "accepted",
                "Afslut aktivt forsøg før ændring.",
                409,
              );
              const edited = newTask({ ...t, ...input });
              for (const key of [
                "title",
                "body",
                "acceptance",
                "profile",
                "requirements",
              ])
                t[key] = edited[key];
              t.approval = null;
              t.stage = "spec";
              event(t, "edit", "Scope ændret. Ny godkendelse kræves.");
              break;
            }
            case "cancel": {
              const a = activeAttempt(t);
              requireThat(a, "Intet aktivt forsøg.", 409);
              if (a.status === "prepared") {
                a.status = "cancelled";
                a.endedAt = new Date().toISOString();
                t.stage = "blocked";
                event(t, "cancel", "Jobpakke annulleret før start.");
              } else {
                t.stopRequested = true;
                event(
                  t,
                  "stop-request",
                  "Stop ønsket. Afventer workerens bekræftelse.",
                );
              }
              break;
            }
            case "accept":
              accept(t, input.head);
              break;
            case "simulate": {
              requireThat(
                t.source === "demo",
                "Simulation er kun mulig på demodata.",
                403,
              );
              const a = t.attempts.at(-1);
              requireThat(
                a?.status === "prepared",
                "Forbered et demojob først.",
                409,
              );
              complete(t, {
                attemptId: a.id,
                scopeHash: a.scopeHash,
                head: "d".repeat(40),
                checks: [
                  {
                    name: "Syntetisk regressionstest",
                    status: "passed",
                    head: "d".repeat(40),
                  },
                ],
                security: "reviewed",
                costs: [
                  {
                    component: "Syntetisk inference",
                    amount: 0.28,
                    currency: "EUR",
                    basis: "estimated",
                  },
                ],
                costComplete: true,
                activeMs: 840000,
                reviewMinutes: 5,
              });
              break;
            }
          }
        });
        return send(200, task);
      }
      requireThat(req.method === "GET", "Metoden er ikke tilladt.", 405);
      const files = {
        "/": "index.html",
        "/app.mjs": "app.mjs",
        "/style.css": "style.css",
      };
      const file = files[url.pathname];
      requireThat(file, "Siden findes ikke.", 404);
      const contents = await readFile(resolve(root, "public", file));
      res.writeHead(200, {
        "Content-Type": file.endsWith(".css")
          ? "text/css"
          : file.endsWith(".mjs")
            ? "text/javascript"
            : "text/html; charset=utf-8",
      });
      res.end(contents);
    } catch (error) {
      send(error.status ?? 500, {
        error: error.status
          ? error.message
          : "Intern fejl. Se serverens drift og database.",
      });
      if (!error.status) console.error(error);
    }
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 15000;
  server.on("close", () => store.close());
  return { server, store };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { server } = createFactory({
    dbPath: process.env.FACTORY_DB,
    demo: process.env.FACTORY_DEMO !== "0",
    repo: process.env.FACTORY_REPO ?? "",
    githubToken: process.env.GITHUB_TOKEN ?? "",
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET ?? "",
    maintainers: (process.env.FACTORY_MAINTAINERS ?? "")
      .split(",")
      .filter(Boolean),
  });
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(); // The close event flushes the database after in-flight requests.
    setTimeout(() => process.exit(1), 30000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  const port = Number(process.env.PORT ?? 4317);
  server.listen(port, "127.0.0.1", () =>
    console.log(`Arcitai Software & Defence Factory: http://127.0.0.1:${port} (local only)`),
  );
}
