# Dokumenteret værdi, benchmarks og tilbud

Arcitai: **Business first. Security built in.** Et fornuftigt tilbud sælger et fungerende forretningsresultat med synlige beviser og ejerskab til kunden. Kastanje-inference kan være en fortsat leverance, når dens konkrete rute giver værdi. Kunden kan vælge anden inference uden at miste metode, repository eller målinger.

## Start her: fem målepunkter og en scorer

Opdateret **24. september 2026** efter [Warp-gennemgangen](warp-measurement.md). Brug ét [målekort](../templates/measurement-card.md) pr. opgave og behold den eksisterende reviewpakke som bevisgrundlag. Start manuelt; dette kræver ingen ny service, GitHub Actions eller Warp-konto.

| Spørgsmål | Det vi måler |
| --- | --- |
| Virker resultatet? | Menneskeligt accepteret resultat på aftalte kriterier og præcis revision; afvisninger og blokeringer bliver synlige |
| Hvad kostede det? | Alle forsøg, reparationer, review/scoring og compute; vis dækning og estimater |
| Hvor meget krævede det af mennesker? | Aktiv tid til afklaring, arkitektur, hjælp, review, accept og drift |
| Hvor hurtigt blev det færdigt? | Gennemløbstid til accept; aktiv agenttid og ventetid holdes adskilt |
| Holdt resultatet? | Fejl og tilbagefald efter accept med version, observationsperiode og datadækning |

Tilføj først **én scorer: [Er resultatets påstande underbygget?](../evals/scorers/evidence-quality.md)** Den har `pass`, `fail` og `unknown` med begrundelse og bevislinks. En scorer, der ikke kunne køres, er `not-scored`. Den undersøger bevisgrundlaget; den samlede accept kræver fortsat alle relevante kriterier, checks og review. Udfør kendte revision-/testkontroller med kode, hvor muligt. En LLM bruges kun til den vurdering, det konkrete materiale kræver.

I piloten gennemgår en person alle leverancer. Hvis en model afprøves som judge, sammenlignes dens vurdering med personens egen vurdering af de første op til ti tilgængelige, afsluttede runs. Medtag også eksempler med manglende bevis og et korrekt review uden fund. Registrér uenigheder og især **falske godkendelser**. Det er en kalibreringsprøve; ti vurderinger dokumenterer ikke en generel fejlrate.

Gem scorerens version, judge/model, materiale-hash, scope/head og vurderingstid. Bevar tidligere vurderinger ved rescore. Efter piloten kan den ekstra LLM-vurdering bruge en på forhånd fastlagt, reproducerbar stikprøve for at begrænse forbrug. Påkrævede accept- og sikkerhedskontroller gælder fortsat alle leverancer. Hvis fejl undersøges særskilt, hold dem uden for den repræsentative stikprøves beståandel.

Vis en fordeling som `bestået / fejlet / ukendt / ikke vurderet` med antal og dækning. Hvis en beståandel bruges, er den `pass / (pass + fail + unknown)` blandt de udvalgte runs med en faktisk vurdering; `not-scored` vises ved siden af og i dækningsbrøken. Mislykkede og afbrudte workers indgår fortsat i opgave-/forsøgsregnskabet, selv om de aldrig fik et færdigt resultat til scoring. Ingen score sammenfattes til “procent sikker”.

## Kobling til bachelorens undersøgelse

**Forslag til forsøgsdesign; ikke en ændring af bachelorens vedtagne spørgsmål.** Mål én sammenhængende udviklingsopgave fra faglig afklaring til accepteret resultat. Registrér, hvilke arkitekturvalg og indgreb miljøet faktisk klarede, og hvilke der krævede Gustav. Sikkerhedsarbejde efter release får eget scope og observationsvindue, så resultaterne kan analyseres separat.

1. Beskriv den nuværende arbejdsgang som baseline, inklusive den AI der allerede bruges. Fastlæg kvalitetskrav, dataadgang, tidsregistrering og udvælgelse før første måling.
2. Brug repræsentative, sammenlignelige opgaver. I et kontrolleret forsøg bruges samme frosne input med friske miljøer; variér rækkefølgen, når menneskelig læring ellers kan favorisere den anden gennemførsel. Virkelige kundeopgaver rapporteres også enkeltvis med deres forskelle.
3. Registrér al mennesketid og årsagerne til indgreb. Planlagt accept og uplanlagt redningsarbejde adskilles, men begge tæller i den samlede indsats. Færre kode-pushes beviser ikke mindre arkitektarbejde.
4. Sammenhold målinger med reproducerbare checks, review og observeret brug. Scorerens vurdering er én datakilde. Vis modstridende beviser og uafsluttede forløb.
5. Beregn kun besparelse i mennesketid, når baseline er målt og sammenlignelig: `(baseline-minutter − factory-minutter) / baseline-minutter`. Begge tal omfatter den samlede aktive mennesketid. Baseline skal være større end nul, og kvaliteten skal vurderes samtidig. Uden baseline beskrives observeret indsats og læring; der opfindes ingen sparet tid.

