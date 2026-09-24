# Én metodepakke, flere måder at køre den på

**Gældende retning, 24. september 2026:** Arcitai Software and Security Factory skal først være et repository med det, der kan genbruges på tværs af apps og agenter. Det enkelte app-repo får en lille, versioneret pakke. Appens kode bliver, hvor den er. Et bestemt abonnement, Pi/Daytona, en egen server eller vores dashboard er ikke produktkrav.

**Videre produktforslag:** En [selvhostbar platform](platform.md) kan gøre tilslutning og agentdrift lettere. [Anbefalingen](product-experience.md) er først at kvalificere ét nemt setup og genbruge en egnet eksisterende motor/UI, før vi bygger en ny platform. Den bygger oven på den portable metode; appens hosting og deployment forbliver selvstændige valg. Den eksisterende pakke kan fortsat bruges uden platformen.

## Produktnavn og grænsen til Defense Factory

Det fulde navn er **Arcitai Software and Security Factory**. “Factoryen” og “factory-pakken” er korte henvisninger til samme produkt. Security er indbygget i udviklingen og et særskilt arbejdsspor, når en opgave kræver specialistarbejde.

| Produkt | Ansvar |
| --- | --- |
| **Software and Security Factory** — dette repo | Afklare, designe, bygge og rette software i vertical slices; teste, reviewe og verificere security før levering og ved senere ændringer |
| **Defense Factory** — separat løsning | Løbende overvågning, logs, incidents, dependencies/advisories og opfølgning på systemer i drift; også software, der er bygget uden vores factory |

**Samarbejde:** Defense registrerer et fund → afleverer en afgrænset issue med berørt system/revision, konsekvens, bevis og acceptkriterier → denne factory leverer en verificeret rettelse/PR → release følger appens politik → Defense efterprøver effekten i drift. Følsomme beviser bliver i den aftalte private kanal. Et fund giver ikke i sig selv ret til produktionsændringer.

Dette er en ansvarsdeling, ikke en tidsgrænse for security: denne factory kan også rette fejl og sårbarheder efter release. Appens releasechecks, smoke tests og kvalitetsmålinger bliver her; en løbende overvågningstjeneste hører til Defense. Ingen af produkterne kræver installation af det andet. Overdragelsen kan begynde som en almindelig issue; der er ingen ny automatisk integration implementeret med navneændringen.

## Hvad kan vi definere?

| Fælles i software-factory-repoet | Vælges og udfyldes i appen |
| --- | --- |
| Seks små skills og en tydelig instruktion til deres anvendelse | Hvordan det valgte harness finder/indlæser skills; hvilke værktøjer der er tilgængelige |
| Behov → kort design → vertical slices → beviser → separat review | Appens eksisterende arkitektur, sprog, commands, testdata og konkrete acceptkrav |
| Issue- og afleveringsformat, kendt revision og status | GitHub som indgang; evt. andre systemer gennem en særskilt integration |
| CI udfører reproducerbare checks; CD følger releasepolitikken | Eksisterende GitHub Actions eller anden CI; hosting, preview, miljøer og rollback |
| Security-udløsere og krav til validering af fund | Relevante scannere, specialist/model, hyppighed og privat fundkanal |
| Én ejer af jobstart, stop, recovery og forbrugsgrænser | Managed automation, egen runner eller manuel start; laptop, Z13 eller sky |
| Fem målepunkter og synlig manglende dækning | Faktiske pris-/tidskilder og observationer for netop dette projekt |

**Agent/harness-agnostisk** betyder her, at metode og afleveringskrav kan bruges af forskellige agentprogrammer. **Model-agnostisk** er et særskilt valg: et bestemt cloudprodukt understøtter ikke nødvendigvis en vilkårlig model. Vi skjuler ikke den forskel bag én fælles API. En installation vælger noget konkret og dokumenterer sine begrænsninger; produktet binder ikke alle installationer til samme valg.

## Hvad ligger klar i repoet nu?

```text
.agents/skills/factory-*/     De seks fælles skills
kit/README.md                Tilslut et eksisterende app-repo
kit/policy.md                Arbejdsgang, CI/CD og security-udløsere
kit/installation.md          Projektets valg og konkrete afprøvninger
kit/delivery.md              PR/review, beviser og målinger
kit/examples/                Inaktivt CI-eksempel
scripts/export-kit.mjs       Lav en afgrænset pakke uden overskrivning
src/ + public/               Valgfri lokal runner og dashboard
profiles/                    Valgfrie, særskilt kvalificerede driftsopskrifter
```

Eksportkommandoen samler de originale skills, kit-filer, issue-form, labels og licens i en ny mappe. Manifestet bevarer filhashes og kendt kildeversion. Den kopierer ikke runtime, kundeoplysninger, `.factory`-database eller aktive Actions-workflows. Ingen installer til brugerens globale agentkonfiguration er nødvendig.

[Startvejledningen](../kit/README.md) viser den konkrete overdragelse. Agenten læser først appen og udfylder [installationsarket](../kit/installation.md). Den bevarer en fungerende pipeline og tilføjer kun det manglende. Secrets og livekontoindstillinger holdes uden for Git. Automatisering af installationen kan senere bygges på dokumenteret gentagelse; den nuværende eksport påstår ikke at konfigurere tjenester.

## Hvordan opleves det for dig?

