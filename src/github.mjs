import { createHmac, timingSafeEqual } from "node:crypto";
import {
  newTask,
  hashScope,
  approveScope,
  event,
  requireThat,
} from "./domain.mjs";
export async function readGitHub(repo, token, fetcher = fetch) {
  requireThat(/^[\w.-]+\/[\w.-]+$/.test(repo), "Ugyldigt repository.");
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Arcitai-Factory",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const options = {
    headers,
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  };
  const responses = await Promise.all(
    ["issues", "pulls"].map((kind) =>
      fetcher(
        `https://api.github.com/repos/${repo}/${kind}?state=open&per_page=100`,
        options,
      ),
    ),
  );
  for (const response of responses)
    requireThat(
      response.ok,
      `GitHub kunne ikke læses (HTTP ${response.status}). Kontroller adgang og rate limit.`,
      502,
    );
  const [items, pulls] = await Promise.all(responses.map((r) => r.json()));
  requireThat(
    Array.isArray(items) && Array.isArray(pulls),
    "Uventet GitHub-svar.",
    502,
  );
  return {
    items: items.filter((i) => !i.pull_request),
    pullRequests: pulls.map((p) => ({
      number: p.number,
      title: String(p.title ?? "").slice(0, 200),
      url: `https://github.com/${repo}/pull/${p.number}`,
      head: p.head?.sha ?? null,
      draft: p.draft === true,
      updatedAt: p.updated_at,
      repo,
    })),
    limited: responses.some((r) =>
      r.headers.get("link")?.includes('rel="next"'),
    ),
  };
}
export function importIssue(store, repo, issue) {
  requireThat(
    Number.isSafeInteger(issue.number) &&
      issue.number > 0 &&
      typeof issue.title === "string" &&
      (issue.body == null || typeof issue.body === "string"),
    "Ugyldigt issue.",
  );
  const externalId = `${repo}#${issue.number}`;
  const old = store.all().find((t) => t.externalId === externalId);
  const body = (issue.body || "Beskrivelse mangler. Afklar før start.").slice(
    0,
    12000,
  );
  const title = issue.title.slice(0, 200);
  const labels = (issue.labels ?? [])
    .map((l) => (typeof l === "string" ? l : l.name))
    .filter((l) => typeof l === "string");
  if (old) {
    if (old.body !== body || old.title !== title || issue.state === "closed") {
      old.title = title;
      old.body = body;
      old.approval = null;
      if (old.attempts.some((a) => ["running", "unknown"].includes(a.status)))
        old.stopRequested = true;
      for (const a of old.attempts)
        if (a.status === "prepared") a.status = "cancelled";
      old.stage = "blocked";
      event(
        old,
        "scope-changed",
        "GitHub-indhold ændret eller lukket. Tidligere godkendelse er ugyldig.",
      );
    }
    old.labels = labels;
    old.githubState = issue.state;
    return store.save(old);
  }
  const task = newTask(
    {
      title,
      body,
      repo,
      acceptance:
        "Fastlæg konkrete acceptkriterier i opgavens specifikation før godkendelse.",
    },
    "github",
  );
  Object.assign(task, {
    externalId,
    issueNumber: issue.number,
    url: `https://github.com/${repo}/issues/${issue.number}`,
    labels,
    githubState: issue.state,
  });
  event(task, "import", "GitHub-issue importeret. Ingen agent startet.");
  return store.insert(task);
}
export function verifySignature(raw, signature, secret) {
  if (!secret || !/^sha256=[0-9a-f]{64}$/.test(signature ?? "")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function processWebhook(
  store,
  { raw, signature, eventName, delivery, secret, repo, maintainers = [] },
) {
  requireThat(
    verifySignature(raw, signature, secret),
    "Ugyldig webhook-signatur.",
    401,
  );
  requireThat(
    typeof delivery === "string" &&
      delivery.length > 0 &&
      delivery.length <= 100,
    "Delivery-ID mangler.",
  );
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    requireThat(false, "Ugyldig JSON.");
  }
  requireThat(
    payload && typeof payload === "object" && !Array.isArray(payload),
    "Ugyldigt webhook-payload.",
  );
  requireThat(
    payload.repository?.full_name === repo,
    "Repository er ikke tilladt.",
    403,
  );
  return store.delivery(delivery, () => {
    if (
      eventName !== "issues" ||
      !["opened", "edited", "labeled", "closed", "reopened"].includes(
        payload.action,
      )
    )
      return { ignored: true };
    const task = importIssue(store, repo, payload.issue);
    const trusted =
      payload.sender?.type === "User" &&
      maintainers.includes(payload.sender?.login);
    // Readiness can request a spec. Implementation also needs the operator's bound local scope.
    if (
      payload.issue.state === "open" &&
      payload.action === "labeled" &&
      payload.label?.name === "factory:ready" &&
      trusted
    ) {
      if (task.acceptance.startsWith("Fastlæg konkrete")) {
        task.stage = "spec";
        event(
          task,
          "spec",
          "Ready-label modtaget; acceptkriterier skal færdiggøres i factoryen.",
        );
      } else if (
        !task.attempts.some((a) =>
          ["prepared", "running", "unknown"].includes(a.status),
        )
      )
        approveScope(task);
      store.save(task);
    }
    return { taskId: task.id, stage: task.stage, scopeHash: hashScope(task) };
  });
}
