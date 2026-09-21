# Cursor cloud: managed worker

Cursor er relevant, når opgaven har fordel af et klargjort cloudmiljø med browser og computer use. Det er en ekstern betalt runtime med sit eget modelkatalog. Vilkårlig Kastanje-inference i denne cloudprofil er ikke verificeret. My Machines/self-hosted tools ændrer ikke i sig selv, at agent-loopet er hosted.

## Native Automation som første cloudprøve

1. Tilknyt ét afgrænset pilotrepo og en gennemgået environment/setup. Gem project-local factory skills i repoet. Afprøv appstart, tests, browser, credentials og artifacts på syntetisk input.
2. Vælg GitHub-triggeren **issue label changed** med `factory:ready`. Den dokumenterede label-trigger er ikke det samme som et løfte om en direkte “GitHub issue created”-trigger. Nye issues går først til triage/spec.
3. Readiness sættes af en maintainer efter konkret scope/accept. Vælg event/actor-filtre, hvor produktet tilbyder dem; hvis tilstrækkelig maintainer-gate ikke kan håndhæves, brug controller-gated API-overdragelse i stedet. Et ubeskyttet offentligt label er ikke en sikker adgangsgate.
4. Jobinstruktion: læs målrepoets AGENTS.md og factory-implement, løs kun accepteret scope, afprøv kriterier, vedlæg beviser, opret kun kladde-PR hvis den konkrete automation er autoriseret til det, ingen merge/deploy. Begræns model, miljø, runtime og spend i kontoen.
5. Åbn resultatet, review selvstændigt, hent den faktiske head og forbrug, importér evidens i factoryen. Native Cursor-jobstyring er ansvarlig for providerstatus/stop. Start ikke samme issue både via native trigger og en custom API-dispatcher.

Dette repo opretter ikke automationen eller ændrer konto/repo-adgang. Det leverer metoden, jobformatet og den lokale reviewflade.

## API-alternativet

Jobpakken for `cursor-cloud` har et `cursor`-objekt til **POST `https://api.cursor.com/v1/agents`**. v1 er public beta. Den indeholder et klientvalgt `agentId`, prompt, repository, `startingRef`, `workOnCurrentBranch:false` og `autoCreatePR:false`. **Erstat `REPLACE_WITH_REVIEWED_COMMIT_SHA` med den valgte revision før afsendelse.** Ingen `main`-antagelse. Vælg et aktuelt model-id fra providerens modelkatalog, hvis en bestemt model ønskes.

API-nøglen hører til controller/dispatcher, ikke issueteksten. Persistér attempt-id og agentId *før* POST. Ved timeout er resultatet ukendt: afstem via GET agent/run-status før retry; brug samme klient-id ved afstemning. Læs den aktuelle v1-reference for status- og stopruter i stedet for at kopiere gamle v0-eksempler. Efter afvikling skal en adapter hente run-id, PR/commit, artifacts og faktisk forbrug, og bekræfte stop. Denne starter eksporterer payload; automatisk create/poll/stop/billing-adapter er ikke implementeret.

Kontrollér adgang til artifacts. Providerens delbare screenshots/video kan have andre delingsregler end dit private Git-repo. Et cloudmiljø er ikke dokumentation for EU-residency.

Kilder: [Automations](https://cursor.com/docs/cloud-agent/automations), [capabilities](https://cursor.com/docs/cloud-agent/capabilities), [setup](https://cursor.com/docs/cloud-agent/setup), [API v1](https://cursor.com/docs/cloud-agent/api/endpoints), [My Machines](https://cursor.com/docs/cloud-agent/self-hosted/my-machines).
