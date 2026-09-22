# Pi som motor i Arcitai Software & Defence Factory

Undersøgt **22. september 2026** for Gustav. Beslutningsforslag, kildekritik og konkret capability-valg. Dette dokument erstatter den tidligere strategiske anbefaling om Pi som et avanceret tilvalg. Det ændrer ikke, hvilke workers starteren allerede kan afvikle.

## Anbefaling

**Vælg Pi som første kandidat til factoryens åbne agentmotor. Behold én fælles factory med software- og defence-profiler.** Pi passer til ønsket om egen hosting, udskiftelig inference og lille grundopsætning. Codex Security/Daybreak kan fortsat være en specialist, når den konkrete adgang findes. Cursor er et relevant managed alternativ, når mindre driftsarbejde vejer tungere end kontrol over worker og inference.

Valget handler først om produktets åbenhed og ejerskab. Et allerede betalt Codex-abonnement kan stadig gøre Codex økonomisk attraktivt til Gustav’s egen pilot; en lavere beregnet API-pris i et studie afgør ikke den sammenligning.

Den mindste sammenhængende løsning er:

**Eksisterende dashboard + én controller → isoleret Pi-worker → tests/browser/beviser → særskilt review → menneskelig accept.** GitHub indeholder issue, kode og PR. Det kræver hverken GitHub Actions eller Warp-abonnement. Pi styrer model- og værktøjssløjfen; controlleren styrer kø, budget, autorisation, recovery og releasegrænser. Det er vores arkitekturforslag, ikke en funktion Pi leverer som samlet produkt.

