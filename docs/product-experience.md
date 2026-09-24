# Produktet skal være let at tage i brug

**Præciseret retning, 24. september 2026:** En færdigsamlet, installérbar factory med fungerende standardvalg, VPS som første driftsprofil og samme pakke til en lokal maskine. Brugeren forbinder repo/modeladgang; opsætningen udfører og verificerer det gentagne arbejde. Metodekittet er fundament og kan også bruges separat. Genbrug Machinist som motor og GUI, og saml software, security og valgfrie Defense-forløb i samme installation. Afprøv isolerede agentjobs og onboarding før udgivelse. Den korte [byggeretning](platform.md) er gældende; [Cole/Shapiro- og driftsgennemgangen](foundation-review.md) begrunder valgene. Den aktuelle [Machinist-gennemgang](machinist-review.md) beskriver valget og integrationshullerne. Fabro er UI-inspiration.

| Produktform | Fordel | Vurdering nu |
| --- | --- | --- |
| Metode, diagram og anbefalinger | Let at forstå, dele og bruge på tværs af værktøjer | Godt grundlag; brugeren har stadig opsætningsarbejde |
| **Færdigsamlet factory + afprøvet driftsprofil** | Installation og første opgave uden manuel sammenkobling; tilpasninger bagefter | **Valgt produktmål; endnu ikke en færdig udgivelse** |
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

Følg de tre gennemgående slices i [byggeretningen](platform.md): fungerende appmiljø og GUI, én rigtig ændring til PR og dernæst vedvarende issue-start. Genbrug Machinists kerne og flade; hver ny funktion skal bevise en del af den faktiske leveringsvej. Den eksisterende Node-prototype bevares indtil erstatningen er afprøvet. Kastanje er den foreslåede apppilot.

Fabros selvhosting ser relevant ud, men den aktuelle serverguide er mærket private early access, og eksterne agenter kræver en kvalificeret ACP-integration. Derfor vælges Machinist nu som fundament, mens Fabro forbliver inspiration. [Kilder og afvejning](foundation-review.md#gui-isolation-og-fravalg).

Docker-pakken, onboarding-wizarden og den komplette automatiske pipeline er endnu ikke implementeret. Ingen Fabro-/Mastra-/Archon-installation, VPS-oprettelse, modelpilot eller betalt drift er udført med researchen.
