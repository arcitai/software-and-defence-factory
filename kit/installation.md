# Installation for denne app

**Status: ikke konfigureret.** Agenten udfylder fra repoet og kendt autorisation. Dette er et læsbart installationsark, ikke en maskinlæst config eller automatisk håndhævelse. Ingen secrets i filen. Manglende valg blokkerer kun den funktion, der kræver dem.

| Valg | Projektets konkrete svar / kilde |
| --- | --- |
| Repo, app, ejer og hovedbranch | Ikke udfyldt |
| Eksisterende instruktioner og arkitektur | Ikke udfyldt |
| Produktets formål, vigtigste brugerrejser og ikke-mål | Henvis til eksisterende produktbrief/spec og tests; ny stor PRD er ikke påkrævet |
| Beviser for appens faktiske værdi | Navngivne bruger-/API-prøver, testdata og kobling til leveret revision; visuelle krav henviser til appens designkilde |
| Kontrolpanel | GitHub issues/checks/PR’er som udgangspunkt; registrér et eventuelt andet valg |
| Agent/harness og version | Ikke valgt; fx Codex, Cursor, Pi eller anden egnet agent |
| Model/provider og afregning | Ikke valgt; abonnement, API eller lokal inference med kendte grænser |
| Arbejdsmiljø | Ikke valgt; managed cloud eller dedikeret lokal/egen cloud-worker |
| Nødvendige capabilities | Filer, shell, Git og tests; browser ved UI; søgning/desktop/security efter opgaven |
| Start, stop og recovery | Manuel start indtil afprøvet automation; én valgt ejer af jobrouting |
| Opgavemandat | Hvem må starte hvad; repo/scope, netværk og credentialreferencer; ingen nøgleværdier |
| Forbrugsgrænser | Jobtid, højst samtidige jobs, forsøg og providerens faktiske stop; ukendt indtil prøvet |
| Setup og testdata | Eksakte install/setup-kommandoer, versioner, privat testmiljø og fixturedata |
| Runner og lager | Hosted eller self-hosted pr. job; faktisk runner/labels, tilladt kode og artifact-/cache-retention |
| Krævede checks | Eksakte eksisterende kommandoer/checknavne; hvor de kører og hvilken revision de tester |
| Security | Hurtige kontroller, specialist ved risiko, privat fundkanal og eventuel periodisk gennemgang |
| Risikokontekst | Berørte brugere/data, eksponering, kritiske flows og muligheder for at opdage/gendanne fejl; projektspecifikke review-/releasekrav |
| Branch/PR-regler | Én writer; valgte rettigheder til branch/PR. Eksisterende rulesets og reviewansvar |
| Deployment og rollback | Eksisterende host og CD; preview/produktion, godkender og recovery. Ikke valgt betyder intet deploy |
| Data og beviser | Tilladte regioner/destinationer for model, worker, Git, artifacts/logs og backup; retention |
| Målinger | Hvor afleveringskort, direkte udgift, mennesketid og observation efter release gemmes |

## Afprøv det valgte setup

| Prøve | Resultat, dato, revision og bevis |
| --- | --- |
| Agenten kan finde de aftalte instruktioner og skills | Ikke afprøvet |
| En lille opgave kan udføres med de nødvendige værktøjer og rigtige checks | Ikke afprøvet |
| Fejlede/manglende checks og stale revision giver ikke accept | Ikke afprøvet |
| En relevant bevidst fejl opdages i et isoleret testmiljø; baseline består | Ikke afprøvet; kalibrér den valgte kritiske bruger-/API-prøve ved første opsætning |
| Agentens jobmiljø kan ikke læse controller/adminnøgler eller private evaluatorressourcer | Ikke afprøvet; worktree eller instruktionsfil er ikke en isolationsprøve |
| Review og evt. PR virker med valgte rettigheder | Ikke afprøvet |
| Cloudopgave kan følges igen efter klienten lukkes, hvis cloud vælges | Ikke afprøvet / ikke relevant med begrundelse |
| Automatisk trigger giver ét job; dublet, stop og restart håndteres | Ikke afprøvet; ingen påstand om ubemandet drift |
| Forbrug og faktisk stop kan kontrolleres før ubemandet betalt brug | Ikke afprøvet |
| Release/rollback virker i valgt testmiljø, hvis deployment er tilsluttet | Ikke afprøvet |

For hver prøve: skeln mellem syntetisk test, rigtig integration og rigtig modelkørsel. En godkendt installation gælder denne kombination af repo, harness, model og miljø; væsentlige ændringer kræver relevant ny kvalifikation. Først efter en reel hændelsesprøve ændres status til automatisk drift afprøvet.
