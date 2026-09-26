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

Open **New issue** in Inbox, choose a repository template (or **Blank issue**),
complete the title and fields, then **Continue**. Or choose
**From GitHub issues** and select an open issue from the configured repository.
The list excludes pull requests, loads 50 GitHub records per page and offers
**Load more**; search filters the loaded issues by title, number or label. GitHub
reads use the controller's existing access, with retry on failure.

Review the instructions and suggested work type before explicitly starting work. The shared,
deterministic suggestion prioritizes `track:software` and `track:security` (also
`track:defence`/`track:defense`) labels. Without a track label, explicit incident
investigation wording suggests Defence; otherwise Software is the default.
Conflicting labels request a choice. This is a simple editable suggestion, not a
model assessment or permission to act. A security code fix can remain Software.
Both sources support either type; Defence still produces a private draft.

Repository templates are read from `.github/ISSUE_TEMPLATE` on the default
branch through GitHub's API. Markdown templates and YAML markdown, input,
textarea, dropdown (including multiple choices) and checkboxes are supported.
Required fields/defaults are preserved; compilation checks the template SHA
again and refuses a changed form. Unsupported forms (including uploads) stay
visible with a GitHub link instead of silently dropping fields. Contact links
preserve the project's private security reporting route. Template Markdown is
shown as literal text, never executed or rendered as raw HTML.

On a supported repository, **Create issue on GitHub** writes the title, description
and template labels to that repository using the displayed host identity. It
returns the real issue number/link and **does not start execution**. Select
**Start work** separately, or choose the issue later from the repository list.
Choose **Local execution only** to submit a brief without publishing it. A local
brief is an execution request; an unfinished form is not a persistent backlog.
Use the private security contact route for sensitive reports, never a public issue.

The controller records a durable creation receipt before calling the provider.
After a timeout, **Check submission** or `issue recover` looks for the original
result; it never blindly repeats a write. Reuse the same request key on CLI retries.
Changed content/identity with that key is rejected. An unresolved result stays
unconfirmed rather than risking a duplicate. Confirmed missing labels are shown;
GitHub projects, assignees and arbitrary issue form extensions are not applied.

CLI equivalents (the selected controller must be running):

```sh
software-defence-factory issue connection --state PATH
software-defence-factory issue list --source remote --state PATH --page 1
software-defence-factory issue templates --state PATH
software-defence-factory issue draft --state PATH --template bug-report.yml --sha TEMPLATE_SHA --file answers.json > draft.json
software-defence-factory issue create --state PATH --draft draft.json --key release-board-fix-01
software-defence-factory issue submissions --state PATH
software-defence-factory issue recover --state PATH --key release-board-fix-01
# Explicit execution, independent of creation:
software-defence-factory issue start --state PATH --url URL --workflow software
software-defence-factory issue start --state PATH --file brief.md --title "Investigate supplied evidence" --workflow defence
```

`answers.json` contains `{"title":"Fix the board","answers":{"problem":"..."}}`;
keys match `fields[].id` in `issue templates`. Multi-select/checkbox answers are
arrays of exact option labels. `issue create` now publishes only; migrate 0.5.1
execution scripts to `issue start`. Legacy `run` remains compatible. Typed private
incident admission remains `incident --file`, distinct from a generic Defence brief.
`--source github` remains an alias for repository listing; `--github URL` remains a compatibility alias for `--url URL`.

Provider selection and unknown-host behavior are documented in [integrations](integrations.md).
View repo uses the browser's own login. Factory's provider uses the controller
host identity; neither shares credentials with the browser or job containers.

## Scheduled work

Configure schedules in the selected harness, where supported (for example Codex
Automations). The scheduled agent calls Factory CLI/API with explicitly selected
scope. Factory owns execution, checks and acceptance, not the external schedule.
There is no Factory cron module, issue watcher or silently enabled automation.
The Automations view identifies this owner; it does not claim to discover external
schedules. Before enabling one, test its host availability, access, duplicate
handling, resource limits and stop behavior. No schedule is created by onboarding.

## Change the definition

Select the harness, model, check and resource limits in the private `factory.json`
while the installation is stopped, then restart. Workflow order and packaged
skills change through reviewed Factory releases. This release does not support
per-role profiles or arbitrary editable workflow graphs. Versioned editable
definitions are tracked in [#53](https://github.com/arcitai/software-and-defence-factory/issues/53).
