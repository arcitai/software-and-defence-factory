# Seks videoer: hvad skal Arcitai Software and Security Factory tage med?

Gennemgået **21. september 2026**. Alle seks engelske, automatisk genererede YouTube-transskriptioner er hentet og læst. Beskrivelserne er åbnet, forkortede tekniske links er fulgt, og udvalgt kildekode er undersøgt. Undertekster kan fejlskrive navne og modeller; modelpriser og rangeringer i videoerne bruges derfor ikke som aktuelle benchmarks. Dette er en arkitektur- og kildegennemgang, ikke en fuld sikkerhedsaudit af de eksterne projekter.

**Senere opdatering 23. september:** [BuilderIO-videoen og den konkrete kode](builderio-review.md) er nu også gennemgået. Aktuel prioritet er en manuel pilot på eksisterende runner; Machinist er en senere mulighed ved dokumenteret behov. Beskrivelserne og dækningsstatus nedenfor er historikken fra denne første gennemgang. Pi- og Security-adaptere er siden tilføjet; se [aktuel worker-status](worker-integrations.md).

**Anbefaling: behold én lille, åben factory med to spor.** Lad Arcitai eje kundens metode, acceptkriterier, beviser og målinger. Efter [Pi-researchen 22. september](pi-research.md) er Pi første harness-kandidat; Codex er stadig den implementerede adapter. Afprøv Machinist som mulig controller, før vi bygger en permanent kø og scheduler selv. Sandcastle er en alternativ byggesten til isoleret agentafvikling. De to skal ikke begge styre samme job. Kildegennemgangen nedenfor beskriver fortsat de seks videoer og deres konkrete kode.

Vores v0.1 er fortsat en **kørbar starter med manuel overdragelse**, ikke en færdig ubemandet factory. Videoerne ændrer især prioriteringen af den næste version: reproducerbare miljøer, før/efter-bevis, versioneret kørselskonfiguration, økonomiske stop og feedback fra drift. Den konkrete rækkefølge står i [næste runtime](next-runtime.md).

## Hvad hver video bidrager med

