# Fra klon til første review

Start med README-demoen. Den beviser installationen med en syntetisk agent, ikke modelkvalitet. Kør derefter din egen app med én lille vertical slice.

## Vælg vært og app

| Valg | Opsætning |
| --- | --- |
| Mac | Node 22.13+, Git og Docker Desktop. Controlleren kører på Mac; jobs i Linux-containere. Maskinen skal være vågen. |
| Linux-VPS | Samme CLI, Docker Engine, vedvarende disk og en dedikeret bruger med Docker-adgang. Ingen GPU nødvendig med ekstern inference. Brug systemd og SSH nedenfor. |
| ROG Flow / Windows | Installer i WSL2 med Docker-integration. Denne profil er endnu ikke afprøvet. |

Start med én betroet operatør, ét repo og ét kundescope. Docker-adgang giver controlleren omfattende adgang til værten; agentjobbet får ikke denne adgang. Vælg en dedikeret vært til kundearbejde. Modeller, VPS, strøm og drift kan koste penge; ingen gratis cloudkapacitet loves. Cloudflare er endnu ikke en runtimeprofil.

Klon appen separat. `init` ændrer ikke appens filer. Jobs kloner appens **aktuelle lokale HEAD**; ikke-committede ændringer, `.env` og andre ikke-trackede filer følger ikke med. Hent/opdater selv appens checkout mellem opgaver. Submodules, Git LFS og eksterne services kræver en særskilt kvalificeret profil.

```sh
npm run factory -- init --repo /absolute/path/to/app --agent codex --check "npm ci && npm test"
npm run factory -- install
npm run factory -- doctor
```

`install` checksum-verificerer og bygger Machinist fra [den pinnede revision](../factory/pins.json), installerer jobimaget og fastholder dets lokale image-ID. Ingen global Machinist-config eller systemtjeneste ændres. Et nyt `install` kan opdatere OS-/transitive imagepakker; stop factoryen før opdatering og gentag relevant kvalificering.

## Vælg inference

Redigér `.factory/platform/model.env` (privat, Git-ignoreret). Ingen nøgler i kommandohistorik, issues eller source. Standardprofilen er til dit eget betroede repo; agentprocessen kan læse den inference-nøgle, den får. Brug en begrænset pilotnøgle og providerens forbrugsgrænse. Verifikationsjobs modtager ingen modelnøgler. Tilføj aldrig GitHub-, deploy- eller cloud-adminnøgler.

