# Workflows, skills and work intake

An **issue** defines the problem, boundaries and acceptance criteria. A
**workflow** defines the runtime's ordered phases and gates. A **task** is one
execution of that workflow; retries and revisions preserve its prior attempts.
A **skill** gives an agent instructions for doing part of the work. Six skills
do not mean six agents, and a skill does not schedule a job.

The queue, dashboard catalog and `software-defence-factory workflows --state PATH`
use the same installed definition. The CLI command works while the installation
is stopped; the dashboard reflects its controller's configuration at startup.

## Prepare, execute, evaluate

Triage and specification use `factory-triage` and `factory-spec` before admission.
They are method activities, not hidden automatically executed phases.

Software execution proceeds through Build → Check → Review → operator approval
→ Handoff. Build and review use the configured agent (Codex, Pi or a custom
executor), with `factory-implement`, `factory-review` and, when scoped,
`factory-security`. Checks run the application's configured command. Handoff
confirms the accepted candidate and evidence; it does not publish or deploy.

Defence executes a scoped investigation and produces a private draft. It is not
a production recovery agent. Validated incident intake still uses
`incident --file incident.json`; the dashboard's investigation brief is not an
equivalent typed incident adapter.

`factory-evaluate` supports a separately scoped comparison. All six packaged
skills are mounted read-only for agent phases and visible in the dashboard's
Skills tab, including their exact installed instructions and file hashes.
Availability does not prove an agent followed every instruction.

## Start work

**New issue** opens the configured GitHub repository's issue chooser. It creates
backlog only. **Start work** opens a modal for explicit execution:

- From GitHub issue: load a URL from this project's origin, review the imported
  title/body and acceptance criteria, then start. GitHub CLI access is required
  on the controller host. Imports are bounded and cannot select another repo.
- Write instructions: supply the accepted scope directly. The project and model
  default to the installation; optional title/reference/model settings are
  secondary. A reference link does not fetch instructions.

The CLI uses the same issue reader for `run --issue URL`. It deliberately submits
when invoked; the dashboard lets the operator inspect/edit the imported scope
before submitting. Issue text is untrusted input, not authority to change policy.
No issue, label or import alone starts work. Automatic polling/triggers require a
separate opt-in admission policy and are not implemented by these forms.

## Customize deliberately

Stop the installation before editing its private `factory.json`. Select the
agent, model, command, check and resource limits according to the setup guide,
then restart. Never put credentials in task text; model credentials belong in
private `model.env`. The Configuration tab exposes selected non-secret settings,
not raw environment or command arguments.

This release does not provide an editable workflow engine. Phase order,
approval gates and bundled skills change through a reviewed Factory release.
Editing an exported kit does not change the runtime's mounted skills. A future
editor must change the same CLI/API contract and acceptance policy, not merely
editable text in the dashboard. See issue #37.

Worker identity uses the host OS APIs for hostname, OS, architecture, CPU count
and memory. Hardware model is best-effort when the OS exposes it (Linux DMI),
with hostname as the fallback. It does not infer a particular machine from the
project path or expose serials, network addresses or credentials. Host resources
are distinct from each job's container limits.