Én opgave kan afprøve metoden; tre pilotleverancer kan give foreløbige erfaringer. Det er ikke et generelt effektbevis. Opsætning, metodeudvikling og kalibrering registreres særskilt som etableringsomkostning og indgår, hvis vi beregner kundens samlede økonomi. Fordeling over fremtidige opgaver kræver en synlig antagelse.

## Fra måling til en konkret forbedring

Vælg én observeret fejltype, fx manglende testbevis. Undersøg dens årsag, foreslå én ændring i instruktion, værktøj eller model, og sammenlign på faste cases med samme kvalitetskrav. Adopter først efter review og gem konfigurationsversionen. Mål derefter videre i piloten. En ændring af selve rubric eller judge starter en ny måleserie; gamle og nye beståandele må ikke ukritisk sammenlignes.

Brug de fem eksisterende evalcases ved en fuld konfigurationssammenligning: to konfigurationer × fem cases × tre gentagelser giver **30 workerforsøg**, plus eventuelle judges. Start kun, når spørgsmålet og budgettet begrunder det. Forsøgene er ikke kørt her. En mindre prøve kan bruges diagnostisk, men må ikke fremstå som den fulde suite.

**Implementeringsstatus:** v0.1 har journal, priser/tider og import af faste evalresultater. Målekort og scorer er nu en manuel metode; automatisk judging, sampling, scorerhistorik, total mennesketid og fejl efter accept er ikke nye dashboardfunktioner. Den eksisterende `rubricPassed` på 0–4 vedrører stadig suite.jsons fire kriterier. Den nye scorers `pass` må ikke oversættes direkte til 4/4 eller automatisk accept. Detaljerne gemmes privat via reviewpakken og dens `evidence`-reference; importer og inputDigest er uændrede.

## To datasæt, to spørgsmål

**Driftsopgaver:** Virker leverancen i kundens hverdag, hvor meget menneskelig indsats kræver den, og hvad koster den samlet? Opgaver har forskellig sværhedsgrad og er ikke et fair modelbenchmark.

**Faste evalueringer:** Hvordan klarer to konfigurationer de samme opgaver på samme input og rubric? Frys case, inputDigest, model/version, harness/version, værktøjer, kontekst, compute og grænser. Mindst tre gentagelser pr. case/configuration i pilot. Fem cases er en start, ikke et statistisk bevis på generel overlegenhed.

## Måledefinitioner

| Mål | Definition / begrænsning |
| --- | --- |
| Registreret pris pr. opgave | Summen af alle kendte cost-poster på alle forsøg. Delvise poster er ikke en fuld pris |
| Pris pr. accepteret resultat | Alle forsøgsomkostninger i kohorten / antal accepterede opgaver. Mislykkede og endnu ikke accepterede forsøg bliver i tælleren. Vis kun, når kostdækning er komplet og mindst én accept findes |
| Aktiv tid | Registreret proces-/agentkøretid; kan summeres pr. opgave. Ikke lig med vægurtid fra idé til accept |
| Lead time | createdAt til acceptedAt, inkl. ventetid. Timestamps findes i eksporten; UI v0.1 viser primært aktiv tid |
| Mennesketid | Verifiers registrerede reviewMinutes; afklaring/support må registreres særskilt i pilotregnskabet |
| Reparationsforsøg | Ekstra forsøg ud over første. Prisen for dem forsvinder ikke ved succes |
| Kvalitet | Acceptkriterier og checks på fuld commit; security-disposition; i evals fire rubric-kriterier. Accept-rate kan ikke erstatte vurdering af selve kravene |
| Security-kvalitet | Valid/missed/unsupported findings i verifier-artifact; ingen “100 % sikker”-score |
| Datadækning | Andel forsøg med komplet pris/reviewtid. Unknown bliver ikke 0 |

EUR er fælles valuta i v0.1. Oprindelig valuta, FX-kilde/dato og allokeringsantagelser skal følge artifact ved omregning. Abonnement er ikke “gratis”: vis enten marginal måling plus særskilt abonnementsallokering eller tydelig ufuldstændig dækning. Undgå dobbeltregning, hvis providerens pris allerede omfatter compute. Lokal hardware/strøm har også omkostninger; brug synligt estimat, når der ikke er en måler.

Faktisk og estimeret basis registreres pr. cost-post. LLM-judgepris tæller med. Reviewminutter konverteres kun til kroner med en aftalt sats og vises ellers som tid. Der påstås ingen ROI uden en sammenlignelig baseline.

## Importér et ægte benchmarkresultat

Kør `node scripts/import-evaluation.mjs` for at få den aktuelle inputDigest. Brug derefter dette format med faktiske værdier:

```json
{
  "suite": "factory-core-v1",
  "inputDigest": "COPY_CURRENT_DIGEST",
  "caseId": "E02",
  "repetition": 1,
  "configuration": "model-revision/harness-version/tools-v1/worker-v1",
  "model": "EXACT_MODEL_AND_REVISION",
  "harness": "EXACT_HARNESS_AND_VERSION",
  "environment": "OS, RAM/GPU, context, tool versions and limits",
  "outcome": "blocked",
  "rubricPassed": 0,
  "activeMs": null,
  "reviewMinutes": null,
  "costEUR": null,
  "costBasis": "unknown",
  "costComplete": false,
  "verifier": "REVIEWER_IDENTITY",
  "evidence": "PRIVATE_ARTIFACT_REFERENCE_WITH_REVISION_AND_RESULTS"
}
```

