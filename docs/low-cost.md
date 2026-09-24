# Lavprisprofil: GitHub som arbejdsflade, egen compute

**Kontrolleret 24. september 2026.** Ønsket er realistisk som en valgfri installation: behold issues, PR’er og almindelig CI/CD i GitHub; kør agent og eventuelt checks på en maskine, du allerede har. Der behøver ikke være et ekstra factory-abonnement eller en egen dashboardserver.

## Actions-filen og maskinen er to forskellige valg

En YAML-workflow kan køre på GitHubs maskine eller på din egen registrerede runner. GitHubs aktuelle dokumentation siger, at self-hosted Actions-kørsel er gratis. Den bruger ikke puljen til GitHub-hosted minutter. Standard hosted-runners er også gratis i offentlige repos; private repos har en inkluderet pulje. Artifact-/cachelager har egne regler. [GitHub-fakturering](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

For en **kvalificeret, dedikeret Linux-runner** kan jobvalget eksempelvis være:

```yaml
runs-on: [self-hosted, linux, arcitai-ci]
```

Det er runnerlabels, ikke installation af en runner. Registrering, labels, adgang og testmiljø skal sættes op; manglende runner giver kø, ikke automatisk flytning til betalt compute. Den skal være tændt og forbundet. [Self-hosted runners](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners).

Brug et afgrænset miljø til godkendte repositories og bidragydere. Giv ikke ukendt PR-kode en runner med adgang til dit personlige hjem, modelnøgler eller deployment. Ved eksterne bidrag kræves en passende isoleret/ephemeral runnerløsning eller andet egnet CI-miljø. En label er routing, ikke isolation.

## Det almindelige udviklingsforløb bevares

| Arbejde | Hvor og hvornår |
| --- | --- |
| TDD og implementering | Agentens udviklingsmiljø: relevant test afslører fejlen/ønsket adfærd → kode → testen består → relevant refaktorering; stadig små vertical slices |
| CI | Actions eller eksisterende CI genkører rigtige tests, build/type/lint og relevante hurtige security-checks på den konkrete ændring |
| CD | Eksisterende deploymentintegration eller separat workflow efter projektets regler; samme godkendte revision og nødvendige miljørettigheder |
| Længere agentarbejde | Den valgte lokale proces eller managed agent. CI behøver ikke vente i en lang agent-loop |
| Specialist-security | Afgrænset scan ved relevant risiko, fund eller aftalt baseline. Kan køre lokalt, på egen runner eller som særskilt CI-job |

TDD er metoden under udviklingen; en Actions-test bagefter er ikke i sig selv TDD. UI-/tekstændringer får passende verifikation uden kunstige tests alene for at følge en skabelon.

## Codex Security kan køre fra YAML

Den officielle [CI-guide](https://learn.chatgpt.com/docs/security/cli/ci) viser GitHub Actions og GitLab CI. Den lokale, tidligere undersøgte kildeversion har også et [Actions-eksempel med Bedrock](https://github.com/openai/codex-security/blob/065fc8654640f3230be00f9d7da33f25fdd07583/examples/github-actions/README.md). Det er et separat provider-eksempel, ikke et krav om AWS.

Vi kan vælge samme CLI på et kvalificeret eget arbejdsmiljø. CLI-adgang, modelafregning og runneromkostning er særskilte forhold. Start med et afgrænset diff-scan; store scanninger vælges efter behov. Bevar coverage, fund og exitstatus: et fejlende eller ufuldstændigt scan må ikke blive til “ingen fund”. Ingen securityscan er kørt med denne research.

SARIF-visning i GitHub for private/internal repos kan kræve GitHub Code Security. Det er ikke nødvendigt for at gemme og reviewe en privat rapport uden denne integration. Vælg rapportdestination og retention særskilt. [Officiel CI-guide](https://learn.chatgpt.com/docs/security/cli/ci).

**En lokal scannerproces er ikke lokal inference.** En lokal/open source-model kan vælges i en egnet agentprofil; det beviser ikke, at Codex Security/Daybreak virker med den. Modeller, tools og transport skal kvalificeres, og security skal stadig levere samme bevis. De officielle CLI-dokumenter beskriver flere provider-/auth-ruter, ikke universel lokal modelkompatibilitet. [CLI-quickstart](https://learn.chatgpt.com/docs/security/cli).

## Hvad kan vi faktisk spare?

- **Ekstra factory-/dashboardabonnement:** ikke nødvendigt med den portable pakke og GitHub.
- **Hosted compute:** kan undgås ved at bruge eksisterende, egnet hardware til agent og checks.
- **LLM-API:** kan undgås for jobs, som en kvalificeret lokal model løser tilfredsstillende. Valgt cloudmodel/specialist afregnes fortsat efter sin adgangsmodel.
- **Drift:** strøm, hardware, vedligehold og appens egen hosting/databaser eksisterer stadig. En skycomputer er ikke generelt gratis, fordi agentkoden er open source.

Hvis Mac’en er lukket, kan en tændt Z13 fortsætte arbejdet. Hvis begge er slukket, kræves en ekstern worker for at fortsætte. Vi lover derfor **mulighed for ingen ekstra platforms- eller API-regning i et egnet lokalt setup**, ikke nul samlede omkostninger eller gratis døgnbemandet cloudcompute.

Installationsarket registrerer præcis, hvilke jobs der bruger hvilke runners og modeller. [CI-eksemplet](../kit/examples/github-checks.yml.example) bruger hosted Ubuntu og dermed private hosted-minutter, hvis det vælges uændret. Skift først til egne runnerlabels efter miljøets kvalifikation; aktiver ikke begge varianter uden behov. Eksemplet er inaktivt og bruger ingen minutter i denne pakke.
