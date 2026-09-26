import { harnessOf } from '../factory/lib.mjs';
// Opt-in Docker proof, restricted to the documented synthetic fixture.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { configAt, api, save, json, run, stream, sleep, ROOT } from '../factory/lib.mjs';

const state=resolve(process.argv[2] || ''), original=configAt(state);
assert.equal(harnessOf(original),'mock','Use a separate synthetic installation');
assert.equal(readFileSync(join(original.repo,'value.txt'),'utf8'),'broken\n');
assert(!(await api(state,'/api/v1/status')).jobs.some(j=>['queued','running','awaiting_approval'].includes(j.state)),'Finish active fixture jobs first');
const agent=`import {writeFileSync} from 'node:fs';
let prompt='';for await(const chunk of process.stdin)prompt+=chunk;
const revised=prompt.includes('SYNTHETIC_REVIEW_FIXED');
if(process.env.FACTORY_PHASE==='build'){writeFileSync('/workspace/value.txt','fixed\\n');if(revised)writeFileSync('/workspace/revision.txt','review concern fixed\\n');}
if(process.env.FACTORY_PHASE==='review')writeFileSync('/output/review.json',JSON.stringify({verdict:revised?'pass':prompt.includes('REVIEW_BLOCKED')?'blocked':'changes',summary:'Synthetic independent review fixture; no model judgment.',findings:revised?[]:[{message:'Revise the synthetic candidate'}]}));
writeFileSync('/output/agent-report.md','Synthetic phase complete; no model call.\\n');`;
const snapshot=async id=>(await api(state,'/api/v1/status')).jobs.find(j=>j.id===id);
async function wait(id,stateWanted){for(let i=0;i<160;i++){const j=await snapshot(id);if(j.state===stateWanted)return j;if(['failed','cancelled','interrupted'].includes(j.state)&&j.state!==stateWanted)throw new Error(j.runs.at(-1).summary);await sleep(250);}throw new Error('Fixture timed out');}
const results=[];
try {
  // Inline the deterministic fixture in the selected Node image; no inference or image rebuild.
  save(join(state,'factory.json'),{...original,command:['node','--input-type=module','-e',agent]});
  for(const verdict of ['changes','blocked']) {
    const {id}=await api(state,'/api/v1/jobs',{workflow:'software',repository:'app',title:`Review revision ${verdict}`,spec:`SYNTHETIC_REVIEW_${verdict.toUpperCase()}`});
    let job=await wait(id,'failed');const failed=job.runs.at(-1),folder=join(state,'jobs',id);
    assert.equal(failed.command,'review');assert.equal(failed.review_verdict,verdict);assert.equal(job.can_request_changes,true);
    const first=json(join(folder,'candidate.json'));
    const proofPath=join(folder,'artifacts',failed.id,'review.json'), priorProof=readFileSync(proofPath,'utf8');
    await assert.rejects(api(state,`/api/v1/jobs/${id}/approve`,{run_id:failed.id}),/not awaiting/);
    await assert.rejects(api(state,`/api/v1/jobs/${id}/request_changes`,{run_id:failed.id,feedback:''}),/feedback/);
    const feedback=join(state,`feedback-${verdict}.md`);writeFileSync(feedback,'SYNTHETIC_REVIEW_FIXED: address the synthetic review concern.\n',{mode:0o600});
    await stream(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),'revise',id,'--file',feedback,'--state',state],{env:{...process.env,SDF_BOOTSTRAPPED:'1'}});
    await assert.rejects(api(state,`/api/v1/jobs/${id}/request_changes`,{run_id:failed.id,feedback:'duplicate'}),/changed|reviewed|already changing/);
    job=await wait(id,'awaiting_approval');const next=json(join(folder,'candidate.json'));
    assert.notEqual(next.head,first.head);assert.equal(readFileSync(proofPath,'utf8'),priorProof);
    const prior=job.runs.find(r=>r.id===failed.id);assert.equal(prior.state,'failed');assert.equal(prior.summary,failed.summary);assert.equal(prior.review_verdict,verdict);
    const archived=readdirSync(folder).find(n=>n.startsWith('previous-checkout-'));
    assert.equal(run('git',['-C',join(folder,archived),'rev-parse','HEAD']),first.head);
    assert.equal(json(join(folder,'checks.json')).head,next.head);assert.equal(json(join(folder,'review.json')).head,next.head);
    assert(!existsSync(join(folder,'accepted.json')));
    await assert.rejects(api(state,`/api/v1/jobs/${id}/approve`,{run_id:failed.id}),/changed/);
    await api(state,`/api/v1/jobs/${id}/approve`,{run_id:job.runs.at(-1).id});await wait(id,'succeeded');
    assert.equal(json(join(folder,'accepted.json')).head,next.head);
    results.push({verdict,job:id,base:first.base,firstHead:first.head,revisedHead:next.head,passed:true});
    console.log(`PASS ${verdict}: failed review -> CLI revision -> fresh checks/review -> current approval; previous candidate and evidence retained`);
  }
  save(join(state,'review-qualification.json'),{synthetic:true,results});
} finally {save(join(state,'factory.json'),original);}
