# Eksperiment: signal → sag → kontrol i drift

**Status: afgrænset prototype til en mulig operations-profil.** Defence Factorys foreslåede kerne er proaktiv sikkerhedsundersøgelse og verificeret udbedring; læs [researchen](../../docs/defence-research.md) først. Driftskoden her er ikke koblet til dashboard, sensorer eller den eksporterede Software Factory-pakke.

## Afprøv lokalt

Fra kilderepoets rod, med Node 22.13+:

```sh
node experiments/defence-operations/replay.mjs
```

Eksemplet læser kun den medfølgende syntetiske fixture og skriver JSON til terminalen. Tre leveringer bliver to unikke signaler i én sag. Sagen indeholder et opgaveudkast og en anbefalet alarmvej; intet bliver sendt. Forkert deployed release holder vurderingen åben. Et sammenhængende evidensark gør sagen klar til review; det autentificerer ikke beviser og lukker ingen sag.

[Regler og format](policy.md) · [Installationsudkast](installation.md) · [Sag og målinger](case.md) · [Mulige driftskomponenter](sources.md).

Tre udkast til operations-skills ligger under `skills/` til senere vurdering. De er ikke installeret i `.agents/skills`, og eksportkommandoen medtager dem ikke.

## Hvad eksperimentet mangler

Proaktiv discovery, egentlig sårbarhedsvalidering og sandbox-/modelintegration er ikke implementeret her. Heller ikke rigtige sensorer, autentificeret modtagelse, varig sags-/episodetilstand, alarmlevering eller produktionschecks. Den faktiske kildeadapter skal eje kundemapping og episodens livscyklus. Et nyt episode-ID ved hver alarm ville skabe dubletter.

Referencen undersøger kun det afgrænsede forløb fra allerede normaliserede signaler til konsistente sags-/verifikationsposter. Tests dokumenterer den adfærd; de er ikke en security-scan eller et kunde-/modelbenchmark.
