# Installation: én tjeneste ad gangen

Udkast til operations-profilen; se [den overordnede research](../../docs/defence-research.md).

Dette er et manuelt beslutningsark, ikke en konfiguration der starter noget. Ukendt er et legitimt felt; det bliver en synlig opgave.

| Felt | Udfyld pr. tjeneste |
| --- | --- |
| Kunde, tjeneste, miljø | Entydig identitet; adskil kunders sager og adgang |
| Ejer og eskalation | Navngiven ansvarlig, kontaktvej, forventet reaktionstid og erstatning ved fravær |
| Drift og kode | Host, repo eller leverandør; læseadgang; faktisk deployed revision/artifact |
| Forretningskritisk funktion | Fx gennemfør en booking; tilladt fejl-/nedetidsniveau og relevant alarmregel |
| Signaler og huller | Uptime, fejl, adgang, dependencies, udløb, backup/jobs; kilde, friskhed og hvad der endnu mangler |
| Dependency-grundlag | Lockfile/SBOM/image for den deployed version; understøttede økosystemer og scanstatus |
| Alarmer og sager | Direkte kritisk alarmvej, privat sagssystem, deduplikering og ejer af sagstilstand |
| Agent og specialist | Harness, model, eventuel security-specialist; læseværktøjer og begrænset jobbudget |
| Data | Privat evidenslager, persondataredaktion, retention/sletning, region og eventuel modeloverførsel |
| Driftsrettigheder | Hvem må undersøge, afbøde, rollbacke, ændre konfiguration og deploye; konkrete runbooks |
| Verifikation | Påkrævede checks, faktisk release, observationsvindue, friskhed og hvem der godkender lukning |
| Omkostninger | Sensor/host/loglager, modelbrug, mennesketid og eventuelle abonnementer |

## Lean start uden stort lokalt setup

Brug hostingens eksisterende overvågning og alarmer, privat issue-/sagskø, eksisterende dependency-bot og dit valgte agentmiljø. Tilføj én uafhængig uptime-kontrol, hvis den mangler. Intet krav om Arcitais server eller dashboard.

Hvis du ejer driften: et lille altid tilgængeligt miljø kan køre sensorer og planlagte checks. Din Mac/Z13 kan udføre agent-/scannerjobs, når den er tilgængelig. En slukket laptop kan ikke være eneste døgnvagt. Overvåg også selve monitorens friskhed fra et andet fejlområde.

LLM, agentharness og security-scanner er forskellige valg. En lokal model kan fjerne API-udgiften, men skal kvalificeres til opgaven. Eksisterende abonnementers og cloudtjenesters vilkår afgør, hvad der er inkluderet. Hardware, strøm, hosting, loglager og mennesketid tæller stadig.

## Før en rigtig pilot tæller som forbundet

- Observer et aftalt, ufarligt testsignal i det rigtige miljø og bekræft modtagelse hos den ansvarlige.
- Afprøv dubletter, ny episode efter lukning og manglende heartbeat. Dokumentér hvilke signaler der faktisk dækkes.
- Afprøv privat overdragelse til valgt team/agent med kendt omfang og adgang. Ingen rå kundelogs i et offentligt issue.
- Gennemfør én godkendt ændring via appens CI/CD; kontrollér deployed release og berørt brugerfunktion bagefter.
- Gem tid, direkte udgifter, menneskearbejde, resultat og resterende huller i [sagen](case.md).
