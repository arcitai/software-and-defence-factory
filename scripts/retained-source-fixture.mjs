import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runHostGit } from '../factory/git-environment.mjs';

const git = (...args) => runHostGit(args);

export function createRetainedSourceFixture(proofState) {
  const repo = join(proofState, 'source-app');
  mkdirSync(repo);
  git('-C', repo, 'init', '--quiet', '-b', 'main');
  writeFileSync(join(repo, 'value.txt'), 'broken\n');
  writeFileSync(join(repo, 'base-id.txt'), 'A\n');
  git('-C', repo, 'add', '-A');
  git('-C', repo, '-c', 'user.name=Factory fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Source A');
  return { repo, sourceA: git('-C', repo, 'rev-parse', 'HEAD') };
}

export function advanceAndPruneSourceFixture({ repo, sourceA }) {
  writeFileSync(join(repo, 'value.txt'), 'later\n');
  writeFileSync(join(repo, 'base-id.txt'), 'B\n');
  git('-C', repo, 'add', '-A');
  git('-C', repo, '-c', 'user.name=Factory fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Source B');
  git('-C', repo, 'switch', '--quiet', '--orphan', 'operator-b');
  writeFileSync(join(repo, 'value.txt'), 'later\n');
  writeFileSync(join(repo, 'base-id.txt'), 'B\n');
  writeFileSync(join(repo, 'operator-checkout.txt'), 'B\n');
  git('-C', repo, 'add', '-A');
  git('-C', repo, '-c', 'user.name=Factory fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Unrelated operator checkout B');

  const operator = sourceFixtureOperatorState(repo);
  git('-C', repo, 'branch', '-D', 'main');
  git('-C', repo, 'reflog', 'expire', '--expire=now', '--all');
  git('-C', repo, 'gc', '--prune=now');
  if (sourceRefExists(repo) || sourceCommitExists(repo, sourceA))
    throw new Error('Source fixture did not remove and prune admission-time commit A');
  return operator;
}

export function sourceFixtureOperatorState(repo) {
  return {
    head: git('-C', repo, 'rev-parse', 'HEAD'),
    branch: git('-C', repo, 'symbolic-ref', '--short', 'HEAD'),
    status: git('-C', repo, 'status', '--porcelain'),
  };
}

function sourceRefExists(repo) {
  try { git('-C', repo, 'rev-parse', '--verify', 'refs/heads/main'); return true; }
  catch { return false; }
}

function sourceCommitExists(repo, sourceA) {
  try { git('-C', repo, 'cat-file', '-e', `${sourceA}^{commit}`); return true; }
  catch { return false; }
}
