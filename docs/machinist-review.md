# Machinist: fundament for den samlede factory

**Vurdering · 24. september 2026.** Undersøgt ved [commit 3943516](https://github.com/owainlewis/machinist/tree/39435164faf1ff7fad49e41c38a7eb1a00538f21). MIT-licens, early access. Dette erstatter vores tidligere vurdering af en ældre revision som en ren procesrunner.

**Valgt retning:** genbrug og kvalificér Machinists motor og eksisterende GUI til den færdigsamlede Arcitai-pakke. Software, security og Defense kan bruge samme platform med særskilte workflows og rettigheder. Arcitai leverer opsætning, seks skills, projektpolitik, isoleret afvikling og dokumenteret værdi. Brugeren skal ikke sammenkoble interne motorer. Den eksisterende Node-starter bevares indtil en afprøvet erstatning findes.

## Hvad findes allerede?

| Del | Verificeret i kilde/docs | Betydning for Arcitai |
| --- | --- | --- |
| Lokal/VPS-drift | Go-binær, SQLite, kontrolplan og worker; VM-guide med systemd og særskilt OS-bruger | Godt grundlag for én pakke, der kan fortsætte uden laptop |
| Udskiftelig agent | Navngivne executors med faste argumentlister; prompt via stdin | Ingen bestemt model nødvendig. Pi skal stadig kvalificeres som konkret wrapper |
| GUI | Opgaver, historik, filer, workflowoversigt, godkendelser og analytics | Prøv den eksisterende flade før et nyt dashboard bygges |
| Workflows | Ordnet kæde med versionsgemte trin, strukturerede resultater, feedback og gentagelser | Brug egentlige workflows til leveringsvejen |
| Stop/recovery | Timeout, procesgruppe-stop, leases og eksplicit genstart af afbrudte workflows | Relevant fundament; netværkstab betyder ikke, at gammel worker er stoppet |
| Målinger | Varighed, udfald og rapporteret tokenforbrug med manglende dækning synlig | Supplér med faktisk pris, mennesketid og kvalitet; tokens er ingen regning |

Kilder: [arkitektur](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/ARCHITECTURE.md), [første workflow](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/docs/task-guide.md), [VM-opsætning](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/docs/vm-deployment.md), [måleberegning](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/internal/controlplane/web/src/run-metrics.js).

## De konkrete huller, vi skal lukke

1. **Agentens rettigheder.** Standardexecutors kører med vid hostadgang. En repo-allowlist og særskilt OS-bruger adskiller ikke agenten fra alle den brugers credentials. Vores job skal afskærmes fra controller, releasecredentials og privat evaluator. GUI/API er en privat, enkeltoperatørflade; en fælles token er ikke flerbrugerlogin. [Security-kontrakt](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/SECURITY.md).
2. **Workflows er sikrere at fortsætte end rå commands.** Et workflow med mistet lease bliver afbrudt og kræver bekræftet stop før retry. Almindelige commands kan blive lagt tilbage i køen, mens den tidligere proces stadig kører ved netværkstab. En enkelt writer skal også være beskyttet mod andre jobs i samme workspace; `max_concurrent_jobs = 1` alene beviser ikke dette efter en mistet lease. [Lease-kode](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/internal/controlplane/workflows.go#L270), [heartbeat](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/internal/managedworker/worker.go#L122).
3. **Issue-triggeren starter endnu commands.** Workflows kan startes fra UI/API/CLI, men de indbyggede periodiske triggers vælger commands. Hele issue → workflow-vejen skal derfor integreres og afprøves, med deduplikering og autoriseret aktør. Ingen ekstra parallel scheduler som genvej. [Workflowgrænser](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/docs/workflows.md).
4. **Resultat er ikke kvalitetsbevis.** Exit 0 uden resultat fejler et workflowtrin; et gyldigt agentrapporteret `complete` er stadig ikke uafhængig verifikation. Krævede checks, præcis revision, separat review og begrænsede reparationsforsøg skal følge Arcitais kontrakt.
5. **Risiko og økonomi.** [Mergeeksemplet](https://github.com/owainlewis/machinist/blob/39435164faf1ff7fad49e41c38a7eb1a00538f21/examples/workflows/risk_delivery/README.md) adskiller agentvurdering og kodepolitik, men bruger en snæver fil-/størrelsesregel. Dets script accepterer også visse skipped/neutral checks; det beviser ikke, at vores krævede checks kørte. Vi overtager ingen mergeautoritet. [Relativ risiko](relative-risk.md), budgetstop og faktisk pris skal tilpasses projektet.

## Første gennemgående prøve

Ét syntetisk repo → isoleret job → resultat i Machinists GUI → godkendelse → verificeret aflevering. Prøv også manglende resultat, fejlet check, ændret revision, mistet worker og genstart uden to writers. Bevar budget og artifacts. Derefter én rigtig appopgave med valgt agent; Pi følger som portabilitetsprøve. Først derefter aktiveres automatisk issue-start.

Motoren skal erstatte mere kode, end integrationen tilfører. Ved adoption ejer Machinist kø og forsøg; vores gamle journal må ikke også starte jobs. Den portable metode og appens CI/CD/deployment bevares. Versionsfastlåsning, backup/restore og opgradering skal prøves før en kundepakke udgives.

**Faktisk afprøvet:** den fastlåste kilde bygger. Runner-, worker- og kontrolplantests gav 322 beståede test-/subtestresultater og to skips: Darwin på Linux og en ikke-konfigureret live GitHub-prøve. Seks lokale proces-/API-prøver bestod, inklusive godkendelse over genstart, manglende resultat, fejlet proces, timeout og cancellation. Det var syntetiske executors i en container uden netværk/modeladgang. Den rigtige Arcitai-/apppilot og isolation mod en agent er stadig ikke kvalificeret. [Detaljer og begrænsninger](proof.md).
