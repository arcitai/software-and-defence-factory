// Explicit, opt-in integration qualification. Uses Docker and the native controller, never inference.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { api, configAt, save, json, containers, sleep, stream, run, ROOT } from '../factory/lib.mjs';
import { admitIncident } from '../factory/incident.mjs';

const state=resolve(process.argv[2] || '.factory/demo-platform'),original=configAt(state);
assert.equal(original.agent,'mock','Qualification is restricted to a synthetic installation');
assert.equal(readFileSync(join(original.repo,'value.txt'),'utf8'),'broken\n');
assert(!(await api(state,'/api/v1/status')).jobs.some(j=>['queued','running','awaiting_approval'].includes(j.state)),'Finish/cancel active demo jobs before qualification');
const results=[];
const cli=(...args)=>stream(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),...args,'--state',state]);
const snapshot=async id=>(await api(state,'/api/v1/status')).jobs.find(j=>j.id===id);
async function until(fn,ms=45000) {
  const deadline=Date.now()+ms;
  while(Date.now()<deadline){const value=await fn();if(value)return value;await sleep(250);}
  throw new Error('Timed out waiting for the required state');
}
const waitState=(id,wanted)=>until(async()=>{const job=await snapshot(id);if(job.state===wanted)return job;if(['failed','blocked','cancelled','interrupted'].includes(job.state)&&job.state!==wanted)throw new Error(`${id}: expected ${wanted}, got ${job.state}: ${job.runs.at(-1).error}`);});
const submit=(workflow,spec)=>api(state,'/api/v1/jobs',{workflow,repository:'app',spec,title:`Qualification: ${spec.slice(0,60)}`});
const work=spec=>submit('software',spec);
const record=name=>{results.push({name,passed:true});console.log(`PASS ${name}`);};
const setConfig=changes=>save(join(state,'factory.json'),{...original,...changes});

