# Defence Factory: definition, afgrænsning og næste slice

**Research og revideret forslag · 24. september 2026.** Start med [det korte visuelle overblik](defence-review.html). Komponent- og modelvalg er forslag; ingen ny driftsopsætning er aktiveret.

## Hvad mener OpenAI?

OpenAI definerer en Defense Factory som en kontinuerlig agentbaseret indsats, der finder og udbedrer sårbarheder. De beskriver en kæde med kortlægning, discovery, dynamisk validering, ansvarlig ejer og verificeret udbedring. Eksisterende værktøjer forbindes gennem skills og reproducerbare, isolerede miljøer. [OpenAI: The Defense Factory](https://openai.com/the-defense-factory/).

Det er altså en aktiv sikkerhedsindsats, som også kan begynde med en kodeundersøgelse eller et eksisterende fund. Vi bør derfor justere vores første, for skarpe skel mellem udvikling før release og overvågning efter release.

Daybreak-siden nævner både sikkerhed under udvikling, defensive operationer og autoriseret sikkerhedstest. Et aktuelt stillingsopslag beskriver en begyndelse med sårbarheder og en udvidelse mod undersøgelse, detektion og respons. Det sidste er retning, ikke dokumentation for færdig funktionalitet. [Daybreak](https://openai.com/daybreak/) · [OpenAI: Product Engineer, Cyber](https://openai.com/careers/product-engineer-cyber-san-francisco/).

## Vores foreslåede ansvarsdeling

Dette er **vores produktforslag**, ikke en standardiseret opdeling fra OpenAI. Software Factory er her kort for det eksisterende produkt **Arcitai Software and Security Factory**. Defence er en selvstændig løsning.

| Del | Ejer arbejdet med | Eksempel |
| --- | --- | --- |
| Software Factory | Produktændringer, kvalitet, security i ændringen, tests, review og levering | Ny bookingfunktion eller en afgrænset sikkerhedsrettelse |
| Defence Factory | Sikkerhedskontekst, proaktive undersøgelser, validering, prioritering og opfølgning på faktisk udbedring | Undersøg en eksisterende adgangskontrol, også uden en alarm |
| Tilsluttet drift | Uptime, logs, alarmer, beredskab og almindelig vedligeholdelse | Fejlrate stiger; vagten afbøder og en sag undersøges |

Defence kan bruges før eller efter release, også på software der aldrig har brugt vores Software Factory. Security-review af en ændring kan bestilles fra Defence uden at oprette et andet konkurrerende forløb. På små opgaver kan samme person/harness varetage flere roller med en separat verifikationsrunde.

De to factories deler appens instruktioner, security-kontekst, sag, revisioner og beviser. Software Factory eller det eksisterende team implementerer rettelsen gennem normal CI/CD. Defence følger den accepterede risiko frem til dokumenteret løsning. En leverandør kan være modtageren, når kildekode eller deployadgang mangler.

**To selvstændige løsninger med fælles overdragelsesformat.** Den fysiske repo-/runtimeopdeling er endnu ikke fastlagt. En fælles server, to dashboards eller et nyt SOC er ikke en nødvendig konsekvens. Driftsprofilen kan tilsluttes uden at ændre ansvarsdelingen.

## Pakningen følger Software Factory

**Gustavs præcisering, 24. september:** produktnavn, installer, motor og arbejdsflade afklares i den anden session, *arcitai software factory method*. Defence skal passe ind i den valgte løsning. Denne research fastlåser derfor hverken et separat dashboard, en bestemt controller eller en ny deploymentmetode.

De aktuelle [produktnoter](product-experience.md) anbefaler et installérbart kit med én afprøvet driftsprofil og vurdering af eksisterende motor/UI før mere platformkode. [Platformforslaget](platform.md) skelner mellem factoryens placering, agentens arbejdsmiljø og kundens app. Det er retning, ikke en færdig VPS-installation. Cole Medins setup er inspiration; Archon er fortsat fravalgt i projektets instruktioner.

| Det skal kunne vælges | Betydning for Defence |
| --- | --- |
| Agent/harness | Sikkerhedsarbejdet skal kunne udføres af en kvalificeret agent gennem en afprøvet adapter. |
| Model/inference | Valg af model eller endpoint er adskilt fra agent og factory; konkrete kombinationer kvalificeres. |
| Egen maskine eller VPS | Genbrug den valgte installations- og driftsform, hvor den passer. Jobs får afgrænset adgang og arbejdsmiljø. |
| GitHub eller GUI | Samme sag og evidens skal kunne bruges gennem begge arbejdsflader. En ekstra Defence-UI kræver et konkret behov. |

Det vi kan definere nu, er den lille **overdragelse mellem forløbene**: sags-ID, tjeneste/miljø, relevant revision, fund og beviser, accepteret rettelsesomfang samt kriterier for efterkontrol. Tilbage kommer job-/PR-reference, faktiske checks og release-/verifikationsstatus. Det kan først være et almindeligt privat issue og links; API og automatisk routing vælges med motoren.

Defence beholder sine egne sikkerhedsopgaver og kan bruges alene, men genbruger så vidt muligt opsætning, jobstyring, evidenslager og arbejdsflade. Hvis løbende overvågning vælges, skal dens placering kunne være tilgængelig, selv når brugerens laptop er slukket; agentarbejdet kan stadig udføres andetsteds.

**Næste integration afhænger af den afprøvede Software Factory-pakning.** Derefter føres ét Defence-fund gennem netop den leveringsvej. Indtil da videreføres definition, sagsformat og afgrænset valideringsmetode uden at bygge en konkurrerende platform.

## Hvad andre faktisk viser

| Primærkilde | Relevant observation | Konsekvens for vores forslag |
| --- | --- | --- |
| [Cloudflare, 18. juni](https://blog.cloudflare.com/build-your-own-vulnerability-harness/) | Skelner mellem discovery og validering, bevarer tilstand og anbefaler udskiftelige modeller. Foreslår at begynde med en skill og udvide ved en konkret flaskehals. | Start med én reproducerbar sag; undgå en stor controller fra dag ét. |
| [Ramp, 20. februar](https://engineering.ramp.com/post/100-vulnerabilities-patched-with-0-humans) | Bruger særskilt kritik og integrationstest før rettelse. Mennesker reviewer og lander PR’en trods overskriftens “0 humans”. | Afprøv fejlen før rettelse og samme adfærd bagefter; behold review. |
| [Ramp Labs, 27. maj](https://labs.ramp.com/research/security-scanning-public-models/) | Undersøger offentligt tilgængelige og open-weight modeller i samme pipeline. Rapporterer både fund, forskelle i træfrate og højt forbrug ved stor parallelitet. | Hold modelvalget åbent, men kvalificér kvalitet/pris på vores egne cases. |
| [Google Chrome, 30. juli](https://blog.google/security/chrome-stronger-with-every-update/) | Beskriver fund, triage, rettelse og udrulning, med modelinteroperabilitet og separate vurderinger. | Sikkerhedsarbejdet følger problemet gennem leverancen og frem til anvendt opdatering. |

Der er også en reel forskel i kildernes strategi: Cloudflare argumenterer for en specialiseret harness ved stor skala; Ramp Labs fremhæver generelle coding agents med enkel orkestrering. Det giver ikke belæg for én universelt bedste stack. Vi bør begynde med den eksisterende agent og kun bygge ekstra tilstand, kø eller adaptere, når en lille prøve viser behovet.

En anden model kan udfordre den første, men dens enighed er ikke et reproduktionsbevis. En test skal fejle af den relevante sikkerhedsårsag; et setup der ikke kan starte, er et uafklaret forsøg. En test der passer, kan også skyldes utilstrækkelig dækning. Den vurdering skal være eksplicit.

## Hvad jeg fandt på X

[Marco Lancini, 21. september](https://x.com/lancinimarco/status/2102055148998504902), fremhæver OpenAIs isolerede miljøer og linker til deres arkitektur. I [svaret fra mrinal, 22. september](https://x.com/mrinal/status/2102222079315829094), kobler forfatteren det til security-review i sin egen software factory, Fluent. Det illustrerer netop overlap mellem begreberne.

Opslaget, svaret og deres synlige kildehenvisninger er læst direkte i X. Lancinis kommentar bruges som faglig diskussion; de tekniske konklusioner ovenfor bygger på primærkilderne. Fluent-artiklens fulde tekst og kode er ikke gennemgået, så den er inspiration til mulig senere research, ikke et kvalificeret komponentvalg. Der er intet grundlag her for at påstå en generel X-konsensus.

## Den minimale kerne, vi foreslår

| Bestanddel | Kan defineres portabelt | Vælges ved installation |
| --- | --- | --- |
| Systemoverblik | Tjeneste, ejer, miljø, faktisk release, afhængigheder, tilladt scope og huller | Repo, host, inventory-/deploymentkilder |
| Sikkerhedskontekst | Tillidsgrænser, vigtige brugerfunktioner og prioriteringsregler | Projektets `SECURITY.md`, trusselsmodel og relevant intern dokumentation |
| Undersøgelse | Kilde til fund, kendt revision, kandidat/afkræftet/uafklaret/valideret og evidens | Scanner, import eller agentundersøgelse |
| Afprøvning | Reproducerbar opskrift, sikkerhedscheck og almindelig regression | Appens testmiljø, services og afgrænset sandbox |
| Udbedring | Afgrænset opgave, én skriver, review, release og efterkontrol | Software Factory, normalt team eller leverandør |
| Fortsættelse | Gemte beviser, ejerskab, stop/retry, audit og budget | Manuel start først; senere valgte triggers og scheduler |

Basale capabilities er fil-/kodelæsning, Git, shell/tests i et afgrænset miljø, adgang til relevante fund og et privat evidenssted. API/logadgang tilføjes efter sagen. Browser er relevant til nogle brugerrejser; fuld computer use er et tilvalg. Skills installerer ingen af delene.

Codex Security kan være en praktisk specialist i Gustavs installation. Dets dokumentation beskriver scans, triage samt fix/verify og strukturerede resultater. Det gør ikke pluginen til hele fabrikken, og kundens miljø, rettigheder og integrationer skal stadig tilsluttes. [Officiel plugin-vejledning](https://learn.chatgpt.com/docs/security/plugin).

Kernen må kunne bruge andre kvalificerede agenter/modeller. Lokal inference er en mulighed, ikke et løfte om samme kvalitet eller gratis drift. Start med små, budgetterede undersøgelser; almindelige deterministiske checks behøver ingen LLM.

## Første rigtige vertical slice

**Én eksisterende app → ét accepteret sikkerhedsfund → reproduktion → minimal rettelse → separat verifikation → reviewet release → kontrol i det relevante miljø.**

Begynd gerne med et kendt/importeret fund. Så kan vi afprøve hele kæden, før vi bruger penge på bred discovery. Brug appens eksisterende testmiljø og CI/CD; opret ikke en generisk overvågningsplatform først. Bevar kandidat og usikkerhed, hvis miljø eller reproduktion mangler.

Mål validerede relevante fund, falske positiver, dubletter, uafklarede forsøg, tid til faktisk udbedring, regression/genåbning, model-/computeudgift og alt menneskearbejde. Vis dækning og nævner sammen med tallene. Tilsluttet drift har supplerende reaktions- og oppetidsmål. Ingen andres resultatprocenter bliver vores benchmark.

## Status i dette repository

Den eksisterende Software Factory og dens eksport er bevaret. Det påbegyndte [operations-eksperiment](../experiments/defence-operations/README.md) er flyttet ud af produktets skills og runtime. Det demonstrerer kun signalgruppering, overdragelsesudkast og kontrol af indsendte verifikationsposter med syntetiske data. Det indeholder hverken discovery, egentlig sårbarhedsvalidering eller en aktiv Defence Factory.

Researchen og dette reviderede forslag er klar til review. Ingen ny Defence-pakke er publiceret, ingen drift koblet på, og ingen betalt scan kørt. Afgrænsningen skal nu styre den næste implementering.

## Researchens rækkevidde

OpenAIs definitions-, arkitektur- og workflowafsnit, Daybreaks anvendelsesområder, plugin-quickstart og karrieresidens produktretning er læst. De statiske beskrivelser af arkitekturfigurerne er brugt; den linkede briefing-deck er ikke gennemgået. Fra Cloudflare er indledning, minimal harness og discovery/validation-afsnit læst. Ramps februarartikel er læst i browseren efter den almindelige sideudlæsning kun returnerede en teaser; majartiklens pipeline og modeleksperiment er læst. Googles lifecycle/discovery/triage-afsnit og de nævnte X-opslag er læst. Ingen upstream-kode er kopieret eller kørt, og ingen af organisationernes effekttal er uafhængigt efterprøvet.
