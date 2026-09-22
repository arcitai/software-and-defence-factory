# Genbrug Codex i en Pi-factory

**Implementeringsopdatering:** Pi RPC og den officielle Security SDK er nu integreret i CLI-jobrunneren og afprøvet med syntetiske inputs. [Aktuel status, opsætning og begrænsninger](worker-integrations.md). Afsnittene nedenfor dokumenterer researchgrundlaget før denne implementering.

Undersøgt 22. september 2026. **Anbefaling: genbrug færdige komponenter gennem deres CLI/SDK og pak én understøttet opsætning.** Pi forbliver kandidat til softwareagenten; security kan bruge en separat, færdig Codex Security-worker. Dette er en opdateret integrationsbeslutning, ikke en udført installation.

## Hvad kan genbruges?

| Del | Dokumenteret mulighed | Valg til vores første pakke |
| --- | --- | --- |
| Codex-harness | CLI, SDK og app-server er åbne integrationsflader; modeladgang og managed services er separate | Behold Codex som alternativ worker. Undgå at indlejre hele dens agent-loop inde i Pi |
| Codex Security | Offentlig CLI, TypeScript SDK og plugin med Apache-2.0-licens | Kald den færdige scanner fra controlleren; returnér fund og evidens til vores journal |
| Security-skills | Den offentlige pluginversion har genbrugelige instruktioner, men også referencescripts og host-specifikke kald | Direkte Pi-port er mulig udvikling, men kræver tilpasning og evaluering; SDK er første vej |
| Browser i desktopappen | Appens indbyggede browser er ikke tilgængelig i Codex CLI | Brug den allerede udvalgte åbne `agent-browser`-CLI i worker-miljøet |
| Computer use i desktopappen | Separat appfunktion med OS-integration | Afprøv den eksisterende Pi-extension som valgfrit modul til opgaver, der faktisk kræver desktop |

Kilder: [Codex som platform](https://developers.openai.com/blog/codex-as-a-platform), [offentligt Security-repository](https://github.com/openai/codex-security), [desktopbrowserens tilgængelighed](https://learn.chatgpt.com/docs/browser), [computer use](https://learn.chatgpt.com/docs/computer-use). Browser- og desktopkandidaternes revisioner og undersøgte begrænsninger står i [Pi-research](pi-research.md) og [kildeinventaret](pi-sources.json).

## Korrektion af den tidligere security-vurdering

Den tidligere beskrivelse var for generel om Codex-plugins. Den lokalt installerede Security-plugin 0.1.24 erklærer `Proprietary`; den offentlige plugin 0.1.95 erklærer **Apache-2.0**. Offentlig revision undersøgt: `065fc8654640f3230be00f9d7da33f25fdd07583`. Licens og proveniens skal derfor følge den konkrete kilde og version.

Vi kan genbruge den offentlige kode med dens licensvilkår. En kopieret `SKILL.md` overfører dog ikke automatisk referencescripts, scan-lifecycle, rapportkontrakt eller host-værktøjer. Den officielle SDK bevarer mere af det eksisterende forløb og reducerer vores vedligeholdelse. [Pluginmanifest](https://github.com/openai/codex-security/blob/065fc8654640f3230be00f9d7da33f25fdd07583/plugins/codex-security/.codex-plugin/plugin.json) · [licens](https://github.com/openai/codex-security/blob/065fc8654640f3230be00f9d7da33f25fdd07583/LICENSE) · [scan-skill](https://github.com/openai/codex-security/blob/065fc8654640f3230be00f9d7da33f25fdd07583/plugins/codex-security/skills/security-scan/SKILL.md).

SDK'en understøtter også konfiguration af Bedrock, OpenRouter og Fireworks. Det er ikke dokumentation for, at vores konkrete Kastanje-/Ollama-route allerede virker. Daybreak-adgang i appen beviser heller ikke adgang via SDK eller Pi. Credentials og eventuel Trusted Access skal gælde den faktisk valgte model og route. [SDK og providerkonfiguration](https://learn.chatgpt.com/docs/security/sdk).

## Den lean produktpakke

Én brugeropsætning skal samle:

1. **Factory:** dashboard, GitHub-synkronisering, kø, budget, review og evidens.
2. **Software-worker:** Pi, projektets testværktøjer, browser-CLI og få relevante skills. Søgning konfigureres til researchopgaver.
3. **Security-worker efter behov:** den officielle Codex Security CLI/SDK og relevante faste checks. Ingen ekstra agent skal bare videresende prompts til denne worker.
4. **Desktop som tilvalg:** kun til opgaver, der kræver programmer uden for browser/terminal.

Brugeren skal vælge repo og modeladgang; vi skal pakke og teste de øvrige versionsvalg samlet. Én understøttet standardprofil giver mindre opsætning end en katalogside med mange valgfrie extensions. En sådan samlet installer er **endnu ikke bygget**.

Controlleren ejer start, timeout og resultatkontrakten. Security SDK kører med processens OS-rettigheder uden interaktive godkendelser; derfor skal den ligesom Pi køre i det afgrænsede worker-miljø. Det løses ikke af en skill. Fund opbevares privat uden for checkout. [SDK'ens afviklingsgrænser](https://learn.chatgpt.com/docs/security/sdk).

## Udskiftelighed og næste bevis

Bevar issues/kode i Git, skills som filer, hændelser og resultater i eksporterbare formater og en fælles worker-kontrakt. Security-modulet må kunne erstattes eller slås fra uden at bryde softwareforløbet. Det giver en konkret exitvej, selv når en valgt model eller tjeneste er lukket.

Næste bevis er ét syntetisk security-job gennem den officielle CLI/SDK: start, stop, fejl, fund/coverage, faktisk commit og forbrug skal ende korrekt i vores kontrakt. Derefter afprøves den valgte provider. I denne undersøgelse er kun dokumentation, kildekode, lokale manifests og CLI-hjælp læst; ingen security-scans, modelkald eller browser-/desktopinstallationer er kørt.
