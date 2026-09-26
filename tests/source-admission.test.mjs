import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SourceAdmissionStore, assertRetainedSource, publicSourceAdmission, restoreRetainedCheckout } from '../factory/source-admission.mjs';
import { JobQueue } from '../factory/queue.mjs';

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'sdf-source-admission-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = join(root, 'repo'); mkdirSync(repo);
  execFileSync('git', ['-C', repo, 'init', '--quiet', '-b', 'main']);
  writeFileSync(join(repo, 'value.txt'), 'A\n');
  git(repo, 'add', 'value.txt');
  execFileSync('git', ['-C', repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'A']);
  return { root, repo, state: join(root, 'state') };
}
const job = suffix => `job_${suffix.padStart(24, '0')}`;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(queue, jobId, predicate) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const value = queue.get(jobId);
    if (predicate(value)) return value;
    await pause(5);
  }
  throw new Error(`Timed out waiting for ${jobId}`);
}
function commit(repo, message) {
  git(repo, 'add', '-A');
  execFileSync('git', ['-C', repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', message]);
  return git(repo, 'rev-parse', 'HEAD');
}

test('admitted commit survives branch movement, source ref removal, source GC, deletion and controller restart', t => {
  const f = fixture(t), source = new SourceAdmissionStore(f.state, f.repo, 'main');
  const sourceAtAdmission = git(f.repo, 'rev-parse', 'HEAD');
  const retained = source.admit(job('a'), undefined);
  assert.equal(retained.resolved_sha, sourceAtAdmission);
  assert.equal(retained.requested_ref, 'main');
  assert.equal(retained.ref_source, 'configured');
  const beforeBuild = { head: git(f.repo, 'rev-parse', 'HEAD'), status: git(f.repo, 'status', '--porcelain'), content: readFileSync(join(f.repo, 'value.txt'), 'utf8') };

  writeFileSync(join(f.repo, 'value.txt'), 'B\n');
  git(f.repo, 'add', 'value.txt');
  execFileSync('git', ['-C', f.repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'B']);
  git(f.repo, 'update-ref', '-d', 'refs/heads/main');
  git(f.repo, 'reflog', 'expire', '--expire=now', '--all');
  git(f.repo, 'gc', '--prune=now');
  rmSync(f.repo, { recursive: true, force: true });

  const restartedCheckout = join(f.root, 'retry-checkout');
  restoreRetainedCheckout(f.state, job('a'), retained, restartedCheckout);
  assert.equal(git(restartedCheckout, 'rev-parse', 'HEAD'), sourceAtAdmission);
  assert.equal(readFileSync(join(restartedCheckout, 'value.txt'), 'utf8'), 'A\n');
  assertRetainedSource(f.state, job('a'), retained);
  assert.equal(publicSourceAdmission(retained).resolved_sha, sourceAtAdmission);
  assert.equal(JSON.stringify(publicSourceAdmission(retained)).includes('retained_repo'), false);
  assert.deepEqual(beforeBuild, { head: sourceAtAdmission, status: '', content: 'A\n' });
});

test('concurrent source admissions keep each configured repository and ref isolated', async t => {
  const f = fixture(t), second = join(f.root, 'other-repo'); mkdirSync(second);
  execFileSync('git', ['-C', second, 'init', '--quiet', '-b', 'main']);
  writeFileSync(join(second, 'value.txt'), 'OTHER\n');
  git(second, 'add', 'value.txt');
  execFileSync('git', ['-C', second, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Other']);
  const stores = [new SourceAdmissionStore(f.state, f.repo), new SourceAdmissionStore(f.state, second)];
  const records = await Promise.all([
    Promise.resolve().then(() => stores[0].admit(job('b'), 'main')),
    Promise.resolve().then(() => stores[1].admit(job('c'), 'main')),
  ]);
  const checkouts = [join(f.root, 'checkout-a'), join(f.root, 'checkout-b')];
  for (let index = 0; index < records.length; index++) restoreRetainedCheckout(f.state, job(index ? 'c' : 'b'), records[index], checkouts[index]);
  assert.equal(readFileSync(join(checkouts[0], 'value.txt'), 'utf8'), 'A\n');
  assert.equal(readFileSync(join(checkouts[1], 'value.txt'), 'utf8'), 'OTHER\n');
  assert.notEqual(records[0].repository_identity, records[1].repository_identity);
  assert.notEqual(records[0].retained_repo, records[1].retained_repo);
});

test('invalid refs fail before retention and missing retained objects never fall back to the configured checkout', t => {
  const f = fixture(t), store = new SourceAdmissionStore(f.state, f.repo);
  assert.throws(() => store.admit(job('d'), 'missing-ref'), /Could not resolve source ref/);
  assert.throws(() => store.admit(job('e'), '--upload-pack=evil'), /valid branch/);
  const record = store.admit(job('f'), 'main');
  const retainedPath = join(f.state, 'jobs', job('f'), record.retained_repo);
  rmSync(retainedPath, { recursive: true, force: true });
  assert.throws(() => assertRetainedSource(f.state, job('f'), record), /Retained source/);
  assert.throws(() => restoreRetainedCheckout(f.state, job('f'), record, join(f.root, 'must-not-be-built')), /Retained source/);

  const missingObject = store.admit(job('8'), 'main');
  const missingObjectPath = join(f.state, 'jobs', job('8'), missingObject.retained_repo);
  git(missingObjectPath, 'repack', '-ad');
  const packs = join(missingObjectPath, 'objects', 'pack');
  const pack = readdirSync(packs).find(name => name.endsWith('.pack'));
  assert(pack, 'fixture retention store has a packed commit closure');
  rmSync(join(packs, pack));
  assert.throws(() => assertRetainedSource(f.state, job('8'), missingObject), /Retained source/);
  assert.throws(() => restoreRetainedCheckout(f.state, job('8'), missingObject, join(f.root, 'missing-object-checkout')), /Retained source/);
});

test('a revision can retain a new base under the same repository identity without overwriting its earlier source', t => {
  const f = fixture(t), store = new SourceAdmissionStore(f.state, f.repo);
  const first = store.admit(job('7'), 'main');
  writeFileSync(join(f.repo, 'value.txt'), 'B\n');
  git(f.repo, 'add', 'value.txt');
  execFileSync('git', ['-C', f.repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'B']);
  const second = store.admit(job('7'), 'main', first.repository_identity);
  assert.notEqual(first.resolved_sha, second.resolved_sha);
  const oldCheckout = join(f.root, 'old-checkout'), newCheckout = join(f.root, 'new-checkout');
  restoreRetainedCheckout(f.state, job('7'), first, oldCheckout);
  restoreRetainedCheckout(f.state, job('7'), second, newCheckout);
  assert.equal(readFileSync(join(oldCheckout, 'value.txt'), 'utf8'), 'A\n');
  assert.equal(readFileSync(join(newCheckout, 'value.txt'), 'utf8'), 'B\n');
  assert.notEqual(first.retained_repo, second.retained_repo);
});

test('queue admission pins A before its pump; build retry after restart still restores A after ref movement and GC', async t => {
  const f = fixture(t); mkdirSync(f.state, { recursive: true, mode: 0o700 });
  const source = new SourceAdmissionStore(f.state, f.repo, 'main'), restored = [];
  const sourceAtAdmission = git(f.repo, 'rev-parse', 'HEAD');
  let queue;
  function makeQueue(store) {
    return new JobQueue(f.state, {
      sourceAdmission: store,
      prepare: () => ({ phase: 'build' }),
      execute: async (current, run) => {
        const checkout = join(f.root, `executor-${run.id}`);
        restoreRetainedCheckout(f.state, current.id, current.source_admission, checkout);
        restored.push({ sha: git(checkout, 'rev-parse', 'HEAD'), content: readFileSync(join(checkout, 'value.txt'), 'utf8') });
        return { outcome: 'blocked', summary: 'Synthetic stopped build for retry coverage' };
      },
      stop: async () => {}, reconcile: async () => {},
    });
  }
  queue = makeQueue(source); t.after(async () => { if (queue) await queue.close(); });
  const created = queue.submit({ workflow: 'software', repository: 'app', spec: 'Synthetic retention retry' });
  assert.equal(created.source_admission.resolved_sha, sourceAtAdmission);
  assert.throws(() => queue.submit({ workflow: 'software', repository: 'app', spec: 'Invalid source', source_ref: 'missing-ref' }), /Could not resolve source ref/);
  assert.equal(queue.all().length, 1, 'an unresolved source is never admitted as a job');

  writeFileSync(join(f.repo, 'value.txt'), 'B\n');
  commit(f.repo, 'B');
  git(f.repo, 'switch', '-q', '--orphan', 'operator-b-root');
  writeFileSync(join(f.repo, 'value.txt'), 'B\n');
  writeFileSync(join(f.repo, 'operator-checkout.txt'), 'B\n');
  const sourceAtB = commit(f.repo, 'Operator checkout B');
  git(f.repo, 'branch', '-D', 'main');
  git(f.repo, 'reflog', 'expire', '--expire=now', '--all');
  git(f.repo, 'gc', '--prune=now');
  assert.throws(() => execFileSync('git', ['-C', f.repo, 'rev-parse', '--verify', 'refs/heads/main'], { stdio: 'ignore' }));
  assert.throws(() => execFileSync('git', ['-C', f.repo, 'cat-file', '-e', `${sourceAtAdmission}^{commit}`], { stdio: 'ignore' }));

  let failed = await waitFor(queue, created.id, job => job.state === 'failed');
  assert.deepEqual(restored[0], { sha: sourceAtAdmission, content: 'A\n' });
  const originalAtB = { head: git(f.repo, 'rev-parse', 'HEAD'), status: git(f.repo, 'status', '--porcelain'), value: readFileSync(join(f.repo, 'value.txt'), 'utf8') };
  assert.equal(originalAtB.head, sourceAtB);
  await queue.close(); queue = null;

  queue = makeQueue(new SourceAdmissionStore(f.state, f.repo, 'main'));
  await queue.action(created.id, 'retry', { run_id: failed.runs.at(-1).id });
  failed = await waitFor(queue, created.id, job => job.state === 'failed' && job.runs.length === 2);
  assert.deepEqual(restored[1], { sha: sourceAtAdmission, content: 'A\n' });
  assert.deepEqual({ head: git(f.repo, 'rev-parse', 'HEAD'), status: git(f.repo, 'status', '--porcelain'), value: readFileSync(join(f.repo, 'value.txt'), 'utf8') }, originalAtB);
});

test('a deliberate new base during revision keeps prior source metadata and starts fresh work from the new commit', async t => {
  const f = fixture(t); mkdirSync(f.state, { recursive: true, mode: 0o700 });
  const source = new SourceAdmissionStore(f.state, f.repo, 'main'), buildBases = [];
  const sourceA = git(f.repo, 'rev-parse', 'HEAD');
  let failReconcile = false;
  const queue = new JobQueue(f.state, {
    sourceAdmission: source,
    prepare: () => ({ phase: 'fixture' }),
    execute: async (current, run) => {
      if (run.command === 'build') {
        const checkout = join(f.root, `revision-${run.id}`);
        restoreRetainedCheckout(f.state, current.id, current.source_admission, checkout);
        buildBases.push({ sha: git(checkout, 'rev-parse', 'HEAD'), content: readFileSync(join(checkout, 'value.txt'), 'utf8') });
      }
      return { outcome: 'complete', ...(run.command === 'review' ? { review_verdict: 'pass' } : {}) };
    },
    stop: async () => {}, reconcile: async () => { if (failReconcile) throw new Error('Previous writer is still present'); },
  });
  t.after(() => queue.close());
  const created = queue.submit({ workflow: 'software', repository: 'app', spec: 'Synthetic revision source' });
  let current = await waitFor(queue, created.id, job => job.state === 'awaiting_approval');
  assert.deepEqual(buildBases[0], { sha: sourceA, content: 'A\n' });

  writeFileSync(join(f.repo, 'value.txt'), 'B\n');
  const sourceB = commit(f.repo, 'B');
  const retainedDir = join(f.state, 'jobs', current.id, 'sources'), beforeFailedRevision = readdirSync(retainedDir).sort();
  failReconcile = true;
  await assert.rejects(queue.action(current.id, 'request_changes', { run_id: current.runs.at(-1).id, feedback: 'Do not proceed while the writer is active.', source_ref: 'main' }), /Previous writer/);
  failReconcile = false;
  assert.deepEqual(readdirSync(retainedDir).sort(), beforeFailedRevision, 'a failed revision action releases its unreferenced source copy');
  assert.equal(queue.get(current.id).source_admission.resolved_sha, sourceA);
  await queue.action(current.id, 'request_changes', { run_id: current.runs.at(-1).id, feedback: 'Use the deliberate next base.', source_ref: 'main' });
  current = await waitFor(queue, created.id, job => job.state === 'awaiting_approval' && job.source_admission.resolved_sha === sourceB);
  assert.deepEqual(buildBases[1], { sha: sourceB, content: 'B\n' });
  assert.equal(current.source_history.length, 1);
  assert.equal(current.source_history[0].resolved_sha, sourceA);
  assert.equal(current.workflow.current_step, 3);
  assert.equal(current.runs.at(-1).command, 'handoff');
  assert.equal(current.runs.at(-2).command, 'review');
  assert.equal(current.runs.filter(run => run.command === 'build').length, 2, 'revision reruns implementation from the new retained base');
  assert.equal(current.runs.filter(run => run.command === 'verify').length, 2, 'changed base cannot reuse the previous check');
  assert.equal(current.runs.filter(run => run.command === 'review').length, 2, 'changed base cannot reuse the previous review');
  assertRetainedSource(f.state, current.id, current.source_history[0]);
  assertRetainedSource(f.state, current.id, current.source_admission);
});

test('an explicit same-revision source repairs a missing retained copy before revision work starts', async t => {
  const f = fixture(t); mkdirSync(f.state, { recursive: true, mode: 0o700 });
  const source = new SourceAdmissionStore(f.state, f.repo, 'main'), buildBases = [];
  const sourceA = git(f.repo, 'rev-parse', 'HEAD');
  const queue = new JobQueue(f.state, {
    sourceAdmission: source,
    prepare: () => ({ phase: 'fixture' }),
    execute: async (current, run) => {
      if (run.command === 'build') {
        const checkout = join(f.root, `repair-${run.id}`);
        restoreRetainedCheckout(f.state, current.id, current.source_admission, checkout);
        buildBases.push(git(checkout, 'rev-parse', 'HEAD'));
      }
      return { outcome: 'complete', ...(run.command === 'review' ? { review_verdict: 'pass' } : {}) };
    },
    stop: async () => {}, reconcile: async () => {},
  });
  t.after(() => queue.close());
  const created = queue.submit({ workflow: 'software', repository: 'app', spec: 'Synthetic retained source repair' });
  let current = await waitFor(queue, created.id, job => job.state === 'awaiting_approval');
  const missing = join(f.state, 'jobs', current.id, current.source_admission.retained_repo);
  rmSync(missing, { recursive: true, force: true });
  await queue.action(current.id, 'request_changes', {
    run_id: current.runs.at(-1).id,
    feedback: 'Retry against the same explicitly selected source.',
    source_ref: 'main',
  });
  current = await waitFor(queue, created.id, job => job.state === 'awaiting_approval' && job.runs.length > 4);
  assert.equal(current.source_admission.resolved_sha, sourceA);
  assert.equal(current.source_history.at(-1).resolved_sha, sourceA);
  assert.notEqual(current.source_admission.retained_repo, current.source_history.at(-1).retained_repo);
  assert.deepEqual(buildBases, [sourceA, sourceA]);
  assertRetainedSource(f.state, current.id, current.source_admission);
});
