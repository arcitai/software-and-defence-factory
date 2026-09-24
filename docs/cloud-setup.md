# Factory i skyen: hvad bruger vi til hvad?

**Anbefaling, 24. september 2026:** brug Codex Cloud til den hurtigste manuelle pilot, hvis kontoen har adgang. Byg vores åbne produktprofil med **den eksisterende Arcitai-kerne på en lille server og Pi i en sandbox, der startes ved behov**. Daytona er første sandbox-kandidat. Det er to startmuligheder for samme metode; vi bygger kun én ny workerintegration først: Pi/Daytona.

Et stort lokalt setup er ikke nødvendigt. Skyens worker kan arbejde, mens du bruger Codex lokalt eller lukker computeren. **Cloudprofilen nedenfor er et byggeforslag, ikke allerede tilsluttet drift.** Den lokale starter og dens syntetiske adapterprøver er [dokumenteret særskilt](proof.md).

## Komponentoversigten

| Del | Vores åbne cloudprofil | Hvad den gør |
| --- | --- | --- |
| Opgaver og kode | GitHub issues, branches og PR’er | Bevarer krav, kodehistorik og menneskelig review. Én afgrænset vertical slice ad gangen |
| Styring og dashboard | Eksisterende Node/SQLite-app på en lille Linux-VM, fx hos Hetzner | Holder kø, scope, status, stop og beviser, også når din computer er slukket |
| Agentens computer | Daytona-sandbox pr. aktivt job | Indeholder checkout, terminal, dependencies, tests og browser; afsluttes efter bevaret resultat |
| Agentprogram | Pi i et versionslåst worker-image | Læser repo/instruktioner, bruger værktøjer og udfører opgaven. Skills følger repoet |
| Model | Én kvalificeret model-API; Kastanje/EU som mulig rute | Leverer inference. Ingen GPU på controlleren eller din laptop er nødvendig med ekstern inference |
| Browser og eventuel desktop | Først den planlagte `agent-browser`-CLI med Chrome; desktop kun ved konkret behov | Giver UI-handlinger og beviser. Daytona har computer-use-API; Pi kræver stadig en afprøvet værktøjsforbindelse |
| Kvalitetskontrol | Faste checks, separat review; Codex Security ved relevante opgaver | Kontrollerer den præcise revision. Agenten kan ikke selv godkende sin levering |
| Triggere | Controller læser GitHub API; senere begrænset webhook-indgang | Sender kun opgaver med godkendt scope, rettigheder og budget til worker. Ingen lang Action venter på agenten |
| Dokumenteret værdi | Factoryens journal og det eksisterende målekort | Samler model/compute, alle forsøg, kvalitet, gennemløbstid og al mennesketid. Ukendt forbrug forbliver ukendt |

**GitHub Actions er valgfrit:** korte, uafhængige PR-checks kan være nyttige. Controller, agent og ventetid kører udenfor. Vi behøver hverken en ny CI-tjeneste eller en ekstra controller for at starte.

