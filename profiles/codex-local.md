# Codex som første lokale harness

Codex CLI er open source; det gør ikke OpenAI-modeller, inference eller abonnementer open source/gratis. CLI kan køre lokalt med et eksternt modelkald, eller med `--oss --local-provider ollama --model <afprøvet-model>`.

Den installerede CLI blev undersøgt med `codex exec --help`. Starteren bruger `exec --json --sandbox workspace-write --ignore-user-config -c approval_policy="never"`, en gennemgået worker-profil og prompt på stdin. Ingen yolo/bypass. Auth følger workerens særskilte CODEX_HOME. CLI-versioner kan ændre flags; kør doctor og preflight efter opdatering.

Kopiér `factory.config.toml` fra denne mappe til workerens særskilte `FACTORY_CODEX_HOME`. Profilen er bevidst minimal. Tilføj kun afprøvede MCP/browser-værktøjer i workerens profil og dokumentér netværksbehov. En headless worker arver ikke denne samtales browser, plugins eller desktop-computer-use. Projektets lokale config og hooks er også kode/adgang, som skal gennemgås.

| Lag | Prøve før første rigtige issue |
| --- | --- |
| Filer/shell/Git | Læs fixture, skriv fil i checkout, afvikl én test, kontrollér diff |
| Browser | Start testapp, navigér, udfør konkret interaktion og gem bevis |
| Web | Kildeopslag med dokumenteret dataoverførsel og værktøj |
| Model | Flere værktøjskald og fejlrecovery, ikke kun et tekstsvar |
| Security | Installér specialistværktøjer særskilt og verificér fund på en kendt fixture |
| Drift | Stop et job, genstart controller, afstem og genoptag uden dublet |

Den nuværende worker kører på POSIX (Linux/macOS/WSL2). Windows-native procestræshåndtering er ikke implementeret. På Z13 er model, kontekst og RAM/GPU-udnyttelse et målepunkt; hardwaregeneration og RAM er ikke fastlagt i researchen. Begynd med én worker og korte afgrænsede opgaver.

Kilder: [Codex CLI](https://github.com/openai/codex), [exec](https://learn.chatgpt.com/docs/developer-commands#codex-exec), [custom providers](https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers).
