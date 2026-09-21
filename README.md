# Arcitai Factory

**Business first. Security built in.**

En åben, self-hostable starter til en software- og security-factory. GitHub ejer issues, kode og PR’er. Factoryen samler opgaver, jobforsøg, review og dokumenteret værdi. Harness og inference vælges hver for sig.

## Prøv dashboardet

Kræver Node.js **22.13+** med `node:sqlite` (afprøvet på 22.21.1 og 22.22.3). Ingen eksterne npm-pakker, ingen build, ingen GitHub Actions og intet modelkald ved start.

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
| Worker | Codex CLI-adapter med kontrolleret overdragelse, ét aktivt lokalt job, timeout, stop, private artifacts og evidensimport |
| Cloud | Cursor v1-jobpayload og konkret opskrift til label-baseret Automation/API; konto og cloudafvikling er ikke forbundet |
| Metode | Seks originale project-local skills og seks profiler: Codex, Codex/Ollama, Codex/Kastanje, Cursor cloud, Codex Security og Pi custom |
| Målinger | Pris pr. opgave/accept, aktiv tid, reviewtid, forsøg, prisdækning og tydelige estimater; JSON-eksport |
| Evaluering | Fem faste cases, verifier-rubric, input-hash, import og visning af virkelige resultater; ingen modelresultater opfundet |

**Det er en kørbar starter med en bevidst manuel overdragelse til eksterne tjenester.** UI’et starter ikke betalte agenter, opretter ikke PR’er og udfører ikke merge/deploy. Automatisk provider-polling, fuld GitHub-reconciliation, udgiftsstop i kroner, autentificering og flere samtidige workers er viderebygning. Se [arkitektur og grænser](docs/architecture.md).

## Vælg første setup

1. **Lokal pilot: Codex CLI.** Behold kendt harness; brug OpenAI-inference eller en afprøvet Ollama-model på fx ROG Flow Z13. Lokal worker er ikke automatisk lokal inference. [Lokal profil](profiles/codex-local.md).
2. **Cloudpilot: Cursor Cloud Agent.** Managed computer/browser og repo-miljø. Brug en godkendt label eller API-overdragelse. [Cursor-opskrift](profiles/cursor-cloud.md).
3. **Målprofil: Codex + Kastanje AI.** Egen worker, valgte åbne modeller og en dokumenteret EU-inference-rute. Endpoint, tool calling, kvalitet, dataveje og forbrug skal verificeres først. [Kastanje/Ollama](profiles/open-models.md).

Pi er et avanceret tilvalg, når den konkrete værktøjskæde begrunder det. Security bruger samme kerne og et særskilt specialistspor; Codex Security/Daybreak kan tilsluttes på den produktflade, hvor adgang faktisk findes. Ingen Warp-abonnement kræves.

## Læs videre

- [Opsætning og en hel opgave fra start til accept](docs/setup.md)
- [Research: Warp/Oz, alternativer og anbefalet system](docs/research.md)
- [Målinger, benchmarks og salgspilot](docs/value.md)
- [Skills](.agents/skills/README.md) · [Profiler](config/profiles.json) · [Evalueringer](evals/suite.json)
- [Security og tillidsgrænser](SECURITY.md) · [Recovery](docs/recovery.md)
- [Udførte kontroller og kendte begrænsninger](docs/proof.md)

MIT-licens. Uafhængigt repository uden AIOS som runtime-afhængighed. [Ejerskab og kildeproveniens](docs/ownership.md).
