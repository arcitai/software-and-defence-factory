// Opt-in actual Docker diagnostics/profile regression; never a model benchmark.
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { configAt, api, save, json, stream, sleep, ROOT } from '../factory/lib.mjs';
import { VERSION } from '../factory/updates.mjs';
const state=resolve(process.argv[2] || ''), original=configAt(state);
assert.equal(original.agent,'mock','Use a separate synthetic installation');
assert.equal(readFileSync(join(original.repo,'value.txt'),'utf8'),'broken\n');
assert(!(await api(state,'/api/v1/status')).jobs.some(j=>['queued','running','awaiting_approval'].includes(j.state)),'Finish active fixture jobs first');
const snapshot=async id=>(await api(state,'/api/v1/status')).jobs.find(j=>j.id===id);
async function wait(id,wanted){for(let i=0;i<160;i++){const job=await snapshot(id);if(job.state===wanted)return job;if(['failed','interrupted','cancelled'].includes(job.state)&&job.state!==wanted)throw new Error(job.runs.at(-1).summary);await sleep(250);}throw new Error('Fixture timed out');}
const cli=(...args)=>stream(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),...args,'--state',state],{env:{...process.env,SDF_BOOTSTRAPPED:'1'}});
const noisy=`await new Promise(r=>process.stdout.write('START diagnostic\\n'+'x'.repeat(3*1024*1024),r));await new Promise(r=>process.stderr.write('\\nTERMINAL_FAILURE_AFTER_LIMIT\\n',r));process.exitCode=17;`;
try {
  save(join(state,'factory.json'),{...original,model:'ignored-for-mock-a',timeoutSeconds:original.timeoutSeconds+1,command:['node','--input-type=module','-e',noisy]});
  const {id}=await api(state,'/api/v1/jobs',{workflow:'software',repository:'app',spec:'Synthetic diagnostics and profile retry',title:'Diagnostics/profile qualification'});
  let job=await wait(id,'failed');const first=job.runs.at(-1),folder=join(state,'jobs',id);
  assert.equal(first.execution.requestedModel,null);assert.equal(first.execution.modelSelection,'not_applicable');assert.equal(first.execution.runtimeVersion,VERSION);
  const path=join(folder,first.id,'build.log'), log=readFileSync(path,'utf8');
  assert(statSync(path).size<1024*1024);assert.match(log,/START diagnostic/);assert.match(log,/log truncated/);assert.match(log,/TERMINAL_FAILURE_AFTER_LIMIT/);assert.match(log,/code=17/);
  assert.match(first.summary,/build exited 17/);assert(!existsSync(join(folder,first.id,'build','agent-report.md')));assert(!existsSync(join(folder,'accepted.json')));
  assert.equal(statSync(join(folder,first.id,'execution-config.json')).mode&0o777,0o600);
  const exported=json(join(folder,'artifacts',first.id,'execution.json'));
  assert.deepEqual(exported,first.execution);assert(!JSON.stringify(exported).includes('TERMINAL_FAILURE'));assert.equal(exported.command,undefined);
  save(join(state,'factory.json'),{...original,model:'ignored-for-mock-b',timeoutSeconds:original.timeoutSeconds+2});
  await cli('retry',id);job=await wait(id,'awaiting_approval');
  const second=job.runs.find(r=>r.command==='build'&&r.id!==first.id);
  assert.deepEqual(job.runs[0],first);assert.equal(second.model,null);assert.equal(second.execution.modelSelection,'not_applicable');assert.notEqual(second.execution.policyHash,first.execution.policyHash);
  assert.equal(job.runs.find(r=>r.command==='verify').execution.requestedModel,null);
  const measurement=json(join(folder,`measurement-${second.id}.json`));assert.deepEqual(measurement.execution,second.execution);
  await cli('approve',id);job=await wait(id,'succeeded');const runs=job.runs;
  assert.equal(runs.at(-1).executor,'deterministic');assert.equal(runs.at(-1).execution.image,null);
  await cli('stop');await cli('up');assert.deepEqual((await snapshot(id)).runs,runs);
  save(join(state,'diagnostics-qualification.json'),{synthetic:true,job:id,logBytes:statSync(path).size,terminalFailureRetained:true,exit:17,first:first.execution,second:second.execution,restartPreserved:true,passed:true});
  console.log('PASS oversized Docker failure retains terminal diagnostics; retry records its own profile; exported proof and restart preserve history');
} finally {save(join(state,'factory.json'),original);}
