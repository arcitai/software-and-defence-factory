# Fælles factory-regler

Disse regler beskriver metoden i **Arcitai Software and Security Factory**. Den konkrete installation håndhæver adgang, concurrency, budget, checks og release. Projektets eksisterende instruktioner og brugerens autoritet gælder fortsat; en issue, label eller skill tildeler ikke nye rettigheder.

## Fra opgave til levering

1. **Afgræns:** registrér brugerbehov, observerbar succes, tilladt scope og kontrolplan. Ved større ændringer beskrives kort arkitektur, vigtige kontrakter og første runnable slice. Genbrug allerede accepterede beslutninger.
2. **Byg og bevis:** én lille vertical slice gennem nødvendige lag ad gangen. Afprøv adfærd og relevante fejl før udvidelse; gem revision, bevis og næste skridt. Agenten fortsætter gennem det aftalte scope uden ny godkendelse efter hver slice. En slice er ikke hele opgavens accept.
3. **Review og aflever:** særskilt review af den præcise revision og de krævede checks. Aflever med [skabelonen](delivery.md). PR, merge, deployment og observation har hver sin status og følger projektets eksplicitte leveringspolitik.

Kun én writer må eje samme arbejdsområde/opgave. Brug separat branch/workspace; husk at Git-worktrees kan dele credentials, porte og databaser. Afstem ukendt jobstatus før en erstatningsworker startes. Bevar resultat og logs før et midlertidigt miljø slettes. Implementeren må ikke ændre sine egne acceptkrav eller kontrollere reviewerens facit.

## Hvad bruger vi CI og CD til?

| Tidspunkt | Fælles ansvar | Projektet vælger |
| --- | --- | --- |
| PR eller ændring til review | Kør reproducerbare checks på kendt revision: relevante tests, build/type/lint og hurtige security-checks | Eksakte kommandoer, sprogversioner og CI-tjeneste; genbrug eksisterende checks |
| Agentstart | Kontroller autoriseret aktør, accepteret scope og kapacitet; start ét job og gem identitet | Manuel start, managed automation eller egen runner. Actions kan være en kort dispatch, hvis nødvendig |
| Release | Godkend integreret revision og de nødvendige checks; hold deploycredentials uden for almindelige PR-jobs | Eksisterende hostingintegration eller separat CD-workflow, miljøregler og rollback |
| Efter release | Verificér leverancen med aftalte releasechecks og mål dens effekt. Modtag afgrænsede fejl-/security-opgaver fra drift eller Defense Factory | Datakilder, periode og ansvarlig; løbende overvågning og incidents ejes af drift/Defense; ingen automatisk produktionsændring uden politik |

TDD bruges under udviklingen, hvor en relevant prøve først viser den ønskede adfærd eller fejlen; CI genkører testene på ændringen. Det erstatter ikke afprøvning af en fungerende vertical slice.

GitHub Actions er en mulig CI/CD-motor, ikke et krav til agenten. Undgå hosted-minutter brugt alene på at vente på en lang agentkørsel. En kvalificeret self-hosted runner kan udføre almindelige CI/CD-jobs på egen hardware; agentarbejdet behøver ikke ligge i samme workflow. Et fungerende deploy via hostingudbyderens Git-integration behøver ikke en ekstra CD-Action.

Ved Actions: mindst mulige permissions, gennemgåede action-versioner fastlåst til commit, timeout og concurrency. Ubetroet PR-kode kører uden deploy-/modelnøgler på et egnet isoleret miljø. Brug ikke privilegeret `pull_request_target` til at køre PR-koden. En selvhostet runner er ikke automatisk et sikkert sted for eksterne PR’er. Branchregler og eventuelle environment-gates sættes og afprøves i tjenesten; en fil aktiverer dem ikke.

## Hvornår kommer security ind?

**Risiko er relativ til ændringen og systemet.** Vurder konsekvens, eksponering, mulighed for at opdage/gendanne og usikkerhed. Et soloprojekt eller en lille diff er ikke automatisk lav risiko. Brug installationsarkets kontekst, vurder først ved triage og igen på den faktiske diff. Ukendt risiko kræver afklaring; den bliver ikke lav som standard. Nye commits eller ændrede forudsætninger kræver relevant ny kontrol. Vurderingen bestemmer bevis og reviewomfang, men tildeler ikke merge-/deployrettigheder.

| Udløser | Krævet håndtering |
| --- | --- |
| Appen tilsluttes | Beskriv data, adgang, dependencies og vigtigste tillidsgrænser. Vælg relevante basiskontroller og privat fundkanal |
| Hver kodeændring | Vurder ændringens risiko og kør aftalte hurtige kontroller. Secret-/dependency-checks vælges efter stack og ændring; værktøjsfejl er ikke et rent scan |
| Auth/rettigheder, følsomme data, betaling, netværksinput, CI/agentpolitik eller tillidsgrænser ændres | Tilføj afgrænset security-review af diff og relevante flows samt reproduktion, når der er et muligt fund |
| Et konkret fund eller en relevant advisory | Validér forudsætninger og effekt; foreslå/fix inden for mandatet og verificér sårbar før/fikset efter. Rå fund holdes privat |
| Release eller aftalt periodisk gennemgang | Gentag relevante kontroller på den integrerede revision. Bred scanning og frekvens vælges efter eksponering, ændringer og budget |

Codex Security kan levere specialistarbejdet, hvor det er tilgængeligt. Andre agenter/scannere skal opfylde samme evidenskrav. Modelnavn, 5/5-score eller vellykket scan er ikke garanti for sikkerhed. Aktiv afprøvning af eksterne/produktionsmål kræver et udtrykkeligt, afgrænset mandat.

## Samarbejde med Defense Factory

**Defense** kan dele factoryens installation og dashboard som et valgfrit arbejdsforløb med egne rettigheder. Det ejer løbende undersøgelser og opfølgning; en driftsprofil behandler logs, incidents og dependency-/advisory-signaler, også fra software bygget uden denne pakke. Et fund bliver en afgrænset softwareopgave med system/revision, konsekvens, bevis og acceptkriterier. Softwareforløbet verificerer rettelsen og afleverer PR/beviser; release følger appens politik, og drift/Defense kontrollerer effekten. Følsomme detaljer bliver i den private fundkanal. Fælles dashboard giver ikke ekstra produktionsadgang. Security-arbejde her omfatter også rettelser efter release.

## Dokumenteret værdi

Registrér kvalitet/accept, samlet direkte pris, al mennesketid, gennemløbstid og observerede fejl efter accept. Bevar fejlede forsøg og reparationer. Ukendt er ukendt; skeln mellem målt og estimeret. Skills/modelsammenligninger bruger sammenlignelige opgaver og versionsspor. Et automatisk scoretal er supplement til faktisk bevis og review.

## Primære metodekilder

Egen tilpasning, kontrolleret 24. september 2026: [Agent Skills-format](https://agentskills.io/specification), [GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use), [deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). Kilderne dokumenterer formater og tjenestefunktioner; de beviser ikke denne installations konfiguration.
