import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { hostGitEnvironment, runHostGit } from '../factory/git-environment.mjs';
import { initializeDemoRepository } from '../factory/demo-fixture.mjs';
import { issueProvider } from '../factory/issue-provider.mjs';
import { readProjectLinks } from '../factory/project-links.mjs';

const rootPath = fileURLToPath(new URL('../', import.meta.url));

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'sdf-host-git-context-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function cleanGit(...args) {
  return execFileSync('git', args, { encoding: 'utf8', env: hostGitEnvironment() }).trim();
}

function repository(path, { origin, name = 'tracked.txt' } = {}) {
  mkdirSync(path, { recursive: true });
  cleanGit('-C', path, 'init', '--quiet', '-b', 'main');
  writeFileSync(join(path, name), 'tracked fixture data\n');
  cleanGit('-C', path, 'add', '-A');
  cleanGit('-C', path, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@localhost', 'commit', '--quiet', '-m', 'Fixture base');
  if (origin) cleanGit('-C', path, 'remote', 'add', 'origin', origin);
  return cleanGit('-C', path, 'rev-parse', 'HEAD');
}

function snapshot(path) {
  const status = cleanGit('-C', path, 'status', '--porcelain');
  const paths = cleanGit('-C', path, 'ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean);
  const files = Object.fromEntries(paths.map(file => [file, readFileSync(join(path, file))]));
  return {
    branch: cleanGit('-C', path, 'symbolic-ref', '--short', 'HEAD'),
    head: cleanGit('-C', path, 'rev-parse', 'HEAD'),
    status,
    index: readFileSync(join(path, '.git', 'index')),
    files,
    refs: cleanGit('-C', path, 'for-each-ref', '--format=%(refname) %(objectname)'),
    objects: cleanGit('-C', path, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname)').split('\n').filter(Boolean).sort(),
  };
}

function hostileEnvironment(foreignRepo) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^GIT_/i.test(key)) delete env[key];
  const config = join(foreignRepo, '..', 'hostile.gitconfig');
  writeFileSync(config, `[core]\n\tworktree = ${foreignRepo}\n`);
  Object.assign(env, {
    GIT_DIR: join(foreignRepo, '.git'),
    GIT_WORK_TREE: foreignRepo,
    GIT_INDEX_FILE: join(foreignRepo, '.git', 'index'),
    GIT_COMMON_DIR: join(foreignRepo, '.git'),
    GIT_OBJECT_DIRECTORY: join(foreignRepo, '.git', 'objects'),
    GIT_ALTERNATE_OBJECT_DIRECTORIES: join(foreignRepo, '.git', 'objects'),
    GIT_NAMESPACE: 'hostile-test-namespace',
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'core.worktree',
    GIT_CONFIG_VALUE_0: foreignRepo,
    GIT_CONFIG_GLOBAL: config,
    GIT_CONFIG_SYSTEM: config,
    GIT_CONFIG_NOSYSTEM: '0',
    GIT_CONFIG_PARAMETERS: `'core.worktree'='${foreignRepo}'`,
    GIT_CEILING_DIRECTORIES: foreignRepo,
    SDF_AUTO_UPDATE: '0',
  });
  return env;
}

function withHostileContext(foreignRepo, callback) {
  const previous = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^GIT_/i.test(key)));
  for (const key of Object.keys(process.env)) if (/^GIT_/i.test(key)) delete process.env[key];
  const hostile = hostileEnvironment(foreignRepo);
  for (const [key, value] of Object.entries(hostile)) if (/^GIT_/i.test(key)) process.env[key] = value;
  try { return callback(); }
  finally {
    for (const key of Object.keys(process.env)) if (/^GIT_/i.test(key)) delete process.env[key];
    Object.assign(process.env, previous);
  }
}

test('CLI init validates the explicit repository under hostile Git overrides and rejects invalid roots', t => {
  const root = temporary(t), selected = join(root, 'selected'), foreign = join(root, 'foreign');
  const selectedHead = repository(selected, { name: 'selected.txt' });
  repository(foreign, { origin: 'https://forge.example/foreign/repo.git' });
  writeFileSync(join(foreign, 'foreign-untracked.txt'), 'must remain untouched\n');
  const before = snapshot(foreign);
  const env = hostileEnvironment(foreign);
  const cli = join(rootPath, 'bin/software-defence-factory.mjs');
  const state = join(root, 'private-state');
  const result = spawnSync(process.execPath, [cli, 'init', '--state', state, '--repo', selected, '--harness', 'mock', '--check', 'true'], {
    cwd: rootPath, env, encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const config = JSON.parse(readFileSync(join(state, 'factory.json'), 'utf8'));
  assert.equal(config.repo, selected);
  assert.equal(config.sourceRef, 'HEAD');
  assert.equal(runHostGit(['-C', selected, 'rev-parse', 'HEAD']), selectedHead, 'init leaves the intended repository at its original base');
  assert.deepEqual(snapshot(foreign), before, 'the foreign checkout, index, refs and objects are untouched');

  const invalid = join(root, 'not-a-repository');
  mkdirSync(invalid);
  const invalidState = join(root, 'invalid-state');
  const rejected = spawnSync(process.execPath, [cli, 'init', '--state', invalidState, '--repo', invalid, '--harness', 'mock', '--check', 'true'], {
    cwd: rootPath, env, encoding: 'utf8',
  });
  assert.equal(rejected.status, 1, rejected.stderr || rejected.stdout);
  assert.equal(existsSync(join(invalidState, 'factory.json')), false, 'an invalid explicit root does not create an installation');
  assert.deepEqual(snapshot(foreign), before);
});

test('demo Git mutations and repository link/provider lookup use the selected repo under hostile context', t => {
  const root = temporary(t), selected = join(root, 'selected'), selectedForge = join(root, 'selected-forge'), foreign = join(root, 'foreign');
  repository(selected, { origin: 'https://github.com/team/intended.git' });
  repository(selectedForge, { origin: 'https://intended-forge.example/team/project.git' });
  repository(foreign, { origin: 'https://forge.example/foreign/repo.git' });
  writeFileSync(join(foreign, 'foreign-untracked.txt'), 'must remain untouched\n');
  const before = snapshot(foreign);
  const demo = join(root, 'demo-repository');

  withHostileContext(foreign, () => {
    initializeDemoRepository(demo);
    assert.equal(readProjectLinks(selected)?.repository, 'https://github.com/team/intended');
    const provider = issueProvider(selected);
    assert.equal(provider.supported, true);
    assert.equal(provider.repository, 'https://github.com/team/intended');
    const unsupported = issueProvider(selectedForge);
    assert.equal(unsupported.supported, false);
    assert.equal(unsupported.host, 'intended-forge.example', 'unsupported provider selection reads the explicit repo origin');
  });

  assert.equal(cleanGit('-C', demo, 'symbolic-ref', '--short', 'HEAD'), 'main');
  assert.equal(readFileSync(join(demo, 'value.txt'), 'utf8'), 'broken\n');
  assert.equal(cleanGit('-C', demo, 'status', '--porcelain'), '');
  assert.deepEqual(snapshot(foreign), before, 'demo init/add/commit and provider lookup leave the foreign checkout unchanged');
});
