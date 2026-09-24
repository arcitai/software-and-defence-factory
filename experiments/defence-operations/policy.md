# Eksperiment: driftsregler og lille signalkontrakt

Udkast til en mulig operations-profil. Produktets foreslåede kerne og ansvarsdeling findes i [researchen](../../docs/defence-research.md).

## Ansvar og forløb

Software Factory ejer ændringer og levering. Defence Factory følger sikkerhedsrisiko på tværs af livscyklussen. Dette eksperiment undersøger kun driftsdelen: signaler, koordinering og kontrol efter indsats. Begge arbejder med samme sagsreference og beviser; ingen af dem overtager automatisk produktionsrettigheder.

Forløb: **signal → triage → indsats/opgave → ændring eller afbødning → verifikation → lukning eller opfølgning**. En normal udvikler eller leverandør kan modtage opgaven. Første respons på et nedbrud kan være en aftalt rollback; en kodeændring kan følge senere.

| Observation | Første disposition | Næste handling |
| --- | --- | --- |
| Kritisk brugerfunktion fejler | Driftsincident-kandidat | Alarmér ansvarlig direkte; bekræft påvirkning, følg aftalt runbook |
| Mistænkelig adgang eller sikkerhedssignal | Sikkerhedskandidat | Privat triage, bevar relevante beviser; eskalér ved troværdig aktiv hændelse |
| Advisory matcher dependency-version | Vedligeholdelse / sårbarhedskandidat | Bekræft deployed version, eksponering og påvirkning; prioriter rettelse |
| Ny version uden kendt sårbarhed | Almindelig vedligeholdelse | Planlagt update-PR, appens tests/review og kontrolleret release |
| Manglende eller gammel sensordata | Dækningshul | Genskab observationen; markér tilstanden ukendt |

En scannerklassifikation er ikke bevis for udnyttelse. En kendt sårbarhed kan kræve akut arbejde uden at være et bekræftet indbrud. Agenten skal bevare den forskel.

## Signalgrænse

En kildeadapter autentificerer kilden, vælger kundens/tjenestens identitet fra betroet konfiguration og omformer data til en lille post. Logtekst, issueindhold og modeloutput er data, aldrig autoritet til værktøjskald. Hold rå logs i privat lager; medtag kun nødvendige, gennemsete uddrag og opake evidensreferencer i sagen.

[Den syntetiske fixture](examples/scenario.json) viser det præcise referenceformat. `flow.mjs` accepterer kun de definerede felter:

- Kilde/event-ID; kunde/tjeneste/miljø; `condition` og `episode`.
- `kind`: availability, security, dependency eller coverage; kildealvor: info, warning eller critical.
- Observationstid i UTC, observeret deployed release, kort opsummering og `evidence:`-referencer.

Gentagen levering af samme kilde/event tæller én gang; konfliktende payload afvises. Samme kunde/tjeneste/miljø/kilde/kind/condition/episode samles til en sag. En ny episode får en ny sag. Den rigtige kilde/sagsadapter skal eje episodens livscyklus og gemme tilstanden; et tilfældigt nyt episode-ID ved hver alarm ødelægger deduplikeringen. Korrelation mellem forskellige kilder er senere tilvalg.

Eksemplet er batch-baseret og har ingen netværksmodtagelse, varig deduplikering eller kø. `route: on-call-now` er en anbefalet disposition, ikke en sendt alarm. Ukendt kilde-, miljø- eller releasekortlægning kræver afklaring. Feltvalidering kan ikke i sig selv fjerne hemmeligheder fra en opsummering.

## Agent og drift

Agentens normale capabilities er læsning af sag, afgrænsede tidsvinduer fra logs/metrics, release-/dependency-oplysninger og eventuelt repo. Browser er et tilvalg til at reproducere en brugerrejse; computer use er ikke et grundkrav. Security-specialisten vælges særskilt og behøver ikke køre på alle sager.

Begræns hvert job i tid, modelbudget og adgang. Højere alvor må eskaleres uden et modelkald. Produktionsændringer, blokering af brugere, rotation af credentials og recovery følger aftalt autoritet/runbooks. AI må ikke udlede sådan adgang fra alarmteksten. Gentagne fund må ikke starte konkurrerende skriverjobs på samme løsning.

Almindelige tests, build og CD bliver i appens eksisterende pipeline. Sensorer, logopsamling og incidentberedskab skal have en rigtig driftsplacering. En scheduler eller et eksisterende overvågningsværktøj kan starte en afgrænset scan; langvarigt agentarbejde behøver ikke køre i GitHub Actions.

## Afslutning og beviser

En PR eller et resolved-signal er en milepæl. Før lukning kontrolleres berørt miljø, faktisk deployed release, relevante bruger-/sikkerhedschecks, frisk sensordækning og aftalt observationsvindue. Bekræftede sikkerhedshændelser kan desuden kræve undersøgelse af fortsat adgang og påvirkning; en grøn uptime-kontrol er utilstrækkelig.

`assessRecovery` afviser manglende/fejlede/skippede checks, forkert release/miljø, forkert sag, gamle beviser, utilstrækkeligt vindue og manglende sensorfriskhed. Et konsistent ark får kun `ready-for-closure-review`: beviserne skal stadig komme fra betroede kilder og vurderes. Funktionen udfører ingen check og beviser hverken genoprettelse eller autenticitet alene.

Afbødet, genoprettet og permanent rettet er separate forhold. En incident kan lukkes efter verificeret genoprettelse efter projektets politik, mens en særskilt årsags-/vedligeholdelsesopgave fortsætter. Bevar forbindelsen og genåbn/opret ny episode ved gentagelse.
