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

Review the instructions and suggested work type before **Create & start**. The shared,
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

This creates a **local Factory issue**, not a GitHub issue. GitHub assignees,
projects and write permissions are not applied. Blank local issues remain
available without GitHub access; `blank_issues_enabled` governs GitHub's chooser,
not Factory's local admission. Drafts are not saved as a persistent backlog.
The reader bounds each template to 100 KB and each chooser to 20 templates;
failures are explicit. Labels color the issue list and inform suggestions;
they cannot grant authority or enable automatic execution.

CLI equivalents:

```sh
software-defence-factory issue list --state PATH
software-defence-factory issue list --source github --state PATH --page 1
software-defence-factory issue preview --github URL --state PATH
software-defence-factory issue templates --state PATH
software-defence-factory issue draft --state PATH --template bug-report.yml --sha TEMPLATE_SHA --file answers.json > draft.json
software-defence-factory issue create --state PATH --draft draft.json --workflow software
software-defence-factory issue recommend --file brief.md
software-defence-factory issue create --state PATH --file brief.md --title "Investigate supplied evidence" --workflow defence
software-defence-factory issue create --state PATH --github URL --workflow software
```

`answers.json` contains `{"title":"Fix the board","answers":{"problem":"..."}}`;
keys match `fields[].id` in `issue templates`. Multi-select/checkbox answers are
arrays of exact option labels. These reads and compilation do not create work.
Only **Create & start** or `issue create` queues execution. It requires an
explicit CLI work type; the old `run` command retains its Software default for
compatibility. Private validated incident intake remains `incident --file`,
distinct from a generic Defence brief or issue.

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
