# Risiko afhænger af ændringen og systemet

**Research og metode · 24. september 2026.** Risiko bestemmer kontrollernes omfang. Den giver ikke i sig selv tilladelse til merge, deploy eller indgreb i produktion.

## Videoen og originalartiklen

Hele den eksisterende engelske autotransskription til [Owain Lewis’ video](https://www.youtube.com/watch?v=yhLDivVIamQ) er genlæst, fra 0:00 til sidste tekst ved 10:46. Det er YouTubes automatiske undertekster, hentet 21. september, ikke en ny lydtransskription eller manuelt verificeret ordlyd. Her er en kort parafrase med tidskoder:

| Tid | Relevant pointe |
| --- | --- |
| [1:30](https://www.youtube.com/watch?v=yhLDivVIamQ&t=90s) | Review kan have forskellige faglige perspektiver |
| [1:52–3:13](https://www.youtube.com/watch?v=yhLDivVIamQ&t=112s) | Klassificér ændringen; konsekvenserne afhænger af virksomheden og systemet. Pointen om relativ risiko står omkring **2:36** |
| [4:29–6:41](https://www.youtube.com/watch?v=yhLDivVIamQ&t=269s) | Demo af risikobaseret PR-håndtering; lav risiko ophæver ikke fejlet CI eller problemer med en forældet branch |
| [6:43–8:30](https://www.youtube.com/watch?v=yhLDivVIamQ&t=403s) | Hændelsesagent samler driftskontekst og foreslår afhjælpning |
| [8:32–9:17](https://www.youtube.com/watch?v=yhLDivVIamQ&t=512s) | Releaseobservation kan opdage problemer efter udrulning |

Den tilgængelige del af [Gergely Orosz’ artikel, 15. september](https://newsletter.pragmaticengineer.com/p/openai-software-factory), beskriver outcome → kontekst → kode/checks → specialistreview → risikoklassifikation → release og feedback. Specialistens relevante kontekst betyder mere end en titel. Artiklen angiver menneskelig godkendelse før produktionsudrulning. Sevbot foreslår afhjælpning og kan udføre et konkret indgreb efter instruks; autonom hændelseshåndtering beskrives som et mål. Den er interviewbaseret journalistik, ikke en offentlig implementation. Teksten efter betalingsgrænsen er ikke læst.

Owains [incident-demo](https://github.com/owainlewis/youtube-tutorials/tree/5b3d3c9a136dc797c0da1427406c9a53fefbee5c/tutorials/software-factory) er separat kode med Cloud Run, Monitoring, Pub/Sub, Firestore og Gemini/ADK. [Agenten](https://github.com/owainlewis/youtube-tutorials/blob/5b3d3c9a136dc797c0da1427406c9a53fefbee5c/tutorials/software-factory/code/agent.py) læser logs, request-målinger og revisions-/trafikhistorik og kræver alle tre beviskilder før konklusion. Recovery udføres af mennesket. Det er et konkret mønster til vores første Defense-/incidentworkflow, ikke en indbygget Machinist-connector. Google-tjenesterne er demoens valg; vores datakilder kan være andre.

## Vores enkle regel

**Vurder sandsynlig fejl, konsekvens, eksponering, mulighed for at opdage/gendanne og usikkerhed — i denne app.** Ingen obligatorisk matematisk score. Et lille firma kan behandle meget følsomme data; én linje kan ændre adgang til alle kunder. Antal filer, modelens selvtillid eller “soloprojekt” afgør ikke risikoen.

| Eksempel — vores vurdering | Rimelig kontrol |
| --- | --- |
| Rettelse af almindelig hjælpetekst uden ændret adfærd | Relevant preview/linkcheck og kort review |
| Ændring af en brugerfunktion | Gennemgående adfærdsprøve, relevante regressioner og separat review |
| Adgangskontrol, betaling, datamigration eller bred produktionspåvirkning | Målrettet specialist, negative tests og relevant recovery-prøve; godkendelse efter appens politik |
| Konsekvens eller miljø er ukendt | Afklar det konkrete hul; klassificér ikke automatisk som lav risiko |

Eksemplerne er udgangspunkter. En Markdown-fil kan være agentpolitik eller indeholde kommandoer, som systemet udfører; den får ikke automatisk tekstfilens enklere vej. Adskil ændringens leverancerisiko fra alvoren af en eventuel sårbarhed.

Registrér en foreløbig vurdering ved triage og kontrollér den igen på den faktiske diff. Bind vurdering, krævede checks og eventuel godkendelse til revision og relevant miljø/policy. Nye commits, ændret base eller ændrede forudsætninger udløser relevant ny kontrol. Implementeren må ikke sænke sin egen kontrolplan.

## Sådan lander det i pakken

- **Opsætning:** appens berørte brugere/data, eksponering, kritiske flows og recovery-muligheder gemmes i installationsarket. Eksisterende kontekst genbruges.
- **Opgave:** et kort felt med risiko, begrundelse, usikkerhed og krævede beviser. Specialister tilføjes efter behov; der er ikke fire agenter på hver lille opgave.
- **Aflevering:** særskilte statusser for review, merge, deploy og observation. Standardpakken afleverer til review. Senere automatisk merge kræver en konkret politik og håndhævede checks; en label eller score er utilstrækkelig.
- **Drift:** observation kan blive til en afgrænset opgave her. Vedvarende undersøgelser/incidenthåndtering følger Defense-workflowet på samme platform, med egne rettigheder. Produktionsindgreb kræver deres eget mandat.
- **Måling:** sammenlign tid, pris, mennesketid og fejl inden for lignende opgaver og risikoprofiler. Vis antal opgaver og manglende data. Billige tekstrettelser må ikke skjule dyrere, risikofyldte ændringer i ét gennemsnit.

Dette er metode og planlagte GUI-felter. Markdownfelterne håndhæves ikke automatisk af den nuværende runtime. [Byggeretning](platform.md) · [Reviewpakke](../templates/review-packet.md) · [Installationsark](../kit/installation.md).
