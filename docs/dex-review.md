# Dex Horthy — design før kode, små leverancer og senere ændringer

Gennemgået **24. september 2026**. [Det korte reviewoverblik](review.html) viser beslutningen; dette dokument gemmer kildegrundlaget. Metoden er indarbejdet i byggeplanen og de eksisterende skabeloner. Runtime, agentadgang og evalimport er uændrede.

## Kilder og dækning

| Primærkilde | Det der er undersøgt |
| --- | --- |
| [Why Software Factories Fail på X](https://x.com/dexhorthy/article/2080697380379427275), dateret 24. juli | Hele artiklen læst i browseren. Den fortsætter i to linkede dele; uddybningen er læst i forfatterens samlede GitHub-version nedenfor. |
| [Forfatterens samlede artikel](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/f2bc7aec4575418d2d2e83fec078266cc56d3e6a/wsff.md) | Produktkrav, systemarkitektur, programdesign, små gennemgående leverancer og flaskehalse. Kildeeksempler og seks centrale billeder er gennemgået. Revision `f2bc7aec4575418d2d2e83fec078266cc56d3e6a`. |
| [David Ondrej med Dexter Horthy](https://www.youtube.com/watch?v=xgkjtF89-44), 7. august, 58:36 | Hele den engelske autotransskription læst: 1.980 tidsstemplede segmenter fra 0:00 til 58:35. Autotekst kan fejltransskribere navne; tekniske hovedpointer er krydstjekket mod artiklen. |
| [Maciejdziubas Software Factory Playbook](https://gist.github.com/Maciejdziuba/88890d7e0eeefa5a8738bbe9fd5e20b8/112d6ba3d533bd07895774e37d169ce585f6317d) | Hele README og SKILL.md læst ved revision `112d6ba3d533bd07895774e37d169ce585f6317d`. En tredjepartsbearbejdning af podcasten; ikke en verificeret officiel Dex-skill. Ingen installation. |
| [Where does the time go](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/f2bc7aec4575418d2d2e83fec078266cc56d3e6a/side-quests/where-does-the-time-go.md) | Forfatterens uddybning om planlægning, review og omarbejde. Procenterne er illustrative antagelser. |
| [Dex’ senere benchmarkkorrektion](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/f2bc7aec4575418d2d2e83fec078266cc56d3e6a/benchmarking-opus-5-on-slop-code-bench.md) og [SlopCodeBench v2](https://arxiv.org/abs/2603.24755v2) | Korrektionens indledning samt forskningsartiklens abstract og versionshistorik. Ingen benchmarkkørsel eller fuld metodeaudit her. |

Videobeskrivelsen linker til [en pakket 4-Gate-skill](https://www.davidondrej.com/dex-podcast). Den offentlige side viser en formular med email og samtykke til nyhedsbrev; formularen er ikke indsendt, og emailpakken er ikke hentet. Den offentlige gist ovenfor er læst særskilt; identitet med emailpakken er ikke verificeret. HumanLayer er forfatterens produkt. PostHog-afsnittet ved 5:13–6:38 er sponsorindhold; øvrige kursus-, referral-, sociale og rekrutteringslinks er ikke tekniske forudsætninger.

## Det artiklen og billederne bidrager med

Dex beskriver, at hurtigere implementering kan flytte køen til review, og at tidlig afklaring kan reducere omarbejde. Hans fire arbejdsniveauer er **produktkrav → systemarkitektur → programdesign → små gennemgående leverancer**. Arbejdet tilpasses opgaven; små, tydelige rettelser gennemgår ikke et fuldt planforløb. Hans erfaringer med ubemandet udvikling er ikke et universelt bevis for, at en bestemt model eller factory altid fejler.

De visuelt gennemgåede billeder viser:

- **Planning/review:** aftaler før kode; de tegnede timer er eksempler, ikke vores målinger.
- **Agentic factory:** model, harness, sandbox og orkestrering er adskilte dele; review kan stadig være flaskehalsen.
- **Lights-on factory:** menneskelig kodevurdering indgår sammen med agentreview og test.
- **Evolving requirements:** senere ændringer udfordrer tidligere designvalg.
- **Product mockup:** et skærmudkast gør adfærd og overdragelser konkrete.
- **Frontier Code:** korrekthed, regressioner, regler og testens evne til at opdage fejlen vurderes særskilt.

Det er forklaringsfigurer. De bliver ikke kopieret ind i produktet, og deres effektpåstande bruges ikke som benchmarkdata.

## Videopunkter med direkte betydning

| Tid | Pointe | Vores tilpasning |
| --- | --- | --- |
| [11:38–16:46](https://www.youtube.com/watch?v=xgkjtF89-44&t=698s) | Brugerproblem og mål før tekniske løsninger; afklar arkitektur med den relevante reviewer. | Ét kort afsnit i den eksisterende reviewpakke før større ændringer. |
| [16:49–19:21](https://www.youtube.com/watch?v=xgkjtF89-44&t=1009s) | Programdesign konkretiserer kodeplacering, typer og kald. | Vis den ændrede kaldesti og de få kontrakter, som er dyre at vælge forkert. |
| [19:23–21:46](https://www.youtube.com/watch?v=xgkjtF89-44&t=1163s) | Små gennemgående leverancer giver tidligere feedback. | Én synlig brugerhandling gennem de relevante lag; afprøv før næste del. |
| [26:40–29:50](https://www.youtube.com/watch?v=xgkjtF89-44&t=1600s) | Kendte enkeltopgaver viser ikke hele evnen til videreudvikling. | Behold vores faste cases; supplér med et senere krav på samme kodebase. |
| [33:19–35:47](https://www.youtube.com/watch?v=xgkjtF89-44&t=1999s) | Relevant kontekst i filer; kendt dataindsamling kan udføres af kode. | Genbrug versionsstyrede beslutninger og private artifacts. Ingen ekstra agent til almindelig statusaflæsning. |
| [40:15–43:11](https://www.youtube.com/watch?v=xgkjtF89-44&t=2415s) | Kontekst bør holdes relevant; faste tokenregler er ikke universelle. | Korte overdragelser efter behov; ingen automatisk 100k-grænse. |
| [44:49–49:10](https://www.youtube.com/watch?v=xgkjtF89-44&t=2689s) | Arbejd på den faktiske flaskehals for kundeværdi. | Mål ventetid og omarbejde før flere workers eller et nyt framework. |

## Det vi ændrer i Arcitai

**Før en større ændring:** agenten udfylder behov/succesmål, systemgrænser, vigtigste kodevalg og den første afprøvelige del i reviewpakken. Markér især væsentlige valg med svagt grundlag. Eksisterende beslutninger genbruges. Gustav får en kort anbefaling om reelle produkt- og arkitekturvalg; rutinevalg håndteres af agenten. Dette er fire perspektiver i én opgave, ikke fire nye agenter eller obligatoriske godkendelsesrunder.

**Under arbejdet:** byg ét lille forløb gennem eksisterende UI, lagring, runner og kontrol, hvor opgaven kræver dem. Behold den aftalte kontrolplan. Registrér bevidste afvigelser fra designet, og få væsentlige ændringer vurderet tidligt. Mockdata kan afklare formen; de dokumenterer ikke, at model, isolation eller rigtig datavej virker.

**Ved review:** kontrollér både adfærd og kodevalg, især afhængigheder, fejlhåndtering og placering af ansvar. Hvor en reproducerbar fejl rettes, skal den relevante prøve demonstrere fejlen før og virkningen efter. Før-prøven skal fejle af den tilsigtede årsag; alle tests skal ikke nødvendigvis fejle på gammel kode. Den ene evidensscorer vurderer fortsat påstandenes bevisgrundlag og er ikke en vedligeholdelsesscore.

**I piloten:** lad en senere, lille ændring bygge på første accepterede version. Notér nødvendig omarbejdning, regressioner og mennesketid. I et kontrolleret forsøg fastlægges rækkefølge og kriterier på forhånd; senere krav gives først ved deres trin. Det er vores lille diagnostiske prøve, ikke en fuld SlopCodeBench-kørsel eller bevis for langsigtet vedligeholdelse.

## Gist’en: nyttig konkretisering, for tung som standard

Playbooken konkretiserer kodeplacering, typer, kald og testplan. Den fremhæver usikre beslutninger og gemmer status til næste session. Vi indarbejder det i den eksisterende [reviewpakke](../templates/review-packet.md).

Den kræver også fire separate godkendelser, stop efter hver del og fast komprimering ved hvert skift. Vores tilpasning bruger én kort beskrivelse, løbende afprøvning og gemt fortsættelse. Behovet for menneskelig afklaring afgøres af konsekvens og eksisterende mandat; filantal eller 100 linjer udløser ikke automatisk et interview. Mockups bruges, når de afklarer en reel usikkerhed.

Testreglen er for bred: eksisterende regressionstests må gerne bestå på gammel kode. En ny prøve af den rettede fejl skal derimod kunne afsløre netop fejlen. Kontekstfiler er nyttige, men bruger stadig tokens og opmærksomhed, når agenten læser dem. En SKILL.md leverer heller ikke browser, sandbox eller modeladgang.

Gist’en er undersøgt som kildemateriale; dens instruktioner er ikke installeret eller aktiveret.

## En vigtig kildekorrektion

Artiklens kategoriske påstand om manglende benchmarks bliver senere nuanceret af Dex selv. SlopCodeBench undersøger successive udvidelser med nye krav; v2 blev publiceret 7. maj 2026. Vi viderefører derfor ikke påstanden om, at sådanne benchmarks ikke findes. Vi udleder heller ikke en aktuel modelrangliste fra hans begrænsede forsøg.

Grønne tests eller en positiv LLM-vurdering dokumenterer ikke i sig selv langsigtet vedligeholdelse. Omvendt beviser argumentet om, at en model ellers ville have skrevet god kode første gang, ikke, at modelreview er værdiløst. Review og generation kan have forskellige opgaver og kontekst. Vores beslutning er at kombinere kontroller og måle deres nytte i piloten.

Ingen nye abonnementer, runtime-frameworks, modelkald, offentlige writes eller ændringer af bachelorens problemformulering følger af denne gennemgang.
