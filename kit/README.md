# Sæt en eksisterende app i factoryen

Denne pakke lægger en fælles arbejdsmetode ind i **dit app-repo**. Appens sprog, arkitektur, CI og hosting bevares. Du vælger agent/harness, model og arbejdsmiljø. GitHub issues, checks og PR’er kan være hele kontrolpanelet; Arcitais runner og dashboard er valgfrie.

## Det får du

- Seks portable skills til afgrænsning, specifikation, implementering, review, security og evaluering. Kun relevante skills bruges på en opgave.
- [Fælles arbejds- og sikkerhedsregler](policy.md), inklusive vertical slices og krav til beviser.
- [Ét installationsark](installation.md) til projektets konkrete valg og afprøvninger.
- [En kort afleveringsskabelon](delivery.md) til PR eller privat review, inklusive de fem målepunkter.
- Et inaktivt [GitHub CI-eksempel](examples/github-checks.yml.example). Det kræver projektets rigtige checkkommando og skal vælges eksplicit.

Pakken starter ingen agent, ændrer ingen konti og giver ikke adgang til modeller, browsere eller deployment. Disse funktioner leveres af det valgte miljø og kontrolleres ved opsætning.

## Tilslut uden at flytte appen

1. Eksportér en versioneret pakke fra software-factory-repoet til en **ny mappe**. Gennemse filerne. Eksporten er staging, ikke en installer.
2. Lav en ændring i appens egen branch: kopiér pakkens `.factory-kit/` og de ønskede `.agents/skills/factory-*`. Tilføj issue-formen, hvis projektet mangler en passende. Bevar eksisterende filer med samme navn og sammenflet bevidst.
3. Tilføj én henvisning i appens eksisterende `AGENTS.md` eller harnessens tilsvarende indgangspunkt: “For factory-opgaver, læs `.factory-kit/policy.md` og `.factory-kit/installation.md`; brug de relevante factory-skills.” Er der ingen instruktionsfil, kan agenten oprette en lille én. Lokale projektregler og brugerens mandat bevares.
4. Lad opsætningsagenten undersøge repoet og udfylde installationsarket fra eksisterende commands, CI, deployopsætning og kendte præferencer. Ukendte adgange markeres som manglende. Der skal ikke vælges en ny stack alene for at passe i pakken.
5. Afprøv én lille vertical slice i det valgte miljø. Vis læste instruktioner, nødvendige tools, faktisk test, review og aflevering. Kvalificér derefter automatisk start, stop og genoptagelse, hvis det ønskes.

**Agentprompt til opsætningen:**

> Tilslut denne app til den vedlagte factory-pakke. Bevar eksisterende arkitektur, instruktioner, CI og deployment. Udfyld installationsarket ud fra repoet og mine kendte valg; markér manglende adgang frem for at gætte. Brug GitHub som arbejdsflade. Tilføj kun manglende integrationsdele. Start med én lille, afgrænset opgave med beviser. Aktivering af konti, betalt drift, merge og deployment følger mit eksisterende mandat.

Et harness skal enten opdage skills-mapperne eller få de valgte filer eksplicit. Verificér det; kopiering alene beviser ikke discovery. Én installation kan bruge en managed cloud-agent, en anden Pi eller Codex på en dedikeret maskine. En lokal maskine skal være tændt for at udføre lokale jobs. Et cloudjob kræver ikke, at din laptop er tændt, men automatisk start kræver en valgt trigger, som faktisk kører i skyen.

## Når det kører

**Issue → afgrænsning → godkendt opgave → agent → checks og review → PR → release efter projektets politik.** En label er et signal; autoriseret aktør, scope, værktøjer og forbrug kontrolleres af den valgte integration. Hold kun én integration ansvarlig for at starte samme opgave.

Vælg én af tre driftsformer i installationsarket: manuel start, providerens egne automations eller egen runner. Manuel start er et gyldigt første setup. Automatisk start må først kaldes afprøvet efter en rigtig hændelsesprøve; stop og recovery prøves særskilt. En skill er ikke en scheduler.

Opdater ved at eksportere en ny pakke og reviewe forskellen i app-repoet. `manifest.json` i den eksporterede `.factory-kit/` angiver kildeversion og filhashes; det er provenance, ikke en signatur eller en runtime-konfiguration. Projektets udfyldte installationsark skal bevares.

MIT. Kilderepoets LICENSE kopieres med som `.factory-kit/LICENSE`; den ændrer ikke appens licens. Ingen tredjepartsskill eller cloudtjeneste er indbygget i denne pakke.