| Agent | Konfiguration |
| --- | --- |
| Codex | `--agent codex`; `CODEX_API_KEY=…` i model.env. Valgfrit `--model MODEL_ID` ved init. Codex CLI 0.156.1. Dette bruger API-adgang, ikke automatisk dit ChatGPT-abonnement. [Officiel auth-vejledning](https://learn.chatgpt.com/docs/non-interactive-mode). |
| Pi | `--agent pi --model PROVIDER/MODEL`; den valgte providers nøgle fra `pi --help` i model.env. Pinned CLI 0.73.1; ingen automatisk extension-discovery. Fælles skills indlæses eksplicit. |
| Egen agent/lokal model | `--agent custom --command-json '["your-agent","--print"]'`; vælg et `image` med agenten installeret. Prompt kommer på stdin. Adapteren skal skrive rapporterne i `/output`. |

Codex/Pi-kommandofladerne er kontrolleret i imaget; betalt modelkald er ikke kørt som kvalificering. Lokale/OpenAI-kompatible endpoints kræver agentens providerkonfiguration og et endpoint, containeren kan nå. `localhost` i containeren er ikke værtsmaskinen. Vi deler ikke automatisk dit hjemmekatalog, din Codex-session eller lokale tjenester.

`factory.json` er operatørkonfiguration: repo, command-argumenter, checkkommando, model, image, timeout, hukommelse, netværk og `scope`. Netværk er `bridge` for modeller og `none` i demoen. Standardimaget har Node, Git og Python. Browsers, computer-use, ekstra runtimes og security plugins kræver en eksplicit image-/agentprofil; skills installerer ikke værktøjerne. Genstart efter ændringer; opret en ny opgave ved ændret agent/politik.

## Arbejd fra dashboard eller issue

```sh
npm run factory -- up
npm run factory -- run --file /path/to/task.md
# Eller: npm run factory -- run --issue https://github.com/OWNER/APP/issues/123
```

Dashboard: **http://127.0.0.1:7331**. Vælg workflow **software** og repo **app**, hvis du opretter opgaven dér. Hold den til én observerbar vertical slice med acceptkriterier og konkret app-risiko.

Under **Files** ligger `change.patch`, revision, checks, separat agentreview og målinger. Godkendelsen starter kun handoff. Download patchen, anvend den på en ny app-branch fra den dokumenterede base, og kør appens normale checks/PR-flow. Ændret base eller patch kræver ny relevant verifikation. Et agentreview er ikke en kvalitetsgaranti.

Ved ændringsønsker: opret en ny softwareopgave med feedback. Machinists **Request changes** genkører kun foregående reviewtrin; denne udgave bruger det ikke som automatisk implementeringsloop. Issue-labels/polling starter endnu ikke jobs. Brug de to workflows; de enkelte rå commands er ikke selvstændige Arcitai-forløb.

## Prøv Defence

Tilpas `scope` i factory.json og en kopi af [incident.json](../factory/examples/incident.json). Rens og minimér input før aflevering. `sanitized:true` er din erklæring, ikke en automatisk garanti. Credentialdetektoren afviser nogle genkendelige nøgler, men erstatter ikke minimering.

```sh
npm run factory -- incident --file /private/path/incident.json
```

Samme kunde/miljø/tjeneste/kilde/event-ID genbruger sagen; ændret indhold afvises. Controlleren binder sagen til det optagne job. Manglende/tomme log-, målings- eller revisionsuddrag samt observationer ældre end en time/fremtidige tidsstempler bliver evidenshuller. Rapporten er et **uverificeret udkast**; sagen forbliver åben. Opret selv en softwareopgave efter review af et rettelsesforslag.

Dette er manuel evidens-triage: ingen live connector, kontinuerlig scanner, verificeret rodårsag, automatisk lukning eller produktionsrecovery. [Defence-kontrakten](defence-integration.md) beskriver også senere arbejde.

## Stop, recovery og data

```sh
npm run factory -- cancel JOB_ID
npm run factory -- retry JOB_ID
npm run factory -- stop
```

`cancel` stopper opgaven og dens mærkede containere. Supervisoren overvåger også dashboard-cancel og deadlines. `retry` afviser en stadig levende executor/procesgruppe og bekræfter containerstop først; et tidligere build-checkout bevares ved siden af det nye. Slet ikke en lås for at skjule ukendt stopstatus. Efter mistet worker kan leasen skulle udløbe, før jobbet viser **interrupted**.

En afbrudt incident-optagelse kan have ukendt resultat. Find først sagen i dashboardet, og bind den eksisterende jobidentitet i den private sagsrecord efter kontrol. CLI'en afviser automatisk replay; start ikke en parallel sag.

`.factory/platform` indeholder database, private logs, checkouts, incident-input og artefakter. Mapper oprettes private; andre processer under samme bruger deler tillid. Dashboardet har ingen multi-user login. Stop før en samlet backup af state, og bevar factory-commit/image-ID. Gamle prototype-data migreres ikke. Aftal retention; automatisk sletning er ikke implementeret.

## VPS: vedvarende proces og privat adgang

Afprøv først demo og app-setup på VPS'en som din dedikerede bruger. Stop en eventuel `up`-instans og opret en **systemd user service**:

```sh
mkdir -p ~/.config/systemd/user
npm run --silent factory -- service > ~/.config/systemd/user/arcitai-factory.service
systemctl --user daemon-reload
systemctl --user enable --now arcitai-factory.service
```

Aktivér linger via VPS-administrationen, hvis tjenesten skal fortsætte uden login. Start ikke også `up`. Brug `systemctl --user stop arcitai-factory` ved backup/opdatering; `journalctl --user -u arcitai-factory` viser logs. Hele installationen skal stadig afprøves på en rigtig Linux-VPS.

Fra din laptop:

```sh
ssh -N -L 7331:127.0.0.1:7331 USER@VPS
```

Åbn localhost:7331. Publicér ikke porten på internettet. Appens Vercel/Azure/anden deployment forbliver i dens egen CI/CD. Agentarbejde bruger ingen hosted Actions-minutter; almindelig CI kan stadig bruge GitHubs kvote.
