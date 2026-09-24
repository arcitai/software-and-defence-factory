# Reviewpakke — kopier til den konkrete levering

Dette er en **manuel artifactskabelon**, ikke et nyt API eller et krav om alle felter for enhver lille opgave. Udfyld relevante felter; brug `unknown` eller `ikke relevant — begrundelse`. Private logs og billedbeviser gemmes på en godkendt privat destination. Henvisning til et artifact er ikke automatisk uploadtilladelse.

## Før kode — kort ved større ændringer

- Behov: berørt bruger, ønsket adfærd og hvordan succes observeres:
- System: eksisterende dele, datavej og berørte grænser:
- Kodevalg: placering, vigtige typer/signaturer, kald og testpåstande:
- Første lille forløb: hvad kan køres og kontrolleres fra ende til ende?
- Væsentlige usikre valg: anbefaling, grundlag og eventuelt nødvendig afklaring:

Genbrug accepteret scope og beslutninger. Agenten udfylder rutinen inden for sit mandat; omfanget følger konsekvens og usikkerhed. Små, tydelige rettelser kræver ikke et særskilt designforløb. Mockup eller diagram medtages, når det afklarer adfærd. [Metodegrundlag](../docs/dex-review.md).

## Vertical slices — byg, afprøv, udvid

En slice leverer én lille, observerbar adfærd gennem de nødvendige lag. Afprøv den, før næste del tilføjes. En lille rettelse kan være én slice; API, CLI og security-arbejde behøver ikke en skærm. Knyt nødvendigt grundarbejde til den næste fungerende del.

| Slice: hvad kan faktisk gøres? | Bevis og revision, inkl. relevant fejl/regression | Status | Næste skridt |
| --- | --- | --- | --- |
| Kort adfærd og afgrænsning | Handling/check og privat reference; markér eventuelle mocks | Afprøvet / fejlet / blokeret / ikke afprøvet | Næste udvidelse eller konkret blocker |

Genbrug bevislinks fra resten af pakken. Slice-status er et teknisk kontrolpunkt; den ændrer ikke scope og erstatter ikke opgavens samlede accept. Agenten fortsætter inden for mandatet uden en ny godkendelsesrunde for hver slice.

## Resultat og identitet

- Forretningsbehov og berørt bruger:
- Issue / accepteret scope / scope-hash:
- Job / attempt / workspace:
- Base-SHA / leveret fuld head-SHA / evt. integreret SHA:
- Factory-revision, workflow/prompt/skill-digest:
- Harness/version, model/provider/revision, værktøjer og miljø:
- Begrænsninger, der påvirker fortolkningen:

## Bevis for acceptkriterier

| Kriterium | Før: observeret problem og baseline | Efter: faktisk resultat | Metode og artifact | Revision/miljø | Disposition |
| --- | --- | --- | --- | --- | --- |
| Udfyld fra accepteret scope | Reproduktion, billede, test eller måling | Samme relevante handling/workload | Privat reference og reproduktionstrin | Fuld SHA + relevante versioner | Bestået / fejlet / ukendt |

For UI: vis handlingen og resultatet. For performance: samme data/workload, enhed, antal gentagelser og variation. For sikkerhed: den afgrænsede reproduktion og rettelsens virkning. Screenshots alene beviser ikke adgangskontrol. En manglende før-måling må ikke erstattes af et gæt.

## Checks og separat review

- Krævede checks fra den accepterede kontrolplan:
- Faktisk kommando/check-identitet, start/slut, exitkode og logreference:
- Reviewer/proces, vurderet head-SHA og vurderet artifact:
- Kodevalg vurderet: ansvar, afhængigheder, kontrakter, fejlhåndtering og væsentlige designafvigelser:
- Risiko og begrundelse; evt. nødvendig specialist:
- Konkrete findings, reparationer og efterkontrol:
- Hvis scorer anvendes: rubric-version, judge/model, materiale-hash, klassifikation og begrundelse; separat menneskelig vurdering og uenigheder:
- Uafklarede forhold og anbefaling: klar til accept / ændringer / uafklaret:

Alle kendte findings skal have en disposition med grundlag. Review må ikke blive en ubegrænset løkke mod en bestemt numerisk score.

Ved en reproducerbar fejl: dokumentér at den målrettede prøve afslører fejlen før rettelsen og består efter. Kontroller årsagen til før-fejlen; eksisterende regressionstests må gerne bestå på begge versioner.

## Forbrug og tid

- Inference + review + compute + andre direkte omkostninger:
- Faktisk / estimeret / ukendt; kilde, valuta og evt. omregning:
- Dækkede forsøg / alle forsøg; tabende best-of-N-varianter inkluderet:
- Aktiv tid / samlet gennemløbstid / kø- og ventetid:
- Mennesketid: afklaring, review, reparation og drift:
- Tokens, cachetokens, værktøjskald og fejl — kun hvor målt:
- Aftalt loft / håndhævende mekanisme / eventuelt stop:

## Aflevering og observation

- Lokal accept, PR, merge og deploy angives separat:
- Genkontrol efter rebase/integration:
- Hvis release indgår: releaseidentitet, baseline, observationsvindue og ansvarlig:
- Ved tilbagevendende fejl: oprindelig opgave, tidligere fix, faktisk releaseversion og ny reproduktion:
- Hvis driftssignal opstår: privat evidens, deduplikeringsnøgle og scoped opgave:
- Stop/oprydning: processtatus, bevarede commits/artifacts og credential-status:

**Fortsættelse ved overdragelse:** senest afprøvede del og revision, gældende beslutninger, åbne forhold samt næste konkrete handling. Henvis til beviser frem for at kopiere hele logs. Opdatér ved meningsfulde milepæle; en ny session skal kunne fortsætte uden at genåbne afklarede rutinevalg.

Den udfyldte pakke supplerer v0.1-evidensimporten. Den aktuelle importer læser **ikke** denne Markdown automatisk og håndhæver ikke alle felterne ovenfor.

Det, der kræver en menneskelig beslutning, kan samles i [én kort oversigt](human-review.md) med link til denne pakke.

Pilotens fem målepunkter og baseline registreres på [målekortet](measurement-card.md). Genbrug bevislinks herfra; scorerens vurdering er et supplerende signal og ændrer ikke acceptkravene.
