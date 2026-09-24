# Arcitai Factory

**Business first. Security and quality built in.**

En åben, self-hostable starter til en software- og security-factory. GitHub ejer issues, kode og PR’er. Factoryen samler opgaver, jobforsøg, review og dokumenteret værdi. Harness og inference vælges hver for sig.

**Start her til review:** [Kort visuelt overblik — status og næste byggetrin](docs/review.html). Åbn filen i en browser; den virker offline.

## Prøv dashboardet

Kræver Node.js **22.13+** med `node:sqlite` (afprøvet på 22.21.1 og 22.22.3). Dashboardets kerne kræver ingen eksterne npm-pakker, ingen build, ingen GitHub Actions og intet modelkald ved start. Security-workerens SDK installeres separat efter behov.

```sh
npm start
```

Åbn **http://127.0.0.1:4317**. Demodata er tydeligt mærkede. Prøv en klar opgave: **Forbered job → Simulér demokørsel → Acceptér resultat**. Vælg **Vis egne data** for en tom lokal kø, eller opret en opgave. Tilstand gemmes under `.factory/` og overlever genstart. Node 22 viser en forventet advarsel om sin eksperimentelle SQLite-API.

```sh
npm run check
npm run doctor
```

## Hvad er med?

| Del | Implementeret i v0.1 |
| --- | --- |
| Arbejdsflade | Opret, søg, filtrér, ændr acceptkriterier/profil, godkend scope, forbered job, annullér/anmod om stop, gennemse beviser og acceptér lokalt |
| GitHub | Læs åbne issues og PR’er, links til kodeplatformen, signeret issue-webhook, delivery-deduplikering og maintainer-gate |
| Jobjournal | SQLite, revisionskontrol, scope-hash, forsøg, commit, checks, security-disposition, omkostninger, tid og hændelser |
| Worker | Codex CLI, Pi RPC og valgfri Security SDK; ét aktivt lokalt job, timeout, stop, private artifacts og evidensimport. Nye adaptere er syntetisk afprøvet |
| Cloud | Cursor v1-jobpayload og konkret opskrift til label-baseret Automation/API; konto og cloudafvikling er ikke forbundet |
| Metode | Seks originale project-local skills og seks profiler: Codex, Codex/Ollama, Codex/Kastanje, Cursor cloud, Codex Security og Pi custom |
| Målinger | Pris pr. opgave/accept, aktiv tid, reviewtid, forsøg, prisdækning og tydelige estimater; JSON-eksport |
| Evaluering | Fem faste cases, verifier-rubric, input-hash, import og visning af virkelige resultater; ingen modelresultater opfundet |

**Det er en kørbar starter med en bevidst manuel overdragelse til eksterne tjenester.** UI’et starter ikke betalte agenter, opretter ikke PR’er og udfører ikke merge/deploy. Automatisk provider-polling, fuld GitHub-reconciliation, udgiftsstop i kroner, autentificering og flere samtidige workers er viderebygning. Se [arkitektur og grænser](docs/architecture.md).

## Vælg første setup

1. **Åben factory: Pi er første kandidat.** Efter den nye research anbefales Pi + isoleret worker + én browser-CLI, med Kastanje eller lokal inference som mulige ruter. Pi er nu tilsluttet CLI-jobrunneren og har bestået et helt syntetisk job. Model og miljø kræver konkret preflight. [Worker-opsætning](docs/worker-integrations.md). [Research](docs/pi-research.md) · [konkret Pi-blueprint](profiles/pi/README.md).
2. **Adapter som findes i v0.1: Codex CLI.** Brug den eksisterende worker-overdragelse, når den konkrete Codex/model/miljøprofil er kvalificeret. Lokal worker er ikke automatisk lokal inference. [Lokal profil](profiles/codex-local.md) · [Kastanje/Ollama via Codex](profiles/open-models.md).
3. **Managed cloud: Cursor Cloud Agent.** Relevant, når managed computer/browser og repo-miljø begrunder mindre kontrol over stacken. [Cursor-opskrift](profiles/cursor-cloud.md).

Security bruger samme kerne og et særskilt specialistspor. Den officielle Codex Security SDK er nu et valgfrit worker-modul med en bestået syntetisk rapportprøve. Reel modeladgang og scanning skal kvalificeres separat. Browser og især desktopstyring kræver deres egne prøver. Ingen Warp-abonnement kræves, og ingen prisbesparelse er målt på en komplet pilot endnu.

Security SDK har et åbent dependencyfund i ZIP-håndteringen. Adapteren bruger den medfølgende pluginmappe og afviser custom plugins; dependencyen er ikke rettet. [Afgrænsning og pilotforbehold](docs/security-dependency-review.md).

## Læs videre

- [BuilderIO: tre trin, få capabilities og en manuel pilot først](docs/builderio-review.md) · [Kræver din beslutning](templates/human-review.md)
- [Pi: dyb research, minimumscapabilities og vurdering af HarnessTax](docs/pi-research.md) · [Pi-profiler](profiles/pi/README.md)
- [Pi- og Security-jobadaptere: opsætning og prøver](docs/worker-integrations.md)
- [Genbrug Codex Security og pak et lean Pi-setup](docs/codex-reuse.md)
- [Seks videoer: kildegennemgang og dækningskontrol](docs/video-audit.md)
- [Næste runtime: samlet pipeline og prioriterede opgaver](docs/next-runtime.md) · [Reviewpakke med før/efter](templates/review-packet.md)
- [Opsætning og en hel opgave fra start til accept](docs/setup.md)
- [Research: Warp/Oz, alternativer og anbefalet system](docs/research.md)
- [Start målingen: fem målepunkter, én scorer og bachelorprotokol](docs/value.md) · [Warp-kilder og tilpasning](docs/warp-measurement.md)
- [Skills](.agents/skills/README.md) · [Profiler](config/profiles.json) · [Evalueringer](evals/suite.json)
- [Security og tillidsgrænser](SECURITY.md) · [Recovery](docs/recovery.md)
- [Udførte kontroller og kendte begrænsninger](docs/proof.md)

MIT-licens. Uafhængigt repository uden AIOS som runtime-afhængighed. [Ejerskab og kildeproveniens](docs/ownership.md).
