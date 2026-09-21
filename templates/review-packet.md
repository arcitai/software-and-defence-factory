# Reviewpakke — kopier til den konkrete levering

Dette er en **manuel artifactskabelon**, ikke et nyt API eller et krav om alle felter for enhver lille opgave. Udfyld relevante felter; brug `unknown` eller `ikke relevant — begrundelse`. Private logs og billedbeviser gemmes på en godkendt privat destination. Henvisning til et artifact er ikke automatisk uploadtilladelse.

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
- Risiko og begrundelse; evt. nødvendig specialist:
- Konkrete findings, reparationer og efterkontrol:
- Uafklarede forhold og anbefaling: klar til accept / ændringer / uafklaret:

Alle kendte findings skal have en disposition med grundlag. Review må ikke blive en ubegrænset løkke mod en bestemt numerisk score.

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
- Hvis driftssignal opstår: privat evidens, deduplikeringsnøgle og scoped opgave:
- Stop/oprydning: processtatus, bevarede commits/artifacts og credential-status:

Den udfyldte pakke supplerer v0.1-evidensimporten. Den aktuelle importer læser **ikke** denne Markdown automatisk og håndhæver ikke alle felterne ovenfor.
