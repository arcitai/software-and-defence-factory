# v0.2: afprøvet og endnu ukendt

**24. september 2026 · testudgave.** Denne side gælder CLI'en i `bin/` og runtime i `factory/`. Den gamle Node-prototypes historik ligger i [proof.md](proof.md).

## Faktisk afprøvet

| Bevis | Resultat |
| --- | --- |
| Ren privat demo-state, uden global Machinist/Go | CLI hentede checksum-verificeret source, byggede Machinist og jobimage, startede server/worker og indsendte opgave |
| Frisk klon fra GitHub | Den publicerede pakke installerede selv og gennemførte softwareforløbet til godkendt handoff; ingen filer fra den oprindelige arbejdsmappe var nødvendige |
| Builderens filrettigheder | Go-builder kørt som operatørens UID/GID med midlertidige caches; en ny installation byggede en operatørejet binær og gennemførte demoen. Undgår root-ejede bind-mount-filer på Linux |
| GitHub CI | Den publicerede pakke bestod npm-installation og alle 38 checks/tests på Ubuntu; CI kører ingen agent/modeljobs |
| `npm run check` | 38 tests samt JavaScript-/JSON-kontrol bestået |
| `npm run probe:platform` | Docker/Machinist-integration: normal aflevering, ændret kandidat, ændret checkpolitik, fejlet test + retry, cancel, deadline, incident-dedup og stop/restart |
| Softwarebevis | En rigtig Git-ændring fra broken til fixed; checks/review og godkendelse knyttes til samme commit og politik. Appens originalcheckout bevares |
| Agentgrænse | Inspiceret kørende container: ikke-root, read-only root, capabilities fjernet, ingen Docker-socket, Git-metadata read-only. Demoens netværk er deaktiveret |
| Recovery | Genstart bevarer interrupted; retry kræver stoppet container og fravær af gammel executor/procesgruppe. Ingen automatisk overtagelse af ukendt skriver |
| Defence | Privat optagelse, scope-validering, dedup/konflikt, jobbinding, ukendt admission og typet uverificeret rapport. Sagen forbliver åben |
| Uafhængigt Defence-review | Den koordinerede opgave gennemgik fire konkrete fund; rettelser genlæst og seks relevante tests bestået |
| UI | Faktisk Machinist-board, patchpreview, godkendelse og succeeded aflæst i browseren. Smal visning kontrolleret; analytics viser manglende tokens som Unavailable |
| Agentpakker | Pinned Codex/Pi starter og deres CLI-argumenter er kontrolleret via `--help`; ingen inference-login eller betalt modelkørsel |

Integrationen er kørt på **macOS arm64 med Docker Desktop**. Machinist er pinnet til `39435164faf1ff7fad49e41c38a7eb1a00538f21`; source-arkiv SHA256 er `b78c9d68455dafa4fde2884845fbdf4f977f62642fc74b75d0b8b54d6184e8a7`. Individuelle agentpakker og base-/buildimages er pinnet; OS-pakker og transitive npm-afhængigheder gør ikke hele imagebuildet bitreproducerbart. Installationen gemmer det faktiske image-ID og binærhash privat.

En race mellem container-listning og normal oprydning blev fundet og rettet under testen. Den endelige probe kører også kontrollerede fejl; dashboardets succesprocent for demoen er derfor ikke en kvalitetsbenchmark.

## Hvad dette ikke beviser

- Ingen rigtig model-/kundepilot eller målt besparelse. Testagenten er eksplicit syntetisk.
- Ingen fuld installation på en rigtig Linux-VPS/WSL2, ingen systemd-bootprøve og ingen hardwaretest af lokal inference. De profiler har vejledning; de er ikke driftserfaring.
- Ingen automatisk PR, issue-polling, deployment, merge eller live telemetry-connector. PR og incident-handoff er manuelle i denne udgave.
- Ingen vedvarende sikkerhedsscanner, verificeret rodårsag eller produktionsrecovery. Codex Security/Daybreak er ikke automatisk installeret eller tilgængelig via en almindelig Codex CLI.
- Ingen flerbrugeradgang, kundeadskillelse eller kvalificeret sandbox til fjendtlig kode. Controllerkonto, Docker og egne repo-/modelprofiler er betroet. Inference-nøglen er tilgængelig i agentprocessen; checks kører uden den.
- Tid gemmes pr. forsøg. Et brat dræbt forsøg kan mangle en detaljeret målefil; Machinists runhistorik bevares. Pris, faktisk modelbrug og mennesketid er ukendt, ikke nul.

## Gentag og fortsæt

Kør demoen, review/godkend den, og kør derefter `npm run probe:platform`. Proben kræver en mock-installation uden aktive opgaver, gemmer privat `qualification.json` og gendanner konfigurationen efter testen. Den starter ingen cloudkonti og kalder ingen model.

Næste acceptprøve: ét eksisterende app-repo, én valgt inferenceprofil og én reel vertical slice. Dokumentér test før/efter, korrekt revision, menneskelig reviewtid, faktisk modelregning og eventuelle fejl efter aflevering. Afprøv derefter samme forløb på en dedikeret Linux-VPS. Bevar appens egen CI/CD.
