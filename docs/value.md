# Dokumenteret værdi, benchmarks og tilbud

Arcitai: **Business first. Security built in.** Et fornuftigt tilbud sælger et fungerende forretningsresultat med synlige beviser og ejerskab til kunden. Kastanje-inference kan være en fortsat leverance, når dens konkrete rute giver værdi. Kunden kan vælge anden inference uden at miste metode, repository eller målinger.

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

## Et enkelt kundetilbud

1. **Afgrænset afklaring:** Find én arbejdsgang, dens omkostning i dag og et accepteret resultat. En kort rådgivningssession er stadig mulig.
2. **Factory-pilot:** Installér et kundeejet repo og reviewflade, forbind én valgt harness/modelrute, afprøv tre repræsentative opgaver og aflever et evidensregnskab.
3. **Dokumenteret drift:** Tilbyd løbende vedligehold, security-review og efterprøvning. Gentagne problemer bliver prioriterede issues; kunden ser status og accepterer ændringer.
4. **Valgfri Kastanje-inference:** Abonnement/forbrug, hvis den verificerede rute opfylder kundens pris-, kvalitets- og datakrav. Modelbinding er ikke produktets lås.

Ingen pris eller abonnementsøkonomi er opfundet her. Aftal fast pilotscope og maksimalt forbrug ud fra den konkrete kundes situation. Et relevant resultat er fx færre reviewminutter ved samme acceptniveau, eller bedre verificerbarhed af security-rettelser; ikke blot flere genererede linjer kode.

For første Kastanje-pilot: én robust fejltilstand, én mindre produktforbedring og én afgrænset sikkerhedsrettelse. Vælg faktiske issues fra produktets backlog; dashboardets syv demoopgaver er illustrationer, ikke oprettede GitHub-issues. Z13-evalueringen kan køre de faste syntetiske cases og sammenligne en lokal model med en afprøvet ekstern rute.

EU-løftet opdeles: inference-region, runtime, Git, logs/artifacts, backups, øvrige tools og support. Før hele kæden er verificeret, er formuleringen **“valgt og dokumenteret EU-inference-rute”**, ikke “alle data bliver i EU”.
