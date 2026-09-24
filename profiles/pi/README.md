# Foreslået Pi-worker

**Status: Pi er nu forbundet med CLI-jobrunneren og afprøvet gennem et helt syntetisk job.** Se [aktuel worker-opsætning](../../docs/worker-integrations.md). Model, browser og miljø skal stadig kvalificeres. Se [research og begrundelser](../../docs/pi-research.md). Skabelonerne her bliver ikke automatisk læst af Pi eller dashboardet. De skal kopieres til en særskilt worker-konfiguration efter valg af miljø og model. Ingen af dem ændrer brugerens `~/.pi/agent`.

**Cloud uden egen stor maskine:** den foreslåede første fjernprofil er Pi i en Daytona-sandbox med ekstern model-API og den eksisterende controller på en lille server. Worker-image, browserforbindelse og fjernadapter mangler. Se [komponenter, omkostninger og byggeorden](../../docs/cloud-setup.md). Den lokale RPC-prøve beviser ikke dette cloudsetup.

## Pakken vi vil afprøve

| Del | Første valg | Status |
| --- | --- | --- |
| Harness | Pi 0.85.1 som første sammenlignelige baseline; kvalificér nyere version separat | Installeret CLI og syntetisk RPC-prøve bestået |
| Browser | `agent-browser` 0.38.1 + Chrome fra isoleret worker-image | Kode/docs læst; browserintegration endnu ikke prøvet |
| Metode | De seks eksisterende factory-skills, kun relevante faser indlæst | Eksisterende projektfiler |
| Søgefunktion | En lille CLI mod Brave Search, kun når nødvendig | Blueprint; konto og wrapper ikke konfigureret |
| Sikkerhed | Gitleaks + OSV-Scanner; sprogtilpasset SAST efter scope | Tools/rules skal versionslåses i worker-image |
| Faglig security-agent | Officiel Codex Security CLI/SDK som separat worker | Offentlig kode/licens og integrationsflade verificeret; syntetisk SDK-rapportprøve bestået. [Aktuel opsætning](../../docs/worker-integrations.md). [Genbrugsbeslutning](../../docs/codex-reuse.md) |
| Desktop | `@injaneity/pi-computer-use` 0.5.1 | Valgfri separat pilot; ikke installeret |
| Controller | Én ejer af jobclaim, budget og reviewstatus | Eksisterende journal; ubemandet pipeline er næste version |
| Model | Eksakt, verificeret model-ID på Kastanje eller lokal API-server | Skabelon; ingen faktisk endpoint-/modeladgang antaget |

Versionerne er kilde-/prøveankre fra 22. september 2026, ikke en påstand om en allerede kompatibilitetstestet samlet pakke. Fastlås også dependency-lock, browserrevision, OS-image, scannerregler og skills-revision, når pakken accepteres. Opdatér den samlet gennem en ny prøve.

Softwareprofilen behøver ingen tredjeparts-Pi-extension. En CLI/skill kan være nok til browser og søgning. MCP tilføjes først, når en bestemt ekstern integration kræver det. Desktopprofilen er den første profil, der kræver en ekstra Pi-extension; på den profil må der ikke utilsigtet være to controllere af samme browser/desktop.

## Sikker, reproducerbar protokolprøve

Har du allerede Pi installeret:

```sh
node scripts/probe-pi.mjs
```

Et eksplicit executable kan angives som første argument. Prøven installerer intet og bruger ikke personlige API-nøgler. Den opretter midlertidig konfiguration/fixture, kører Pi mod en syntetisk loopback-provider og rydder op bagefter. Den tester providertransport, tool-resultat, usage, fejl og cancellation. Ingen browser eller desktop styres. Ingen rigtig model bedømmer eller skriver kode.

Denne prøve må **ikke** registreres som en succesfuld modelevaluering eller en gratis kundeopgave i dashboardet. Den beregnede pris er kunstig testdata. Den beviser heller ikke OS-isolation, stop af underprocesser eller en real providers fakturering.

## Foreslået miljø

Start med hele Pi-processen, projektets toolchain og browser i ét dedikeret Linux-arbejdsmiljø. Brug et kopieret checkout med kendt base, separat arbejdsvolumen og ikke-root-bruger. Controller, evidence-verifier, releasecredentials og evalfacit bor uden for worker. Brug ikke personlig browserprofil eller hostens Docker-socket. Fastlæg egress til modelrute, nødvendige pakkekilder og testmål; slå øvrig adgang fra, når jobtypen tillader det.

Container/VM vælges og gennemprøves separat. Det medfølgende repo bygger ikke et sandbox-image endnu. `--no-approve`, `--tools` og `--offline` er ikke OS-isolation. En worker med Bash kan starte andre programmer, selv om ingen browsertool er registreret direkte i Pi.

Blueprint for filplacering **inde i en kommende worker**:

```text
/opt/factory/                 # versionslåst, read-only metode og værktøjer
  policy.md                  # gennemgåede instruktioner til denne jobtype
  skills/                    # valgte originale factory-skills
/run/factory-pi/              # isoleret konfiguration; ingen personlig auth
  settings.json
  models.json
/workspace/                  # afgrænset checkout
/artifacts/                  # privat log, screenshots og evidens
```

