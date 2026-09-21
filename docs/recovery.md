# Recovery and reconciliation

## Controller restart

Stop Node with Ctrl-C and restart with the same FACTORY_DB. SQLite WAL and transactions preserve completed state changes. A restart does not start prepared jobs. Refresh the browser for the new session token. Persist the database and its parent directory on local disk; do not use a shared network filesystem for workers.

## Prepared, running and unknown jobs

A prepared job can be cancelled in the UI without an external process. A running job receives a stop request; the worker polls it and terminates its process group. Do not treat the click as proof of termination. The UI shows the request while awaiting worker confirmation.

If a worker disappears, crashes or its outcome cannot be determined, keep it running/unknown in the journal. Inspect the actual host/process group or provider run. Tear down its outer isolation environment if necessary; retain source/artifacts for review. Only after proving that the process and relevant descendants are stopped:

```sh
node scripts/reconcile.mjs TASK_ID "Confirmed worker VM stopped at TIMESTAMP; evidence stored at PRIVATE_REFERENCE"
```

This records the operator's statement; it does not kill a process or query a provider. Import independent evidence next, or revise the task for another bounded attempt. A confirmed cancellation is not a successful task. Unknown costs remain unknown even when a provider times out. Never resubmit a cloud run simply because its POST response was lost; reconcile the same client/run identity first.

## Backup and restore

Stop the controller **and** all workers before a filesystem backup/restore. Preserve the entire `.factory/` directory (or custom DB parent and job artifacts), including any SQLite WAL/SHM files. Store backups privately and encrypted according to the customer scope. Restore to a separate directory first and start a test instance with a distinct PORT and FACTORY_DB. Verify task count, last revisions, attempts and artifacts before replacing a live installation. No automated backup or encryption service is supplied.

JSON export is useful for analysis but is not a full database backup: it omits webhook delivery history and some local metadata. Do not rely on it for replay-safe restore.

## Replay and concurrency

A valid webhook delivery-id is persisted atomically with its effect; retry returns duplicate. Read-only GitHub sync uses stable repository/issue identity. Revision conflicts return HTTP 409 and require refresh. A single database serializes local worker claims; active/unknown workers prevent a new writer. Multiple independent databases do not provide a shared lock, so native cloud automation and CLI dispatch must not run the same task independently.

## Source rollback

Keep source versions in Git. Before upgrading, back up private runtime data and inspect any state/schema changes. This version creates additive tables only; future migrations must include versioning and restore proof. Reverting source alone is not always enough to revert state. Never reset customer working copies blindly; retain failed-job branches and untracked files until reviewed.