Den lille VM kan begynde med 2 vCPU/4 GiB som kapacitetsantagelse, ikke et målt minimum. Brug lokal persistent SQLite og backup. v0.1 åbnes privat via [SSH-portforward](setup.md); den har ikke login til offentlig deling. En lukket laptop afbryder visningen, ikke serveren. En delt offentlig arbejdsflade kræver senere adgangskontrol. Hetzner dokumenterer EU-lokationer; konkret serverpris og region vælges ved opsætning. EU-inference kræver også kontrol af sandbox, logs og backups. [Hetzner Cloud](https://www.hetzner.com/cloud/).

## Den nemmeste start før cloudadapteren findes

**Codex Cloud:** forbind pilotrepoet, vælg et miljø, angiv setup og nødvendige checks, og start én lille opgave manuelt. Opgaven kører i et separat cloudmiljø og kan afleveres til review/PR. Brug samme krav, skills og målekort; importér kun beviser, der faktisk er indsamlet. Det kræver ikke vores egen server for at gennemføre denne pilot. Kontoens adgang er ikke afprøvet her. [Cloud](https://learn.chatgpt.com/docs/cloud), [miljøer](https://learn.chatgpt.com/docs/environments/cloud-environment).

Dit abonnement kan gøre dette til den mindst besværlige første prøve. Cloudopgaver og lokal Codex-brug deler dog forbrugsgrænser; de er ikke ubegrænsede eller en isoleret gratis pulje. Vi har ikke målt, hvilken løsning der er billigst på vores opgaver. [Codex-priser og grænser](https://learn.chatgpt.com/docs/pricing).

Codex Cloud er heller ikke automatisk vores issuescheduler. GitHub-dokumentationen beskriver blandt andet PR-review og opgaver fra PR-kommentarer; den er ikke bevis for en generel issue-created-trigger. Lokale plugins, Daybreak-adgang og desktopværktøjer må ikke antages at følge med cloudmiljøet. [GitHub-integrationen](https://learn.chatgpt.com/docs/third-party/github), [miljøopsætning](https://learn.chatgpt.com/docs/environments/cloud-environment).

To afgrænsede alternativer:

| Hvis behovet er … | Muligt valg | Konsekvens |
| --- | --- | --- |
| Færdig cloudcomputer med browser/desktop fra starten | Cursor Cloud Agent | Managed VM og computer-use er dokumenteret; betalt Cursor-plan og modelafregning. Relevant hvis det sparer væsentlig opsætning, ikke vores standardabonnement. [Cursor](https://cursor.com/docs/cloud-agent) |
| OpenAI-styret agent direkte fra vores dashboard | Agents API med hosted sandbox | Sessions, hændelser og miljølivscyklus er dokumenteret. API-integration skal bygges; model, værktøjer og container afregnes særskilt fra ChatGPT-abonnementet. Erstatter Pi/Daytona-ruten i den valgte profil. [API](https://developers.openai.com/api/docs/guides/agents-api/overview), [hosted miljø](https://developers.openai.com/api/docs/guides/agents-api/environments/openai-hosted), [priser](https://developers.openai.com/api/docs/pricing) |

Portabiliteten ligger i eget repo, opgave-/evidensformat og udskiftelige adaptere. En managed tjeneste bliver ikke leverandøruafhængig af den grund. Vi bygger ikke begge API-integrationer samtidig.

## Cloudroom Core: god inspiration, ekstra drift

Gennemgået ved [`cc2a655`](https://github.com/davidondrej/cloudroom-core/tree/cc2a655f168abc700efb378a33f1e9bf15802e5f). Det er en tidlig Rust-runtime, som holder agentprocesser på en Linux-server. Pi og Codex ejer fortsat deres egne agentloops. Det er **ikke alene et færdigt issue → review-produkt eller en managed cloudcomputer**. [README](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/README.md), [harnesses](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/docs/harnesses.md).

| Det interessante | Hvad vi gør med det |
| --- | --- |
| Arbejdet fortsætter uden en tilsluttet klient; kø, hændelser og recovery er eksplicitte | Gem provider-job-id og hændelser; forbind igen til eksisterende job før et nyt forsøg. Modtaget er ikke det samme som færdigt |
| Runtime og harness har forskellige ansvar | Behold vores opgave-/acceptlag og lad én workeradapter eje den konkrete fjernproces |
| Ressourcer og capabilities kan ses | Vis faktisk miljøstatus og manglende værktøjer; behold opgavens pris-/kvalitetsmåling i vores journal |

Grundlaget er [session-livscyklus](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/docs/session-lifecycle.md) og [dashboard](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/docs/dashboard.md). Et service-restart kan afbryde aktivt arbejde; klientafkobling og servicefejl er forskellige hændelser.

**Fravalg som første motor:** selvhosting kræver Linux/systemd/cgroups, Rust-service, ekstern PostgreSQL med TLS, migreringer og særskilt harness-login. Arbejdsmodellen er én betroet bruger; agentprocesser under samme konto deler filer/credentials. Cgroups er ikke isolation mellem kunder. Browser/computer og vores GitHub-/reviewflow følger ikke automatisk med. Preview-helperen bygger på SSH-tunneler fra klienten. [Setup](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/docs/setup.md), [Linux-runtime](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/src/runtime/linux.rs), [previews](https://github.com/davidondrej/cloudroom-core/blob/cc2a655f168abc700efb378a33f1e9bf15802e5f/docs/previews.md).

Apache-2.0 tillader genbrug på licensens vilkår; vi kopierer ingen kode i denne omgang. Cloudroom kan senere vurderes som en runtime-adapter, hvis det erstatter mere drift/kode end det tilføjer. Ingen konkurrerende jobkø. Dette er en kildegennemgang, ikke en afprøvning eller sikkerhedsgodkendelse.

## Hvad koster det, og hvad skal være tændt?

**Altid tændt:** kun lille controller, journal og eventuel privat dashboardadgang. **Ved opgaver:** sandbox, model og checks. Gem diff/commit, beviser og forbrug uden for den midlertidige sandbox før oprydning.

Daytonas offentliggjorte standardrater er $0,0504/vCPU-time og $0,0162/GiB RAM-time. Et regneeksempel med **2 vCPU + 4 GiB = $0,1656/time** giver **$3,31 ved 20 aktive timer**, mod $119,23 ved 720 timer. Dette er kun CPU/RAM: model, disk, snapshots, controller, backup og eventuelle afgifter er ekstra. Opstart, tests og oprydning tæller også. Det er ikke et tilbud eller en målt opgavepris. [Daytona-priser](https://www.daytona.io/pricing).

Stopped/paused koster fortsat disk; transitions kan stadig koste CPU/RAM. Kontroller faktisk sluttilstand. Providerens forbrugsdata kan være forsinkede og er ikke i sig selv et hårdt budgetstop. [Faktureringsregler](https://www.daytona.io/docs/billing).

GitHub Free har aktuelt 2.000 inkluderede hosted Actions-minutter pr. måned til private repositories. Eksempel: 100 PR’er med ét femminutters check bruger 500 minutter; genkørsler og andre workflows kommer oveni. En worker tændt i en Action i 30 døgn ville bruge 43.200 minutter. Offentlige standard-runners og selvhostede runners har andre regler; selvhosting betaler stadig maskinen. **Derfor bruger vi Actions til korte checks, hvis overhovedet.** [GitHub Actions-fakturering](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Sammenlign først økonomi, når de samme små opgaver er kørt med samme acceptkrav. Medregn mislykkede forsøg, reviews og mennesketid efter [målemetoden](value.md).

## Næste byggetrin: tre vertical slices

1. **Én forberedt opgave → Pi i skyen → synlig reviewpakke.** Pak det nødvendige worker-image og tilføj en fjernadapter til den eksisterende kerne. Vis ægte jobstatus og præcis revision; bevar resultatet før teardown. Minimum omfatter scope, én writer, afgrænset adgang, timeout og verificerbart stop. Afprøv syntetisk først; en reel betalt pilot dokumenteres særskilt.
2. **Afbryd og kom tilbage.** Luk visningen, afbryd forbindelsen og genstart controlleren. Genfind jobbet uden dobbelt writer; mistet kontakt står som ukendt. Budget-/stopgrænser, beviser og oprydning skal holde, før ubemandet betalt brug åbnes.
3. **Én godkendt GitHub-opgave → samme forløb.** Tilføj periodisk API-læsning med deduplikering og aktør-/scopekontrol. Senere kan signeret webhook erstatte polling. Knyt resultatet til PR, krævede checks og menneskelig accept. Ingen ny runtime for hvert trin.

Den nuværende runner deler filsystem/journal med controlleren. En cloud-sandbox er derfor **ikke** blot et nyt endpoint i konfigurationen: jobtransport, statusafstemning og artifact-import mangler. SQLite bliver hos controlleren; den deles ikke som netværksdisk med worker. Lokal Codex og cloudworker bruger separate branches/workspaces og samles gennem review.

Det detaljerede arbejde følger [runtimeplanen](next-runtime.md) og den eksisterende [Pi-profil](../profiles/pi/README.md). Daytona dokumenterer [sandboxmiljøer](https://www.daytona.io/docs/sandboxes) og [computer-use](https://www.daytona.io/docs/en/computer-use/); kompatibilitet, region, værktøjer og stop er endnu ikke prøvet i vores setup. Ingen konto, server, betalt kørsel eller deployment er oprettet med denne research.
