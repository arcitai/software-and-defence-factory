import { createHash, randomUUID } from 'node:crypto';
import { QueueError } from './queue.mjs';
const keyPattern = /^[A-Za-z0-9_-]{16,100}$/;
const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Receipts share the controller database and maintenance lock. They are not jobs
// and cannot schedule execution. A pending write is never blindly repeated.
export class IssueSubmissions {
  constructor(queue, provider) {
    this.queue = queue; this.provider = provider;
    queue.db.exec('CREATE TABLE IF NOT EXISTS issue_submissions(id TEXT PRIMARY KEY, data TEXT NOT NULL)');
  }
  get(key) {
    if (!keyPattern.test(key || '')) throw new QueueError('Provide a stable request key of 16–100 letters, digits, hyphens or underscores.', 400);
    const row = this.queue.db.prepare('SELECT data FROM issue_submissions WHERE id=?').get(key);
    return row && JSON.parse(row.data);
  }
  save(record) { this.queue.db.prepare('INSERT INTO issue_submissions VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(record.request_id, JSON.stringify(record)); return this.present(record); }
  present(record) {
    return { request_id: record.request_id, state: record.state, provider: record.provider, repository: record.repository, actor: record.actor,
      title: record.payload.title, created_at: record.created_at, issue: record.issue || null, error: record.error || null };
  }
  list() { return this.queue.db.prepare('SELECT data FROM issue_submissions ORDER BY rowid DESC LIMIT 50').all().map(row => this.present(JSON.parse(row.data))); }
  create(input) { return this.queue.exclusive(`issue-submission:${input.request_id}`, () => this.publish(input)); }
  async publish(input) {
    const existing = this.get(input.request_id);
    if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 160 || typeof input.spec !== 'string' || !input.spec.trim() || Buffer.byteLength(input.spec) > 60000) throw new QueueError('Provide a title under 161 characters and a description under 60 KB.', 400);
    if (!Array.isArray(input.labels) || input.labels.length > 50 || input.labels.some(label => typeof label !== 'string' || !label.trim() || label.length > 100)) throw new QueueError('Provide up to 50 valid issue labels.', 400);
    const payload = { title: input.title.trim(), body: input.spec.trim(), labels: [...new Set(input.labels)].sort() };
    const context = await this.provider.context();
    if (input.repository !== context.repository || input.actor !== context.actor) throw new QueueError('Repository destination or identity changed. Review the connection before creating.', 409);
    const hash = fingerprint({ provider: this.provider.id, repository: context.repository, actor_id: context.actor_id, payload });
    if (existing) {
      if (existing.hash !== hash) throw new QueueError('This request key already belongs to different content or identity. Inspect its receipt before creating another issue.', 409);
      if (existing.state === 'created') return this.present(existing);
      if (existing.state !== 'rejected') return this.reconcile(existing);
    }
    if (!context.available) throw new QueueError('This repository is archived or has issues disabled.', 400);
    if (payload.labels.length && !context.labels_supported) throw new QueueError('This identity cannot apply the selected labels. Use a repository identity with label access.', 403);
    const record = existing || { request_id: input.request_id, provider: this.provider.id, hash, repository: context.repository, actor: context.actor, actor_id: context.actor_id,
      payload, correlation_id: randomUUID(), created_at: new Date().toISOString() };
    record.state = 'pending'; record.error = null; this.save(record);
    try {
      record.issue = await this.provider.publish(record);
      record.state = 'created'; return this.save(record);
    } catch (error) {
      record.state = [400,401,403,404,410,422,429].includes(error.httpStatus) ? 'rejected' : 'uncertain';
      record.error = record.state === 'rejected' ? 'Repository provider rejected creation. Check Issues write access and repository labels, then retry the same request.' : 'Creation may have succeeded. Check this saved submission; do not create another issue to retry.';
      this.save(record);
      throw new QueueError(`${record.error} Request: ${record.request_id}`, 409);
    }
  }
  recover(key) { return this.queue.exclusive(`issue-submission:${key}`, async () => {
    const record = this.get(key); if (!record) throw new QueueError('Submission not found.', 404);
    const context = await this.provider.context();
    if (record.provider !== this.provider.id || record.repository !== context.repository || record.actor_id !== context.actor_id) throw new QueueError('Restore the original repository and provider identity before recovering this submission.', 409);
    if (record.state === 'created' || record.state === 'rejected') return this.present(record);
    return this.reconcile(record);
  }); }
  async reconcile(record) {
    const issue = await this.provider.recover(record);
    record.issue = issue; record.state = 'created'; record.error = null;
    return this.save(record);
  }
}
