# Pi og Codex Security: fungerende jobadaptere

Den fælles CLI-runner kan nu afvikle **Codex CLI, Pi RPC og Codex Security SDK**. Pi er efterprøvet gennem et helt job med den installerede Pi 0.85.1 og en syntetisk lokal modelserver. Security SDK 0.1.29/plugin 0.1.95 er afprøvet med SDK'ens officielle `mock`-funktion, der producerer syntetiske fund og rapporter uden modelkald. Dette er integrationsbeviser; der er endnu ingen ægte model-, browser-, Kastanje- eller kundescanning i disse prøver.

Factoryens kerne er fortsat uden npm-afhængigheder. Security er et valgfrit modul med egen lockfil. Hver opgave vælger én worker; Pi behøver ikke starte endnu en agent for at sende en security-opgave videre. GitHub Actions, AIOS og Codex Desktop er ikke nødvendige.

**Åbent dependencyfund:** npm-audit markerer Security SDK'ens `extract-zip`-afhængighed. Vores adapter bruger kun den medfølgende pluginmappe og afviser custom ZIP-plugins, men upstreamfundet er ikke rettet. Se [den konkrete vurdering og begrænsning](security-dependency-review.md) før en kundepilot.

## Pi

På det dedikerede POSIX-miljø, som beskrevet i [opsætningen](setup.md), skal `pi` være på PATH. Den afprøvede version er `@earendil-works/pi-coding-agent@0.85.1`. En anden version kræver en ny prøve.

1. Opret privat worker-home og Pi-konfigurationsmappe uden for checkout. Brug [settings](../profiles/pi/settings.example.json) og [models](../profiles/pi/models.example.json) som udgangspunkt; udfyld den virkelige provider/model. Konfigurationsfiler er betroet operatørinput og må ikke komme fra issues.
2. Gem factoryens gennemgåede implementeringsinstruktioner som en privat policyfil. Brug indholdet af [factory-implement](../.agents/skills/factory-implement/SKILL.md) og relevante miljøregler. Repoets egne AGENTS.md-instruktioner læses i jobbet.
3. Kopiér [worker.example.json](../profiles/pi/worker.example.json) til en privat fil og udfyld de eksisterende absolutte stier. `credentialEnv` navngiver kun de modelcredentials, som workerprocessen skal arve. Ingen nøgler gemmes i filen. Vælg thinking-niveau efter modelprøven; `off` er skabelonens værdi.
4. Vælg **Pi · custom** for opgaven. Godkend scope og forbered jobbet. Afprøv miljø og model, og opret den almindelige preflight med profil, scope, base, dato og capabilities.

Preflight får nu også `workerConfigHash`. Beregn den efter dine prøver:

```sh
node scripts/worker-config-hash.mjs pi /private/pi-worker.json /worker/checkout
```

Værdien binder worker-JSON samt Pi-settings, models og policyfilen. Ændrede filer kræver ny gennemgang og preflight. Credentials hashes ikke. Hashen attesterer ikke, at prøver er udført; den binder operatørens attestering til konfigurationen.

Start med samme database som dashboardet:

```sh
FACTORY_WORKER_ISOLATED=1 FACTORY_WORKER_CONFIG=/private/pi-worker.json \
  npm run worker -- --task TASK_ID --workspace /worker/checkout \
  --preflight /private/preflight.json --execute
```

Pi kører én ny RPC-session med read/write/edit/bash. Automatisk extension-, skill- og kontekstdiscovery er slået fra; den valgte policy vedlægges eksplicit. Adapteren kontrollerer det faktisk valgte model-ID/provider, venter på `agent_settled`, håndterer senere model-/protokolfejl og henter sessionens usage. Et prompt-ACK er ikke afsluttet arbejde.

Browser-CLI'er kan installeres i dette miljø og beskrives i den gennemgåede policy. Browser og computer use er **ikke installeret eller capability-godkendt** af adapteren. Denne Pi-adapter indlæser endnu ingen desktopextensions.

## Security

Installer kun på worker-miljøet:

```sh
npm ci --prefix profiles/security --ignore-scripts --no-audit --no-fund
```

Brug [security-worker.example.json](../profiles/security/worker.example.json), opret dens private home og vælg en faktisk tilgængelig model. Eksemplet bruger `OPENAI_API_KEY`. Ved separat worker-login kan `auth` sættes til `chatgpt`, `credentialEnv` tømmes, og `codexHome` pege på den private Codex-konfiguration. Personlig desktop-login kopieres ikke automatisk.

Andre providers konfigureres med `provider` og `providers` i samme struktur som SDK'ens `model_providers`; kun valgte credentials arves. At SDK'en understøtter flere providers er ikke bevis for vores konkrete Kastanje-/lokale rute. [Officiel SDK-dokumentation](https://learn.chatgpt.com/docs/security/sdk).

Vælg **Codex · security** og forbered et godkendt **Standard-scan af hele repositoryet**. Dette adaptertrin udfører ikke diff-scan, deep-scan eller automatisk rettelse. Opgavens tekst vedlægges som supplerende kontekst til det officielle scanforløb; den ændrer ikke programmets scan-scope. Brug en anden overdragelse til et andet scope.

Beregn `workerConfigHash` med `security` som første argument og start samme `npm run worker`-kommando med security-konfigurationsfilen. Denne profil kræver også en eksplicit `security: true`-attestering i preflight. Rapporterne gemmes privat uden for målcheckout. Resultatet skal være afsluttet og forseglet på den startede commit; ændrer scanningen checkout, afvises det som et normalt succesresultat. SDK-fejl bliver fejl, ikke nul fund.

## Resultater, stop og review

Begge adaptere bruger samme writer-lås, scope, Git-origin, rene startcheckout, 45-minutters timeout og stop via dashboardet. Worker-konfiguration og preflight må ikke ligge i checkout, heller ikke gennem symbolske links. SDK-processen har OS-adgangen i sit worker-miljø; `FACTORY_WORKER_ISOLATED=1` opretter ingen sandbox. Controller og runner deler stadig database/filesystem i denne version.

`worker-result.json` bevarer usage og rapportmetadata privat sammen med logs. Agentens prisberegning er ikke en faktura og overføres ikke automatisk til EUR-målingerne. Pi kan rapportere nul ved manglende prisdata. Dashboardets tid måles af runneren og bevares ved senere evidensimport. Modelpriser og øvrige omkostninger forbliver ukendte, indtil de dokumenteres.

Et afsluttet job går til review som `awaiting-evidence`. Security giver `finding` ved fund og ellers `inconclusive`; en tom fundliste giver aldrig automatisk `reviewed`. Uafhængig evidens og menneskelig accept følger stadig [den eksisterende kontrakt](setup.md#evidence-review-og-accept). Ingen PR, merge eller deploy følger af workerens exitkode.

## Gentag prøverne

```sh
npm run check
# Kræver Pi på PATH og ovenstående Security-installation:
npm run probe:workers
```

Den opt-in prøve fjerner arvede credentials, bruger midlertidige repos/homes/databaser og en loopback-modelserver, kalder et rigtigt Pi-read-tool og afslutter med SDK'ens eksplicit syntetiske scan. Dens resultater føres ikke ind i din aktive journal eller dine kundebenchmarks. De almindelige tests bruger stubs til fejl, forkert model, ugyldig JSON og stop inklusive underprocesser. Prøverne dokumenterer ingen besparelse, sårbarhedsdetektion eller OS-isolation.