Factoryen er et selvstændigt produkt med egne skills og kvalitetsforløb: **Business first. Security and quality built in.** AIOS er det separate produktivitetsprodukt og er hverken installations-, runtime- eller metodekrav. [Produktgrænsen](ownership.md#product-boundary).

Det første software-setup kan have **nul tredjeparts-Pi-extensions**: Pi’s standardværktøjer, almindelige CLI’er, eksisterende seks factory-skills og én browser-CLI. Tilføj én desktop-extension, hvis en konkret opgave kræver native apps. Et lille modelvendt værktøjssæt betyder dog ikke, at alt bagved er simpelt eller sikkert.

## Hvad X-opslaget faktisk dokumenterer

[Aloks opslag](https://x.com/analogalok/status/2102006741193957839) henviser til **HarnessTax** fra forskere ved UC Berkeley og Arena. Vi har læst opslaget og forfatterens svar, åbnet forsøgsbeskrivelsen og kontrolleret de offentliggjorte diagramdata. Vi fandt en forskningsside med data; betegnelsen “paper” i opslaget er ikke i sig selv dokumentation for fagfællebedømmelse.

Vi har kontrolleret de publicerede resultater, ikke genkørt forsøgene eller efterprøvet alle rå inference-traces. De to ting skal holdes adskilt.

Forsøget sammenligner syv modeller og tre harnesses på 30 tilfældigt valgte opgaver fra hvert af SWE-bench Lite og Terminal-Bench 2.0, med tre gentagelser. Grænsen er 100 agent-turns og harnessens egen high-effort-indstilling. Tokenpriser er standardiseret efter en prisliste fra 1. september. På SWE-bench er ekstern netadgang og webværktøjer deaktiveret. Pi har to hjælpepakker til abonnementsauth og turnbegrænsning. Forfatterne fremhæver lignende succesrater til forskellige omkostninger og advarer om begrænset generalisering til andre opgaver og mulig træningseksponering. [Forsøgsbeskrivelse og konklusion](https://harnesstax.github.io/).

| Offentliggjort sammenligning | Pi | Leverandørens harness | Hvad det siger os |
| --- | --- | --- | --- |
| GPT-5.6 Sol, Terminal-Bench 2.0 | 83,3 %; $0,421 pr. forsøg | Codex: 78,9 %; $0,761 | Ca. 45 % lavere beregnet API-pris i netop dette forsøg |
| Claude Fable 5, SWE-bench Lite | 96,7 %; $0,666 | Claude Code: 97,8 %; $1,329 | Ca. 50 % lavere pris med 1,1 procentpoint lavere observeret succes |
| Første kald, gennemsnit på SWE-bench | 1.972 inputtokens | Codex 11.308; Claude Code 27.011 | Stor forskel i startkontekst, ikke en måling af hele factoryens arbejde |

Tallene er kontrolleret i [SWE-data](https://github.com/HarnessTax/HarnessTax.github.io/blob/f8a8281c41bb97d34efee83e58be522ef1bb78cd/data/charts/system-frontier-swe.8fd44a1e0f.json), [Terminal-Bench-data](https://github.com/HarnessTax/HarnessTax.github.io/blob/f8a8281c41bb97d34efee83e58be522ef1bb78cd/data/charts/system-frontier-tb.3c661a24c5.json) og [kontekstdata](https://github.com/HarnessTax/HarnessTax.github.io/blob/f8a8281c41bb97d34efee83e58be522ef1bb78cd/data/charts/system-agent-context-swe.06f521bdb1.json). De testede harnessversioner er Pi **0.85.1**, Codex **0.146.0** og Claude Code **2.1.224**. Modelnavnene her er studiets etiketter; de er ikke en erklæring om vores API-adgang.

Min fortolkning er mere afgrænset end opslagets:

- **“Intet kvalitetstab” er ikke bevist.** Fable-tallene har faktisk forskellig observeret succes. Manglende statistisk sikker forskel er heller ikke et ækvivalensbevis.
- Sol-forskellen på Terminal-Bench er beskrevet som et deskriptivt estimat. Datasættets interval for Codex minus Pi er cirka −12,2 til +1,1 procentpoint; det beviser ikke, at Pi altid er bedre. [Parvise data](https://github.com/HarnessTax/HarnessTax.github.io/blob/f8a8281c41bb97d34efee83e58be522ef1bb78cd/data/charts/system-harness-effect-tb.4d5a1affd4.json).
- “75 %” er ni af tolv model/benchmark-sammenligninger, hvor en alternativ harness har højeste observerede succes. Det er ikke 75 % af alle opgaver, og alternativet er ikke nødvendigvis Pi. [Studiet](https://harnesstax.github.io/).
- API-tokenpris er hverken abonnementspris eller samlet leverancepris. Browser, VM, reparationer, reviewer, mennesketid og vedligehold skal med i vores regnestykke.
- Korte benchmarkopgaver uden web på SWE-bench dokumenterer ikke browser-QA, native computer use, sikkerhedsaudits eller langvarig drift.
- Startkontekst forklarer ikke alene totalprisen. Cache, output, antal forsøg og modelvalg skal måles. Det er derfor forkert automatisk at regne alle ekstra inputtokens som fuldt faktureret hver gang.

Det stærke argument er **“afprøv en mindre harness med samme model og samme acceptkriterier”**. Vi bør ikke sælge en besparelsesprocent, før vi har målt den på vores færdige capability-pakke.

## Hvad Pi allerede kan

Pi er MIT-licenseret og har som standard `read`, `write`, `edit` og `bash`; yderligere indbyggede søgeværktøjer kan aktiveres. Skills og TypeScript-extensions udvider metoden og værktøjerne. Print/JSON, RPC og SDK giver flere integrationsmuligheder. Der er ikke native MCP, subagents eller en obligatorisk planmotor; det kan tilføjes. [Kernen](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/README.md).

Custom providers kan konfigureres med bl.a. OpenAI Chat Completions, Responses og Anthropic Messages. Derfor er Ollama, vLLM og en kompatibel Kastanje-rute realistiske integrationsmål. Men “OpenAI-kompatibel” skal prøves med streaming, tool calls, fejl, usage og eventuelle billeder; det er ikke en universel garanti. [Models-kontrakt](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/docs/models.md).

Pi har sessions, compaction, retry og usage/statistik. Vi skal undgå at genbygge disse funktioner, men stadig definere en afsluttet factory-opgave uden for agenten. RPC’s `prompt.success` betyder, at prompten er accepteret, og `agent_end` er ikke nødvendigvis sidste aktivitet. `agent_settled` er relevant for den afsluttede agentsløjfe, hvorefter checks og review stadig mangler. [RPC-kontrakt](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/docs/rpc.md).

**Pi er ikke en sandbox.** Project trust styrer indlæsning af projektressourcer; processen og extensions har stadig brugerens OS-rettigheder. Kontekstfiler kan læses uanset project trust, medmindre kontekstindlæsning deaktiveres. Skills og tool-hooks er derfor ikke en adgangsgrænse. [Pi’s egen sikkerhedsbeskrivelse](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/docs/security.md).

## Den minimale capability-matrix

Dette er foreslåede profiler, ikke capabilities som allerede er koblet til dashboardet.

| Capability | Hvorfor | Mindste valg | Aktivering |
| --- | --- | --- | --- |
| Læse, ændre og bygge kode | Selve implementeringen | Pi’s fire værktøjer + Git + projektets toolchain | Alle softwarejobs |
| Repo-/dokumentationssøgning | Finde relevant kontekst | `rg`, Git og kendte kilder via HTTP | Alle; ingen vektordatabase fra start |
| Websøgning | Finde aktuelle eksterne kilder | Én eksplicit søgeprovider gennem en lille CLI/skill | Research og opgaver med ukendt dokumentation |
| Browser use | Afprøve en webapp og indsamle visuelle beviser | `agent-browser` CLI i egen browserprofil | Obligatorisk ved relevante frontendændringer |
| Computer use | Native apps eller UI, der ikke kan betjenes via API/DOM | `@injaneity/pi-computer-use` som evalueringskandidat | Særskilt desktop-worker; slukket ellers |
| GitHub issue/PR | Hente scope og levere ændring | GitHub API/`gh` hos controlleren; Git i worker | Ét pilotrepo; ingen publiceringsnøgle som standard i agenten |
| Tests og quality gates | Reproducerbar kontrol | Projektets formatter/lint/typecheck/unit/integration | Deterministisk runner på fast revision |
| Sikkerhedskontrol | Secrets, sårbare dependencies og kodeproblemer | Gitleaks + OSV-Scanner; målrettet SAST efter sprog | Basiskontrol + udvidet defence-profil |
| Faglig security-vurdering | Validere fund og konsekvens | Separat review-session; evt. Codex Security-specialist | Scope- og risikobestemt |
| Isolation og hemmeligheder | Begrænse en fejl eller prompt injection | Hele Pi-worker i dedikeret container/VM | Krav før ubemandede kundejobs |
| Joblivscyklus | Start, stop, timeout, budget og genoptagelse | Én controller, jobjournal og supervisor | Uden for Pi |
| Beviser og økonomi | Dokumentere accepteret værdi | Commit + checks + private artifacts + usage/human time | Alle jobs, inklusive fejlede forsøg |

“Browser use” er en capability, ikke et krav om frameworket med navnet Browser Use. Vi behøver heller ikke MCP for at anvende browser, GitHub eller scannere, når en passende CLI allerede findes. Computer use og web search løser forskellige behov; det ene erstatter ikke automatisk det andet.

## Konkret valg af værktøjer

### Browser: start med agent-browser

Vercel Labs’ [agent-browser](https://github.com/vercel-labs/agent-browser/tree/b0f3962a131292805fe7c4e276e4bf7a50a4e876) er min første kandidat: Apache-2.0, lokal CLI, snapshots med elementreferencer, handlinger og screenshots. Den læste version er **0.38.1**. Den har en direkte URL-læser og struktureret output; vi behøver ikke dens ekstra AI-chatfunktion eller en ekstra inference-gateway. Pi kan bruge CLI’en gennem Bash og læse screenshots, hvis den valgte model kan modtage billeder.

Arbejdsgangen bliver: åbn testapp → snapshot → målrettet handling → ny observation → assertion/screenshot. Brug tekst/DOM til navigation og billeder til visuel kontrol. Agenten skal ikke optage video eller hente hele DOM’en ved hvert klik. Et browserjob får sin egen proces/session, testkonto og private artifactmappe.

Værktøjets [security-funktioner](https://github.com/vercel-labs/agent-browser/blob/b0f3962a131292805fe7c4e276e4bf7a50a4e876/docs/src/app/security/page.mdx) omfatter domain allowlist, outputgrænser og handlingspolitik. De skal afprøves sammen med vores netværksgrænse. En agent med fri Bash kan starte andre processer; en CLI-flagpolitik er ikke hele workerens sandbox.

To alternativer er relevante:

- **Pi-forfatterens `browser-tools`:** meget få scripts, men den læste [launcher](https://github.com/badlogic/pi-skills/blob/90bb51cae36515a648515b633a81c0c6efc8c74d/browser-tools/browser-start.js) er macOS-specifik, bruger port 9222 og kan kopiere den normale Chrome-profil med `--profile`. Den genbruger desuden en eksisterende browser på porten. Det er ikke mit standardvalg til flere factoryjobs eller Z13/cloud-portabilitet.
- **Playwright/MCP:** relevant, hvis et valgt værktøj kræver MCP, eller projektet allerede har gode Playwright-tests. Behold de deterministiske regressionstests; agentstyret eksploration og tests har forskellige roller. Vi installerer ikke flere overlappende browserstacks fra start.

### Desktop: én extension, særskilt profil

[`@injaneity/pi-computer-use` 0.5.1](https://github.com/injaneity/pi-computer-use/tree/4b8dbd7eaa13328ab1a8a4b55d0be0b077de7d62) er MIT-licenseret og modeluafhængig på værktøjsniveau. Dens semantiske værktøjer finder apps, observerer, søger, udfører handlinger og verificerer UI-ændringer. Koden registrerer også browser/CDP-værktøjer. Derfor skal en desktop-worker ikke automatisk have både dette og en ekstra browserextension aktiveret.

Platformene har forskellige grænser:

- macOS kræver macOS 14+ og Accessibility/Screen Recording til en native helper.
- Windows kræver en interaktiv desktopsession. Linux i WSL er ikke automatisk adgang til Windows-apps på Z13.
- Linux kræver en grafisk session med AT-SPI2. X11 har billed-/inputmuligheder; native Wayland er i den læste version semantisk begrænset uden implementeret portalbaseret skærm/input. `headless` betyder her en politik mod foreground-input, ikke nødvendigvis en usynlig Chromium-proces. [Linux-matrix](https://github.com/injaneity/pi-computer-use/blob/4b8dbd7eaa13328ab1a8a4b55d0be0b077de7d62/docs/linux.md).

Min vurdering: lovende pilotkandidat, ikke endnu accepteret ubemandet drift. Pakken har en install-helper og brede peer-dependencies; hele kombinationen Pi/OS/model/helper skal versionslåses og prøves. På en cloud-worker er headless browser væsentligt mindre opsætning end et komplet desktopmiljø. Brug en separat testdesktop, ikke Gustav’s personlige arbejdsflade.

### Websøgning: gør datavejen eksplicit

Til første onlineprofil foreslår jeg **Brave Search API gennem en lille, versionslåst CLI/skill**, med Pi-forfatterens [brave-search](https://github.com/badlogic/pi-skills/tree/90bb51cae36515a648515b633a81c0c6efc8c74d/brave-search) som reference. Vi behøver kun korte resultater med URL/titel/snippet; læs derefter selve primærkilden. Vores wrapper skal have timeout, maksimal responsstørrelse og ingen automatisk skift til en anden tjeneste. Søgestrenge med kundekode eller private fund skal ikke sendes til en offentlig søgeprovider.

Den aktuelle [Brave-prisside](https://brave.com/search/api/) siger $5 pr. 1.000 Search-kald og $5 i månedlig kredit. Skillens ældre tekst om en særlig gratis plan er derfor ikke vores prisgrundlag. Kontoens faktiske vilkår og kvoter skal bekræftes ved opsætning. Uden behov for websøgning bruger worker kun kendte dokumentationskilder. Egen søgetjeneste kan senere være et valg, men gratis software fjerner ikke drift eller upstreambegrænsninger.

Jeg ville **ikke vælge en stor web-extension som default endnu**. [`pi-web-tools` 4.1.1](https://github.com/coctostan/pi-web-tools/blob/445f9fca0bd8bdf96251a1d93f265e95ab3b75c4/package.json) har Exa-søgning, fetch og indholdsfiltrering, men erklærer Pi-peer `^0.74.0`, som efter semver ikke omfatter 0.85/0.87. README’s “≥0.74” er bredere end manifestet. Det er en konkret kompatibilitetsafklaring, ikke bevis for at pakken nødvendigvis fejler. En ekstra model til indholdsfiltrering skal også indgå i pris- og datakortet.

Den læste [fetch-kode](https://github.com/coctostan/pi-web-tools/blob/445f9fca0bd8bdf96251a1d93f265e95ab3b75c4/extract.ts) kan desuden sende URL’en videre til `r.jina.ai`, når direkte indholdshentning fejler på bestemte måder. Det er en konkret ekstra datavej, som skal være eksplicit valgt i en kundeløsning. Et lokalt extension-navn betyder ikke lokal behandling.

### MCP: tilvalg, når en konkret integration kræver det

[`pi-mcp-adapter` 2.36.0](https://github.com/nicobailon/pi-mcp-adapter/tree/0e88e19e6dc0a72847d4ab8740c02f42d5aeecab) er en MIT-kandidat med én proxy til on-demand værktøjsopslag. Det er bedre til vores formål end at indlæse alle mulige connectors ved start. Men den kan læse delte/projektlokale MCP-konfigurationer; factoryen skal styre præcis hvilke servere og credentials, der gives adgang til. En extension er kode med procesrettigheder. Vi har ikke kørt denne adapter eller godkendt dens dependency-kæde.

## Defence kræver mere end en stærk model

Defence er en profil i samme system med egen adgang og evidens, ikke endnu en platform. Basispakken bør bestå af:

| Kontrol | Kandidat | Rolle og grænse |
| --- | --- | --- |
| Secrets i kode/historik | [Gitleaks](https://github.com/gitleaks/gitleaks) | Deterministiske detektioner; fund/logs skal redigeres før deling |
| Kendte dependency-sårbarheder | [OSV-Scanner](https://github.com/google/osv-scanner) | Scan relevant lockfile/SBOM; brug kontrolleret database/opslagsrute |
| Sprogspecifik kildeanalyse | [Semgrep CE](https://docs.semgrep.dev/licensing) eller projektets egnede scanner | Målrettede regler, fast version og kendt rule-license; ingen tilfældig gigantisk regelpakke |
| Webapp under kørsel | [ZAP baseline](https://www.zaproxy.org/docs/docker/baseline-scan/) som tilvalg | Spider/passiv analyse mod afgrænset testinstans; ikke et bevis for fuld pentest |
| Validering og remediation | Pi-review eller konkret Codex Security-overdragelse | Fund → reproduktion → konsekvens → patch → regressionstest → kontrol på samme head |

Semgrep CE-motoren og Semgrep’s vedligeholdte regler har **forskellige licenser**. De officielle regler er ikke uden videre materiale, vi kan videredistribuere i en konkurrerende security-tjeneste. Brug egne eller særskilt godkendte regler i produktpakken; afklar den konkrete anvendelse. [Licensopdelingen](https://docs.semgrep.dev/licensing).

Et “scan bestået” betyder kun, at de valgte kontroller ikke fandt deres typer af fejl. Authentication, autorisation, dataflows og forretningslogik kræver relevante tests og vurdering. Ingen fund må få høj alvor alene på en agents ord; bevar reproduktion og usikkerhed.

Daybreak-adgang i Codex er ikke det samme som tilgængelig API-inference i Pi. Det samme gælder Codex-plugins og produktets øvrige værktøjer. Vi beholder specialistgrænsen og kopierer ikke pluginfiler ind i vores MIT-repo. En åben model må gerne konkurrere på samme afgrænsede security-cases, men får ikke en kvalitetsgaranti gennem modelnavnet.

## Lokal, egen cloud og Kastanje

| Profil | Afvikling | Inference | Hvad skal bevises |
| --- | --- | --- | --- |
| Z13 softwarepilot | Pi + browser i dedikeret miljø | Lokal server eller Kastanje | Konkret RAM/VRAM/OS, tool calling, kontekst, hastighed og stabilitet |
| Egen cloud | Lille privat controller; isoleret Linux-worker | Kastanje eller valgt API | Worker-/netværksgrænse, region, logs, backup og stop |
| Desktoppilot | Separat OS-session/VM med Pi-extension | Billedmodel efter behov | Observation, korrekt mål, handling, ny observation, stop og session cleanup |
| Codex-specialist | Den produktflade med faktisk adgang | Tilgængelig security-model | Tilladte dataveje og en reviewpakke, som returnerer til factoryen |

Modeluafhængighed betyder, at vi kan udskifte modeller bag en kontrakt. Det betyder ikke identisk kvalitet eller støtte for alle tool-/billedformater. Tekstmodeller kan arbejde med kode og browserens semantiske snapshots. Pixelbaseret computerarbejde og visuel vurdering kræver en egnet billedmodel eller en eksplicit separat billedvurdering. Hardwaremodellen “ROG Flow Z13” alene afgør ikke, hvad der kan køre tilfredsstillende.

Pi’s [containervejledning](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/docs/containerization.md) skelner mellem hele agenten i isolation og kun routing af indbyggede tools. Sidstnævnte kan efterlade extensions på værten. Derfor anbefaler jeg **hele Pi-processen og browseren i workergrænsen** til ubemandet drift. Rootless container er første afprøvning til vores eget pilotrepo; en VM/micro-VM er et relevant stærkere miljø til mindre betroet kode. Ingen Docker-socket, personlig home-mappe eller administrationsnøgler i worker.

[Gondolin](https://github.com/earendil-works/gondolin/tree/29fa74d802112f29c720990aced26165e0d57d84) er en interessant Apache-2.0 micro-VM-kandidat med netværkspolitik og proxyinjektion af secrets. Den dokumenterer Linux/macOS og ARM64 som mest afprøvet. Den er ikke hermed godkendt som Windows/Z13-standard. Den officielle Pi-extension er især en reference til tool-routing; den isolerer ikke automatisk alle andre extensions.

En lokal model eller et EU-endpoint garanterer ikke, at hele flowet er lokalt/EU. GitHub, søgning, billeder, logs, telemetry og backups skal indgå. Pi’s startuptelemetry/opdateringskald kan deaktiveres i en fast workerprofil; `--offline` er **ikke** et netværksfilter for model- og værktøjskald. [Settings](https://github.com/earendil-works/pi/blob/95fbc04997eaee961eb673fa7923e9220609ebd5/packages/coding-agent/docs/settings.md).

## Skills, controller og målinger

Behold de eksisterende seks små skills: triage, spec, implement, review, security og evaluate. Indlæs kun dem, den aktuelle fase kræver. Browser/search/desktop får korte capability-instruktioner ved brug, ikke en universel megaprompt. Ingen swarm, permanent memory-server, vektordatabase, planextension eller selvinstallerende extension-agent er nødvendig for første pilot. Hvis en konkret eval viser behov, kan vi tilføje det bagefter.

Andre tilvalg følger inputtypen: PDF-/dokumentudtræk, transskription og videooptagelse kræver deres egne programmer eller tjenester. LSP kan hjælpe på store kodebaser; en databaseconnector kan være relevant til en testdatabase. Ingen af disse er automatisk med, fordi Pi har en skill. Start med projektets eksisterende kommandoværktøjer og syntetiske testdata, og udvid capability-kontrakten, når en opgave kræver mere.

Start med Pi som separat **RPC-proces**: det giver en tydelig procesgrænse og en udskiftelig workeradapter. SDK er også relevant til Node/TypeScript, men kobler os tættere til Pi’s interne API. Machinist kan stadig afprøves som controller; Pi og Machinist konkurrerer ikke om samme rolle. Den tidligere runtime-probe er fortsat en selvstændig opgave. Se [næste runtime](next-runtime.md).

Første controllerkontrakt skal låse repo/base/scope/skills/tools/model, samle strømmede hændelser, vente på settled, køre faste checks og starte et separat review af den frosne revision. `clear_queue` før `abort` er relevant ved stop; supervisoren skal også kunne afslutte procestræ og miljø. En agentbesked om “done” eller et succesfuldt RPC-svar må aldrig udløse merge.

Dashboardet bør måle **pris pr. accepteret opgave**, ikke kun tokens pr. modelkald. Registrér input/output/cache, første-kaldskontekst, model- og toolversioner, alle forsøg, VM/browser-tid, ekstern søgning, menneskelig review-/reparationstid og fejl efter release. Hold køtid, aktiv agenttid, testtid og mennesketid adskilt. Pi’s beregnede session cost er ikke en kvittering; manglende prisliste/usage skal blive “ukendt”, også hvis Pi returnerer nul.

Vores sammenligning bør have to spor:

1. **Harness-effekt:** samme tilgængelige model og samme opgaver/checks på Pi og Codex, hvor begge faktisk understøtter den. Frys toolbudget, miljø, prisgrundlag og instruktioner; dokumentér forskelle i effort-semantik.
2. **Kundens realistiske pakke:** Pi + nødvendige browser/security-funktioner + Kastanje/lokal inference over for den faktisk anvendte løsning. Her tæller opsætning, drift og mennesketid med.

Brug først vores fem fixtures og derefter tre reelle Kastanje-opgaver: bug, mindre feature og afgrænset security-rettelse. De fem fixtures er en screening, ikke et statistisk grundlag for en universel pris-/kvalitetspåstand. Browser-, stop- og recovery-scenarier skal tilføjes som driftsprøver. Gentag opgaver i sammenligningen, og behold fejl og mislykkede forsøg i regnskabet.

## Hvad er allerede efterprøvet her?

På authoring-maskinen er **Pi 0.85.1 allerede installeret**. Den læste upstreamrevision har package-version 0.87.0; vi har ikke opgraderet brugerens installation eller antaget, at alle extensions understøtter begge.

Den nye [protokolprøve](../scripts/probe-pi.mjs) har kørt mod den rigtige Pi 0.85.1 og en **syntetisk lokal HTTP-provider**:

- Custom provider og RPC-start lykkedes.
- Pi udførte sit rigtige `read`-værktøj på en ufarlig fixture og sendte resultatet tilbage.
- JSONL med Unicode linjeseparator blev korrekt behandlet som ét record.
- Kunstigt usage og konfigurerede priser blev summeret korrekt.
- `clear_queue` + `abort` afbrød et hængende lokalt modelrequest.
- En accepteret prompt kunne efterfølgende få en providerfejl, som blev registreret.
- En projektlokal extension blev ikke automatisk indlæst i den valgte profil.

**Dette er integrationsbevis, ikke et modelbenchmark.** Der blev ikke kørt betalt inference, browser-/desktopextensions, en OS-sandbox, Kastanje eller security-scannere. Pi er endnu ikke forbundet som eksekverende worker i dashboardet. [Opsætningsforslag og konfigurationsskabeloner](../profiles/pi/README.md) beskriver næste konkrete skridt. [Kildeinventar](pi-sources.json) fastholder de inspicerede revisioner.

Næste leverance bør være **én Pi-worker, én isoleret browser og én Kastanje-opgave gennem hele reviewforløbet**. Desktopstyring kommer ind, når en sådan opgave faktisk behøver den. Det er den korteste vej til at lære, om den lille harness også giver en billigere og bedre samlet leverance for Arcitai.
