# Opsætning og en fuld opgave

Vil du starte uden stor lokal maskine, så læs først [cloudoversigten med komponentvalg](cloud-setup.md). Den skelner mellem en manuel Codex Cloud-pilot og vores endnu ikke tilsluttede Pi/sandbox-profil. Opskriften nedenfor beskriver den eksisterende lokale kerne.

## Start lokalt eller på egen VM

`npm start` giver en komplet lokal demo uden nøgler. En VM kan køre samme proces under en service manager; brug persistent lokal disk og SSH-portforward:

```sh
ssh -L 4317:127.0.0.1:4317 operator@your-vm
```

Åbn derefter localhost på din egen maskine. Der er ikke brugerstyring i v0.1. Eksponér ikke hele HTTP-porten via offentlig tunnel. `.env.example` er dokumentation; serveren indlæser den ikke automatisk. Sæt valgte environment-variabler i shell eller service manager. Konkrete tokens sættes uden for Git.

Til egen kø uden demo:

```sh
FACTORY_DEMO=0 FACTORY_DB="$PWD/.factory/pilot.sqlite" npm start
```

Brug samme FACTORY_DB ved efterfølgende CLI-kald. Slukning af demoflag sletter ikke eksisterende demodata fra en database.

## Læs GitHub

Start med `FACTORY_REPO=owner/repo`. Et offentligt repo kræver ikke token. Til et privat repo: snæver server-side token med metadata, issues og pull requests read. Ingen contents-write eller administration til denne læser. Tryk **Opsætning → Læs GitHub-issues**. PR’er vises i egen fane. Listen er begrænset til første 100 åbne objekter i hver kategori; UI’et meddeler pagination.

Import opretter ikke GitHub-issues. Lokale opgaver er en lokal kø. Periodisk fuld reconciliation, lukkede objekter og alle sider er en senere integration; issue-closed håndteres også af webhook, hvis den leveres. GitHub-eventruten `POST /api/webhooks/github` verificerer HMAC SHA-256, repository, eventtype og delivery-id. `FACTORY_MAINTAINERS` er en kommaadskilt liste af menneskelige GitHub-logins, der må sende readiness-label. `GITHUB_WEBHOOK_SECRET` bliver på serveren.

GitHub kan ikke kontakte en loopbackadresse direkte. Vælg i pilot enten manuel læsning, Cursor-native automation eller en *særskilt* autentificeret ingress, der kun videresender signed raw webhook bytes, sætter lokal Host og blokerer alle øvrige ruter. Den ingress er ikke installeret i dette repo. Denne grænse er bevidst; der står ikke en skjult cloudtjeneste bag UI’et.

Issue-form og labeldefinitioner ligger i `.github/ISSUE_TEMPLATE/factory-task.yml` og `config/labels.json`. De er filer klar til at blive valgt i målrepoet; denne aflevering ændrer ikke GitHub-indstillinger.

Pi og Codex Security bruger nu den samme jobrunner. Se [deres konkrete opsætning og integrationsprøver](worker-integrations.md). Nedenstående Codex-profil og evidenskontrakt gælder fortsat.

## Fra scope til lokal Codex-worker

1. Opret/importér en opgave. Skriv konkrete acceptkriterier og vælg profil. Klik **Godkend scope → Forbered job → Hent jobpakke**. Opdag opgave-id i download eller `/api/export`.
2. Klargør et **dedikeret worker-miljø** uden dit almindelige hjems filer og credentials. På Z13 kan det være Linux/WSL2; hardware og model skal afprøves. Et flag eller en Git-worktree er ikke isolation. Installer Codex, værktøjer og målrepoets dependencies i dette miljø.
3. Brug rent checkout med korrekt GitHub-origin. Tilføj de relevante `.agents/skills/factory-*` til målrepoet under dets egen governance; er instruktionerne endnu ikke en del af den accepterede revision, så vedlæg skillteksten eksplicit i jobkonteksten. Overskriv ikke målrepoets AGENTS.md.
4. Opret særskilt `FACTORY_CODEX_HOME` og autentificér workerens Codex dér. Browser/MCP, netværk og testmiljø prøves særskilt. Factoryen arver ikke Codex Desktop-værktøjer. Base user config ignoreres; en gennemgået `factory.config.toml` profil kan levere nødvendige værktøjer. Kastanje bruger `kastanje.config.toml`. Projektkonfiguration og hooks skal gennemgås før checkout betros.
5. Gem en privat preflight **uden for checkout**, efter reelle prøver:

