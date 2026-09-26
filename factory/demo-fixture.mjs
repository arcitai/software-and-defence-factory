import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runCandidateGit } from './git-environment.mjs';

export function initializeDemoRepository(repo) {
  mkdirSync(repo, { recursive: true, mode: 0o700 });
  runCandidateGit(repo, 'init', '-b', 'main');
  writeFileSync(join(repo, 'value.txt'), 'broken\n');
  runCandidateGit(repo, 'add', 'value.txt');
  runCandidateGit(repo, '-c', 'user.name=Factory demo', '-c', 'user.email=demo@localhost', 'commit', '-m', 'Synthetic fixture');
}