```sh
node scripts/import-evaluation.mjs /private/result.json
```

Resultatet vises under **Værdi & benchmarks → Fast evalueringssuite** efter opdatering. Import af samme suite/input/configuration/case/repetition afvises som dublet. Programmet tjekker format og kohorteidentitet; operatøren ejer bevisernes faktuelle sandhed. Bevar fejlede kørsler. Importér ikke de illustrative tal fra denne vejledning.

Resultater med forskellig case-/gentagelsesdækning må ikke rangeres. Dashboardet viser dækning, antal forsøg, accept og omkostning; det udpeger ingen vinder. En senere analyse skal vise per-case variation og hvorfor afvisninger opstod. Forbedring i en syntetisk kodecase er ikke automatisk business ROI.

## Supplerende målinger fra videogennemgangen

En ændring af skills eller prompts er også en ny konfiguration. Gem factory-commit, workflowversion, hashes for faktisk anvendte prompts/skills, provider/model, harness, relevante lokale indstillinger, tools og miljø i det private artifact. I v0.1 henvises til dette fra `evidence`, og `configuration`/`environment` navngives entydigt; der er endnu ingen automatisk provenance-collector. Gem ikke hemmeligheder i konfigurationssporet.

Tilføj disse målinger til run-artifactet, når runtime understøtter dem. **De er ikke nye automatiske dashboardfelter i v0.1.**

| Måling | Anvendelse |
| --- | --- |
| Fase og aktør: kode, agent eller menneske | Find om tiden bruges på implementering, review, værktøjer eller manuel afklaring |
| Start/slut, køtid og ekstern ventetid | Skeln mellem travl worker og venten på checks. Summen af parallelle agenttider er ikke gennemløbstiden |
| Input/output/cachetokens og kilde | Forklar forbruget; undgå at tælle cachetokens dobbelt i providerens samlede inputtal |
| Værktøjskald, polling og reparationsårsag | Find gentagne mekaniske handlinger, der kan flyttes til kode |
| Afvisninger og fejl efter accept | Vis om en billigere konfiguration blot flytter arbejde og fejl til kunden |
| Konfigurationens version | Knyt ændret resultat til de faktisk anvendte prompts, skills, tools og modelversioner |

Best-of-N skal rapportere N, alle kandidaters udfald, samlet pris og udvælgelsesmetode. En afbrudt/langsom variant må ikke slettes fra sammenligningen. Gentagen drift før/efter et modelskifte har ofte forskellige opgaver; det er en observation, ikke et kontrolleret årsagsbevis. Brug de faste cases til sammenligning og produktpiloten til forretningsværdi.

En evalændring starter med en hypotese, fx: “Et script til at afvente checks reducerer tokens uden flere oversete fejl.” Fastlås inputs, ændr én væsentlig faktor, bevar fejlede runs, lad en separat verifier vurdere, og indfør kun forbedringen via en almindelig versioneret ændring. Den konkrete [reviewpakke](../templates/review-packet.md) samler beviserne.

## Et enkelt kundetilbud

1. **Afgrænset afklaring:** Find én arbejdsgang, dens omkostning i dag og et accepteret resultat. En kort rådgivningssession er stadig mulig.
2. **Factory-pilot:** Installér et kundeejet repo og reviewflade, forbind én valgt harness/modelrute, afprøv tre repræsentative opgaver og aflever et evidensregnskab.
3. **Dokumenteret drift:** Tilbyd løbende vedligehold, security-review og efterprøvning. Gentagne problemer bliver prioriterede issues; kunden ser status og accepterer ændringer.
4. **Valgfri Kastanje-inference:** Abonnement/forbrug, hvis den verificerede rute opfylder kundens pris-, kvalitets- og datakrav. Modelbinding er ikke produktets lås.

Ingen pris eller abonnementsøkonomi er opfundet her. Aftal fast pilotscope og maksimalt forbrug ud fra den konkrete kundes situation. Et relevant resultat er fx færre reviewminutter ved samme acceptniveau, eller bedre verificerbarhed af security-rettelser; ikke blot flere genererede linjer kode.

For første Kastanje-pilot: én robust fejltilstand, én mindre produktforbedring og én afgrænset sikkerhedsrettelse. Vælg faktiske issues fra produktets backlog; dashboardets syv demoopgaver er illustrationer, ikke oprettede GitHub-issues. Z13-evalueringen kan køre de faste syntetiske cases og sammenligne en lokal model med en afprøvet ekstern rute.

EU-løftet opdeles: inference-region, runtime, Git, logs/artifacts, backups, øvrige tools og support. Før hele kæden er verificeret, er formuleringen **“valgt og dokumenteret EU-inference-rute”**, ikke “alle data bliver i EU”.
