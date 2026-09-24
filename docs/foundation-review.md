# Fundamentet holdt op mod Cole, Shapiro og driftsmulighederne

**Research · 24. september 2026.** Den korte, gældende byggeretning er [platform.md](platform.md). Dette er kildegrundlag og konkrete huller, ikke en færdig installation eller et benchmark.

## Tre forskellige Cole-repositories

| Kilde | Hvad den faktisk bidrager med | Vores anvendelse |
| --- | --- | --- |
| [ai-software-factory](https://github.com/coleam00/ai-software-factory/tree/e167ddc480d2f5c95d436f9d1c5cdcf37b092281) | Projektopsætning og VPS-opskrift oven på Archons SDLC-workflows | Agentstyret onboarding og en observeret første opgave før scheduler. Archon fravalgt |
| [skills](https://github.com/coleam00/skills/tree/dfaa9105741fc5ba9b16b6a72551cad4bad70415) | 34 skills samt en separat shell/Python-runner i `build-dark-factory` | Udvælg principper frem for at installere hele samlingen. Runneren kræver ikke Archon |
| [dark-factory-experiment](https://github.com/coleam00/dark-factory-experiment/tree/eaf804b4cad7606496d54298b9c42d47731119d0) | En konkret RAG-app med Archon-workflows og beskrevne driftserfaringer | Lær af fejl, gates og kandidatverifikation; appen er ikke et generisk factory-dashboard |

**Vigtig præcisering:** “Coles løsning kræver Archon” gælder de to factory-repos, ikke alle hans skills. Den portable runners [konkrete agentkald](https://github.com/coleam00/skills/blob/dfaa9105741fc5ba9b16b6a72551cad4bad70415/.claude/skills/build-dark-factory/templates/runner/factory/run-workflow.sh#L266) bruger imidlertid Claude-formede CLI-argumenter og JSON. Codex/Pi kræver en reel adapter; et nyt programnavn er ikke nok. Vi bevarer vores harnessuafhængige metode og kvalificerer konkrete wrappers i den valgte Machinist-motor. [Opdelingen mellem agent, workflowmotor og trigger](https://github.com/coleam00/skills/blob/dfaa9105741fc5ba9b16b6a72551cad4bad70415/.claude/skills/build-dark-factory/references/automation.md) er nyttig uden at overtage hans scripts.

## Hvad har vi, og hvad mangler?

| Del | Vores fundament | Næste nødvendige bevis |
| --- | --- | --- |
| Retning og skills | Seks skills, accepteret scope, vertical slices og security/review | Projektets formål, ikke-mål og vigtigste brugerrejser skal peges ud ved installation; ingen obligatorisk stor PRD |
| Checks af faktisk værdi | Evidensformat og eval-cases; syntetiske prøver | Appen skal fungere på den leverede revision; en relevant fejl skal få kontrollen til at fejle |
| Afvikling | Node/SQLite-journal og Codex/Pi-adaptere | Isoleret miljø fra GUI til resultat; secretgrænse, stop, restart og bevarede artifacts |
| Levering | GitHub-læsning, issue-webhook og reviewmetode | Afgrænset branch-/PR-skrivning, aktuelle checks og særskilt releasepolitik |
| Vedvarende drift | Regler for én writer, timeout og begrænsede reparationer | Installer/service, polling, dubletter, udløbet adgang, ukendt worker og backup/restore |
| Arbejdsflade | Eksisterende lokal GUI og designretning | Kort onboarding og virkelige jobstatusser; ingen ekstra generisk workflow-editor |

Coles [FACTORY.md](https://github.com/coleam00/dark-factory-experiment/blob/eaf804b4cad7606496d54298b9c42d47731119d0/FACTORY.md) beskriver både en merge uden fungerende app-test og en langvarigt fastlåst kø. Det er forfatterens egne hændelser, ikke vores uafhængige driftsmåling. Konsekvensen for os: manglende bevis er uafklaret, aktive jobs skal kunne afstemmes, og stop skal virke uden et modelsvar. Et nyt reviewprompt alene løser ingen af delene.

Den relevante [slice-skill](https://github.com/coleam00/skills/blob/dfaa9105741fc5ba9b16b6a72551cad4bad70415/.claude/skills/piv-slice-epic/SKILL.md) understøtter gennemgående, beviselige ændringer og planlægning af afhængige opgaver efter det tidligere resultat. Vi overtager ikke hans anbefalede linjetal eller testprocenter. Vores slice afgrænses af adfærd og reviewbarhed.

## Shapiro: autonomi og en afgrænset forbedringsløkke

[The Five Levels, 23. januar](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/) beskriver niveauer 0–5. På niveau 3 er mennesket tæt på kodereview; niveau 4 flytter arbejdet mod specifikation og kontrol af resultater. Det er en forfatters model, ikke en certificering, et benchmark eller tilladelse til automatisk merge. Vores første produkt leverer selvstændigt til review; yderligere releaseautonomi kræver særskilt politik og bevis. GUI’en skal vise de konkrete tilladelser frem for ét misvisende niveau-tal.

[Rise of the Trycycle, 11. marts](https://www.danshapiro.com/blog/2026/03/dark-factories-rise-of-the-trycycle/) peger på gentagen planforbedring og implementering med review som en enkel kerne. Vi bruger princippet inden for hver vertical slice, med uafhængig reviewkontekst, bevarede observationer og afgrænset reparationsbudget. “Perfekt” og modelenighed er ikke acceptkriterier. Tre samtidige løsninger vælges kun til en konkret, budgetteret evaluering; de er ikke vores lavprisstandard.

Den aktuelle [Trycycle README](https://github.com/danshapiro/trycycle/blob/eb25b5141187b667096d948198617075f8e8e55a/README.md) beskriver nu native subagenter eller en Python-runner og flere reviewrunder. Artiklen er derfor inspiration, ikke en aktuel installationsspecifikation. Trycycle er ikke installeret; en ekstra orchestrator oven på vores jobloop ville først kræve entydigt ejerskab af forsøg og stop.

## Drift og pris

| Placering | Hvad det giver | Valg nu |
| --- | --- | --- |
| Egen Linux-VPS | Vedvarende controller og jobmiljø; separat modeladgang | Standardprofil. Dedikeret vært, ét projekt og ét aktivt job først |
| Egen Mac/ROG Flow | Samme Linux-pakke på egen hardware; mulighed for lokal inference | Alternativ. Søvn/slukning stopper kapaciteten; runtime og model er separate valg |
| Oracle Always Free | Aktuelle docs angiver op til 2 OCPU/12 GB ARM samt 200 GB block storage | Mulig gratis pilot; kapacitet er ikke garanteret, idle maskiner kan inddrages, og ARM-images skal kvalificeres |
| Cloudflare Sandbox | Linux-jobmiljø efter behov med Workers/Durable Objects omkring | Senere adapter. Betalt plan og forbrug; ingen gratis altid-tændt VPS |

Oracle-tal er læst i den [aktuelle officielle oversigt](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), ikke den ældre 4 OCPU/24 GB-markedsføring. Vi har ikke oprettet en instans eller kontrolleret Gustavs konto. Gratis compute inkluderer ikke modeladgang eller en garanti for drift.

[Cloudflare Containers-priser](https://developers.cloudflare.com/containers/platform/pricing/) kræver Workers Paid fra 5 USD/md. og inkluderer begrænsede compute-kvoter. Hukommelse/disk afregnes efter reserveret størrelse, mens CPU afregnes efter aktiv brug. En illustrativ `standard-1` med 4 GiB RAM/8 GB disk, vågen 20 timer på en måned og samlet 5 aktive vCPU-timer, giver cirka **5,50 USD** for basisplan og containerforbrug. Det er beregning, ikke måling; model, eventuelle ekstra Workers/DO/logs, lager, trafik, backup og moms er ikke med. Samme størrelse vågen 720 timer koster cirka **32,10 USD alene i basisplan og RAM/disk**, før CPU og øvrigt. Derfor er sleep afgørende.

[Sandbox-arkitekturen](https://developers.cloudflare.com/sandbox/concepts/architecture/) bruger VM-isolerede Linux-miljøer. [Levetid og storage](https://developers.cloudflare.com/sandbox/concepts/sandboxes/) kræver, at vi bevarer og gendanner jobdata ved tab af den midlertidige disk. Vores nuværende lokale SQLite/journal må ikke bare lægges i sådan et miljø og behandles som permanent. Cloudflare kan senere være worker eller en særskilt cloudprofil; den ændrer ikke den portable metode.

## GUI, isolation og fravalg

**GUI:** genbrug Machinists eksisterende flade først; [den nyere undersøgelse](machinist-review.md) styrer motorvalget. Vores starter bevares som reference. Fabro viser gode mønstre, men [serverguiden](https://docs.fabro.sh/administration/self-host-docker) er mærket private early access. [Agentgrænsen](https://docs.fabro.sh/changelog/2026-05-18) er API eller ACP, hvor det eksterne ACP-program ejer værktøjer/auth. Det er ekstra integration, ikke bevis for plug-and-play Codex/Pi. Mastra forbliver UX-inspiration. [Freshell](https://freshell.net/) fra Shapiros artikel er relevant som browserarbejdsflade for coding-CLI’er; dets landing page er læst, men en factory-integration er ikke undersøgt eller afprøvet.

**Isolation:** en VPS er en computer, og et Git-worktree er et checkout. Ingen af delene alene afskærmer en agent fra kontrolplanet. Første pilot bruger dedikeret vært og jobcontainere med begrænsede mounts, ikke-root bruger, ressourcegrænser og projektafgrænset netværk. Den betroede jobstarter må administrere containere; agenten får hverken Docker-socket, controllerdisk, evaluatorens private tests eller admin-/deploycredentials. [Docker beskriver daemonens privilegier](https://docs.docker.com/engine/security/). Containere deler værtskerne: adskilte kunders ubetroede jobs eller sikkerheds-PoC’er kræver et stærkere, kvalificeret VM-miljø. Dette er krav til næste slice, ikke implementerede garantier.

**Capabilities:** filer/shell/Git/tests er basis. Browser til UI-prøver; web research og security-specialist efter opgaven. Fuld desktop/computer use er tilvalg. Hvert værktøj skal installeres og bevises på workerens miljø; en skill eller lokal appintegration flytter ikke automatisk med til VPS’en.

**Afgrænsning:** ingen Archon, ingen ny stor skillpakke, ingen automatisk produktionsmerge som standard, ingen fælles kørende kundeinfrastruktur og ingen ny obligatorisk hostingudbyder. Defense kan genbruge opsætning/status/evidens med egne rettigheder og arbejdsforløb. Appens eksisterende CI/CD og produktionshosting bevares.

## Hvad er faktisk undersøgt?

Udvalgte README-, setup-, workflow-, runner-, regel- og verifikationsafsnit er læst ved de linkede commits; ikke fulde kode-/sikkerhedsaudits. Begge Shapiro-artikler er læst, sammen med Trycycles aktuelle README. Cloudflare- og Oracle-docs er kontrolleret på datoen ovenfor. Ingen upstream-skill er aktiveret, kode kopieret ind i produktet eller provider købt. Machinist er efterfølgende bygget og afprøvet med syntetiske processer i et isoleret lokalt miljø; ingen rigtig model-/apppilot er udført. Se [proof.md](proof.md).