1. Du tager en eksisterende app og får factory-pakken reviewet ind på en branch i dens repo.
2. Den valgte agent afprøver én lille opgave i dit valgte miljø. Du får PR, faktiske checks, før/efter-bevis og pris/tid, hvor oplysningerne findes.
3. Når integrationen er kvalificeret, kan du bruge GitHub til at oprette issues, følge status, læse PR’er og træffe de relevante beslutninger. Agenten fortsætter inden for aftalt scope. Jobs med ukendt tilstand eller forbrug kræver afklaring, ikke en skjult genstart.

Der behøver ikke være et nyt control panel. GitHub er førstevalget for denne produktform. Vores dashboard kan senere samle flere repos eller målinger, hvis det giver en konkret fordel.

## Hvad får arbejdet til at fortsætte uden din laptop?

| Valgt installation | Hvor arbejdet udføres | Hvad skal faktisk tilsluttes? |
| --- | --- | --- |
| Mac + valgt managed cloud-agent | Hos agentudbyderen; Mac bruges til opsætning og review | Repo/miljø, skillindlæsning, tilladt trigger, credentials og spend. Brug providerens eksisterende funktioner, når de dækker behovet |
| ROG Flow Z13 + lokal agent/model | På Z13, så længe maskinen og jobprocessen er tændt | Model/tool-kvalifikation, dedikeret arbejdsmiljø og evt. vedvarende lokal proces. GitHub kan stadig være arbejdsfladen |
| Egen sky med valgt agent | På egen VM eller en sandbox-tjeneste | Runtime/dispatcher, isolation, status, stop, artifacts og drift. Cloudroom er én inspirationskilde; vores runner er et muligt tilvalg |

De er eksempler på installationer, ikke en rangering af pris eller modelkvalitet. Et abonnement kan spare opsætning, men flytter ikke nødvendigvis alle lokale tools til skyen. En lokal model gør heller ikke GitHub, browseropslag eller artifacts lokale.

**Den afgørende forskel:** GitHub gemmer opgaverne; en konfigureret integration starter agenten. Skills fortæller agenten, hvordan arbejdet udføres. En issue-label alene er ikke en agent eller en scheduler. Registrér kun én ejer af dispatch, så eksempelvis en native automation og en egen runner ikke tager samme job.

En integration til ubemandet brug skal vise en rigtig issue → job → review-overdragelse samt håndtering af dubletter, afbrydelse og stop. Hvis den valgte provider ikke har den nødvendige trigger, er manuel start en ærlig fungerende installation, indtil en lille adapter er bygget. GitHub Actions kan udføre en kort dispatch, men skal ikke holde en runner i live gennem hele agentopgaven.

## Lav pris og almindelig CI/CD

Actions bruges først til de velkendte tests, build, relevante security-checks og deployment. TDD foregår i udviklingsmiljøet. [Lavprisprofilen](low-cost.md) beskriver egne runners, der undgår hosted-minutter, og lokale modeller, der kan undgå API-regning. Det gør ikke strøm, hardware eller apphosting gratis. Security CLI kan køre i CI eller separat; den valgte modeladgang skal stadig kvalificeres.

## CI/CD og security er kontrakter med projektet

Vi kan definere **hvad og hvornår**: checks på en kendt revision, review efter risiko, beskyttede deployment-rettigheder og recovery. Projektet definerer **hvordan og hvor**: tests, scanner, hosting og de faktiske gates. Det inaktive CI-eksempel fejler, hvis appens checkscript mangler. Eksisterende CI foretrækkes; der oprettes ikke et ekstra grønt check uden reelt indhold.

[Security-tabellen](../kit/policy.md#hvornår-kommer-security-ind) dækker onboarding, kodeændringer, ændrede tillidsgrænser, konkrete fund og release/periodisk gennemgang. Den kræver ingen bestemt model og udløser ikke automatisk en dyr fuld scan på hver lille rettelse. Codex Security er en mulig specialist med samme krav om efterprøveligt bevis.

## Hvad tog vi med fra kilderne?

- **Ras Mic:** en flytbar instruktionsfil og få skills med projektspecifikke checks. Vi bevarer idéen, men bruger egne tekster og overtager ikke hans servicearkitektur, bestemt reviewabonnement eller offentlig artifacthost. [Den gennemgåede AGENTS-fil](https://github.com/michaelshimeles/skills/blob/4b72f46b045e6fef52e6a98d4c162dd309826aed/AGENTS.md).
- **BuilderIO:** separate regler for implementering, PR-review og levering samt projektspecifikke forbindelser. Konfiguration af metode er forskellig fra installation af integrationsværktøjer. [Undersøgt repository](https://github.com/BuilderIO/skills/tree/9e4f7beb3def2d785a6fa347fd946fd1a063f522), [tidligere fuld videogennemgang](builderio-review.md).
- **Warp og Dex:** mål leverancer med beviser, og udvikl gennem små fungerende dele. Vores [målemetode](value.md) og [vertical-slice-regler](../AGENTS.md#develop-in-vertical-slices) er bevaret.
- **Cloudroom:** et muligt driftslag, når man vil drive agentprocesser selv. Det definerer ikke hele produktet. [Sammenligning og kildegrænser](cloud-setup.md).

## Næste afprøvning

Pakkens eksport og konfliktafvisning er testet. Næste produktprøve er **én eksisterende app med dens valgte agent og eksisterende CI**: tilslut pakken, løs én afgrænset opgave gennem relevante lag, få særskilt review og efterprøv de konkrete tools. Automatisér derefter ét gentaget trin, hvis det valgte miljø kræver det. En ny cloudadapter bygges kun for et reelt hul i den valgte installation.

Ingen konti, servere, offentligt repository, cloudjob eller deployment er oprettet som del af denne omlægning.
