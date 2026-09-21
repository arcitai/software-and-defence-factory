let state,
  view = "work",
  dataset = "demo",
  filter = "",
  query = "",
  selected = null,
  metricView = "operations";
const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const euro = (n) =>
  n == null
    ? "Ukendt"
    : new Intl.NumberFormat("da-DK", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
      }).format(n);
const minutes = (ms) =>
  ms == null ? "Ukendt" : `${Math.round(ms / 60000)} min`;
const tasks = () =>
  state.tasks.filter((t) =>
    dataset === "demo" ? t.source === "demo" : t.source !== "demo",
  );
const profile = (id) => state.profiles.find((p) => p.id === id);
const cost = (t) =>
  t.attempts.some((a) => a.costs.length)
    ? t.attempts.reduce(
        (sum, a) => sum + a.costs.reduce((n, c) => n + c.amount, 0),
        0,
      )
    : null;
const duration = (t) =>
  t.attempts.some((a) => Number.isFinite(a.activeMs))
    ? t.attempts.reduce((sum, a) => sum + (a.activeMs ?? 0), 0)
    : null;
const badge = (t) =>
  `<span class="badge ${esc(t.stage)}">${esc(state.stageNames[t.stage])}</span>`;
const title = (eyebrow, heading, sub, action = "") =>
  `<div class="title-row"><div><span class="eyebrow">${eyebrow}</span><h1>${heading}</h1><p class="subtitle">${sub}</p></div>${action}</div>`;
const stat = (name, value, foot) =>
  `<div class="stat"><div class="stat-label">${name}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`;
