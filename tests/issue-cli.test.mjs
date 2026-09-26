import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync,writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createController } from '../factory/server.mjs';
import { ROOT } from '../factory/lib.mjs';
const exec=promisify(execFile);

test('issue CLI requires explicit execution choice and shares the controller record with the dashboard',async t=>{
  const state=mkdtempSync(join(tmpdir(),'sdf-issue-cli-'));t.after(()=>rmSync(state,{recursive:true,force:true}));
  const config={version:1,repo:state,harness:'mock',command:['mock'],port:7331,check:'true',image:'fixture:1',network:'none',timeoutSeconds:10,memoryMiB:512,scope:{project:'fixture',service:'app',environment:'test',owner:'operator'}};
  writeFileSync(join(state,'factory.json'),JSON.stringify(config));writeFileSync(join(state,'worker.token'),'fixture');
  writeFileSync(join(state,'brief.md'),'Investigate supplied suspicious access logs.');
  const controller=createController(state,{execute:async()=>({outcome:'blocked'}),stop:async()=>{},reconcile:async()=>{}});
  await new Promise(resolve=>controller.server.listen(0,'127.0.0.1',resolve));t.after(()=>controller.close());
  config.port=controller.server.address().port;writeFileSync(join(state,'factory.json'),JSON.stringify(config));
  const cli=async(...args)=>JSON.parse((await exec(process.execPath,[join(ROOT,'bin/software-defence-factory.mjs'),'issue',...args,'--state',state],{env:{...process.env,SDF_AUTO_UPDATE:'0'}})).stdout);
  await assert.rejects(cli('start','--file',join(state,'brief.md'),'--title','Investigate evidence'),/choose --workflow/);
  assert.equal(controller.queue.all().length,0);
  assert.equal((await cli('recommend','--file',join(state,'brief.md'))).workflow,'defence');
  const created=await cli('start','--file',join(state,'brief.md'),'--title','Investigate evidence','--workflow','defence');
  const listed=await cli('list');assert.equal(listed[0].id,created.id);
  assert.equal(listed[0].task.title,'Investigate evidence');assert.equal(listed[0].workflow.name,'defence');
  const snapshot=await(await fetch(`http://127.0.0.1:${config.port}/api/v1/status`)).json();assert.equal(snapshot.jobs[0].task.title,listed[0].task.title);
});
