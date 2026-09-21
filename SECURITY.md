# Security scope

This starter is a **single trusted operator, single customer scope, loopback-only application**. It is not a public SaaS or a complete sandbox. No production security audit or Daybreak scan has been performed for this delivery.

Protected assets: provider/GitHub credentials, customer source and issues, worker filesystem, evidence integrity, operator intent and model spend. Trust boundaries: untrusted issue text, HTTP caller, signed GitHub event, approved job, agent process, external provider and independent verifier.

Implemented controls: Host/Origin validation, cross-site rejection, session CSRF token for mutations, CSP, bounded HTTP bodies, signed webhook raw-body validation, repository/maintainer checks, persistent event deduplication, scope hash, revision checks, finite repair count, fixed executable/argv (no shell interpolation), a separate checkout, one active local worker, timeout/stop, private artifacts and same-commit acceptance checks.

Important limits:

- Local OS users/processes that can read the database or call localhost are trusted. CSRF is not user authentication. Keep the service private; SSH portforward is the intended remote access.
- The isolation environment must already exist. FACTORY_WORKER_ISOLATED is an operator assertion, not a container/VM creator. Worktrees do not restrict reads. A dedicated environment and filesystem/network policy must prevent access to other customer scopes, controller credentials and verifier artifacts.
- Evidence is imported by a trusted operator. It is structurally checked but unsigned. Do not give an implementer access to mutate the journal or forge verifier artifacts. A multi-user release needs authenticated claims and protected verifier identity.
- A positive process exit is not a correct result. Scope, exact result commit, relevant independent tests, security disposition and human review remain necessary. Local evidence does not automatically track later GitHub commits.
- Process groups help stop ordinary children; malicious code can evade a process group. Tear down the outer VM/container to establish stop after an untrusted or unknown run. Financial spend needs provider-side caps; elapsed-time limits alone do not provide them.
- Raw model logs may contain secrets. They stay on the worker. Review/redact before sharing. Do not publish evaluation artifacts containing customer code or vulnerability details.
- The intentionally flawed eval fixture is test input, not runtime code. Do not deploy it.

Use a private reporting channel established by the repository owner for sensitive findings. This local starter has no remote repository or configured disclosure inbox. Do not file exploit details in a public issue by default.
