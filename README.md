# Arcitai Software and Security Factory

**Business first. Security and quality built in.**

En åben factory-pakke til **eksisterende app-repositories**: fælles skills, vertical slices, CI-/security-principper, review og dokumenteret værdi. Agent/harness, model, arbejdsmiljø og deployment vælges pr. installation. GitHub kan være hele kontrolpanelet. Vores lokale runner og dashboard er et valgfrit supplement.

**Produktgrænse:** Denne factory bygger og retter software med security og kvalitet indbygget. Den separate **Defense Factory** overvåger systemer i drift og kan aflevere konkrete fund hertil — også fra software bygget andre steder. [Ansvar og overdragelse](docs/adoption.md#produktnavn-og-grænsen-til-defense-factory).

**Start her:** [Kort visuelt review](docs/review.html) · [Hvad er fast, og hvad vælger installationen?](docs/adoption.md)

## Tilslut en app

Klon eller hent dette repository som kilde til pakken. Appens kode bliver i sit nuværende repo. Med Node 22.13+ kan du eksportere en lille pakke til en ny mappe:

```sh
node scripts/export-kit.mjs ../my-app-factory-kit
```

Eksporten overskriver ikke en eksisterende mappe. Den indeholder seks skills, en issue-form, metode, installationsark, afleveringsskabelon og et **inaktivt** CI-eksempel. Ingen database, server, model eller providerkonto kræves for at bruge instruktionerne. Læs den eksporterede `.factory-kit/README.md`, og lad din valgte agent tilpasse pakken på en branch i appens eget repo.

[Adoptionsvejledning](kit/README.md) · [Fælles regler](kit/policy.md) · [Installationsark](kit/installation.md) · [Aflevering og målinger](kit/delivery.md)

| Vi definerer | Installationen udfylder |
| --- | --- |
| Afgræns → byg i vertical slices → bevis → separat review | Appens arkitektur, tests og konkrete acceptkriterier |
| Portable skills og krav til nødvendige capabilities | Codex, Cursor, Pi eller anden agent; valgte modeller og værktøjer |
| CI verificerer kode; CD leverer efter projektets politik | Eksisterende Actions/anden CI, host, miljøer og rollback |
| Security efter ændringens risiko, fund og release | Relevante scannere/specialister og privat fundkanal |
| Én jobejer, kendt status, stop og beviser | Manuel start, providerens automation eller egen runner |
| Fem målepunkter med ærlige ukendte værdier | Målekilder, forbrugsgrænser og observationsperiode |

**Ingen provider er standard for produktet.** En installation må gerne vælge ét konkret abonnement eller runtime. Det valg ændrer ikke den fælles metode. En kopieret skill starter ikke et cloudjob: den valgte integration skal konfigureres og afprøves. [Driftsvalg og grænser](docs/adoption.md).

Eksport og beskyttelse mod overskrivning er afprøvet med isolerede fixtures. Pakken er endnu ikke kvalificeret gennem en rigtig kundes cloud-/modelopgave. Der er ingen aktiveret automation, CD eller ekstern publicering.

## Valgfrit: prøv den lokale runner og dashboardet

Kræver Node.js **22.13+** med `node:sqlite` (afprøvet på 22.21.1 og 22.22.3). Dashboardets kerne kræver ingen eksterne npm-pakker, ingen build, ingen GitHub Actions og intet modelkald ved start. Security-workerens SDK installeres separat efter behov.

```sh
npm start
```

Åbn **http://127.0.0.1:4317**. Demodata er tydeligt mærkede. Prøv en klar opgave: **Forbered job → Simulér demokørsel → Acceptér resultat**. Vælg **Vis egne data** for en tom lokal kø, eller opret en opgave. Tilstand gemmes under `.factory/` og overlever genstart. Node 22 viser en forventet advarsel om sin eksperimentelle SQLite-API.

```sh
npm run check
npm run doctor
```

### Hvad er med i den valgfrie runtime?

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

Security kan bruge en valgt specialist, inklusive Codex Security hvor tilgængelig. Det valg kræver ikke, at resten af installationen bruger Codex. Starterens valgfrie Security SDK har et åbent dependencyfund, beskrevet i [pilotforbeholdene](docs/security-dependency-review.md).

## Valgfrie profiler og baggrund

- [Lavpris: almindelig CI/CD, egne Actions-runners og modelomkostninger](docs/low-cost.md)

- [Cloudmuligheder og Cloudroom: sammenligning, ikke obligatorisk stack](docs/cloud-setup.md)
- [Pi-blueprint](profiles/pi/README.md) · [Codex lokalt](profiles/codex-local.md) · [Åbne modeller](profiles/open-models.md) · [Cursor cloud](profiles/cursor-cloud.md)
- [Ras Mic og fem øvrige videoer](docs/video-audit.md) · [BuilderIO](docs/builderio-review.md) · [Dex og vertical slices](docs/dex-review.md)
- [Metode for dokumenteret værdi](docs/value.md) · [Warp-måling](docs/warp-measurement.md)
- [Valgfri runtime: arkitektur](docs/architecture.md), [setup](docs/setup.md), [viderebygning](docs/next-runtime.md) og [workerprøver](docs/worker-integrations.md)
- [Udførte kontroller](docs/proof.md) · [Security](SECURITY.md) · [Recovery](docs/recovery.md)

MIT. Uafhængigt af AIOS og bestemte agentprodukter. [Ejerskab og kildeproveniens](docs/ownership.md).
