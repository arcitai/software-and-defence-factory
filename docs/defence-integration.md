# Defence/incident: integrationskontrakt v0.2

**Implementeringsgrundlag · 24. september 2026.** Første vertical slice: ét driftssignal → afgrænset læseundersøgelse → privat sag → anbefaling eller softwareopgave. Kontrakten omfatter også senere integrationsarbejde. v0.2 implementerer manuel inputvalidering, scope/dedup, jobbinding og et privat uverificeret triage-udkast; den implementerer ikke en live connector eller aktiv overvågning. Se [faktisk status og proof](platform-proof.md).

Én **Arcitai Software & Defence Factory**, med fælles CLI, installation, dashboard og Machinist-kø. Fundamentet er [Machinist `39435164faf1ff7fad49e41c38a7eb1a00538f21`](machinist-review.md). Denne kontrakt følger [platformretningen](platform.md); researchens tidligere forslag om to selvstændige løsninger er dermed overhalet som pakningsbeslutning.

## To forskellige arbejdsforløb

| Forløb | Opgave og resultat |
| --- | --- |
| Sikkerhedsundersøgelse | Undersøg kode, afhængigheder eller et importeret fund; følg kandidat → valideret/afkræftet/uafklaret → verificeret udbedring. Kan foregå før og efter release. |
| **Incident-triage, første slice** | Undersøg et driftsproblem og foreslå næste handling. En HTTP 500 er ikke i sig selv en sårbarhed. Mistanke om sikkerhedsproblem overdrages til særskilt validering. |

Defence kan tilsluttes eksisterende software uden for Software Factory. Afgrænsningen bygger på [definitionsresearchen](defence-research.md), hvor kontinuerlig sikkerhedsundersøgelse er bredere end incidenthåndtering.

## Input: ét godkendt scope

Første version startes manuelt gennem den fælles CLI/GUI. Ingen ny scheduler; senere signaltriggers skal bruge samme kø og deduplikering.

| Feltgruppe | Minimum |
| --- | --- |
| Identitet | `contract_version`, `case_id`, kilde + `event_id`, episode, modtaget/observeret tidspunkt. Controlleren tildeler sags-ID. |
| Mål | Kunde/projekt, tjeneste, miljø og ansvarlig fra en betroet installationsprofil. Repo og deployed revision angives, eller markeres ukendt. |
| Signal | Kort beskrivelse og kildens rapporterede alvor. Alarmtekst er ubetroet evidens. |
| Læseadgang | Tilladte kilder, ressourcer, tidsvindue, krævet friskhed og maksimum for rækker/bytes, kald, tid og modelbudget. Kun referencer til credentials. |
| Kontekst | Appens risiko, kritiske flows, runbook og kriterier for efterkontrol. Ukendte forhold registreres eksplicit. |

Kunde/miljø/kilde/event-ID er deduplikeringsnøglen. Gentagelse genbruger sagen; ændret payload med samme nøgle giver konflikt til review. Adapteren ejer episodekorrelation. Alarmtekst og agenten kan ikke vælge en anden kundes scope.

## Udførelse: fire små trin

1. **Kontrollér input.** Validér profil, scope, budget og kildeadgang før modelstart. Mangler registreres uden at udvide rettigheder.
2. **Indsaml evidens.** Læs fejl/logs, relevante målinger og release-/ændringshistorik gennem afgrænsede værktøjer. Registrér utilgængelige, forsinkede og afkortede data.
3. **Undersøg.** Adskil målte fakta, hypoteser og usikkerhed. Aflever påvirkning, sandsynlig årsag, én anbefaling og konkret efterkontrol. Deployment-korrelation beviser ikke årsag.
4. **Validér afleveringen.** Controlleren kontrollerer schema, scope, krævede kilders status og evidensreferencer. Gyldige links beviser ikke agentens forklaring. Gem privat sag og eventuelt overdragelsesudkast.

Læsning håndhæves gennem IAM og værktøjsadaptere. Jobbet får ingen produktionsskriveadgang, deploynøgler, controllerdisk eller Docker-socket. Ingen vilkårlig shell med cloud-credentials. Ubetroede logs kan ikke aktivere værktøjer eller udvide scope. Følsomme felter fjernes før modelinput; kun godkendt inference modtager resten. Eksisterende alarmberedskab fortsætter uafhængigt af agenten.

## Privat evidens og synlig status

Råmateriale bliver som udgangspunkt i kildesystemet. Nødvendige, minimerede udtræk gemmes i et adgangsbegrænset sagslager, fx `.factory/defence/<case-id>/`, med aftalt slettefrist. Git-ignore er ikke adgangskontrol. Ingen rå logs, secrets eller sårbarhedsdetaljer i offentlige issues, kit-eksport eller almindelige joblogs.

