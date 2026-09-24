# Fabro, Mastra og Cole: hvad bruger vi inspirationen til?

Undersøgt **24. september 2026**. **Senere præcisering samme dag:** [standardretningen](platform.md) genbruger nu Machinist på VPS/lokalt; se [den nyere undersøgelse](machinist-review.md). Fabros serverguide er mærket private early access; eksterne agenter bruger ACP. Coles separate skills-repo har også en Archon-fri runner. Se den samlede [fundamentgennemgang](foundation-review.md), før tabellens tidligere kandidater vælges. Kode og dokumentation er læst; Fabros to repository-skærmbilleder er visuelt gennemgået. Ingen af systemerne er installeret eller afprøvet med vores agent/model. Visuel inspiration er ikke bevis på driftskvalitet.

| Kilde | Det relevante | Vores anvendelse |
| --- | --- | --- |
| **Fabro** | Selvhostbar server, opsætning og web-UI til workflows og runs | UI-inspiration; den nyere Machinist-vurdering styrer motorvalget |
| **Mastra Studio** | Arbejdsflade til agenter/workflows, separate oversigter for metrics, traces og logs samt evaluering | Brug adskillelsen mellem dagligt overblik og teknisk fejlsøgning. Indfør ikke hele frameworket alene for at få dashboardet |
| **Cole Medins factory** | Agentstyret installation, projektets mission, brugerrejser, uafhængig verifikation og en konkret VPS-guide | Brug opsætnings- og driftsmønstrene. **Archon er fravalgt**; hans komplette factory kræver den motor og kan derfor ikke overtages uændret |

## Fabro: tæt på den ønskede platform

Læst ved [`a2b39a2`](https://github.com/fabro-sh/fabro/tree/a2b39a2408d2f35b8882099728217254c24f0c7a). [README](https://github.com/fabro-sh/fabro/blob/a2b39a2408d2f35b8882099728217254c24f0c7a/README.md) beskriver server, web-UI, workflow-grafer og checkpoints. [Docker-guiden](https://docs.fabro.sh/administration/self-host-docker) dokumenterer selvhosting af det officielle image. Det er mere end et UI-bibliotek.

De gennemgåede billeder viser et [board](https://github.com/fabro-sh/fabro/blob/a2b39a2408d2f35b8882099728217254c24f0c7a/docs/public/images/web/runs-board.png) med tilstande og næste handling og en [opgavedetalje](https://github.com/fabro-sh/fabro/blob/a2b39a2408d2f35b8882099728217254c24f0c7a/docs/public/images/web/run-overview.png) med trin, filer, verifikation, forbrug samt PR-/previewlinks. Det er skærmbilleder i kilderepoet, ikke vores egen kørsel.

**UI-valg for Arcitai:** vis først, hvad der kører, hvad der er blokeret, og hvad der kræver review. Åbn checks, ændringer, pris/tid og logs fra den enkelte opgave. Den detaljerede workflowgraf kan være en avanceret visning; brugeren behøver ikke designe en graf for at sende første issue. Dette er vores designvurdering.

En opsætningsside i koden henviser stadig til installer/terminal for GitHub App-registrering; vi kan ikke ud fra markedsføringen love friktionsfri browseropsætning af alt. [Setup-kode](https://github.com/fabro-sh/fabro/blob/a2b39a2408d2f35b8882099728217254c24f0c7a/apps/fabro-web/app/routes/setup.tsx).

**Prøven før valg:** kan en passende version køre med vores ønskede harness/model og et acceptabelt arbejdsmiljø; levere beviser på korrekt revision; stoppe og genoptage uden dobbeltarbejde; og fungere med vores GitHub-/security-politik? Dokumentér faktisk pris og dataflow. Bevar én ejer af jobstatus, hvis den erstatter vores runner. Ingen parallelle controllere for samme job.

## Mastra: gode mønstre til måling og undersøgelse

Læst ved [`4cb2f12`](https://github.com/mastra-ai/mastra/tree/4cb2f12d05b0de71a22127a76a16c1732bb674ec). [Studio-guiden](https://github.com/mastra-ai/mastra/blob/4cb2f12d05b0de71a22127a76a16c1732bb674ec/docs/src/content/en/docs/studio/overview.mdx) beskriver agent-/workflowtest, scorerresultater, datasets og sammenligning af eksperimenter. Det er en arbejdsflade omkring Mastra-applikationer, ikke dokumentation for en generisk GitHub-factory.

[Observability](https://mastra.ai/docs/studio/observability) skiller samlede metrics fra traces for den enkelte kørsel og søgbare logs. Kostdata kan være estimater og afhænger af tilsluttet storage. For os betyder det: et enkelt værdioverblik øverst, detaljer og måledækning ved klik. Et flot scoretal erstatter ikke faktisk accept eller en registreret menneskelig indsats. Mastras UI er her vurderet fra dokumentationen; ingen interaktiv Studio-session er prøvet.

## Cole: VPS-drift er en selvstændig inspiration

Læst ved [`e167ddc`](https://github.com/coleam00/ai-software-factory/tree/e167ddc480d2f5c95d436f9d1c5cdcf37b092281). [Server-guiden](https://github.com/coleam00/ai-software-factory/blob/e167ddc480d2f5c95d436f9d1c5cdcf37b092281/docs/server-cheat-sheet.md) beskriver Ubuntu-VPS, SSH, værktøjer/logins, runtime-verifikation, en observeret første opgave og derefter en systemd-timer. Den viser også apphosting med systemd/Caddy og en deploymentkontrol. Hostinger er eksemplet; opskriften beskriver andre hosts som mulige.

**Det vi tager med:** lad opsætningsagenten læse projektet, konfigurere et vedvarende miljø og bevise én fuld opgave, før periodisk drift aktiveres. Factory-serveren og kundens produktionsapp behøver ikke bo sammen. Hvis appen allerede kører på Azure/Vercel, bevares dens pipeline. Coles automatiske merge-/deployvalg er ikke vores standardpolitik.

[Hans README](https://github.com/coleam00/ai-software-factory/blob/e167ddc480d2f5c95d436f9d1c5cdcf37b092281/README.md) binder AI-trinnene til Archons SDLC-workflows. At droppe Archon betyder, at installer, timer og lifecycle ikke bare kan kopieres og forventes at virke med Pi/Codex direkte. Vi bruger principperne og vurderer en anden motor separat.

## Genbrug og næste valg

Fabros rodlicens er [MIT](https://github.com/fabro-sh/fabro/blob/a2b39a2408d2f35b8882099728217254c24f0c7a/LICENSE.md). Mastras [licensfil](https://github.com/mastra-ai/mastra/blob/4cb2f12d05b0de71a22127a76a16c1732bb674ec/LICENSE.md) skelner mellem Apache-2.0-indhold, tredjepartsdele og `ee/` med særskilt licens. Der blev ikke fundet en rodlicens i Coles undersøgte træ. Der er ikke kopieret kildekode eller assets ind i Arcitai-produktet.

Retningen er [én samlet VPS-/lokalpakke](platform.md) på Machinist, med dens GUI som første arbejdsflade. Fabro og Mastra leverer fortsat UI-inspiration. Et bestemt runtime-valg må ikke gøre de portable skills, projektets acceptkriterier eller beviser afhængige af den motor.
