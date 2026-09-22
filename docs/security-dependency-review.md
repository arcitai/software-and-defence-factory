# Security SDK: dependency-kontrol

22. september 2026, den installerede npm-pakke `@openai/codex-security@0.1.29` med lockfil i `profiles/security`.

`npm audit --prefix profiles/security --omit=dev --audit-level=high --json` **bestod ikke**. Den rapporterer `extract-zip@2.0.1` og den direkte SDK-afhængighed som high. Det er en transitiv dependency-kæde, ikke to demonstrerede angrebsveje i factoryen. Registryet angav ingen automatisk tilgængelig rettelse.

De to advisories beskriver symlink-/path-traversal ved udpakning af skadelige ZIP-arkiver: [GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) og [GHSA-7pqw-9j4j-h8q3](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3). Begge omfatter den installerede version. Dette er ingen påstand om, at et angreb er udført eller en kundes data er berørt.

## Den gennemgåede inputvej

I den **installerede npm-pakkes** `dist/runtime.js`:

- `resolvePluginPath`, linje 1713, returnerer `bundledPluginRoot()` direkte, når `pluginPath` ikke er sat.
- `bundledPluginRoot`, linje 1193, finder og returnerer en allerede udpakket mappe med pluginmanifest.
- Kun en eksplicit `pluginPath`, der er en `.zip`-fil, går fra denne funktion til `extractPluginZip`; `extractZip` kaldes på linje 1592.

Factoryens adapter konstruerer SDK'en med udvalgte modeloverrides og **ingen `pluginPath`**. Konfigurationsloaderen og selve adapteren afviser nu også feltet eksplicit. Hverken issuetekst eller worker-JSON kan dermed vælge et ZIP-plugin gennem dette interface. Regressionstesten kontrollerer, at afvisningen sker før SDK-konstruktion. Den rigtige SDK-prøve anvendte den medfølgende pluginmappe 0.1.95.

Vurderingen er, at den beskrevne ZIP-inputvej ikke er eksponeret i vores understøttede adapter. Det er en afgrænset vurdering af anvendelighed og en integration, der udelukker inputvejen; **dependencyen er ikke repareret, og npm-audit er fortsat ikke grøn**. Hele SDK'en og dens øvrige features er ikke sikkerhedsauditeret her. Tilføjelse af custom plugins, ændrede modeloverrides eller en SDK-opdatering kræver ny vurdering. Worker-isolation og verificerede installerede pakker er fortsat nødvendige.

Før en kundepilot skal dependencyfundet indgå i den konkrete deploymentbeslutning. Behold modulet valgfrit; opgradér og gentag audit/prober, når upstream har en passende rettelse. Der er ikke sendt en ny advisory eller besked til leverandøren fra denne opgave.
