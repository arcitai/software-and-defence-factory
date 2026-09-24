# Runtime quickstart

Install Node 22.13+, Git and Docker Engine/Desktop. Use an unprivileged account with Docker access. Install `software-defence-factory` through npm, or invoke the same package with npx. No factory source checkout is required.

## Qualify a synthetic installation

```sh
software-defence-factory demo
```

Open the printed localhost URL, inspect the sample task and its files, then approve the handoff. This changes only an isolated synthetic repository and makes no inference calls. Once the sample finishes:

```sh
software-defence-factory qualify --state /absolute/path/printed/by/demo
```

The qualification intentionally creates failed, cancelled and interrupted tasks. They are expected evidence of failure handling. Never point qualification at an application installation.

## Connect an application

Commit an intentional, reviewed starting point in the application first. Jobs clone committed code only; uncommitted work stays in the source checkout.

```sh
software-defence-factory init --repo /absolute/path/to/app --agent codex --check "npm ci && npm test" --state /private/state/my-app --port 7331
software-defence-factory install --state /private/state/my-app
software-defence-factory doctor --state /private/state/my-app
```

Verification commands receive `FACTORY_BASE_REVISION`, the resolved commit recorded as the candidate base. Diff-based checks should compare against this revision; the isolated checkout has no origin remote. The value comes from protected controller metadata, not the task text.

Replace the check with the application's actual verification command. `init` does not edit the app, copy global skills or start work. It creates factory.json, worker.token and model.env with private permissions. Each installation has one repository and a distinct state path/port. `--agent pi` selects Pi; `--agent custom --command-json '["executable","argument"]'` selects an available command in the job image. The bundled image provides Node, Git, Codex and Pi. Other toolchains require an intentionally built compatible image; do not claim Rust/mobile/browser capabilities from this image alone.

Configure inference credentials in the private model.env file. Do not copy the operator's entire account environment or authentication folders. Codex uses its supported API credential environment; Pi uses the selected provider's configuration. Use `--model` with init for a specific model. Task-level model overrides are supported only for Codex/Pi and do not prove that the provider serves that model.

A local model endpoint must be reachable from inside the job container. Host loopback addresses do not automatically refer to the host from Docker. Configure and qualify the chosen adapter/network path before dispatch; this package does not automatically expose Ollama or import its models.

```sh
software-defence-factory up --state /private/state/my-app
software-defence-factory run --file task.md --state /private/state/my-app
```

A task should describe the accepted outcome, allowed scope and observable checks. The CLI also accepts `--issue https://github.com/owner/repo/issues/123` for an issue belonging to the configured origin; it uses the operator's existing gh access outside the job. The dashboard supports the same task workflow. Source text and links do not grant additional authority.

## Review and handoff

Inspect the task's Result, Files and History tabs. Build evidence includes candidate.json, change.patch and the implementation report. Checks and review identify their exact commit and policy hash. Approval revalidates both before writing accepted.json. Request changes creates a new implementation sequence while preserving earlier attempts.

The source application is not changed and no branch, PR, merge or deployment is published automatically. A reviewed change.patch can be checked and applied with `git apply --check` and `git apply` on an appropriate branch at its recorded base revision; then follow the application's normal integrated checks and delivery policy.

## Remote access and operation

```sh
ssh -N -L 127.0.0.1:7331:127.0.0.1:7331 your-host
```

Open http://127.0.0.1:7331 on the client. Use the same local/remote port because the HTTP service validates its Host header. The SSH connection must remain open. Access also works across different networks when your configured private network connects the hosts.

Use `status`, `cancel JOB_ID`, `retry JOB_ID` and `stop`, always with the selected `--state`. `service` prints a systemd user-service definition; review and install it through the host's normal service management. It is not enabled by printing it. See [recovery](recovery.md).

## Native application builds

Pin an application-specific image with the required toolchains. In `factory.json`,
`cpus` (1–32, default 2), `pidsLimit` (64–16384, default 256), `memoryMiB` and
`timeoutSeconds` bound the job's resources. Verification uses a separate
disk-backed checkout, keeping the candidate read-only. Its private scratch
directory is removed after container termination is confirmed. Interrupted
executors may retain scratch under their attempt for recovery; stop/reconcile
the job before removing it. Ensure the state filesystem has sufficient space.
No Docker socket, operator credentials or unrelated project caches are mounted.
