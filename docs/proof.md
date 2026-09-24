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

## 0.3.2 — application build workspace

Verification now uses an isolated disk-backed checkout so native builds can exceed
1 GiB without exhausting the temporary RAM filesystem. CPU/process limits are
configurable and validated; defaults preserve the earlier limits. The source
candidate remains read-only and scratch is removed only after container stop.

Linux Docker qualification passed all nine paths, including a real 1,100 MiB
write, read-only candidate mounts, configured CPU/process limits and scratch
cleanup after both success and failed checks. Existing candidate/policy guards,
retry, cancellation, timeout and incident/restart checks passed. The 20 package/
runtime tests and 39 dashboard tests passed. No application development agent
was launched by this fixture qualification.

## 0.3.3 — read-only cache cleanup

A real application build exposed read-only cache directories left after an
unsuccessful copy. Verification now removes owned scratch directories after
container stop without following symlinks, and preserves the check exit code
if cleanup itself still requires recovery. Linux Docker qualification passed
all 11 paths, including success and exit-17 checks that create mode-000 cache
directories with symlinks to the read-only candidate. Both leave no scratch and
preserve the candidate; the failed check remains failed with its original exit.
The 20 package/runtime tests and 39 dashboard tests also passed.

## 0.3.4 — retained image pins and comparison bases

The npm-packed candidate passed all 12 Linux Docker qualification paths. A second
installation rebuilt the shared job-image tag; the first installation's original
image ID still inspected and executed successfully, and its controller restarted
with the same pin. Retention tags preserve exact images rather than silently
changing another installation's configuration.

The native-build fixture verified that `FACTORY_BASE_REVISION` matches protected
candidate metadata and differs from the changed candidate head. This enables
application diff checks without restoring a writable remote or substituting HEAD.
The read-only candidate, scratch cleanup, failure, timeout, retry and stale-review
guards also passed. All 20 runtime/package and 39 dashboard tests passed.
This is deterministic runtime proof; application and model qualification remain
separate.
