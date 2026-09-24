# Qualification evidence

## Native runtime and npm installation — 24 September 2026

The 0.3 candidate was packed as an npm tarball, installed outside a source checkout on Linux x64, and exercised on the Z13. No application repository or paid model was used for runtime qualification.

Eight real Docker/control-flow paths passed:

1. Isolated implementation, candidate commit, application check, independent synthetic review, operator approval and handoff.
2. Changing the candidate after review prevents acceptance.
3. Changing the check policy after review prevents acceptance.
4. A failing application check blocks review/delivery; controlled retry reruns it.
5. Cancellation confirms container stop. The running container was non-root, read-only, network-disabled for the fixture, without added capabilities or Docker socket; Git metadata was read-only.
6. A bounded deadline stops the attempt and records failure.
7. Incident intake deduplicates its event and produces a private draft without a recovery claim.
8. Stop/restart retains interrupted state; retry establishes the previous writer stopped and starts a distinct attempt.

The source application remained unchanged. These fixtures demonstrate runtime behavior, not independent model judgment or a real application's correctness.

The restored dashboard displays the native queue, task stages, history and actual artifact content. The tested build preserves the selected upstream layout and interaction model. The interface was inspected at desktop and a narrow viewport. Creating a synthetic task, requesting revisions, obtaining fresh checks/review, previewing the actual patch and approving handoff were exercised in the browser.

## Unit and packaging coverage

20 runtime/method/package tests and 39 dashboard tests passed locally. The maintained tests cover queue transitions, stale approval, cancellation, restart, incident scope/deduplication, session/Host/Origin protection, artifact bounds, npm installation/export, external state paths, update identity checks and failed-update preservation. Dashboard tests cover board routing, analytics with missing measurements, status races, task presentation and interaction/accessibility behavior.

## Limits

Real Codex/Pi inference inside the factory, local-model network access, application-specific browser/toolchain capability, cost, token reporting, production connectors and autonomous deployment have not been qualified by these synthetic tests. A separately successful host-local model request is not proof that an isolated factory job can use it. Application installations require a real bounded pilot after scope, credentials, toolchain and checks are selected.
