import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { retainedReviewVerdict } from '../factory/processes.mjs';

test('legacy revision requires the exact exported review, checked head and policy', t => {
  const state=mkdtempSync(join(tmpdir(),'sdf-review-evidence-'));
  t.after(()=>rmSync(state,{recursive:true,force:true}));
  const job={id:'job_fixture'}, attempt={id:'run_fixture'};
  const folder=join(state,'jobs',job.id), artifact=join(folder,'artifacts',attempt.id,'review.json');
  mkdirSync(join(folder,'artifacts',attempt.id),{recursive:true});
  const save=(path,value)=>writeFileSync(path,JSON.stringify(value));
  save(join(folder,'candidate.json'),{head:'candidate'});
  save(join(folder,'checks.json'),{head:'candidate',policyHash:'policy',passed:true});
  const valid={head:'candidate',policyHash:'policy',verdict:'changes'};
  assert.equal(retainedReviewVerdict(state,job,attempt),undefined);
  save(artifact,valid); assert.equal(retainedReviewVerdict(state,job,attempt),'changes');
  for (const invalid of [{...valid,head:'other'},{...valid,policyHash:'other'},{verdict:'blocked'}]) {
    save(artifact,invalid); assert.equal(retainedReviewVerdict(state,job,attempt),undefined);
  }
  writeFileSync(artifact,'{malformed'); assert.equal(retainedReviewVerdict(state,job,attempt),undefined);
  writeFileSync(artifact,'x'.repeat(1024*1024+1)); assert.equal(retainedReviewVerdict(state,job,attempt),undefined);
  rmSync(artifact); const outside=join(state,'outside.json');save(outside,valid);symlinkSync(outside,artifact);
  assert.equal(retainedReviewVerdict(state,job,attempt),undefined);
});
