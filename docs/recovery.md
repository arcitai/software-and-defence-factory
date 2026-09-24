# Recovery and retained evidence

Use `status --state PATH` and the private supervisor.log to identify the active installation. Stop it before replacing its package or container image.

- A normal `stop` signals the controller, waits for the executor process group, removes its labelled containers and retains the database and artifacts.
- An unconfirmed running attempt becomes `interrupted` on controller restart. It is never silently considered successful.
- `retry JOB_ID` reconciles the previous process group and containers. A live or unknown writer blocks retry. For a new build/defence attempt, the prior checkout is retained as previous-checkout-*.
- A failed verification can retry the same unchanged candidate after the check environment is repaired. A changed candidate needs a fresh verification/review sequence.
- A requested revision retains previous evidence and starts a new build from the source repository with the accumulated feedback. It does not reuse earlier approval.
- Removing a stopped task from the dashboard hides its queue record. Private artifacts and its deleted_at record remain on disk; this is not secure erasure.

Do not remove active.json merely to unblock a job. Establish that its PID, process group and labelled containers are stopped. PID reuse or missing process identity requires operator investigation. Preserve logs and work before cleanup.

For backup, stop the installation and copy the complete private state directory, including SQLite files, factory.json and credentials, to an authorized private destination. Restore only while stopped. Update the repository path if it moved, verify ownership/permissions and the pinned image, then inspect state before any retry. Keep previous backups; no automatic destructive schema migration is provided.

Earlier experimental engines use a different journal. Start a new state directory for the native 0.3 runtime; preserve old journals separately. There is no automatic import of their jobs or approval state.
