import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { workflowDefinitions, WORKFLOWS } from '../factory/workflows.mjs';
import { createController } from '../factory/server.mjs';
import { digest, ROOT } from '../factory/lib.mjs';
import { machineInfo } from '../factory/machine.mjs';

test('installed CLI, controller and queue share the same phase/skill contract for a non-Codex profile', async t => {
  const state = mkdtempSync(join(tmpdir(), 'sdf-catalog-'));
  t.after(()=>rmSync(state,{recursive:true,force:true}));
  const config={version:1, repo:state, agent:'pi', command:['pi','secret-command-argument'], model:'example/model', port:7349, timeoutSeconds:10, memoryMiB:512, network:'none', image:'fixture:1',check:'npm test',scope:{project:'p',service:'s',environment:'test',owner:'operator'}};
  writeFileSync(join(state,'factory.json'), JSON.stringify(config));writeFileSync(join(state,'worker.token'),'private-fixture');
  const cli=JSON.parse(execFileSync(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),'workflows','--state',state],{encoding:'utf8',env:{...process.env,SDF_AUTO_UPDATE:'0'}}));
  const controller=createController(state,{execute:async()=>({outcome:'blocked'}),stop:async()=>{},reconcile:async()=>{}});
  await new Promise(resolve=>controller.server.listen(0,'127.0.0.1',resolve));t.after(()=>controller.close());
  const origin=`http://127.0.0.1:${controller.server.address().port}`;
  const api=await (await fetch(origin+'/api/v1/definitions')).json();
  assert.deepEqual(api,cli);assert.deepEqual(api,workflowDefinitions(config));
  for(const [name,steps] of Object.entries(api.workflows)) assert.deepEqual(steps.map(step=>step.name),WORKFLOWS[name]);
  assert.equal(api.skills.length,6);assert(!JSON.stringify(api).includes('secret-command-argument'));
  for(const skill of api.skills) assert.equal(skill.sha256,digest(readFileSync(join(ROOT,skill.path),'utf8')));
  assert.equal(api.commands.find(phase=>phase.name==='build').executor,'pi');
  assert.equal(api.commands.find(phase=>phase.name==='verify').executor,'factory');
  const status=await(await fetch(origin+'/api/v1/status')).json();
  assert(status.workers[0].machine.hostname);assert(status.workers[0].machine.memoryMiB>0);
  const denied=await fetch(origin+'/api/v1/issues/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:'https://github.com/example/another/issues/1'})});
  assert.equal(denied.status,403);
  const invalid=await fetch(origin+'/api/v1/issues/preview',{method:'POST',headers:{'Content-Type':'application/json','X-Factory-Session':status.csrf_token},body:JSON.stringify({url:'https://github.com/example/another/issues/1'})});
  assert.equal(invalid.status,400);assert.equal(controller.queue.all().length,0);
});

test('machine discovery returns portable host capacity, never a hard-coded worker identity',()=>{
  const value=machineInfo();assert.equal(value.platform,process.platform);assert.equal(value.architecture,process.arch);
  assert.equal(typeof value.hostname,'string');assert(value.logicalCpus>0);assert(value.memoryMiB>0);
  assert.deepEqual(Object.keys(value).sort(),['architecture','hardware','hostname','logicalCpus','memoryMiB','osRelease','platform']);
});
