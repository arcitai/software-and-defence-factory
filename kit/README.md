# Tilslut appen og gennemfør første opgave

**Arcitai Software & Defence Factory** giver dit app-repo en fælles metode til udvikling, security og review. Start med den agent, du allerede bruger. Appens kode, arkitektur, CI og hosting bevares.

## 1. Giv pakken til din agent

Brug den eksporterede pakke. Åbn app-repoet i din valgte agent, giv den pakkens placering, og brug denne besked:

> Tilslut denne app til den vedlagte factory-pakke på en branch. Læs først appens instruktioner, arkitektur, tests og CI. Følg opsætningstrinnene nedenfor, og udfyld installationsarket ud fra repoet og mine kendte valg. Bevar eksisterende filer og sammenflet bevidst. Markér manglende adgang. Brug manuel start og GitHub til issues, checks og PR’er. Vis, hvad der er tilsluttet, afprøvet eller stadig mangler. Konti, betalt drift, publicering og deployment følger mit eksisterende mandat.

Agenten udfører opsætningen; du behøver ikke udfylde hele installationsarket på forhånd. Manglende adgang blokkerer kun det trin, der kræver den.

## 2. Agentens opsætning

1. Kopiér `.factory-kit/` og relevante `.agents/skills/factory-*` ind på appens branch. Tilføj den medfølgende issue-form, hvis appen har brug for den. Sammenflet navnesammenfald; overskriv ikke projektets instruktioner eller konfiguration.
2. Tilføj en henvisning i appens `AGENTS.md` eller agentens tilsvarende indgangspunkt: “For factory-opgaver, læs `.factory-kit/policy.md` og `.factory-kit/installation.md`; brug relevante factory-skills.” Opret kun en ny instruktionsfil, hvis appen mangler den. Bevar lokale regler og brugerens mandat.
3. Udfyld [installationsarket](installation.md) fra eksisterende setup og kendte valg: agent, miljø, checkkommandoer, adgang, forbrug og releasepolitik. Ingen secrets i Git. Arkets tekst er dokumentation; det konfigurerer ikke tjenester.
4. Kontrollér, at agenten kan læse de valgte skills og faktisk har de nødvendige værktøjer. Afprøv appens relevante checks. Det [inaktive CI-eksempel](examples/github-checks.yml.example) tilpasses kun, hvis det udfylder et konkret hul i appens CI.

De seks skills dækker triage, spec, implementering, review, security og evaluering. Brug dem, opgaven kræver. [Fælles regler](policy.md).

## 3. Send første opgave

Vælg en lille, eksisterende fejl eller forbedring. Beskriv:

- Hvilken brugeradfærd skal ændres?
- Hvad skal fungere bagefter, og hvad må ændres?
- Hvilken test eller observation kan demonstrere resultatet?

Agenten bygger én gennemgående vertical slice, kører relevante checks og afleverer til separat review med [afleveringskortet](delivery.md). PR kræver den aftalte GitHub-adgang; mangler den, afleveres branch/diff og beviser med tydelig status. Registrér faktisk tid og forbrug, hvor de er tilgængelige. Manglende tal er ukendte.

**Første prøve er bestået**, når ændringen virker, krævede checks består på den afleverede revision, og reviewet kan vurdere beviserne. En demo eller kopierede skillfiler er ikke i sig selv en bestået installation.

## Når første opgave virker

Vælg eventuelt automatisk start fra issues gennem agentudbyderens integration eller egen runner. Afprøv ét job, dubletter, stop og recovery før ubemandet drift. En skill starter ingen scheduler. Lokale jobs kræver en tændt maskine; et afprøvet cloudsetup kan fortsætte, når din laptop er lukket. Merge og deployment følger appens releasepolitik.

Opdater pakken ved at eksportere en ny version og reviewe forskellen. Bevar projektets udfyldte installationsark. `.factory-kit/manifest.json` registrerer kildeversion og filhashes; det er provenance, ikke en signatur eller runtime-konfiguration.

MIT. Pakkens LICENSE ændrer ikke appens licens. Der er ingen obligatorisk provider, global skillinstallation eller Arcitai-runtime.
