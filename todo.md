# Factory development queue

This is the ordering/entrypoint; linked GitHub issues own scope, acceptance and
current delivery state. Work one accepted slice at a time. The chosen product
boundary is **one controller/dashboard per project**, with common Factory
interaction and optional project identity. No global project hub is planned.

## Current slice

- [ ] [#26 — contributor and worker development foundation](https://github.com/arcitai/software-and-defence-factory/issues/26).
- [ ] [#25 — visible project identity and task composer label](https://github.com/arcitai/software-and-defence-factory/issues/25). First real local-model pilot; requires built-UI review and a PR, not just a successful model response.

## Next, in order

1. [#30 — supported custom job-image selection](https://github.com/arcitai/software-and-defence-factory/issues/30): remove the manual installation-metadata step.
2. [#28 — immutable source admission](https://github.com/arcitai/software-and-defence-factory/issues/28): eliminate the controlled-checkout workaround.
3. [#29 — optional trusted PR handoff](https://github.com/arcitai/software-and-defence-factory/issues/29), after #28. [#12](https://github.com/arcitai/software-and-defence-factory/issues/12) retains the overall source/delivery contract.
4. [#1 — Arcitai dashboard refinement](https://github.com/arcitai/software-and-defence-factory/issues/1): establish the shared visual direction and review it in the real UI.
5. [#27 — optional project theme from DESIGN.md](https://github.com/arcitai/software-and-defence-factory/issues/27), after the shared visual direction and #25; no runtime interpretation of arbitrary Markdown.

## Qualification and later scope

- [#6 — real model/application/security qualification](https://github.com/arcitai/software-and-defence-factory/issues/6). Reuse evidence from #25 where applicable; its security case and broader failure evidence remain separate obligations.
- [#7 — first bounded Defence case](https://github.com/arcitai/software-and-defence-factory/issues/7). Requires an explicitly selected isolated system and response boundary; no production monitoring is implied.
- [#22 — external inspiration](https://github.com/arcitai/software-and-defence-factory/issues/22). Research backlog only; extract a concrete accepted requirement before implementation.

AIOS-app and other application development are separate queues. This Factory
work does not start or resume those jobs. See [CONTRIBUTING.md](CONTRIBUTING.md)
and the [self-development recipe](docs/development.md) before submitting work.
