# Komponentvalg og research

Undersøgt 24. september 2026. Dette er vores arkitekturforslag, baseret på de linkede primærkilder. Ingen af de nævnte tjenester er installeret, kørt eller valgt som obligatorisk dependency.

Denne note dækker mulige **driftskomponenter**. Den er underordnet [Defence Factory-researchen](../../docs/defence-research.md), hvor proaktiv sikkerhedsundersøgelse er kernen. Ingen af værktøjerne nedenfor udgør alene en Defence Factory.

## Hvad bruger vi til hvad?

| Behov | Lean start | Muligt åbent værktøj / senere udvidelse |
| --- | --- | --- |
| Uptime og kritisk brugerfunktion | Eksisterende hostalarmer + uafhængig kontrol | Uptime Kuma til simple kontroller; app-specifik syntetisk brugerrejse efter behov |
| Fejl, logs og metrics | Appens eksisterende opsamling med korte forespørgsler | OpenTelemetry som portabel instrumentation/transport, når det gavner |
| Alarmstøj og eskalation | Kildens egne regler, gentagelseshåndtering og direkte kontaktvej | Alertmanager ved behov for gruppering/routing på tværs af Prometheus-signaler |
| Kendte dependency-sårbarheder | Eksisterende advisories; kontrollér relevant deployed artifact | OSV-Scanner som afgrænset scanner, hvor artifacts/økosystem understøttes |
| Opdateringer | Eksisterende dependency-bot og almindelige reviewede PR’er | Renovate, hvis der er behov for en selvvalgt update-motor |
| Sagsarbejde og AI | Privat issue/sag, valgte skills, eksisterende agentmiljø | Egen runner/lokal model efter kvalifikation; specialist til konkrete security-spørgsmål |
| Beviser og kontrolpanel | Links i sagen til privat evidens og appens checks | Samlet dashboard senere, hvis det reducerer faktisk manuelt arbejde |
| CI/CD og recovery | Appens eksisterende pipeline, host og runbooks | Egne runners efter behov; ingen ny obligatorisk deploymentplatform |

**Mulig senere operations-profil:** genbrug det kunden allerede har. Tilføj kun den manglende uptime-kontrol, en dependency-kilde, privat sagsgang og de tre skills. Et fuldt metrics-/logcluster er ikke et startkrav. Åben software kan stadig kræve betalt compute, lager og vedligeholdelse; der er ikke lavet en pris-/kapacitetsbenchmark her.

## Hvad kilderne understøtter

- **Incidentlifecycle:** NIST SP 800-61 Rev. 3 placerer incident response gennem organisationens risikostyring, inklusive forberedelse, detektion, respons og recovery. Det understøtter vores sammenhæng mellem byggeri og drift. Her er publikationssiden og abstract læst; pakken er ikke en implementering eller compliance-vurdering af hele standarden. [NIST, endelig publikation, april 2025](https://csrc.nist.gov/pubs/sp/800/61/r3/final).
- **Portabel telemetry:** OpenTelemetry dækker generering, indsamling og eksport af logs, metrics og traces og er leverandøruafhængigt. Det er ikke et lager eller dashboard. Vi gør derfor OTel til en mulig forbindelse til eksisterende værktøjer. [OpenTelemetry: What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/).
- **Få relevante alarmer:** Google SRE behandler præcision, recall, detektionstid og reset-tid samt alarmer baseret på brugerrettede servicemål. Vi tager princippet med: alarmér på væsentlig påvirkning og mål også støjen. En lille app behøver ikke starte med hele kapitlets burn-rate-regelsæt. [Google SRE: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).
- **Samling og routing:** Alertmanager understøtter deduplikering, gruppering, routing, inhibition og tidsbegrænsede silences. Genbrug sådan funktionalitet i et eksisterende alarmsystem frem for at bygge en ny alarmplatform i vores agent. [Prometheus: Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/).
- **Enkel uptime:** Uptime Kumas README beskriver selvhosting, flere typer endpoint-kontrol og mange notifikationsintegrationer. Det gør den til en relevant kandidat til en lille selvhostet installation; det er ikke i sig selv sikkerhedsovervågning eller en verificeret driftsopsætning. [Uptime Kuma](https://github.com/louislam/uptime-kuma).
- **Kendte sårbarheder:** OSV-Scanner sammenholder projektets dependency-versioner med OSV-databasen. Det understøtter kandidatfund, som skal kobles til deployed version og konkret eksponering. En versionstræffer er ikke bevis for aktiv udnyttelse. [OSV-Scanner](https://google.github.io/osv-scanner/).
- **Vedligeholdelse via PR:** Renovate finder relevante pakkefiler og kan oprette dependency-/lockfile-opdateringer efter konfigureret tidsplan. Det passer til almindelig review, tests og release; vi tilføjer ikke automatisk merge som standard. [Renovate documentation](https://docs.renovatebot.com/).

## Det næste byggetrin

Den lokale referencekæde er syntetisk. En senere operations-pilot kan være **én valgt app og én faktisk signalkilde**: betroet modtagelse → varig privat sag med genlevering/episoder → afgrænset overdragelse → appens release → produktionsevidens. Kvalificér også tabt signal, mistet agentjob og genoprettelse.

Derefter kan en dependency-kilde tilsluttes samme kæde. Først når gentagne sager viser et behov, tilføjes mere automation og et dashboard. Målefelterne findes allerede i [sagsskabelonen](case.md); de er uafhængige af både Warp og vores valgfrie dashboard.