| Video og ophav | Relevant indhold og tidskode | Arcitais anvendelse |
| --- | --- | --- |
| [Inside OpenAI's Agentic Software Factory](https://www.youtube.com/watch?v=yhLDivVIamQ) — Owain Lewis, 21/9 | [1:30](https://www.youtube.com/watch?v=yhLDivVIamQ&t=90s): specialistreview og risikovurdering. [3:15](https://www.youtube.com/watch?v=yhLDivVIamQ&t=195s): hændelser og performance. [8:32](https://www.youtube.com/watch?v=yhLDivVIamQ&t=512s): release-observation. | Tilføj risikobestemt review og en afgrænset feedbackvej fra drift til nye opgaver. En demo af automatisering er ikke dokumentation for autonom produktionsdrift. |
| [I Open-Sourced My Own AFK Software Factory](https://www.youtube.com/watch?v=E5-QK3CDVQM) — Matt Pocock, 30/4 | [2:06](https://www.youtube.com/watch?v=E5-QK3CDVQM&t=126s): Sandcastle med harness, sandbox og backlog. [6:20](https://www.youtube.com/watch?v=E5-QK3CDVQM&t=380s): planner, implementer og reviewer. [9:06](https://www.youtube.com/watch?v=E5-QK3CDVQM&t=546s): integration af branches. | Bevar udskiftelige roller og separate arbejdsområder. Parallelle branches skal stadig integreres og kontrolleres samlet. Start med én writer. |
| [Engineers… Your Software Factory NEEDS Agent Sandboxes to SCALE](https://www.youtube.com/watch?v=SEI_qIW4o2c) — IndyDevDan, 10/8 | [2:13](https://www.youtube.com/watch?v=SEI_qIW4o2c&t=133s): flere konfigurationer på samme opgave. [27:40](https://www.youtube.com/watch?v=SEI_qIW4o2c&t=1660s): orkestratorer og workers. [29:09](https://www.youtube.com/watch?v=SEI_qIW4o2c&t=1749s): begrænsede nøgler og oprydning. | Definér hele miljøets livscyklus, credentials og forbrug. Best-of-N er en valgfri evaluering med fælles budget; alle tabende forsøg tæller med. |
| [I Built A Self-Improving AI Software Factory](https://www.youtube.com/watch?v=ZDOTYfJBuLw) — Owain Lewis, 31/8 | [1:29](https://www.youtube.com/watch?v=ZDOTYfJBuLw&t=89s): controller kontra workers. [8:38](https://www.youtube.com/watch?v=ZDOTYfJBuLw&t=518s): evaluering. [9:39](https://www.youtube.com/watch?v=ZDOTYfJBuLw&t=579s): scripts frem for gentagen agent-polling. | Den vigtigste nye runtime-kandidat er Machinist. Versionsstyr prompts og mål ændringer på sammenlignelige opgaver. Bevar lokal, interaktiv udvikling til udforskende arbejde. |
| [My Super Simple Software Factory](https://www.youtube.com/watch?v=haUfb1ievTE) — IndyDevDan, 3/8 | [1:23](https://www.youtube.com/watch?v=haUfb1ievTE&t=83s): observerbar, tilpasningsbar og genbrugelig. [11:18](https://www.youtube.com/watch?v=haUfb1ievTE&t=678s): kodekontroller og strukturerede overdragelser. [18:18](https://www.youtube.com/watch?v=haUfb1ievTE&t=1098s): kontekst, model, prompt og værktøjer. | Kode ejer tilstandsskift, deadlines og kendte checks. Agenter ejer analyse og implementering. Vælg kun de faser, opgaven kræver; et fuldt agenthold er ikke standard for små rettelser. |
| [Building a Software Factory that actually works](https://www.youtube.com/watch?v=_LCeJZFIsd4) — Greg Isenberg med Ras Mic, 14/9 | [5:23](https://www.youtube.com/watch?v=_LCeJZFIsd4&t=323s): isolér. [11:34](https://www.youtube.com/watch?v=_LCeJZFIsd4&t=694s): byg. [14:48](https://www.youtube.com/watch?v=_LCeJZFIsd4&t=888s): bevis. [22:25](https://www.youtube.com/watch?v=_LCeJZFIsd4&t=1345s): review/reparation. | Gør før/efter-bevis til en lille reviewpakke. Brug tests eller målinger, når effekten ikke er visuel. Et bestemt betalt reviewprodukt og en 5/5-score er ikke et universelt acceptkriterium. |

## Hvad de konkrete kilder faktisk leverer

### Machinist: undersøg før vi genopfinder runtime

[Machinist](https://machinist.sh/) linker til [owainlewis/machinist](https://github.com/owainlewis/machinist/tree/7b08de02e9a94fabcafe434dd0c83f3f71afe5ae), MIT. Runtime-koden adskiller procesafvikling fra workflow-orkestrering og har jobs, leases, workers, output og historik. Den aktuelle arkitektur siger udtrykkeligt **ét run pr. job, ingen intern fasemodel**. En dræbt workflow-proces er ikke automatisk genoptagelig mellem faser. [Arkitektur](https://github.com/owainlewis/machinist/blob/7b08de02e9a94fabcafe434dd0c83f3f71afe5ae/ARCHITECTURE.md).

Hjemmesidens sammenhængende issue-til-PR-fortælling er mere omfattende end det, vi bør regne som en færdig kontrakt. Projektets [roadmap](https://github.com/owainlewis/machinist/blob/7b08de02e9a94fabcafe434dd0c83f3f71afe5ae/docs/workflow-roadmap.md) skelner mellem implementeret runtime, eksperimentelle workflows og fremtidig, holdbar recovery. Brug den skelnen i en pilot. Deres [sikkerhedsmodel](https://github.com/owainlewis/machinist/blob/7b08de02e9a94fabcafe434dd0c83f3f71afe5ae/SECURITY.md) siger også, at kommandoer har worker-brugerens OS-adgang; repository-registrering er ikke sandboxing.

**Vores beslutning:** Machinist er en stærk kandidat til genbrug, men endnu ikke integreret eller afprøvet med Arcitai. Behold nuværende starter, indtil en lille afprøvning viser mindre samlet vedligehold og korrekt fejlhåndtering. Undgå to konkurrerende køer og to dashboards, der begge påstår at eje samme tilstand.

### Sandcastle: agent- og sandbox-adapter, ikke hele kundeløsningen

Matt-linket fører til [Sandcastle](https://github.com/mattpocock/sandcastle/tree/e99f832f26dc9d245c019a9ddd19fa5dee792427), MIT. Det er en nyttig TypeScript-byggesten til valgte agent-/sandboxkombinationer. Videoens automatiske merge er en konfigureret workflowbeslutning. Arcitai kan bruge samme overdragelsesprincip og fortsat returnere en PR til menneskelig accept. Biblioteket erstatter ikke kundens testkommandoer, forbrugspolitik og dataafgrænsning.

[AI Hero-linket](https://www.aihero.dev/s/wuvIE1) omdirigerer til [mattpocock/skills](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7). Små, tilpasselige skills er relevant inspiration. Der installeres ikke en samlet pakke, og interview-workflows bliver ikke gjort obligatoriske for en allerede afklaret opgave.

### SSSF: gode fasekontrakter, konkrete integrationshuller

[Super Simple Software Factory](https://github.com/disler/super-simple-software-factory/tree/de31374882e7a4e3e5b7bb9bd09e69dc2f779356), MIT, har Python-workflows, typede output, SQLite-spor og Pi-udvidelser. Den undersøgte [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py) leverer eksplicitte placeholder-checks, som returnerer exit 0. De skal erstattes af repoets rigtige tests. [Claude Code-adapteren](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agent_cc.py) er en stub; v1 bruger Pi.

**Vores beslutning:** genbrug idéen om små, validerede overdragelser. Installér ikke hele stacken som Arcitais plug-and-play-standard. Beskyttelse, der opdager filændringer efter en agentkørsel, er ikke i sig selv en grænse mod dataudsendelse under kørslen.

### Factory in a box: lær livscyklussen, gennemgå standarderne

Sandbox-videoen linker til [Inkwell-eksemplet](https://github.com/disler/inkwell-agent-sandboxes-and-software-factory/tree/92f1701810993b8303562265ba04c727468fe070), MIT. Det har konkrete create/setup/execute/observe/harvest/teardown-trin. Vi skal bruge en tilsvarende kontrakt for resultater, forbrug og oprydning. Den aktuelle [observe-opskrift](https://github.com/disler/inkwell-agent-sandboxes-and-software-factory/blob/92f1701810993b8303562265ba04c727468fe070/just/sandbox/lifecycle/observe.just) gør demoappens port offentlig; den indstilling er ikke en passende kundestandard.

[exe.dev](https://exe.dev/) er en hosted VM-tjeneste, ikke et krav til den åbne factory. [OpenRouters management-API](https://openrouter.ai/docs/guides/overview/auth/management-api-keys) viser et konkret mønster til separate nøgler med limits og tilbagekaldelse. Det betyder ikke, at Kastanje allerede har samme API. Nøglernes grænse dækker heller ikke automatisk VM, andre providers eller mennesketid. Management-nøglen må ikke følge med ind til worker-agenten.

### Ras Mic: lille metode, særskilt teknisk håndhævelse

[Podcastens skabelonlink](https://startup-ideas-pod.link/ras-software-factory) omdirigerer til [michaelshimeles/skills](https://github.com/michaelshimeles/skills/tree/4b72f46b045e6fef52e6a98d4c162dd309826aed). [AGENTS.md](https://github.com/michaelshimeles/skills/blob/4b72f46b045e6fef52e6a98d4c162dd309826aed/AGENTS.md) binder isolate/build/prove/ship sammen. Det nævner selv delte ressourcer mellem worktrees og en offentlig standardhost til billedbeviser. Der er ingen top-level LICENSE i den undersøgte rod, og dele henviser til andre upstreams; vi kopierer derfor ikke denne samling ind under vores MIT-licens.

**Vores tilpasning:** seks egne skills er nok. Før/efter-materiale gemmes privat som standard, og eksisterende godkendt arkitektur bruges frem for at påtvinge alle projekter samme service-lag. Reviewscoren kan være ét signal. Sikkerhedskritiske ændringer kræver stadig undersøgelse af kode og adfærd. Separate worktrees fjerner ikke fremtidige mergekonflikter eller adgang til fælles secrets, porte og databaser.

### OpenAI-historien: hold demonstrationen adskilt fra dokumentationen

Beskrivelsen linker til den [oprindelige Pragmatic Engineer-artikel](https://newsletter.pragmaticengineer.com/p/openai-software-factory), 15/9, og [Owains demo](https://github.com/owainlewis/youtube-tutorials/tree/5b3d3c9a136dc797c0da1427406c9a53fefbee5c/tutorials/software-factory). Artiklen bygger på interviews; kun den tilgængelige del er læst. Den beskriver menneskelig godkendelse før produktion og Sevbot som et system, der foreslår afhjælpning; selvstændig udførelse er en ambition. Owains demo er hans implementering, ikke OpenAI-intern produktionskode.

Den konkrete [PR-prompt](https://github.com/owainlewis/youtube-tutorials/blob/5b3d3c9a136dc797c0da1427406c9a53fefbee5c/tutorials/software-factory/resources/prompts.md) starter i dry-run og begrænser live-merge til nøje afgrænsede prosarettelser med kontrolpunkter. Vi overtager ikke dens merge-tilladelse. Arcitai skal først kunne levere pålidelig reviewevidens.

## Dækningskontrol af vores repository

**K** = implementeret og kontrolleret lokalt. **M** = beskrevet metode/manuelt arbejde. **N** = kræver viderebygning eller reel pilot. K er ikke bevis på betalt modelafvikling.

| Område | Status nu | Hvad mangler? |
| --- | --- | --- |
| Forretningsmål, scope og readiness | K + M | Virkelige Kastanje-opgaver og baseline |
| GitHub-issues/PR-overblik | K | Pagination, lukninger, frisk head/check-reconciliation og fuldt eventflow |
| Harness- og inferenceadskillelse | K + M | End-to-end-afprøvning af hver valgt rute; browser/computer-preflight |
| Én writer, frister, forsøg og stop | K | Distribuerede leases, genstart og dubletudførelse under reelle fejl |
| Worker-isolation og miljøopskrift | M + N | VM/image, egne credentials, netværksgrænse, separate testdata og bevist containment |
| Implementering → checks → separat review | K + M | Automatisk fasekørsel og uafhængig verifier-identitet; evidensimport er operatørbetroet |
| Før/efter og risikobestemt review | M | Skabelon er tilføjet; automatisk artifactindsamling og håndhævelse mangler |
| Omkostning, aktiv tid, reviewtid | K | Automatisk usage, fase-/ventetid, token-/værktøjsmålinger og finansielt stop |
| Kontrollerede evals | K + M | Faktiske modelresultater og komplet konfigurationsproveniens |
| Aflevering til PR og integration | M + N | GitHub-skriveadapter, head-guard og kontrol efter integration |
| Release, observation og hændelser | N | Først read-only observation, deduplikering og scoped opgaver; rollback er særskilt autoritet |
| Security-spor | M + K for fælles gates | Reelt specialistværktøj, validerede fund og efterprøvet rettelse |
| Læring af tidligere runs | M | Fejlkategorier, kontrolleret ændring af metode og eval før optagelse |
| EU-kæde og kundedrift | M + N | Dokumentation for inference, runtime, Git, logs, værktøjer, backups og support |

## Øvrige links i beskrivelserne

Alle tekniske hovedlinks ovenfor er fulgt. Sidehenvisninger registreres her, så de ikke forveksles med manglende produktkomponenter:

- Owains [Skool-community](https://www.skool.com/aiengineer/about), [AI Engineer](https://aiengineer.co/), [startside](https://aiengineer.co/start) og [medlemsguide](https://learn.aiengineer.co/youtube/build-and-evaluate-a-software-factory): community/tilbud. De to sidste kunne ikke hentes med webværktøjet; medlemsmateriale er ikke læst. De offentlige repositories giver det anvendte tekniske grundlag.
- IndyDevDans [Tactical Agentic Coding](https://agenticengineer.com/tactical-agentic-coding): kursussiden er læst som tilbud, ikke som dokumentation for effektivitet. [Loop Engineering-videoen](https://www.youtube.com/watch?v=VQy50fuxI34) og [datavideoen](https://www.youtube.com/watch?v=qh4vLlit97I) er sidehenvisninger, ikke ekstra transskriberet her. Datavilkår skal kontrolleres hos den valgte provider.
- Matts [Discord](https://aihero.dev/discord) og [Twitter](https://twitter.com/mattpocockuk): community/sociale profiler, ikke runtime-afhængigheder.
- Podcastens [Brex-sponsor](https://startup-ideas-pod.link/brex_SIP), [IdeaBrowser](https://www.ideabrowser.com/) og [Late Checkout](https://latecheckout.agency/): reklame/tilbud; ikke nødvendige for løsningen.
- Sociale ophavslinks: [Owain LinkedIn](https://www.linkedin.com/in/lewisowain/), [Owain Instagram](https://www.instagram.com/_owainlewis/), [Greg Twitter](https://twitter.com/gregisenberg), [Greg Instagram](https://instagram.com/gregisenberg/), [Greg LinkedIn](https://www.linkedin.com/in/gisenberg/), [Ras Mic X](https://x.com/Rasmic) og [Ras Mic YouTube](https://www.youtube.com/@rasmic). Registreret, ikke brugt som teknisk evidens.

Der er ikke købt abonnementer, installeret de eksterne factories, kørt deres agentkode, oprettet nøgler, deployet eller publiceret noget. Korte resuméer og kildehenvisninger følger med; fulde tredjepartstransskriptioner er ikke pakket i starterens kildearkiv.