```json
{
  "profile": "codex-local",
  "scopeHash": "COPY_FROM_JOB",
  "baseCommit": "FULL_CHECKOUT_COMMIT_SHA",
  "verifiedAt": "CURRENT_ISO_TIMESTAMP",
  "capabilities": {"files": true, "shell": true, "git": true, "tests": true}
}
```

Tilføj kun web/browser/computer/security med `true`, når de konkrete krav er afprøvet. Preflight er en operatørattestering, ikke en selvkørende capability-test. `npm run doctor` viser kun tilstedeværelse/version.

```sh
# Eksport alene; intet modelkald.
npm run worker -- --task TASK_ID

# Kør på det allerede klargjorte, dedikerede miljø.
FACTORY_WORKER_ISOLATED=1 FACTORY_CODEX_HOME=/private/codex-home \
  npm run worker -- --task TASK_ID --workspace /worker/checkout \
  --preflight /private/preflight.json --execute
```

Worker kontrollerer repo, rent checkout, scope, frisk preflight og capabilities. Den laver en ny `factory/<attempt-id>` branch og starter Codex med en argv-liste og prompt på stdin, ikke shell-evalueret issuetekst. 45 minutters timeout, 4 MiB rå outputgrænse, stopanmodninger og én aktiv lokal writer. Rå output kan indeholde følsomme oplysninger: private filer under `.factory/jobs/`, ingen automatisk upload.

**Budget:** En timeout er ikke et loft på fakturaen. Sæt providerens udgiftsgrænse før en betalt kørsel. Adapteren stopper ikke ved et bestemt eurobeløb.

## Evidence, review og accept

Workerens exit 0 giver `awaiting-evidence`. Den har ikke verificeret ændringen. `tracked.patch` indeholder tracked diff; `working-tree.txt` afslører untracked/ikke-committed filer. Bevar checkout, gennemgå alle filer, lav den tilsigtede commit og kør uafhængige checks på den commit. Upload intet blindt fra rå log.

En verifier/operatør leverer:

```json
{
  "attemptId": "COPY_FROM_JOB",
  "scopeHash": "COPY_FROM_JOB",
  "head": "FULL_VERIFIED_COMMIT_SHA",
  "checks": [{"name": "Relevant regression check", "status": "passed", "head": "FULL_VERIFIED_COMMIT_SHA"}],
  "security": "reviewed",
  "costs": [{"component": "inference", "amount": 0.12, "currency": "EUR", "basis": "actual"}],
  "costComplete": false,
  "activeMs": 120000,
  "reviewMinutes": 4
}
```

Beløb og tider ovenfor illustrerer formatet; de er ikke målinger. `costComplete` bliver først true, når alle relevante poster inkl. compute/review-modeller er dækket. Manglende beløb: tom costs-liste og false. Manglende tid: null. Security kan være unassessed, reviewed, finding eller inconclusive; *reviewed* betyder, at den relevante sikkerhedsdisposition er vurderet, ikke en sårbarhedsfrihedsgaranti.

```sh
node scripts/evidence.mjs TASK_ID /private/evidence.json
```

Web-UI’et viser nu beviserne. Accept kræver checks på samme SHA, security reviewed og uændret scope. Operatøren vurderer derefter resultatet. Ved changes requested: redigér specifikationen, godkend og forbered et nyt forsøg inden for retry-grænsen. Merge/deploy er separate handlinger under deres eksisterende myndighed. For cloudarbejde afvikles jobpakke og verificering eksternt, og evidens importeres i samme format. Importer ikke mens en lokal worker stadig kører.

Se [recovery](recovery.md) ved stop/timeout/ukendt status og [værdi](value.md) for benchmarkimport.
