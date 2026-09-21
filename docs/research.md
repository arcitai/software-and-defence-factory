# Fra Warp-inspiration til en åben Arcitai Factory

Research opdateret **21. september 2026**. Dette dokument supplerer den tidligere brede research og ændrer standardvalget fra Pi først til **Codex lokalt / Cursor i cloud**. Pi bliver et avanceret tilvalg. Resultatet er en kørbar starter, ikke et færdigt produktionssystem eller dokumentation for modelbesparelser.

## Den anbefalede form

Ét produkt: **Arcitai Software & Defence Factory**. Én metode og arbejdsflade, to arbejdsspor, flere udskiftelige harness-/modelprofiler. Start med en operatør og et pilotrepo. GitHub er den første forge-adapter; kernen ejer ikke GitHub-specifikke agentantagelser. Kastanje bliver både en pilotcase og en valgfri inference-rute.

| Lag | Mindste nyttige indhold |
| --- | --- |
| Business | Problem, bruger, ønsket resultat, acceptkriterier, ejer og dokumenteret værdi |
| Repository | README, AGENTS, skills, issue-form, labelkontrakt og versionshistorik |
| Runtime | Kø, scope-gate, idempotens, én writer, timeout, stop/reconciliation og artifacts |
| Worker | Harness, værktøjer, isoleret checkout, testmiljø og capability-preflight |
| Model | Valgt provider/model, dataregion, tool calling, kontekst og forbrug |
| Kvalitet | Tests på konkret revision, separat review, security-disposition og menneskelig accept |
| Læring | Driftsmålinger, faste evalueringscases, fejltyper og kontrollerede metodeændringer |

Det er derfor mere end “fem skills og en agent”. Skills er et nyttigt lille videnslag, men ingen skill installerer et testmiljø, leverer browserstyring eller afstemmer et job efter et timeout.

## Hvad Warp faktisk gør

