# Sag, overdragelse og dokumenteret værdi

Udkast til operations-profilen; se [den overordnede research](../../docs/defence-research.md).

Manuel skabelon. Opret først en kandidat og udfyld fakta løbende; ukendt bliver ikke til nul. Gem følsomme oplysninger i den valgte private sagskanal.

## Sag

- Sags-ID og episode:
- Kunde / tjeneste / miljø / ejer:
- Klassifikation: drift / sikkerhedskandidat / bekræftet sikkerhedshændelse / vedligeholdelse / dækningshul:
- Faktisk release/artifact og kilde til observationen:
- Påvirket funktion, omfang, alvor og begrundelse:
- Første kendte observation / modtaget / anerkendt af ansvarlig:
- Signalernes dækning, friskhed og eventuelle huller:
- Private evidensreferencer; fakta adskilt fra hypoteser:
- Allerede udført indsats, autoritet og resultat:

## Opgave til Software Factory, eksisterende team eller leverandør

- Modtager, repo eller leverandørkontakt; overordnet sag og eventuel eksisterende opgave:
- Valideret problem, reproduktion eller begrundet usikkerhed:
- Accepteret omfang og tilladte filer/systemer; én første vertical slice:
- Observerbare acceptkriterier og regressionstest:
- Påkrævet security-review efter risiko:
- Rollback/recovery og godkendt releasevej:
- Aflevering: konkret revision, checks, fund og resterende usikkerheder:
- Verifikation i drift: miljø, releasekilde, relevante checks og observationsvindue:

## Genoprettelse og opfølgning

- Afbødningstid og faktisk effekt:
- Deploy/rollback-reference, tidspunkt og observeret release:
- Checks efter ændring; beviser, tidspunkt, udfører og observationsvindue:
- Tidspunkt for verificeret genoprettelse; resterende dækningshuller:
- Beslutning: åben / afbødet / genoprettet / lukket som falsk alarm / lukket; begrundelse og ansvarlig:
- Resterende årsagsopgave, vedligeholdelse eller gentagelse:

## Målinger

| Mål | Registrér |
| --- | --- |
| Dækning | Hvilke tjenester/signaler observeres faktisk; sensorer med gammel/manglende data |
| Reaktion | Fra første kendte observation til modtagelse, anerkendelse, afbødning og verificeret genoprettelse hver for sig |
| Støj og kvalitet | Dubletter, falske alarmer, bekræftede sager, genåbnede/gentagne problemer; behold nævner og periode |
| Vedligeholdelse | Alder på relevante åbne fund, update-PR → faktisk deployed version, fejlede opgraderinger |
| Indsats og pris | Alle forsøg, modeludgift, allokeret drift/lager og mennesketid til setup, triage, review og recovery |

En logpost beviser sjældent, hvornår et problem reelt begyndte. Kald derfor målet reaktion fra *første kendte observation*, medmindre starttid kan dokumenteres. Mål succes mod en registreret baseline og lignende sager; opfind ikke undgåede hændelser eller besparelser. Bachelorpiloten kan bruge en kontrolleret, mærket testhændelse og observeret mennesketid. Replay-fixturen er udviklingsevidens, ikke en effektmåling.
