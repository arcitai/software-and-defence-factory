# Verifier notes

Keep this file out of the implementer's starting context. This is a disclosed pilot fixture, not a contamination-resistant public benchmark.

E01: `maxPrice: 0` wrongly admits positive prices because zero is falsy. `detailHTML` also has unescaped HTML interpolation. A correct concrete reproduction of either issue qualifies. Do not award executed-evidence credit for an unexecuted assertion.

E02: independently test absent, zero and positive limit, empty input, and combined category/price. Negative product prices are allowed by this fixture. Avoid prescribing one implementation.

E03: verify zero and negative integer cents, both locales/currencies, and names containing `& < > " '`. Inspect rendered DOM: a name containing `<img src=x>` must be text, not an element. Accept Intl's locale-specific whitespace. Currency comes from the caller, not inferred from the locale. Require both modules and actual executed evidence.

E04: interpolation is an HTML injection sink if values are untrusted and output is rendered as HTML. A harmless injected element proves the sink locally; no request to external targets is needed. Encode both fields for HTML text context. Do not accept findings about a database, shell, authentication or live deployment absent from the fixture. Record missed valid findings and unsupported findings in the evidence artifact.

E05: reconcile B's provider/process state before another writer. Neither A's check nor an agent success message proves B. Require B stopped/completed, matching scope, actual delivered commit, passing applicable checks and security disposition, then human acceptance. Rejection of all automation forever is not a useful answer.

Score each case with the four criteria in suite.json. Record 0–4, raw checks, reviewer identity, revision and artifact reference. Import only after reviewer disposition; the importer checks format, not factual truth. Timeouts, failures and capability blocks remain in the cohort. Require matched case/repetition coverage before comparison. Report per-case distributions; no single marketing score.
