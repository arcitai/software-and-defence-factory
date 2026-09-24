# Aflevering — én opgave

Kort skabelon til PR eller privat review. Udfyld relevante felter; følsomme beviser gemmes privat og henvises kun fra en autoriseret destination.

- Behov, issue og accepteret scope:
- Kort design/arkitektur ved større ændringer:
- Base-SHA, leveret head-SHA og faktisk testet revision (kan være CI-mergecommit):
- Harness/model/miljø og version; job-id eller logreference:

| Vertical slice / faktisk adfærd | Før/efter, check og revision | Status og næste skridt |
| --- | --- | --- |
| Udfyld for hver relevant del | Markér mocks, manglende baseline og reel integration | Afprøvet / fejlet / blokeret |

- Krævede checks: kommando eller check-id, exit/resultat og bevislink:
- Separat review af adfærd og kodevalg: reviewer, revision og disposition:
- Security: ændringens risiko, valgte kontroller, fund og efterprøvning; eller begrundet ikke relevant:
- Uafklarede forhold, konkrete næste skridt og recovery:
- Leveringsstatus: lokalt resultat / PR / accepteret / merged / deployet / observeret. Angiv kun det udførte:

| Målepunkt | Værdi og dækning |
| --- | --- |
| Kvalitet | Accepteret / ændringer / fejlet / blokeret / stadig åben; hvem vurderede hvad? |
| Samlet direkte pris | Model, review, compute og alle forsøg. Faktisk / estimeret / ukendt; valuta og kilde |
| Al mennesketid | Afklaring/design, hjælp, review og drift; manglende registrering |
| Gennemløbstid | Start/slut og aktiv tid separat; ikke afsluttet betyder ingen endelig tid til accept |
| Fejl efter accept | Konkret regression, revision og observationsperiode; ikke observeret endnu er et gyldigt svar |

Grønne checks på en tidligere revision eller et model-scoretal erstatter ikke review af den leverede ændring. Merge og deployment følger installationsarkets særskilte rettigheder.
