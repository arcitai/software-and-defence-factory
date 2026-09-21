# Lokal model eller Kastanje-inference

## Ollama og Z13

Installér Ollama fra leverandørens officielle distribution. Vælg og hent en model, som den konkrete maskine kan køre med relevant kontekst og tool calling. Registrér model-id/digest, kvantisering, kontekst, RAM, GPU/driver, tokens/sekund og faktisk opgavekvalitet. Der er ikke målt modelperformance på brugerens Z13 endnu.

Start selve Ollama-serveren med `OLLAMA_NO_CLOUD=1`, hvis inference skal være lokal; workerens klientmiljø alene ændrer ikke en allerede kørende Ollama-server. Hold endpoint på loopback eller privat net. Brug Codex-profilen `codex-oss` og `FACTORY_MODEL` til det prøvede model-id. Kontroller netværkstrafik/logs i den konkrete opsætning: web research, pakker og eksterne MCP-værktøjer kan stadig sende data ud.

Eksempel efter den fælles preflight:

```sh
FACTORY_MODEL=your-tested-model FACTORY_WORKER_ISOLATED=1 \
  FACTORY_CODEX_HOME=/private/codex-home \
  npm run worker -- --task TASK_ID --workspace /worker/checkout \
  --preflight /private/preflight.json --execute
```

## Kastanje som målprofil

Kastanje er en valgfri inference-rute og et muligt pilotprodukt. Den er ikke en forudsætning for factoryen. Den tidligere projektkontekst viser en begrænset Codex/GPT-OSS-prøve; denne aflevering har **ikke** kørt et nyt integreret Kastanje-job eller et fair modelbenchmark.

Kopiér `kastanje.config.example.toml` til workerens særskilte `CODEX_HOME/kastanje.config.toml`. Erstat endpoint og model med verificerede værdier. Nøglen gives i workerens `KASTANJE_API_KEY`, aldrig i Git eller UI. Profilen skal være en bruger/worker-profil; regn ikke med at et målrepos `.codex/config.toml` kan definere modelprovider.

Før profilen bliver anbefalet til kunder skal den konkrete rute bestå: Responses API-format og streaming; gentagne tool calls og korrekt tool-resultatbinding; timeout/cancel og uafklaret forbrug; modelkontekst/trunkering; ensartede authfejl; forbrugsidentitet og fakturareconciliation. “OpenAI compatible” kan betyde kun Chat Completions og er ikke i sig selv nok for denne Codex-konfiguration.

Dokumentér region for inference **og** worker, Git/kildekode, kontrolplan, logs, backups, MCP, webværktøjer og support. Kunder med et strengt samlet EU-krav kan kræve egen Git-forge, EU-controller og begrænset egress. GitHub kan senere erstattes gennem en forge-adapter; v0.1 har kun GitHub-adapteren.

Prisen består af model, compute/platform, eventuelle reviewmodeller, drift og mennesketid. Åbne vægte er ikke nødvendigvis en OSI open source-licens; vurder hver models licens og kommercielle anvendelse konkret. Ingen automatisk fallback til en anden region/provider.

Kilder: [Codex providerkonfiguration](https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers), [Ollama FAQ](https://docs.ollama.com/faq), [Ollama GPU](https://docs.ollama.com/gpu).
