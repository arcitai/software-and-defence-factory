import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { githubProjectLinks, readProjectLinks } from '../factory/project-links.mjs';

test('project links use the exact configured GitHub origin without credentials or transport syntax', () => {
  for (const remote of ['https://github.com/team/project.git', 'git@github.com:team/project.git', 'ssh://git@github.com/team/project', 'https://github.com/team/project/']) {
    assert.deepEqual(githubProjectLinks(remote), { repository: 'https://github.com/team/project', new_issue: 'https://github.com/team/project/issues/new', source: 'configured_git_origin' });
  }
  for (const remote of ['https://secret@github.com/team/project', 'https://github.com.evil.test/team/project', 'https://github.com/team/project?token=secret', 'file:///team/project', '../team/project', 'https://github.com/team/..', 'https://github.com/team/project/issues/1', 'javascript:alert(1)', 'https://gitlab.com/team/project']) assert.equal(githubProjectLinks(remote), undefined, remote);
});

test('a project without a local origin exposes no fabricated repository link', t => {
  const root = mkdtempSync(join(tmpdir(), 'factory-links-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  execFileSync('git',['init',root],{stdio:'ignore'});
  assert.equal(readProjectLinks(root),undefined);
  execFileSync('git',['-C',root,'remote','add','origin','git@github.com:owner/actual.git']);
  assert.equal(readProjectLinks(root).repository,'https://github.com/owner/actual');
});