Hver evidenspost har kilde, scope, forespørgselsvindue, indsamlingstid, release hvis kendt, indholdshash og markering af huller/afkortning. Hashen dokumenterer integritet, ikke sandhed. Dashboardet viser en redigeret opsummering; evidensadgang kræver samme autorisation som kilden. Indtil særskilt adgangskontrol er kvalificeret, begrænses installationen til én betroet operatør og ét kundescope.

| Dimension | Kontraktens tilstande og betydning |
| --- | --- |
| Kørsel | `queued → running → succeeded / failed / stopped`; uafklaret worker giver `unknown`. Dette er kontraktbegreber, som adapteren skal mappe til Machinist. |
| Undersøgelse | `triaged` eller `inconclusive`, med separat liste over evidenshuller. Manglende krævet kilde giver `inconclusive`; nul resultater er ikke dokumentation for sund drift. |
| Sag | `open → handoff_pending → awaiting_verification → closure_review`. En vellykket agentkørsel lukker ikke sagen. |

Stop afbryder agent og connector-kald og bevarer delresultater som ufuldstændige. Ved mistet lease eller ukendt processtatus må en erstatning først starte efter bekræftet stop; timeout alene beviser det ikke. Retry får nyt forsøgs-ID under samme sag. Pris og varighed summeres over alle forsøg; ukendt pris vises som ukendt.

## Overdragelse til Software Factory

Udkastet indeholder sagsreference, tjeneste/miljø, repo/revision, påvirkning, private evidensreferencer, foreslået rettelsesomfang, app-relativ risiko og reproduktions-/acceptkriterier. Softwareforløbet omsætter accepteret scope til **én vertical slice** med test, implementering og separat review. Mangler kodeadgang, går udkastet til den ansvarlige ejer/leverandør.

Første slice opretter kun et privat udkast. Ekstern issue-oprettelse eller softwarejob kræver særskilt autoriseret overdragelse gennem controlleren med deduplikering og samme ene skriver. Tilbage kommer job/PR, præcis revision og faktiske checks. Ændret revision kræver relevant ny verifikation.

Efterkontrol skal knytte den faktiske deployment til relevante observationer og appens aftalte tidsvindue. Merge, agentens selvtillid eller en upstream-alarm med status “closed” er utilstrækkeligt. v0.2 kan registrere efterkontrol til menneskelig vurdering; den udfører ingen restart, rollback, deploy, automatisk merge eller automatisk lukning.

## Accept: det skal demonstreres

| Scenarie | Krævet resultat |
| --- | --- |
| Syntetisk fejl efter release | Tre evidensklasser → privat rapport med fakta/hypotese → softwareudkast. Tydeligt markeret som fixture, ingen eksterne skrivninger. |
| Gentaget signal / andet miljø | Samme hændelse giver én sag; payloadkonflikt afvises. Andre miljøer blandes aldrig ind. |
| Manglende adgang, forsinket eller tom måling | Synlig usikkerhed og kildedækning; ingen påstand om nul fejl eller automatisk lav risiko. |
| Log med instruktioner og test-secret | Ingen instruktionsudførelse; test-secret når hverken model, opsummering eller eksport. |
| Stop eller mistet worker | Delresultater bevares; intet erstatningsjob før bekræftet stop. |
| Overdragelse og ændret revision | Udkast starter ingen softwarejob; autoriseret overdragelse deduplikeres. Bevis for forkert revision afvises. |
| PR merged eller alarm lukket | Sagen afventer dokumenteret deployment/efterkontrol og menneskelig vurdering. |

En live connector kvalificeres særskilt mod én autoriseret tjeneste med håndhævet læseadgang, dokumenteret kildefriskhed og nul produktionsskrivninger. Syntetisk replay kvalificerer ikke dette.

## Inspiration og resterende arbejde

Owains [GCP-demo](https://github.com/owainlewis/youtube-tutorials/tree/5b3d3c9a136dc797c0da1427406c9a53fefbee5c/tutorials/software-factory) er læst i den pinnede README, `agent.py` og `domain.py`. Vi genbruger mønstret med afgrænsede logs, målinger og revisionshistorik samt anbefaling og menneskelig recovery. Demoens Google/Gemini-stack er et adaptereksempel. Dens timeoutbaserede genstart og mapping fra lukket alarm til recovered overtages ikke som vores bevis for processtop eller udbedring.

Næste implementering er dette ene forløb på den fælles runtime: inputvalidering, isoleret adapter, privat lager, resultatkontrol og stop/recovery. Det eksisterende [operations-eksperiment](../experiments/defence-operations/README.md) er kun offline reference. Løbende security-scans, nye sensorer, flere kunders adgangskontrol og produktionshandlinger er senere, særskilt kvalificerede slices.
