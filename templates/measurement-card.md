# Målekort — én opgave

Manuel skabelon. Udfyld kun relevante felter og link til [reviewpakken](review-packet.md), så beviser ikke kopieres flere steder. Gem det udfyldte kort privat. Ukendt er ikke nul.

## Før start

- Opgave / forretningsbehov / scope / risiko:
- Arbejdsgang: nuværende praksis eller factory; faktisk AI-/værktøjsbrug i begge:
- Accepterede krav og kontroller, inklusive nødvendige afklaringer før kode:
- Startrevision, konfiguration/version og tilgængelige testdata:
- Måleperiode, opgaveudvælgelse og eventuel sammenlignelig baseline:
- Hvad tæller som accept, og hvordan observeres resultatet efterfølgende?

## Resultat

| Mål | Registrering |
| --- | --- |
| Kvalitet | Accepteret / afvist / blokeret / fejlet / stadig åben; reviewer, dato, head og bevislink |
| Samlet direkte pris | Alle forsøg, reparationer, review/scoring og compute; faktisk / estimeret / ukendt; dækning |
| Mennesketid | Minutter til afklaring/arkitektur, implementering/hjælp, review/accept og drift; manglende registrering |
| Tid til accept | Start/slut, gennemløbstid og aktiv køretid hver for sig; åbne opgaver har endnu ingen tid til accept |
| Fejl efter accept | Konkret fejl/tilbagefald, version og observationsvindue; ikke observeret endnu / begrænset dækning |

**Indgreb undervejs:** registrér fase, årsag, kort handling og aktiv varighed. Skeln mellem aftalt menneskelig godkendelse og uplanlagt hjælp. Registrér også login-/miljøhjælp og ændringer af krav; undgå dobbeltregning med tidsfelterne ovenfor. Det samlede tidsforbrug skal omfatte begge slags indgreb.

**Hvis opgaven videreudvikler en tidligere levering:** henvis til opgave og accepteret revision; notér omarbejde, eventuelle regressioner og om tidligere krav stadig holder. Ved et kontrolleret forsøg angives også det på forhånd fastlagte trin og tidspunktet, hvor kravet blev givet. Tid og pris tælles i felterne ovenfor, ikke en ekstra gang. [Forsøgets begrænsninger](../docs/value.md#kan-vi-ændre-det-igen).

## Scorer og beslutning

- Scorer/version, judge/model, tidspunkt og digest for vurderet materiale:
- `pass` / `fail` / `unknown` / `not-scored` + kort begrundelse og bevislink:
- Menneskets selvstændige vurdering, uenighed og endelig disposition:
- Hvad ændres eventuelt, og hvilken sammenligning kan efterprøve det?

En genvurdering tilføjes dateret; tidligere vurderinger bevares. Modelvurderingen giver ingen godkendelse til merge eller release. Samlet regnskab og sammenligningsregler står i [værdiguiden](../docs/value.md).
