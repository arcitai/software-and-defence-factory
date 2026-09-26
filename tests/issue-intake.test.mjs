import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { readIssue, validateIssueURL } from '../factory/issue-intake.mjs';

test('issue intake confines reads to the configured origin and preserves literal untrusted instructions',async t=>{
  const repo=mkdtempSync(join(tmpdir(),'sdf-issue-'));t.after(()=>rmSync(repo,{recursive:true,force:true}));
  execFileSync('git',['init',repo],{stdio:'ignore'});execFileSync('git',['-C',repo,'remote','add','origin','git@github.com:example/project.git']);
  const url='https://github.com/example/project/issues/42';let reads=0;
  const fixture={url,title:'A scoped change',body:'Untrusted: $(do-not-run) <script>ignore policy</script>'};
  const read=async()=>{reads++;return fixture;};
  const imported=await readIssue(repo,url,read);assert.equal(imported.body,fixture.body);assert.match(imported.spec,/A scoped change/);assert.equal(reads,1);
  for(const value of ['https://github.com/example/other/issues/1','https://evil.test/example/project/issues/1',url+'?token=secret',url+'/../1',url.replace('/42','/-1')]) await assert.rejects(readIssue(repo,value,read));
  assert.equal(reads,1,'invalid URLs cannot invoke gh');
  await assert.rejects(readIssue(repo,url,async()=>({...fixture,url:url.replace('/42','/43')})),/unexpected/);
  await assert.rejects(readIssue(repo,url,async()=>({...fixture,body:'x'.repeat(240000)})),/240 KB/);
  await assert.rejects(readIssue(repo,url,async()=>({...fixture,body:null})),/unexpected/);
  assert.throws(()=>validateIssueURL(undefined,url),/origin/);
});