Provideradgang bør være kortlivet og kun til den valgte route. I en simpel container kommer API-nøglen ind i processen og kan dermed læses af kode dér; en korrekt konfigureret gateway med placeholder/secret-injektion kan mindske dette. En gateway er en særskilt opsætningsopgave, ikke noget JSON-filen løser.

## Startkontrakt til den kommende adapter

Adapteren skal starte Pi med argument-array, aldrig en shellkommando bygget af issue-tekst. Eksempel for en implementeringsfase i det allerede etablerede miljø:

```json
[
  "--mode", "rpc",
  "--offline", "--no-approve", "--no-extensions", "--no-context-files",
  "--no-skills", "--no-prompt-templates", "--no-themes",
  "--tools", "read,write,edit,bash",
  "--provider", "kastanje",
  "--model", "REPLACE_WITH_VERIFIED_MODEL_ID",
  "--thinking", "off",
  "--append-system-prompt", "/opt/factory/policy.md",
  "--skill", "/opt/factory/skills/factory-implement/SKILL.md",
  "--session-dir", "/artifacts/pi-sessions"
]
```

`--no-skills` fjerner automatisk discovery; eksplicitte `--skill`-stier kan stadig indlæses i den undersøgte kode. Den gennemgåede jobpolicy skal medtage relevante repositoryinstruktioner og checks, når automatisk kontekstdiscovery er slået fra. Et kunderepo må ikke stiltiende levere en extension eller en credential-kommando til controlleren. Læs skabelonen som en konfigurationskontrakt; den er ikke et komplet launch-script.

Sæt `PI_CODING_AGENT_DIR` til workerens egen konfigurationsmappe og `PI_TELEMETRY=0`. `--offline` deaktiverer startup-netværk, men model- og værktøjskald kan fortsat bruge netværket. Provider/model skal kontrolleres med RPC `get_state` før arbejdet; en fuzzy modelmatch må ikke stiltiende vælge en anden model.

Desktopprofilen vil behøve en eksplicit `-e`-sti og de konkrete ekstra toolnavne i allowlisten. Den generelle argumentliste ovenfor indlæser **ikke** computer-use. Credentials og private MCP-servere må ikke opdages fra en eksisterende brugerkonfiguration.

## Provider-skabeloner

- [settings.example.json](settings.example.json): ingen automatisk tillid, telemetry eller skjult retry-budget. Compaction forbliver aktivt, men skal tælle i usage.
- [models.example.json](models.example.json): Chat Completions som eksempel på Kastanje- og lokal rute. `.invalid` og model-ID er bevidste placeholders.
- [capabilities.json](capabilities.json): planlagt capability-valg og nødvendig proof. Det er dokumentation og ændrer ikke produktets capability-register.

Er den faktiske Kastanje-route Responses-baseret, skal `api`, kompatibilitet og test ændres sammen. Angiv kun `image`, hvis både model og endpoint er prøvet med billeder. Kontekstvindue og max output skal afspejle den reelle serverkonfiguration, ikke et ønsketal. `reasoning:false` og `--thinking off` er forsigtige skabelonværdier, ikke en kvalitetsanbefaling til alle modeller.

Modelfilen indeholder ingen priser. Pi kan repræsentere manglende priser som nul; factory-adapteren skal gemme prisgrundlag separat og vise **ukendt** indtil dokumenteret. Lokale modeller har stadig hardware-, energi- og driftstid.

## Fra proof til pilot

| Trin | Konkret accept |
| --- | --- |
| 1. Isoler worker | Uden adgang til hosthome, controllerdata og admincredentials; tilladt netværk demonstreret; stop fjerner jobprocesser |
| 2. Kvalificér modelrute | Tekst, streaming, tool call/result, malformed args, contextgrænse, timeout, abort og usage; billede hvis nødvendigt |
| 3. Kvalificér browser | Syntetisk testapp: udfyld formular, assert resultat, screenshot, afvist ikke-tilladt navigation, ingen genbrug af session mellem jobs |
| 4. Kvalificér security | Kendt syntetisk secret/dependency/finding opdages; rent kontroltilfælde; scannerfejl bliver ikke “ingen fund”; rå secrets redigeres |
| 5. Luk pipeline | Issue → scope → implementering → faste checks → uafhængig reviewsession → reviewpakke på præcis SHA. Ingen auto-merge |
| 6. Afbryd og genoptag | Dublet-event, mistet worker, crash og timeout giver ingen to writers og intet nulstillet budget |
| 7. Mål kundeværdi | Alle forsøg, ukendt forbrug, testtid, mennesketid og accepteret resultat registreres ærligt |

Kastanje-piloten starter med én reel bugfix efter disse miljø-/capability-prøver. Desktop prøves som separat tilvalg på en syntetisk app: observer → handling → bekræft ændring → stop. Vi installerer ikke desktop-adgang på den personlige maskine blot for at gøre softwareprofilen “komplet”.
