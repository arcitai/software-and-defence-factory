# Produktet skal være let at tage i brug

**Anbefaling, 24. september 2026:** Gør Arcitai til et installérbart, åbent factory-kit med én afprøvet standardopsætning. Metode og diagram forklarer arbejdet; opsætningen skal føre til en rigtig opgave og reviewbare beviser. En selvhostbar platform er mulig, men genbrug af en eksisterende motor og UI bør afprøves før en ny platform bygges.

| Produktform | Fordel | Vurdering nu |
| --- | --- | --- |
| Metode, diagram og anbefalinger | Let at forstå, dele og bruge på tværs af værktøjer | Godt grundlag; brugeren har stadig opsætningsarbejde |
| **Installérbart kit + afprøvet driftsprofil** | Et konkret setup med kendte begrænsninger; metode og valg forbliver portable | **Anbefalet første produkt** |
| Egen komplet platform | Samlet onboarding, jobstyring og UI | Mulig senere; kræver vedligehold af login, opdateringer, isolation, recovery og integrationer |

En anbefalet standard er et dokumenteret, afprøvet valg for én målgruppe. Den gør ikke samme provider obligatorisk for alle installationer. **Archon er eksplicit fravalgt.** Cole Medins opskrift kan inspirere opsætning og VPS-drift; hans runtime installeres ikke som del af vores produkt.

## Hvad har inspirationskilderne gjort?

| Produkt | Hvordan kommer man i gang? | Hvad får man? |
| --- | --- | --- |
| **Warp Factories** | Adgang til platformen → forbind repo → vælg agenter → send første opgave | En samlet tjeneste med koordinering, agentkørsler, integrationer og målinger. [Oversigt](https://docs.warp.dev/factories/) |
| **Warp oz-for-oss** | Installer en GitHub App og deploy deres webhookservice på Vercel | Åben automatiseringskode, som sender arbejdet til Warp-hostede agenter. Det er en anden opsætning end Factories-wizarden. [Onboarding](https://github.com/warpdotdev/oz-for-oss/blob/main/docs/onboarding.md) |
| **BuilderIO Skills / Factory** | Installer valgte skills, vælg agentklient og projektscope, og konfigurér Factory i appen | Instruktioner og projektpolitik oven på værktøjerne i det valgte agentmiljø. Factory er eksperimentel. [Installer](https://github.com/BuilderIO/skills#install) · [Factory-guide](https://github.com/BuilderIO/skills/blob/main/docs/factory/README.md) |
| **Arcitai, aktuelt** | Eksportér pakken → lad din agent tilslutte appen → gennemfør én opgave | Seks skills, metode, check-/reviewkrav og målinger. En cloudtjeneste, model og automatisk issue-start skal vælges og afprøves særskilt. [Start her](../README.md) |

## Warp er et platformprodukt

Warp Factories er aktuelt **Early Access**. Deres quickstart kræver adgang, et Warp-team med credits og tilladelse til de valgte repos. På [platform.warp.dev](https://platform.warp.dev/) opretter man en factory, forbinder kodeplatformen, vælger repos og agenter og tilføjer eventuelt Slack eller en issue tracker. Første lille opgave kan startes direkte fra dashboardet. Resultatet afleveres som en PR til menneskelig review og merge. Det er dokumentationens flow; vi har ikke tilmeldt eller afprøvet tjenesten. [Quickstart](https://docs.warp.dev/factories/quickstart/).

Dashboardet viser mere end et GitHub-spejl: det indeholder også agentkørsler, konfiguration, automations og målinger. Warp understøtter flere harnesses, blandt andet Codex og Claude Code. [Produktoversigt](https://docs.warp.dev/factories/).

Selvhosting af udførelsen er ifølge Warp en Enterprise-funktion. Warp driver stadig koordinering og lagring af run-data; platformydelser bruger credits, også med egen compute eller inference. At kunne vælge agent/model er derfor ikke det samme som at kunne drive hele platformen uafhængigt. [Infrastruktur og sikkerhed](https://docs.warp.dev/factories/infrastructure-and-security/).

## Hvad bør vi overtage?

**Fra Warp:** én tydelig opsætning, få valg og første opgave som slutpunkt. **Fra BuilderIO:** agenten hjælper med at konfigurere projektet, og fælles instruktioner kan distribueres separat fra en driftstjeneste. Deres installer kan også opsætte valgte instruktionsblokke og integrationer; selve Factory-skills giver ikke automatisk credentials eller en scheduler. [BuilderIO-installation](https://github.com/BuilderIO/skills#install), [Factory-grænser](https://github.com/BuilderIO/skills/blob/main/docs/factory/README.md#limits).

Vores nuværende eksport er sikker staging i en ny mappe, men kræver stadig agentens tilpasning til appen. En guided installer kan senere gøre den gentagne del nemmere. Det er et forslag til næste produktforbedring, ikke en funktion vi allerede har.

## Næste konkrete skridt for Arcitai

1. **Afprøv en motor før vi bygger mere platform.** Fabro er en relevant kandidat, fordi det har selvhosting, opsætning og UI. Sammenhold den med vores eksisterende lokale runner på én afgrænset vej: repo → agent → tests → review/PR, inklusive stop, recovery, adgang og faktisk forbrug. Ingen ny permanent afhængighed før dette virker. [Kilder og vurdering](ui-references.md).
2. **Tilslut Kastanje som pilot** med en konkret valgt agent og ét fungerende miljø. Første start er manuel. Gennemfør én vertical slice fra en rigtig issue, inklusive security-vurdering, særskilt review og pris/tid, hvor data findes.
3. **Pak den afprøvede vej**, så næste installation har én kort guide og agentstyret eller guided opsætning. Tilbyd VPS som en valgfri driftsprofil. Bevar appens eksisterende deployment.
4. **Automatisér én issue-indgang**, når den manuelle vej virker. Tilføj kun eget UI dér, hvor GitHub og den valgte motors UI efterlader et dokumenteret behov.

En egen platform bliver relevant, hvis de afprøvede alternativer ikke kan levere nødvendige åbne worker-/modelvalg, privat datavej, review eller enkel opsætning, og en lille egen løsning kræver mindre vedligehold. Udvid efter dokumenteret behov; [platformforslaget](platform.md) viser den mulige grænse og de nødvendige slices.

Dette er en anbefaling. Ingen Fabro-/Mastra-/Archon-installation, VPS-oprettelse, modelpilot eller betalt drift er udført med researchen.
