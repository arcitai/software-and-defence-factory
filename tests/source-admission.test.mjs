import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SourceAdmissionStore, assertRetainedSource, publicSourceAdmission, restoreRetainedCheckout } from '../factory/source-admission.mjs';

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

test('concurrent source admissions keep each configured repository and ref isolated', t => {
  const f = fixture(t), second = join(f.root, 'other-repo'); mkdirSync(second);
  execFileSync('git', ['-C', second, 'init', '--quiet', '-b', 'main']);
  writeFileSync(join(second, 'value.txt'), 'OTHER\n');
  git(second, 'add', 'value.txt');
  execFileSync('git', ['-C', second, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Other']);
  const stores = [new SourceAdmissionStore(f.state, f.repo), new SourceAdmissionStore(f.state, second)];
  const records = [stores[0].admit(job('b'), 'main'), stores[1].admit(job('c'), 'main')];
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
