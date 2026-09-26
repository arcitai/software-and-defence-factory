# Roles, skills and work

Read [Factory concepts](concepts.md) for the shared vocabulary. Inspect the actual
installation with `software-defence-factory definition --state PATH`, or its
Agents, Skills and Definition pages. Both read the same effective catalog.

Software follows **Implement → Check → Review → Accept & hand off**. Implement
and Review are separate agent invocations using the installation's harness/model.
Check runs the project's command. Accept requires operator approval and confirms
that the candidate and policy still match their evidence. It does not push,
merge, deploy or publish. Revisions start a new build/check/review and preserve
the failed attempt.

Defence currently runs **Investigate** against supplied scoped evidence and
produces a private draft. It is not production monitoring, exploitation or
verified recovery. See [Defence integration](defence-integration.md).

The six bundled job skills cover triage, specification, implementation, review,
security and evaluation. They are instructions, not six running processes.
All are mounted read-only for agent steps; the role prompt supplies the work
boundary. Triage/specification prepare scope before admission; evaluation is a
separately scoped comparison. Factory Foundation is an operator setup skill,
kept outside those execution mounts.

## Start work

Open **New task** in Inbox, write a bounded brief and start it. Alternatively,
choose **From GitHub issue**, load an issue from the configured repository,
review the imported scope and start it. Starting queues real work; creating an
issue or setting a label does not. The CLI equivalent is `run --file task.md`
or `run --issue URL`. Private validated incident intake uses `incident --file`.

View repo opens GitHub in a new tab, where the browser's own login applies.
Import uses the controller host's `gh` identity; it does not borrow browser
credentials. Import previews neither enable automatic triggers nor grant an
issue author more access.

## Change the definition

Select the harness, model, check and resource limits in the private `factory.json`
while the installation is stopped, then restart. Workflow order and packaged
skills change through reviewed Factory releases. This release does not support
per-role profiles or arbitrary editable workflow graphs. Versioned editable
definitions are tracked in [#53](https://github.com/arcitai/software-and-defence-factory/issues/53).