try {
  const pass=await work('Synthetic complete vertical slice');await waitState(pass.id,'awaiting_approval');
  const folder=join(state,'jobs',pass.id),candidate=json(join(folder,'candidate.json'));
  assert.equal(json(join(folder,'checks.json')).head,candidate.head);assert.equal(json(join(folder,'review.json')).head,candidate.head);
  assert.equal(readFileSync(join(folder,'checkout/value.txt'),'utf8'),'fixed\n');
  assert.equal(readFileSync(join(original.repo,'value.txt'),'utf8'),'broken\n');
  await cli('approve',pass.id);await waitState(pass.id,'succeeded');
  assert.equal(json(join(folder,'accepted.json')).head,candidate.head);record('software: exact revision, isolated checkout, checks, review, approval, handoff');

  setConfig({cpus:4,pidsLimit:1024,check:"test \"$(cat value.txt)\" = fixed && dd if=/dev/zero of=large-build-fixture bs=1M count=1100 status=none && sleep 2"});
  const native=await work('Synthetic disk-backed build verification');
  const checking=await until(()=>containers(state).find(c=>c.Config.Labels['sdf.job']===native.id&&c.State.Running&&c.Config.Env.includes('FACTORY_PHASE=verify')));
  assert.equal(checking.HostConfig.NanoCpus,4000000000);assert.equal(checking.HostConfig.PidsLimit,1024);
  const nativeCandidate=json(join(state,'jobs',native.id,'candidate.json'));
  assert.notEqual(nativeCandidate.base,nativeCandidate.head);
  assert(checking.Config.Env.includes(`FACTORY_BASE_REVISION=${nativeCandidate.base}`));
  assert(checking.Mounts.some(m=>m.Destination==='/scratch'&&m.RW));
  assert(checking.Mounts.some(m=>m.Destination==='/workspace'&&!m.RW));
  await waitState(native.id,'awaiting_approval');
  const verification=(await snapshot(native.id)).runs.find(r=>r.command==='verify');
  assert(!existsSync(join(state,'jobs',native.id,verification.id,'check-workspace')));
  assert(!existsSync(join(state,'jobs',native.id,'checkout/large-build-fixture')));
  await cli('approve',native.id);await waitState(native.id,'succeeded');setConfig({});
  record('native build scratch exceeds 1 GiB; immutable base, read-only candidate, limits and cleanup verified');

  for (const exitCode of [0, 17]) {
    setConfig({check:`mkdir -p cache/nested && echo cache > cache/nested/value && ln -s /workspace cache/candidate && chmod 000 cache/nested cache && exit ${exitCode}`});
    const readonly=await work(`Synthetic read-only cache cleanup, exit ${exitCode}`);
    await waitState(readonly.id,exitCode===0?'awaiting_approval':'failed');
    const run=(await snapshot(readonly.id)).runs.find(r=>r.command==='verify');
    assert(!existsSync(join(state,'jobs',readonly.id,run.id,'check-workspace')));
    assert.equal(readFileSync(join(state,'jobs',readonly.id,'checkout/value.txt'),'utf8'),'fixed\n');
    assert.equal(readFileSync(join(original.repo,'value.txt'),'utf8'),'broken\n');
    if(exitCode===0){await cli('approve',readonly.id);await waitState(readonly.id,'succeeded');}
    else assert.match(run.error,/verify exited 17/);
    record(`read-only cache cleanup after exit ${exitCode}; candidate symlink not followed and exit preserved`);
  }
  setConfig({});

  const changed=await work('Synthetic changed revision guard');await waitState(changed.id,'awaiting_approval');
  writeFileSync(join(state,'jobs',changed.id,'checkout/value.txt'),'changed after review\n');
  await cli('approve',changed.id);await waitState(changed.id,'failed');
  assert(!existsSync(join(state,'jobs',changed.id,'accepted.json')));record('changed candidate cannot inherit earlier approval');

  const policy=await work('Synthetic policy change guard');await waitState(policy.id,'awaiting_approval');
  setConfig({check:'true'});await cli('approve',policy.id);await waitState(policy.id,'failed');
  assert(!existsSync(join(state,'jobs',policy.id,'accepted.json')));setConfig({});record('changed check policy cannot inherit earlier approval');

  setConfig({check:'exit 17'});
  const fail=await work('Synthetic failing check');await waitState(fail.id,'failed');
  assert.equal((await snapshot(fail.id)).runs.at(-1).command,'verify');
  assert(!existsSync(join(state,'jobs',fail.id,(await snapshot(fail.id)).runs.at(-1).id,'check-workspace')));
  setConfig({});await cli('retry',fail.id);await waitState(fail.id,'awaiting_approval');
  await cli('approve',fail.id);await waitState(fail.id,'succeeded');record('failed app check blocks delivery; controlled retry rechecks same candidate');

  const cancel=await work('SYNTHETIC_TIMEOUT cancellation fixture');
  const live=await until(()=>containers(state).find(c=>c.Config.Labels['sdf.job']===cancel.id&&c.State.Running));
  assert(live.HostConfig.ReadonlyRootfs);assert(live.HostConfig.CapDrop.includes('ALL'));assert.equal(live.HostConfig.NetworkMode,'none');
  assert(!live.Mounts.some(m=>m.Source.includes('docker.sock')));assert(!live.Mounts.some(m=>m.Destination==='/workspace/.git'&&m.RW));
  assert.notEqual(live.Config.User.split(':')[0],'0');
  await cli('cancel',cancel.id);await waitState(cancel.id,'cancelled');
  await until(()=>!containers(state).some(c=>c.Config.Labels['sdf.job']===cancel.id));record('non-root container boundaries; cancel confirms container stop');

  setConfig({timeoutSeconds:2});const timeout=await work('SYNTHETIC_TIMEOUT deadline fixture');
  await waitState(timeout.id,'failed');assert(!containers(state).some(c=>c.Config.Labels['sdf.job']===timeout.id));record('bounded deadline stops agent and fails the attempt');
  setConfig({});

  const input={...json(join(ROOT,'factory/examples/incident.json')),event_id:`probe-${Date.now()}`};
  const first=await admitIncident(state,input,submit),again=await admitIncident(state,input,submit);
  assert.equal(first.id,again.id);assert(again.deduplicated);await waitState(first.id,'succeeded');
  const report=json(join(state,'jobs',first.id,'incident-report.json'));assert.equal(report.case_state,'open');assert.equal(report.verification,'not_performed');
  assert.equal(report.production_action_taken,false);record('incident deduplication, private draft and no recovery claim');

  const interrupted=await work('SYNTHETIC_TIMEOUT restart fixture');
  await until(()=>containers(state).some(c=>c.Config.Labels['sdf.job']===interrupted.id&&c.State.Running));
  await cli('stop');assert.equal(containers(state).length,0);await cli('up');await waitState(interrupted.id,'interrupted');
  setConfig({timeoutSeconds:2});await cli('retry',interrupted.id);await waitState(interrupted.id,'failed');
  assert.equal((await snapshot(interrupted.id)).runs.length,2);assert.equal(containers(state).length,0);record('stop/restart retains interrupted state; retry proves previous writer stopped');
  const other=join(state,'second-installation');
  await stream(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),'init','--state',other,'--repo',original.repo,'--agent','mock','--check',original.check,'--port','7350']);
  await stream(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),'install','--state',other]);
  assert.equal(run('docker',['image','inspect','--format','{{.Id}}',original.image]),original.image);
  run('docker',['run','--rm','--init','--network','none',original.image,'node','-e','process.exit(0)']);
  await cli('stop');setConfig({});await cli('up');
  record('a second installation rebuild preserves the first pinned image and controller restart');
  save(join(state,'qualification.json'),{synthetic:true,platform:process.platform,arch:process.arch,engine:json(join(state,'engine.json')).version,results});
  console.log(`Qualified ${results.length} paths. Model quality, cost and production connectors were not measured.`);
} finally {save(join(state,'factory.json'),original);}