const panel = (name, content) =>
  `<section class="panel"><div class="panel-head"><h2>${name}</h2></div><div class="panel-body">${content}</div></section>`;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.hidden = true), 4200);
}
async function api(path, input) {
  const response = await fetch(
    path,
    input
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Factory-Session": state.csrf,
          },
          body: JSON.stringify(input),
        }
      : {},
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Anmodningen mislykkedes.");
  return data;
}
async function load() {
  try {
    state = await api("/api/state");
    if (state.mode === "live" && !state.tasks.some((t) => t.source === "demo"))
      dataset = "live";
    $("#error").hidden = true;
    $("#freshness").textContent =
      `Læst ${new Date().toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}`;
    $("#connection").textContent =
      state.repo || "Lokal kø · GitHub ikke tilsluttet";
    render();
  } catch (e) {
    $("#error").textContent = e.message;
    $("#error").hidden = false;
  }
}
function render() {
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $("#page-name").textContent = {
    work: "Arbejdsflade",
    pulls: "Pull requests",
    metrics: "Værdi & benchmarks",
    capabilities: "Agenter & capabilities",
    security: "Sikkerhed & kvalitet",
    setup: "Opsætning",
  }[view];
  $("#notice").innerHTML =
    dataset === "demo"
      ? '<span class="demo-dot"></span><strong>Demo</strong><span>Syntetiske opgaver og tal. Ingen agenter eller modelkald kører.</span><button id="dataset-toggle">Vis egne data →</button>'
      : '<span class="demo-dot"></span><strong>Egne data</strong><span>Lokale opgaver og GitHub-import. Uden demotal.</span><button id="dataset-toggle">Vis demo →</button>';
  $("#dataset-toggle").onclick = () => {
    dataset = dataset === "demo" ? "live" : "demo";
    filter = "";
    query = "";
    render();
  };
  $("#view").innerHTML = {
    work: renderWork,
    pulls: renderPulls,
    metrics: renderMetrics,
    capabilities: renderCapabilities,
    security: renderSecurity,
    setup: renderSetup,
  }[view]();
  bindView();
}
function renderWork() {
  const ts = tasks(),
    m = state.metrics[dataset],
    reviews = ts.filter((t) => t.stage === "review");
  return (
    title(
      "ARBEJDSFLADE",
      "Fra idé til dokumenteret resultat.",
      "Et fælles overblik over opgaver, agenter og det, der kræver din vurdering.",
      '<button class="button primary" id="new-task">＋ Ny opgave</button>',
    ) +
    `<div class="summary">${stat("Til din vurdering", reviews.length, "Resultater med beviser til review")}${stat("Accepterede opgaver", m.accepted, `${m.tasks} opgaver i denne visning`)}${stat("Registreret omkostning", euro(m.attempts ? m.knownCostEUR : null), `${m.attempts} forsøg · ${m.costCoverage == null ? "ingen" : Math.round(m.costCoverage * 100) + " %"} omkostningsdækning`)}${stat("Median aktiv køretid", minutes(m.medianActiveMs), "Ventetid er ikke medregnet")}</div>` +
    `<div class="pipeline">${state.stages
      .map(
        (s) =>
          `<button class="stage ${s} ${filter === s ? "selected" : ""}" data-stage="${s}" aria-pressed="${filter === s}"><span class="stage-dot"></span>${state.stageNames[s]}<strong>${ts.filter((t) => t.stage === s).length}</strong></button>`,
      )
      .join("")}</div>` +
    `<div class="work-grid"><section class="panel"><div class="panel-head"><h2>${filter ? state.stageNames[filter] : "Alle opgaver"}</h2><span class="count" id="task-count">${visibleTasks(ts).length}</span><input class="search" type="search" id="search" aria-label="Søg i opgaver" placeholder="Søg i opgaver…" value="${esc(query)}"></div><div id="task-list">${taskRows(ts)}</div></section><aside class="side-area"><section class="side-section"><h3>NÆSTE BESLUTNING</h3><div class="review-card"><span class="big">${reviews.length.toString().padStart(2, "0")}</span><p>${reviews.length ? "Opgaver venter på din vurdering. Se ændringen, de aktuelle checks og den dokumenterede værdi." : "Ingen resultater venter på review. Start med et tydeligt mål og testbare acceptkriterier."}</p><small>Du ejer accept. Factoryen samler beviserne.</small><button class="button" id="show-review">${reviews.length ? "Åbn reviewbakken" : "Se arbejdsgangen"} <span>↗</span></button></div></section><section class="side-section"><h3>SENESTE HÆNDELSER</h3><div class="activity">${
      ts
        .flatMap((t) => t.events.map((e) => ({ ...e, title: t.title })))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 3)
        .map(
          (e) =>
            `<div class="activity-item">${esc(e.text)}<small>${esc(e.title.slice(0, 44))}</small></div>`,
        )
        .join("") ||
      '<p class="small-note">Her vises godkendelser, jobpakker og beviser.</p>'
    }</div><p class="note">${dataset === "demo" ? "Eksemplerne viser formatet. De dokumenterer ingen produktivitetsgevinst." : "Jobstatus og GitHub-status er separate. Et afsluttet agentjob er ikke en accepteret leverance."}</p></section></aside></div>`
  );
}
function visibleTasks(ts) {
  return ts.filter(
    (t) =>
      (!filter || t.stage === filter) &&
      (!query ||
        `${t.title} ${t.repo}`.toLowerCase().includes(query.toLowerCase())),
  );
}
function taskRows(ts) {
  return (
    visibleTasks(ts)
      .map(
        (t) =>
          `<button class="task-row" data-task="${t.id}"><span class="task-icon">${t.stage === "accepted" ? "✓" : "◦"}</span><span><span class="task-title">${esc(t.title)}</span><span class="task-meta"><span>#${esc(t.issueNumber ?? t.displayNumber ?? t.id.slice(0, 5))}</span><span>·</span><span>${esc(profile(t.profile)?.name)}</span><span>·</span><span>${t.attempts.length ? euro(cost(t)) : "Afventer job"}</span></span></span>${badge(t)}</button>`,
      )
      .join("") ||
    '<div class="empty">Ingen opgaver i denne visning.<br>Opret en opgave, eller vælg et andet filter.</div>'
  );
}
function renderPulls() {
  return (
    title(
      "GITHUB · ÆNDRINGER",
      "Pull requests til vurdering.",
      "En læst GitHub-status er et øjebliksbillede. Åbn ændringen for diff og aktuelle checks.",
    ) +
    `<div class="panel">${state.pullRequests.length ? state.pullRequests.map((p) => `<a class="task-row" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><span class="task-icon">⑂</span><span><span class="task-title">${esc(p.title)}</span><span class="task-meta">#${esc(p.number)} · ${esc(p.repo)} · ${esc(p.head?.slice(0, 8) ?? "Commit ukendt")}</span></span><span class="badge">${p.draft ? "Kladde" : "Åben"}</span></a>`).join("") : '<div class="empty">Ingen PR’er indlæst.<br>Forbind et repository under Opsætning, og læs GitHub-data.</div>'}</div><p class="small-note">Status kommer fra seneste manuelle synkronisering. Factoryen ændrer eller merger ikke PR’er. Checkresultater importeres særskilt til det konkrete job.</p>`
  );
}
function renderMetrics() {
  const ts = tasks(),
    m = state.metrics[dataset];
  const tabs = `<div class="metric-tabs"><button data-metric="operations" class="${metricView === "operations" ? "active" : ""}">Driftsmålinger</button><button data-metric="benchmarks" class="${metricView === "benchmarks" ? "active" : ""}">Fast evalueringssuite</button></div>`;
  const head =
    title(
      "DOKUMENTERET VÆRDI",
      "Kvalitet, tid og pris. Sammen.",
      "Se om factoryen leverer nyttige resultater med mindre samlet indsats.",
      '<a class="button" href="/api/export" download>Eksportér målinger ↗</a>',
    ) + tabs;
  if (metricView === "benchmarks") return head + renderBenchmarks();
  const rows = ts.filter((t) => t.attempts.length);
  const max = Math.max(1, ...rows.map(cost));
  return (
    head +
    `<div class="summary">${stat("Pris pr. accepteret opgave", euro(m.costPerAcceptedEUR), "Alle forsøg i kohorten / accepterede opgaver")}${stat("Median aktiv køretid", minutes(m.medianActiveMs), "Kun registrerede forsøg")}${stat("Registreret reviewtid", m.reviewMinutes == null ? "Ukendt" : `${m.reviewMinutes}<small>min</small>`, `${Math.round((m.reviewCoverage ?? 0) * 100)} % af forsøg har mennesketid`)}${stat("Reparationsforsøg", m.repairs, "Ekstra forsøg følger opgavens samlede pris")}</div><div class="two-column">${panel("Registreret omkostning pr. opgave", rows.map((t) => `<div class="metric-line"><span title="${esc(t.title)}">#${esc(t.displayNumber ?? t.issueNumber ?? t.id.slice(0, 4))} · ${esc(profile(t.profile)?.inference)}</span><svg class="bar-track" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><rect class="bar" width="${cost(t) == null ? 0 : Math.max(1, (cost(t) / max) * 100)}" height="8" rx="4"/></svg><span>${euro(cost(t))}</span></div>`).join("") + `<p class="small-note">${rows.length ? "Viser summerede registrerede beløb, også på endnu ikke accepterede opgaver." : "Ingen omkostninger registreret."} Manglende regninger bliver ikke til 0 €. Driftsopgaverne er ikke et modelbenchmark.</p>`)}${panel("Hvad tæller med?", `<div class="requirement"><span>Inference og eventuelle reviewmodeller</span><strong>Pr. forsøg</strong></div><div class="requirement"><span>Compute / platform / elektricitet</span><strong>Egen post</strong></div><div class="requirement"><span>Menneskelig afklaring og review</span><strong>Minutter</strong></div><div class="requirement"><span>Ventetid mellem start og accept</span><strong>I eksport</strong></div><p class="small-note">Omkostninger mærkes faktisk eller estimeret. Samlet pris pr. accepteret opgave vises kun, når alle forsøg i kohorten har fulde omkostninger. Der beregnes ikke ROI uden en sammenlignelig baseline.</p>`)}</div><div class="section-title"><h2>Opgavens regnskab</h2><p>${dataset === "demo" ? "Syntetiske eksempeldata" : "Registrerede observationer"} · beløb i EUR</p></div><div class="panel table-wrap"><table><thead><tr><th>Opgave</th><th>Profil</th><th>Forsøg</th><th>Registreret pris</th><th>Aktiv tid</th><th>Resultat</th></tr></thead><tbody>${rows.map((t) => `<tr><td><button class="button" data-task="${t.id}">#${esc(t.displayNumber ?? t.issueNumber ?? t.id.slice(0, 5))}</button></td><td>${esc(profile(t.profile)?.name)}</td><td>${t.attempts.length}</td><td>${euro(cost(t))}<span class="subcell">${t.attempts.every((a) => a.costComplete) ? "Dækning komplet" : "Dækning ufuldstændig"} · ${t.attempts.some((a) => a.costs.some((c) => c.basis === "estimated")) ? "Med estimater" : "Registreret"}</span></td><td>${minutes(duration(t))}</td><td>${badge(t)}</td></tr>`).join("") || '<tr><td colspan="6">Ingen kørsler endnu.</td></tr>'}</tbody></table></div>`
  );
}
function renderBenchmarks() {
  const groups = state.evaluations.groups;
  const actual = groups.length
    ? `<div class="panel table-wrap"><table><thead><tr><th>Konfiguration</th><th>Cases</th><th>Accept / forsøg</th><th>Pris / accept</th><th>Review</th></tr></thead><tbody>${groups.map((g) => `<tr><td>${esc(g.configuration)}</td><td>${g.cases}/${g.requiredCases}</td><td>${g.accepted}/${g.runs}</td><td>${euro(g.costPerAcceptedEUR)}<span class="subcell">${g.costEUR == null ? "Prisgrundlag mangler" : g.estimated ? "Med estimater" : "Faktiske poster"} · ${g.completeCosts ? "komplet" : "ufuldstændig"}</span></td><td>${g.reviewMinutes == null ? "Ukendt" : g.reviewMinutes + " min"}</td></tr>`).join("")}</tbody></table></div><p class="small-note">Importerede reviewer-resultater. Sammenlign kun identiske cases, inputs og gentagelser. Rådata følger eksporten.</p>`
    : "";
  return (
    actual +
    `<div class="two-column">${panel("Evalueringssuite · factory-core-v1", `<span class="badge">${groups.length ? "Resultater importeret · se kohortedækning" : "Suite defineret · modelkørsler ikke udført"}</span><h2>Samme opgave. Samme beviskrav.</h2><p class="small-note">Fem faste prøver sammenligner kodeforståelse, fejlretning, ændringer på tværs af filer, security-review og stop/recovery. Repository-commit, model, harness, kontekst og gentagelse følger hvert forsøg.</p><ol class="small-note"><li>Fastlås input, revision og rubric.</li><li>Kør hver profil på de samme opgaver.</li><li>Vurdér beviser uafhængigt af implementeringen.</li><li>Sammenhold accept, pris og mennesketid.</li></ol><p class="small-note">Ingen model er udpeget som vinder. Demotallene på arbejdsfladen bruges ikke som sammenlignende modelresultater.</p>`)}${panel("Resultater af modelbenchmark", `<div class="empty">${groups.length ? "Resultater vises ovenfor. Se rådata for vurderingsgrundlaget." : "Ingen verificerede modelkørsler endnu.<br>Brug evals/suite.json og resultatformatet i repositoryet."}</div><div class="requirement"><span>Accept pr. opgave</span><strong>Afventer</strong></div><div class="requirement"><span>Samlet pris inklusive fejl</span><strong>Afventer</strong></div><div class="requirement"><span>Falske og oversete security-fund</span><strong>Afventer</strong></div><div class="requirement"><span>Reviewtid og variation</span><strong>Afventer</strong></div>`)}</div>`
  );
}
function renderCapabilities() {
  const labels = {
    files: "Filer",
    shell: "Terminal",
    git: "Git",
    tests: "Tests",
    web: "Web",
    browser: "Browser",
    computer: "Computer",
    security: "Security",
  };
  const status = {
    native: "Indbygget",
    configure: "Opsættes",
    evaluate: "Evalueres",
  };
  return (
    title(
      "HARNESS · VÆRKTØJER · MODEL",
      "Samme metode. Flere måder at køre.",
      "En skill beskriver arbejdet. Harnesset, værktøjerne og miljøet gør det muligt.",
    ) +
    `<div class="legend"><span>● Indbygget = dokumenteret harness-funktion</span><span>◇ Opsættes = kræver miljø, værktøj eller adgang</span><span>○ Evalueres = kvalitet skal bevises</span></div><div class="panel table-wrap"><table><thead><tr><th>Profil</th>${Object.values(
      labels,
    )
      .map((l) => `<th>${l}</th>`)
      .join("")}</tr></thead><tbody>${state.profiles
      .map(
        (p) =>
          `<tr><td><strong>${esc(p.name)}</strong><span class="subcell">${esc(p.inference)}</span></td>${Object.keys(
            labels,
          )
            .map(
              (k) =>
                `<td class="cap-${p.capabilities[k]}">${status[p.capabilities[k]]}</td>`,
            )
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table></div><p class="small-note">Dette er et capability-katalog fra dokumentationen, ikke en grøn installationstest. Alle profiler skal have en konkret preflight, før de kan løse opgavens krav.</p><div class="section-title"><h2>Profiler og data</h2><p>Model og kørselssted vælges hver for sig</p></div><div class="panel">${state.profiles.map((p) => `<article class="profile-card"><h3>${esc(p.name)}</h3><p>${esc(p.note)}</p><div class="tag-row"><span class="badge">${esc(p.region)}</span><span class="badge spec">${esc(p.readiness)}</span></div></article>`).join("")}</div>`
  );
}
function renderSecurity() {
  const ts = tasks();
  const pending = ts.filter(
    (t) => t.attempts.length && t.attempts.at(-1).security !== "reviewed",
  );
  return (
    title(
      "SIKKERHED & KVALITET",
      "Et resultat skal kunne efterprøves.",
      "Kontrol af den konkrete ændring, egen reviewrolle og tydelige uafklarede forhold.",
    ) +
    `<div class="summary">${stat("Til sikkerhedsvurdering", pending.length, "Forsøg uden afsluttet security-review")}${stat("Accepterede opgaver", ts.filter((t) => t.stage === "accepted").length, "Menneskelig accept i denne factory")}${stat("Automatisk merge", "Fra", "Merge og deploy sker separat")}${stat("Modelbaseret scanning", "Afventer", "Ingen live kundescanning udført")}</div><div class="two-column">${panel("Krav før accept", `<ul class="checks"><li>Godkendt opgavescope er uændret</li><li>Checks gælder den afleverede commit</li><li>Security-resultat er vurderet</li><li>Mennesket accepterer de viste beviser</li></ul><p class="small-note">Nye commits gør tidligere checks forældede. Importeret evidens skal komme fra en betroet verifier; agentens egen påstand er ikke tilstrækkelig.</p>`)}${panel("Security som specialistspor", `<span class="eyebrow">CODEX / DAYBREAK</span><p class="small-note">Inventory → fund → validering → ansvarlig → rettelse → efterprøvning. Brug Codex Security på den produktflade, der faktisk er tilgængelig. En lokal model kan også indgå og måles mod samme krav.</p><p class="small-note">Plugins, adgang, model og verificering er særskilte dele. Følsomme fund hører hjemme i et privat scope.</p>`)}</div><div class="section-title"><h2>Opgaver til vurdering</h2><p>Review er knyttet til beviser, ikke til et modelnavn</p></div><div class="panel">${taskRows(ts.filter((t) => ["review", "blocked"].includes(t.stage)))}</div>`
  );
}
function renderSetup() {
  return (
    title(
      "DIT SETUP",
      "En åben kerne. Tre konkrete spor.",
      "Start med den vej, der passer til opgaven. Bevar skills, acceptkrav og måleformat.",
    ) +
    `<div class="setup-steps"><article class="setup-card"><span class="number">01 · LOKAL</span><h2>Codex på din maskine</h2><p>CLI, separat arbejdsområde og repoets skills. Vælg OpenAI-inference eller Ollama på fx Z13. Browser og computer use får en særskilt preflight.</p><pre class="code">npm start\nnpm run doctor\nnpm run worker -- --task ID</pre><span class="badge">Første lokale harness</span></article><article class="setup-card"><span class="number">02 · CLOUD</span><h2>Cursor som worker</h2><p>Managed VM og computer use. Godkendte issues udløser job via label eller API. Cursor udfører arbejdet; factoryen samler beviser og målinger.</p><pre class="code">factory:ready\n→ Cursor Automation / API\n→ separat review → accept</pre><span class="badge spec">Konto og miljø skal forbindes</span></article><article class="setup-card"><span class="number">03 · INFERENCE</span><h2>Kastanje som modelrute</h2><p>Samme factory med valgte åbne modeller via Kastanje. Dokumentér endpoint-kompatibilitet, region, logs og omkostning for den konkrete rute.</p><pre class="code">Harness → Kastanje API\n→ valgt model / udbyder\n→ forbrug pr. forsøg</pre><span class="badge spec">Målprofil · integration afprøves</span></article></div><section class="panel wide"><div class="panel-head"><h2>Hvor ligger hvad?</h2></div><div class="panel-body"><div class="data-flow"><div class="flow-box">GitHub<small>Issues · PR’er · kode</small></div><span>↔</span><div class="flow-box">Factory<small>Routing · journal · review</small></div><span>↔</span><div class="flow-box">Worker<small>Harness · værktøjer · testmiljø</small></div><span>↔</span><div class="flow-box">Inference<small>Lokal · Kastanje · ekstern</small></div></div><p class="small-note">EU-inference betyder ikke automatisk, at alle data forbliver i EU. Kildekode, prompts, logs, artifacts og øvrige værktøjer skal kortlægges separat. Cloudvalg skifter ikke profil i baggrunden.</p></div></section><div class="section-title"><h2>GitHub-forbindelse</h2><p>Tokens bliver på serveren</p></div>${panel("Læs issues fra ét repository", `<p class="small-note">${state.repo ? `Konfigureret: <strong>${esc(state.repo)}</strong>` : "Start serveren med FACTORY_REPO=owner/repo. Private repositories kræver en snæver GITHUB_TOKEN på serveren."} Import læser op til 100 åbne issues og 100 åbne PR’er. Denne version ændrer ikke GitHub-labels, opretter PR’er eller starter cloudagenter fra UI’et.</p><button class="button" id="sync-github" ${state.repo ? "" : "disabled"}>Læs GitHub-issues ↻</button><p class="small-note">Opsætning, cloudautomation og drift er beskrevet i README.md og docs/setup.md.</p>`)}`
  );
}
function bindView() {
  document
    .querySelectorAll("[data-task]")
    .forEach((b) => (b.onclick = () => openTask(b.dataset.task)));
  document.querySelectorAll("[data-stage]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = filter === b.dataset.stage ? "" : b.dataset.stage;
        render();
      }),
  );
  document.querySelectorAll("[data-metric]").forEach(
    (b) =>
      (b.onclick = () => {
        metricView = b.dataset.metric;
        render();
      }),
  );
  if ($("#search"))
    $("#search").oninput = (e) => {
      query = e.target.value;
      $("#task-list").innerHTML = taskRows(tasks());
      $("#task-count").textContent = visibleTasks(tasks()).length;
      document
        .querySelectorAll("[data-task]")
        .forEach((b) => (b.onclick = () => openTask(b.dataset.task)));
    };
  if ($("#new-task"))
    $("#new-task").onclick = () => {
      $("#create-profile").innerHTML = state.profiles
        .map((p) => `<option value="${p.id}">${esc(p.name)}</option>`)
        .join("");
      $("#create-dialog").showModal();
    };
  if ($("#show-review"))
    $("#show-review").onclick = () => {
      if (tasks().some((t) => t.stage === "review")) {
        filter = "review";
        render();
      } else {
        view = "setup";
        render();
      }
    };
  if ($("#sync-github"))
    $("#sync-github").onclick = async () => {
      const b = $("#sync-github");
      b.disabled = true;
      b.textContent = "Læser…";
      try {
        const r = await api("/api/github/sync", {});
        dataset = "live";
        await load();
        toast(
          `${r.count} issues og ${r.pullRequests} PR’er læst${r.limited ? " · listen er begrænset til første side" : ""}.`,
        );
      } catch (e) {
        toast(e.message);
        b.disabled = false;
        b.textContent = "Læs GitHub-issues ↻";
      }
    };
}
function openTask(id) {
  selected = id;
  renderDetail();
  if (!$("#task-dialog").open) $("#task-dialog").showModal();
}
function renderDetail() {
  const t = state.tasks.find((x) => x.id === selected);
  if (!t) return;
  const a = t.attempts.at(-1);
  const prepared = a?.status === "prepared",
    active = a && ["prepared", "running", "unknown"].includes(a.status);
  let buttons = "";
  if (["inbox", "spec", "ready", "blocked"].includes(t.stage) && !active)
    buttons +=
      '<button class="button soft" data-action="approve">Godkend scope</button>';
  if (t.stage === "ready" && !active)
    buttons +=
      '<button class="button primary" data-action="prepare">Forbered job</button>';
  if (prepared)
    buttons += `<a class="button primary" href="/api/tasks/${t.id}/job" download>Hent jobpakke ↓</a>${t.source === "demo" ? '<button class="button soft" data-action="simulate">Simulér demokørsel</button>' : ""}`;
  if (active)
    buttons +=
      '<button class="button danger" data-action="cancel">' +
      (prepared ? "Annullér jobpakke" : "Anmod om stop") +
      "</button>";
  if (t.stage === "review")
    buttons +=
      '<button class="button primary" data-action="accept">Acceptér resultat</button>';
  $("#detail").innerHTML =
    `<div class="dialog-head"><div><span class="eyebrow">${esc(t.repo)} · ${t.source === "demo" ? "DEMO" : "LOKAL JOURNAL"}</span><h2 id="dialog-title">${esc(t.title)}</h2>${badge(t)}</div><button class="icon-button close" aria-label="Luk">×</button></div><div class="detail-grid"><div><small>Registreret omkostning</small>${t.attempts.length ? euro(cost(t)) : "Ukendt"}</div><div><small>Seneste aktive køretid</small>${minutes(a?.activeMs)}</div><div><small>Forsøg</small>${t.attempts.length}</div></div><div class="detail-section"><h3>Behov</h3><p>${esc(t.body)}</p><h3>Acceptkriterier</h3><p>${esc(t.acceptance)}</p></div><div class="detail-section"><h3>Kørselsprofil</h3><p>${esc(profile(t.profile)?.name)}<br><span class="muted">${esc(profile(t.profile)?.readiness)}</span></p>${t.requirements.map((r) => `<span class="badge spec">${esc(r)}</span> `).join("")}</div><div class="detail-section"><h3>Beviser ${a?.head ? `· ${a.head.slice(0, 8)}` : ""}</h3>${a?.checks.length ? `<ul class="checks">${a.checks.map((c) => `<li class="${c.status === "passed" ? "" : "failed"}">${esc(c.name)} · ${esc(c.status)}</li>`).join("")}</ul><p class="muted">Security: ${esc(a.security)} · ${a.provenance === "synthetic" ? "Syntetiske beviser" : "Importeret evidens"}${a.costComplete ? "" : " · omkostninger er ufuldstændige"}</p>` : '<p class="muted">Ingen verificerede beviser endnu. En jobpakke starter ikke en agent og giver ikke en sikkerhedsgodkendelse.</p>'}</div>${!active && t.stage !== "accepted" ? `<details><summary class="small-note">Redigér specifikation</summary><form id="edit-form"><label>Acceptkriterier<textarea name="acceptance" required>${esc(t.acceptance)}</textarea></label><label>Kørselsprofil<select name="profile">${state.profiles.map((p) => `<option value="${p.id}" ${p.id === t.profile ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label><button class="button" type="submit">Gem og kræv ny godkendelse</button></form></details>` : ""}<div class="form-error" role="alert"></div><div class="actions">${buttons}${t.url ? `<a class="button" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">Se issue på GitHub ↗</a>` : ""}</div><p class="muted">Accept registreres lokalt. Merge og deploy udføres ikke af denne handling.</p>`;
  $("#detail .close").onclick = () => $("#task-dialog").close();
  document
    .querySelectorAll("[data-action]")
    .forEach(
      (b) =>
        (b.onclick = () => taskAction(b.dataset.action, { head: a?.head })),
    );
  if ($("#edit-form"))
    $("#edit-form").onsubmit = (e) => {
      e.preventDefault();
      taskAction("edit", Object.fromEntries(new FormData(e.target)));
    };
}
async function taskAction(action, extra = {}) {
  const t = state.tasks.find((t) => t.id === selected);
  document
    .querySelectorAll("[data-action]")
    .forEach((b) => (b.disabled = true));
  try {
    await api(`/api/tasks/${t.id}/${action}`, {
      revision: t.revision,
      ...extra,
    });
    await load();
    renderDetail();
    toast(
      {
        approve: "Scope godkendt.",
        prepare: "Jobpakke forberedt. Agenten er ikke startet.",
        simulate: "Syntetisk kørsel afsluttet.",
        accept: "Resultatet er accepteret lokalt.",
        cancel: "Stop eller annullering registreret.",
        edit: "Specifikation gemt. Ny godkendelse kræves.",
      }[action],
    );
  } catch (e) {
    $("#detail .form-error").textContent = e.message;
    document
      .querySelectorAll("[data-action]")
      .forEach((b) => (b.disabled = false));
  }
}
$("#create-form").onsubmit = async (e) => {
  e.preventDefault();
  const b = e.target.querySelector("[type=submit]");
  b.disabled = true;
  try {
    const t = await api(
      "/api/tasks",
      Object.fromEntries(new FormData(e.target)),
    );
    $("#create-dialog").close();
    e.target.reset();
    dataset = "live";
    filter = "";
    await load();
    openTask(t.id);
  } catch (error) {
    e.target.querySelector(".form-error").textContent = error.message;
  } finally {
    b.disabled = false;
  }
};
$("#create-dialog .close").onclick = () => $("#create-dialog").close();
$("#refresh").onclick = () => load();
document.querySelectorAll("[data-view]").forEach(
  (b) =>
    (b.onclick = () => {
      view = b.dataset.view;
      filter = "";
      query = "";
      render();
    }),
);
await load();
