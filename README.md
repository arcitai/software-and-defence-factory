# Arcitai Software & Defence Factory

**Én CLI og ét dashboard til softwarearbejde og privat incident-triage.**
Self-hostet på [Machinist](https://github.com/owainlewis/machinist), med isolerede Docker-jobs, vertical slices, tests og separat review. Ingen Archon eller obligatorisk platformsubscription. Dit app-repo og dets deployment bevares.

**v0.2 er en testudgave.** Installation og fejlforløb er afprøvet lokalt uden modelkald. En rigtig app/modelpilot og live driftsovervågning er næste kvalificering.

## Prøv den — uden modelnøgle

Kræver **Node 22.13+, Git og kørende Docker Engine/Desktop** på macOS eller Linux. Første installation henter og bygger runtime og jobimage; afsæt diskplads og nogle minutter.

```sh
git clone https://github.com/arcitai/software-and-defence-factory.git
cd software-and-defence-factory
npm run factory -- demo
```

Åbn **http://127.0.0.1:7332**. En syntetisk opgave ændrer en lille fixture, kører tests og venter på din godkendelse. Se patch, checks og review under **Files**; godkend derefter handoff. Ingen model, PR, merge eller deployment bruges i demoen.

Stop: `npm run factory -- stop --state .factory/demo-platform`.

## Forbind din egen app

```sh
npm run factory -- init --repo /absolut/sti/til/app --agent codex --check "npm ci && npm test"
npm run factory -- install
# Tilføj kun din inference-nøgle i den private .factory/platform/model.env.
npm run factory -- up
npm run factory -- run --issue https://github.com/OWNER/APP/issues/123
```

Vælg appens rigtige checkkommando. Issue-import kræver `gh` med læseadgang; `run --file task.md` virker uden GitHub. [Quickstart](docs/quickstart.md) forklarer Codex/Pi, privat konfiguration, VPS og aflevering.

| Del | Hvad bruger vi den til? |
| --- | --- |
| **Arcitai CLI** | Opsætning, installation, start/stop, opgaver, incident-input og kontrolleret retry |
| **Machinist** | Dashboard, én jobkø, trin, godkendelser, historik og artefakter |
| **Docker** | Agentens checkout, shell og tests; ingen Docker-socket eller deploynøgler i agentjobbet |
| **Codex / Pi / egen command** | Udskiftelig agent; modellen og inferenceadgangen vælges separat |
| **Seks skills** | Scope, vertical slices, implementering, review, security og dokumenteret værdi |
| **GitHub / Actions** | Issues og PR’er; appens almindelige tests og CI/CD. Agentjobs kører på din vært |
| **Defence** | Manuel, privat evidens → læseundersøgelse → uverificeret udkast. Ingen produktionshandlinger |

Softwareforløb: **opgave → ændring → appchecks → separat review → din godkendelse → patch og beviser**. PR-oprettelse er endnu manuel. Varighed gemmes pr. forsøg; pris og mennesketid står som ukendt, indtil de faktisk måles.

**Start her:** [Kort visuelt overblik](docs/review.html) · [Quickstart og VPS](docs/quickstart.md) · [Afprøvninger og grænser](docs/platform-proof.md).

Metoden kan også bruges uden platformen: [portabelt kit](kit/README.md). Den tidligere Node-prototype er bevaret via `npm start`; den deler ikke jobkø eller data med Machinist. [Arkitektur og næste slices](docs/platform.md) · [Defence-kontrakt](docs/defence-integration.md) · [Kilder og licenser](docs/ownership.md).

MIT for Arcitai-koden. Machinist og agentpakker beholder deres egne licenser. Repositoryets synlighed ændres ikke af installationen.
