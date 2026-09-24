# Security boundaries

The factory is a private, single-operator developer tool. The operator account, Docker daemon and host kernel are trusted. Docker access is privileged host access; run the controller as an unprivileged dedicated user on a suitable machine.

The dashboard binds to 127.0.0.1. It checks Host, Origin and cross-site requests. Writes and artifact reads require a browser session nonce or the private CLI token. This is local-session protection, not multi-user authentication. Use an SSH tunnel with the same local and remote port. Do not publish the HTTP port directly.

Agent jobs run in non-root containers with a read-only root filesystem, dropped capabilities, resource/deadline limits, no Docker socket and read-only Git metadata. Only implementation receives a writable job checkout. Verification uses a disposable copy. Policy and skills are mounted read-only. Git hooks and global Git configuration are disabled for controller Git operations. Host-level container escape is outside the protection provided here.

Mock jobs have no network. Inference jobs currently use bridge networking; this is not an egress allowlist and does not isolate a model credential from the agent receiving it. Give jobs only purpose-scoped inference credentials. Never add GitHub administration, deployment, cloud or personal account credentials to model.env. Live target testing needs separate explicit authorization.

Input size and artifact paths are bounded. Workspaces are cloned from committed code; review files remain private. Stop/retry requires confirmation that the previous executor and its containers no longer run. An uncertain stop retains a fence.

Candidate checks, independent review and approval must agree on both commit and policy hash. Job success is not a guarantee of security. Incident reports remain unverified drafts until an authorized operator obtains separate recovery evidence.

Report vulnerabilities privately to a repository maintainer using GitHub private vulnerability reporting when enabled. Do not publish raw credentials, customer evidence or exploit details in a public issue. If no private channel is available, ask for one without including the sensitive finding.
