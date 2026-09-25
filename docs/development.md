# Developing Factory through Factory

Factory can treat this repository as an application. The released package runs
the job; the job edits a separate source checkout. This prevents a candidate
from changing the controller, protected policy or evidence that will accept it.

## Keep the three locations separate

| Location | Purpose |
| --- | --- |
| Developer checkout | Committed source, task branches and PR handoff |
| Installed npm release | Stable CLI/controller used to execute the job |
| Private application state | Configuration, model environment, jobs and evidence |

Give Factory development its own state path and loopback port. Use one
dashboard/controller per project. A synthetic demo remains a separate
installation; it is not the project dashboard or proof of product work.
Other applications need not run while Factory itself is being developed.

The dashboard should identify the project (#25). Optional project identity
from `DESIGN.md` is planned in #27; it is not supported configuration yet.
Shared navigation, state meanings, evidence and approvals remain Factory-owned.

## Prepare the source and checks

Follow the [contributor setup](../CONTRIBUTING.md), then verify the exact source
revision and a clean checkout. Preserve unfinished work in its existing branch
or worktree. Until #28 provides admission-time source pinning, hold a dedicated
committed source checkout at the selected SHA while submitting/executing jobs.
Task text naming a SHA does not pin it. Compare each recorded candidate base
with the intended SHA before acceptance.

For this repository, the configured full check is:

```sh
npm ci --ignore-scripts && npm run build:dashboard && npm run check
```

Select an image containing the supported Node/Git toolchain and chosen agent.
Exercise the full baseline inside that image before the first task. The check
does not need the Docker socket inside the container. Controller/runtime
qualification is performed by the operator outside implementation jobs, in
separate synthetic state. Browser acceptance likewise needs an explicitly
available browser; the stock image does not promise one.

## Configure the released runtime

Establish host access, inference and resource limits using the existing
[setup plan](setup.md). These example paths/ports are placeholders and must be
replaced with user-owned locations and an unused port:

```sh
software-defence-factory init --repo /absolute/path/to/factory-source --agent pi --check "npm ci --ignore-scripts && npm run build:dashboard && npm run check" --state /private/state/factory-development --port 7343
software-defence-factory install --state /private/state/factory-development
software-defence-factory doctor --state /private/state/factory-development
```

The example uses the standard job image. Configure the chosen model and only
its inference environment in private state; never copy GitHub/npm credentials,
personal agent configuration or the host's Docker socket into a job. A local
model endpoint must be reachable from the actual isolated image/network.
The setup plan covers that separate connectivity/boot obligation.

For an existing custom image, ordinary `install` would replace its selection.
Version 0.4.1 has no supported custom-image installation command; #30 tracks
that gap. A manually prepared profile must verify and retain the exact Docker
image ID, record matching `factory.json` and `engine.json` metadata in private
state, and exercise the real checks. `doctor`'s current installation marker
alone is not qualification. Do not overwrite a working custom profile merely
to make that marker appear.

For the small dashboard pilot, a bounded profile uses four CPUs, 4 GiB of job
RAM, 512 processes and a 30-minute phase deadline. The local inference server
has its own host resource budget. Record actual model, runtime/image versions,
limits, source and evidence privately; these values are a tested project
profile, not minimum requirements for every model or task.

## Submit one ready slice

Inspect the queue before starting an existing state. `up` or a managed service
will execute already queued work. For a newly configured, empty state:

```sh
software-defence-factory up --state /private/state/factory-development
software-defence-factory run --issue https://github.com/arcitai/software-and-defence-factory/issues/25 --state /private/state/factory-development
```

Choose an **open, accepted issue** from the [todo](../todo.md); #25 is the first
pilot, not an instruction to repeat a completed task. `run --file` is also
supported. The controller owns build → configured checks → independent review
→ approval/handoff. Review uses a separate model context over the exact
candidate and policy. The operator reads the actual patch and evidence and
completes any browser or other external acceptance before approving.

Inspect failures rather than resubmitting blindly. `cancel JOB_ID` stops the
selected attempt; after reconciliation, `retry JOB_ID` retains prior evidence.
Use the dashboard's request-changes path for a changed implementation. Follow
[recovery](recovery.md) before starting a replacement writer.

## Handoff, delivery and operation

Version 0.4.1 returns an accepted patch; #29 tracks optional PR publication.
Apply the patch on a unique branch at its recorded base, compare the resulting
diff/tree, run applicable integration checks and open a PR. Changed content or
base needs fresh relevant review. The repository's actual required checks still
govern integration. Keep raw prompts and host-specific paths private.

Use [managed services and tunnels](services.md) for boot/login startup and
operator access to the project's loopback dashboard. Installed npm updates
change the orchestration runtime only while idle; they do not update this
source checkout, merge its PRs or rebuild the selected job image.

A candidate dashboard can be previewed in separate private state on another
unused port after its assets build. Do not run an unreviewed candidate server
against the existing job database. Publishing the reviewed version and adopting
it through the normal updater is a separate release step.

Retain the issue/job/base/candidate/check/review/PR chain and update
[proof](proof.md) only with observed results and limitations. One successful
dashboard task does not complete the wider security/model qualification (#6),
live Defence workflow (#7) or arbitrary unattended software development.
