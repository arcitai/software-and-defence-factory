import { spawn } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { api, configAt, containers, run, save, sleep, stopContainers } from './lib.mjs';

const state=process.argv[2];
configAt(state);
const lock=join(state,'supervisor.json');
writeFileSync(lock,JSON.stringify({pid:process.pid}),{flag:'wx',mode:0o600});
const children=[]; let stopping=false;
async function shutdown(code=0) {
  if(stopping)return; stopping=true;
  try { stopContainers(state); } catch(error) { console.error(`Cleanup unconfirmed: ${error.message}`); code=1; }
  for(const child of [...children].reverse()) if(child.exitCode===null) child.kill('SIGTERM');
  await sleep(500);
  for(const child of children) if(child.exitCode===null) child.kill('SIGKILL');
  rmSync(lock,{force:true}); process.exit(code);
}
process.on('SIGTERM',()=>shutdown());process.on('SIGINT',()=>shutdown());
function launch(args) {
  const child=spawn(join(state,'bin/machinist'),args,{stdio:'inherit'});children.push(child);
  child.on('error',error=>{console.error(error.message);shutdown(1);});
  child.on('exit',()=>{if(!stopping)shutdown(1);});return child;
}
try {
  stopContainers(state);
  launch(['--config',join(state,'machinist.toml'),'start']);
  let ready=false;
  for(let i=0;i<60&&!stopping;i++) {
    try {await api(state,'/api/v1/status');ready=true;break;}catch{await sleep(200);}
  }
  if(!ready)throw new Error('Control plane did not start');
  launch(['--config',join(state,'worker.toml'),'worker','start']);
  // This only fences containers; Machinist remains the sole job scheduler.
  while(!stopping) {
    const snapshot=await api(state,'/api/v1/status');
    const active=new Set((snapshot.jobs || []).flatMap(j=>(j.runs || []).filter(r=>r.state==='running').map(r=>r.id)));
    for(const c of containers(state)) {
      const labels=c.Config.Labels;
      if(c.State.Running&&(!active.has(labels['arcitai.run'])||Date.now()>Number(labels['arcitai.deadline']))) {
        stopContainers(state,labels['arcitai.job']);
      }
    }
    await sleep(1000);
  }
} catch(error) { console.error(error.message); await shutdown(1); }