**Produktets arbejdsflade.** `build.warp.dev` blev åbnet og visuelt undersøgt. Der er en opgaveliste med triage, specifikation, implementering, review og menneskelige afklaringer, knyttet til GitHub-arbejdsobjekter. Det understøtter ønsket om at styre flowet frem for at føre lange chats. Vi har ikke inspiceret dashboardets backend og udleder derfor ikke dets præcise API/database fra skærmbilledet. [Warp Contributions](https://build.warp.dev/), [dashboard-dokumentation](https://docs.warp.dev/factories/factory-dashboard/).

**Repository-metoden.** Warps contribution-flow kræver product/technical spec for features før implementation readiness. Afgrænsede bugs kan gå mere direkte. Agentreview kombineres med menneskelig faglig review og konkret testbevis. Det overførbare princip er tydelig readiness og verificering af ændringen. Arcitai starter med én kort specifikation til små opgaver og udvider, når kompleksiteten kræver det. [CONTRIBUTING ved undersøgt commit](https://github.com/warpdotdev/warp/blob/c02a1887c2ffac2fe1362140acc60f1c42dd614c/CONTRIBUTING.md).

**Oz for OSS.** Det åbne automation-repo er konkret mere end prompts: Python-webhook-controller på Vercel, KV-tilstand, eventrouting, kontekstsamling, dispatch til hosted Oz og polling af run-resultater. GitHub er arbejdsgrundlaget, mens controlleren holder runtime-status. Skills dækker blandt andet triage, dedupe, specs, implementering, reviews, security og verifikation. Dette er den vigtigste tekniske reference for vores opdeling mellem en åben controller og udskiftelige workers. [Oz-kode ved undersøgt commit](https://github.com/warpdotdev/oz-for-oss/tree/a2bb45f231fd56ea28c1b381999d11b277a0b0e2), [arkitektur](https://github.com/warpdotdev/oz-for-oss/blob/a2bb45f231fd56ea28c1b381999d11b277a0b0e2/docs/architecture.md).

**Actions er ikke hele runtime-laget.** Den undersøgte aktuelle Oz-platformdokumentation beskriver webhook-controller og cronpolling; GitHub Actions bruges til CI. Warps eget repo indeholdt samtidig en workflow-reference til en ældre action-baseret wrapper. Kilderne er i bevægelse: kopier ikke en enkelt YAML og antag, at den repræsenterer hele det aktuelle setup. Den minimale Arcitai-starter behøver ingen Actions. [Oz platform](https://github.com/warpdotdev/oz-for-oss/blob/a2bb45f231fd56ea28c1b381999d11b277a0b0e2/docs/platform.md), [Warp-workflow](https://github.com/warpdotdev/warp/blob/c02a1887c2ffac2fe1362140acc60f1c42dd614c/.github/workflows/update-triage-local.yml).

**Målinger.** Warp beskriver omkostning pr. PR, gennemløb, agentadfærd og scorere. Estimerede kreditter og LLM-vurdering er nyttige observationer, men er ikke en faktura eller uafhængigt bevis på korrekthed. “Autonomi” ud fra fravær af menneskelige kode-push måler ikke al menneskelig afklaring/review. Vores målemodel registrerer den tid eksplicit. [Measure and improve](https://docs.warp.dev/factories/measure-and-improve/).

**Kontrolleret sammenligning.** Warps benchmarkdokumentation beskriver faste opgaver på forskellige model/runner-konfigurationer, gentagelser og vurderingsomkostninger. Sammenligning mod tredjeparts-harnesses var endnu ikke tilgængelig i den læste dokumentation. Arcitai bør derfor etablere egne sammenlignelige cases og bevare alle forsøg. [Benchmarks](https://docs.warp.dev/factories/benchmarks/).

Der anbefales **ikke** et Warp-abonnement. Vi bruger principper og offentlige kilder som inspiration, ingen Warp-produktkode eller designkopi. `warp` er AGPL-3.0, `oz-for-oss` MIT ved undersøgelsen; åben automation-kode er ikke lig med gratis hosted Oz-inference. X-søgningen gav ikke et tilstrækkeligt primært grundlag; konklusionerne her bygger på docs og repositories, ikke på tilskrevne marketingposts.

## Hvilket harness løser hvilket problem?

| Profil | Hvorfor vælge den? | Konkret grænse |
| --- | --- | --- |
| Codex lokal + OpenAI | Kendt harness; lav opsætningsfriktion i eksisterende workflow | Inference ekstern; headless browser/plugins kræver egen opsætning |
| Codex + Ollama | Lokal inference med samme CLI og metode | Model/hardware/tool calling skal prøves; webværktøjer kan stadig sende data ud |
| Codex + Kastanje | Kobler Arcitai-installation til valgt modelrute og forbrugsdata | Responses-kompatibilitet, EU-kæde og kvalitet skal verificeres pr. rute |
| Cursor cloud | Managed VM, browser/computer og repo-miljø | Leverandørkonto, spend og dataaftryk; vilkårlig custom inference ikke dokumenteret her |
| Codex Security | Adgang til specialiserede security-metoder og evt. Daybreak | Produktflade og kundeadgang skal prøves; modelnavn er ikke et kvalitetstempel |
| Pi custom | Lille, udvidelig runtime og providerfrihed | Integration af web/computer, isolation og supervision er eget ansvar |

Cursor dokumenterer label-ændring som GitHub-trigger og et v1-agent-API. Det gør en issue-pipeline konkret, men actor-gate, retries og polling er stadig runtime-ansvar. [Automations](https://cursor.com/docs/cloud-agent/automations), [API](https://cursor.com/docs/cloud-agent/api/endpoints).

Cursor **Origin** er allerede dokumenteret som tidlig beta med repository-/PR-funktioner og GitHub-synkronisering. Det er ikke nødvendigt at flytte kundens forge for at få factory-værdi. Bevar GitHub som første integrationsflade, og lad en anden forge blive en senere adapter. [Origin](https://cursor.com/docs/origin).

Codex' providerindstilling adskiller endpoint og model fra CLI. Den kontrollerede lokale CLI har eksplicit OSS/Ollama-støtte. Det dokumenterer en integrationsmulighed, ikke at alle åbne modeller løser samme opgaver eller understøtter alle browser-/searchfunktioner. [CLI-kilde](https://github.com/openai/codex), [providerdocs](https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers).

## Capabilities, reviews og sikkerhed

Seks små skills er passende her: triage, spec, implement, review, security og evaluate. De læses kun, når rollen kræver dem. Capabilities vurderes separat: filer, shell, Git, tests, web, browser, computer, security. Et grønt katalogfelt betyder dokumenteret produktfunktion, ikke afprøvet installation.

Security følger et afgrænset spor fra inventory og discovery til validation, ownership og verified remediation. Brug samme job-/evidence-format, men privat fundhåndtering og særskilt verifier. Det åbner for andre modeller uden at gøre kvaliteten afhængig af branding. [OpenAI Defense Factory](https://openai.com/the-defense-factory/).

Vi starter ikke med en agent, der automatisk omskriver sine egne skills ud fra PR-feedback. Først skal et svagt resultat kunne spores til model, værktøj, specifikation eller verifikation. Senere metodeændringer afleveres som almindelige, reviewede PR’er og skal bestå evalueringscasene.

## Kastanje, bachelor og kundetilbud

Kastanje er en konkret produktpilot: vælg små, repræsentative forbedringer og dokumentér, om factoryen faktisk reducerer samlet indsats. Den anden pilot er en afgrænset Z13-worker med syntetiske cases. De demonstrerer to forskellige forhold: produktleverance og lokal teknisk gennemførlighed.

Bachelorens allerede valgte content-case ændres ikke af dette forslag. Factory-piloten kan være supplerende empiri om AI-støttet virksomhedsudvikling, hvis det passer til den fastlagte afgrænsning. Kunden behøver heller ikke købe en “AI-platform”: tilbuddet kan være et valgt forretningsproblem, en installeret arbejdsgang, dokumenterede kontrolpunkter og en efterfølgende beslutning om drift/inference.

Den kommercielle kæde og beviskravene er konkretiseret i [value.md](value.md). Arkitekturen muliggør Kastanje som fortsat inference-leverance, men holder kundens repository, skills og målinger portable.

## Hvad næste investering bør afgøre

1. To matchede konfigurationer på de fem evalcases, mindst tre gentagelser pr. case; dokumenteret modeladgang før betalt kørsel.
2. Tre små Kastanje-produktopgaver med faktisk commit/review/forbrug og en sammenlignelig baseline.
3. Prøv én rigtig cloudoverdragelse og stop/recovery, eller én isoleret lokal modelrute på Z13. Lad pilotbehovet vælge rækkefølge.
4. Implementér kun derefter en permanent dispatcher, provider-reconciliation og automatiske PR-/check-skrivninger.

Denne rækkefølge bygger et reelt tilbud uden at foregive, at en flot dashboard-demo allerede dokumenterer en billigere eller sikrere softwarefabrik.
