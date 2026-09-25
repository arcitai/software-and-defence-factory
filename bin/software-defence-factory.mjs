#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, openSync, closeSync, rmSync, renameSync, realpathSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { ROOT, PINS, DEFAULT_STATE, configAt, save, json, run, stream, digest, api, sleep, stopContainers } from '../factory/lib.mjs';
import { admitIncident } from '../factory/incident.mjs';
import { DEFAULT_DEMO_STATE } from '../factory/paths.mjs';
import { bootstrap, registerInstallation, VERSION } from '../factory/updates.mjs';
import { hasService, manageService, serviceDefinition, withServiceOperation, isManagedLaunch } from '../factory/services.mjs';

try {
  const handled = await bootstrap(process.argv.slice(2));
  if (handled !== undefined) process.exit(handled);
} catch (error) { console.error(`Factory: ${error.message}`); process.exit(1); }

const args = process.argv.slice(2), command = args.shift() || 'help';
const positional = [], flags = {};
for (let i=0;i<args.length;i++) {
  if (args[i].startsWith('--')) {
    if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Value required for ${args[i]}`);
    flags[args[i].slice(2)] = args[++i];
  } else positional.push(args[i]);
}
let state = resolve(flags.state || DEFAULT_STATE);
if(existsSync(state))state=realpathSync(state);
const alive = pid => { try { process.kill(pid,0); return true; } catch(error) { if(error.code === 'ESRCH')return false; throw error; } };

function init(repo, agent='codex', check='', port=7331) {
  repo=realpathSync(resolve(repo));
  if (existsSync(join(state,'factory.json'))) throw new Error('Already configured; edit the private factory.json explicitly or choose another --state');
  if ([repo,state,ROOT].some(p=>/[,\n\r]/.test(p))) throw new Error('Paths cannot contain commas or line breaks');
  if (run('git',['-C',repo,'rev-parse','--show-toplevel']) !== repo) throw new Error('--repo must be the Git root');
  run('git',['-C',repo,'rev-parse','HEAD']);
  const presets={codex:['codex','exec','--json','--ephemeral','--sandbox','danger-full-access','-'],pi:['pi','--mode','json','--print','--no-session','--no-extensions','--skill','/factory-skills'],mock:['node','/opt/factory/mock.mjs']};
  const argv=agent==='custom'?JSON.parse(flags['command-json'] || 'null'):presets[agent];
  if (!argv) throw new Error('Select codex, pi, mock or custom with --command-json');
  if (flags.model && ['codex','pi'].includes(agent)) argv.splice(agent==='codex'?argv.length-1:argv.length,0,'--model',flags.model);
  mkdirSync(state,{recursive:true,mode:0o700});state=realpathSync(state);chmodSync(state,0o700);
  save(join(state,'factory.json'),{version:1,repo,agent,command:argv,check,port:Number(port),image:PINS.jobImage,network:agent==='mock'?'none':'bridge',timeoutSeconds:1800,memoryMiB:2048,model:flags.model || null,
    scope:{project:'pilot',service:'app',environment:'test',owner:'operator'}});
  configAt(state);
  writeFileSync(join(state,'worker.token'),randomBytes(32).toString('hex')+'\n',{mode:0o600});
  writeFileSync(join(state,'model.env'),'# Only inference credentials belong here. Never add GitHub, deploy or cloud credentials.\n',{mode:0o600});
  registerInstallation(state);
  console.log(`Configured ${state}\nApp files were not changed. Only committed code is cloned into jobs.`);
}

function retainImage(reference) {
  let image;
  try { image=run('docker',['image','inspect','--format','{{.Id}}',reference]); }
  catch(error) { if(/No such image|No such object/.test(error.message))return null;throw error; }
  if(!/^sha256:[a-f0-9]{64}$/.test(image))throw new Error('Docker returned an unexpected image identity');
  // Containerd can drop an untagged manifest when the shared build tag moves.
  // Keep the exact object reachable; existing installations retain their pins.
  run('docker',['tag',image,`software-defence-factory-retained:${image.slice(7)}`]);
  return image;
}
async function install() {
  const config=configAt(state);
  if(existsSync(join(state,'supervisor.json'))&&alive(json(join(state,'supervisor.json')).pid))throw new Error('Stop the factory before installing or updating its runtime');
  if (!['darwin','linux'].includes(process.platform)||!['arm64','x64'].includes(process.arch)) throw new Error('Use macOS/Linux arm64/amd64, or WSL2');
  run('docker',['info','--format','{{.ServerVersion}}']);
  retainImage(config.image);retainImage(PINS.jobImage);
  await stream('docker',['build','-t',PINS.jobImage,join(ROOT,'factory/image')]);
  config.image=retainImage(PINS.jobImage);
  if(!config.image)throw new Error('Built job image is unavailable');
  save(join(state,'factory.json'),config);save(join(state,'engine.json'),{runtime:'native-node',version:VERSION,image:config.image});
  console.log('Installed. Job image is pinned to its local image ID. No model call made.');
}
async function portFree(port) {
  await new Promise((ok,fail)=>{const server=createServer();server.once('error',fail);server.listen(port,'127.0.0.1',()=>server.close(ok));});
}
async function up() {
  const config=configAt(state),lock=join(state,'supervisor.json');
  registerInstallation(state);
  if(existsSync(lock)) { if(alive(json(lock).pid))throw new Error('Supervisor already running; use status');rmSync(lock); }
  if(!existsSync(join(state,'engine.json')))throw new Error('Run install first');
  if(process.getuid()===0)throw new Error('Run the controller as a dedicated unprivileged user with Docker access');
  run('docker',['image','inspect',config.image]);await portFree(config.port);
  const fd=openSync(join(state,'supervisor.log'),'a',0o600);
  const child=spawn(process.execPath,[join(ROOT,'factory/supervisor.mjs'),state],{detached:true,stdio:['ignore',fd,fd]});
  closeSync(fd);child.unref();
  for(let i=0;i<80;i++) {
    await sleep(250);
    if(!alive(child.pid))throw new Error(`Startup failed; inspect ${join(state,'supervisor.log')}`);
    try {const snapshot=await api(state,'/api/v1/status');if(snapshot.workers?.some(w=>w.connected&&Date.parse(w.last_seen_at)>Date.now()-2000)) { console.log(`Dashboard: http://127.0.0.1:${config.port}\nPrivate state: ${state}`);return; }} catch {}
  }
  throw new Error('Worker did not become ready; inspect supervisor.log');
}
async function stop() {
  const lock=join(state,'supervisor.json');
  if(existsSync(lock)) {
    const {pid}=json(lock);
    if(alive(pid)) {
      const identity=run('ps',['-p',String(pid),'-o','command=']);
      const controllerProcess=identity.includes(join(ROOT,'factory/supervisor.mjs'))||identity.includes(join(ROOT,'bin/software-defence-factory.mjs')+' serve');
      if(!controllerProcess||!identity.includes(state))throw new Error('PID identity changed; refusing to signal an unrelated process');
      process.kill(pid,'SIGTERM');
      for(let i=0;i<40&&existsSync(lock);i++)await sleep(250);
      if(existsSync(lock))throw new Error('Stop unconfirmed; inspect supervisor and do not start replacement workers');
    } else rmSync(lock);
  }
  stopContainers(state);console.log('Controller and its labelled containers stopped.');
}
async function submit(workflow,spec) {
  if(Buffer.byteLength(spec)>240000)throw new Error('Task exceeds 240 KB');
  const title=workflow==='defence'?'Private incident triage':spec.split('\n').find(s=>s.trim())?.replace(/^#+\s*/, '').slice(0,100)||'Software task';
  return api(state,'/api/v1/jobs',{workflow,repository:'app',spec,title});
}
async function jobAction(action) {
  const id=positional[0];if(!/^job_[a-z0-9]+$/.test(id || ''))throw new Error('A job ID is required');
  const snapshot=await api(state,'/api/v1/status'),job=snapshot.jobs.find(j=>j.id===id);
  if(!job)throw new Error('Job not found');
  const current=job.runs.at(-1);
  if(action==='approve'&&job.state!=='awaiting_approval')throw new Error('Job is not awaiting approval');
  if(action==='retry'&&!['interrupted','failed','blocked','cancelled'].includes(job.state))throw new Error('Only a stopped attempt can be retried');
  let feedback;
  if(action==='request_changes') {
    if(!flags.file)throw new Error('revise requires --file feedback.md');
    feedback=readFileSync(resolve(flags.file),'utf8');
    if(!feedback.trim()||feedback.length>4000)throw new Error('Provide revision feedback under 4000 characters');
  }
  // The controller validates the current run and owns reconciliation atomically.
  // A CLI-side stop after a stale snapshot could terminate a newer attempt.
  await api(state,`/api/v1/jobs/${id}/${action}`,{run_id:current?.id,...(feedback===undefined?{}:{feedback})});
  console.log(`${action}: ${id}`);
}

try {
  if(command==='init') { if(!flags.repo)throw new Error('init requires --repo /path/to/existing/git/repo');init(flags.repo,flags.agent,flags.check,flags.port); }
  else if(command==='install')await withServiceOperation('install',install);
  else if(command==='up') { if(hasService(state))await manageService('controller','start',state);else await withServiceOperation('up',up); }
  else if(command==='stop') { if(hasService(state))await manageService('controller','stop',state);else await withServiceOperation('stop',stop); }
  else if(command==='serve') {
    const managed=isManagedLaunch(state);
    if(hasService(state)&&!managed)throw new Error('This installation is managed; use service start instead of foreground serve');
    const launch=async()=>{
    if(process.getuid()===0)throw new Error('Use a dedicated unprivileged operator account');
    const lock=join(state,'supervisor.json');if(existsSync(lock)){if(alive(json(lock).pid))throw new Error('Supervisor already running');rmSync(lock);}
    if(!existsSync(join(state,'engine.json')))throw new Error('Run install first');
    run('docker',['image','inspect',configAt(state).image]);
    registerInstallation(state);await portFree(configAt(state).port);
    const { supervise } = await import('../factory/supervisor.mjs');await supervise(state);
    };
    if(managed)await launch();else await withServiceOperation('serve',launch);
  }
  else if(command==='service') {
    if(!positional.length || positional[0]==='print')console.log(serviceDefinition(state));
    else await manageService('controller',positional[0],state,flags);
  }
  else if(command==='tunnel')await manageService('tunnel',positional[0],state,flags);
  else if(command==='status') { const snapshot=await api(state,'/api/v1/status');delete snapshot.csrf_token;console.log(JSON.stringify(snapshot,null,2)); }
  else if(command==='doctor') {
    const config=configAt(state);console.log(JSON.stringify({node:process.version,docker:run('docker',['info','--format','{{.ServerVersion}}']),engineInstalled:existsSync(join(state,'engine.json')),repo:config.repo,agent:config.agent,checksConfigured:!!config.check?.trim(),inference:'Not called or verified',dashboard:`http://127.0.0.1:${config.port}`},null,2));
  } else if(command==='run') {
    let spec;
    if(flags.issue) {
      if(!/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(flags.issue))throw new Error('Expected a GitHub issue URL');
      const origin=run('git',['-C',configAt(state).repo,'remote','get-url','origin']);
      const match=origin.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/);
      if(!match||!flags.issue.toLowerCase().startsWith(`https://github.com/${match[1].toLowerCase()}/issues/`))throw new Error('Issue does not belong to the configured app origin; use a scoped task file for other input');
      const issue=JSON.parse(run('gh',['issue','view',flags.issue,'--json','title,body,url']));
      spec=`Issue: ${issue.url}\n${issue.title}\n\n${issue.body}`;
    } else if(flags.file)spec=readFileSync(resolve(flags.file),'utf8');
    else throw new Error('Use --file task.md or --issue https://github.com/owner/repo/issues/123');
    if(!configAt(state).check?.trim())throw new Error('Configure an app check before submitting software work');
    console.log(JSON.stringify(await submit('software',spec)));
  } else if(command==='incident') {
    if(!flags.file)throw new Error('Use --file incident.json; see factory/examples/incident.json');
    console.log(JSON.stringify(await admitIncident(state,json(resolve(flags.file)),submit)));
  } else if(['approve','cancel','retry'].includes(command))await jobAction(command);
  else if(command==='revise')await jobAction('request_changes');
  else if(command==='demo') {
    state=resolve(flags.state || DEFAULT_DEMO_STATE);
    const repo=join(state,'sample-app');
    if(!existsSync(join(state,'factory.json'))) {
      mkdirSync(repo,{recursive:true,mode:0o700});run('git',['init','-b','main',repo]);
      writeFileSync(join(repo,'value.txt'),'broken\n');run('git',['-C',repo,'add','value.txt']);
      run('git',['-C',repo,'-c','user.name=Factory demo','-c','user.email=demo@localhost','commit','-m','Synthetic fixture']);
      init(repo,'mock',"test \"$(cat value.txt)\" = fixed",Number(flags.port || 7332));
    } else if(configAt(state).agent!=='mock')throw new Error('Demo requires a mock configuration');
    await withServiceOperation('demo startup',async()=>{await install();await up();});console.log(JSON.stringify(await submit('software','Synthetic installation qualification: fix value.txt. No inference is used.')));
    console.log('Review the synthetic change in the dashboard and approve its handoff.');
  } else if(['version','--version','-v'].includes(command))console.log(VERSION);
  else if(command==='qualify') {
    await stream(process.execPath,[join(ROOT,'scripts/probe-platform.mjs'),state]);
  } else if(command==='kit') {
    if(!flags.output)throw new Error('kit requires --output NEW_DIRECTORY');
    await stream(process.execPath,[join(ROOT,'scripts/export-kit.mjs'),resolve(flags.output)]);
  } else if(['help','--help','-h'].includes(command))console.log(`Software & Defence Factory ${VERSION} (test release)

  kit --output NEW_DIRECTORY               Export the portable method without a runtime
  demo                                    Install and run a synthetic sample (no model key)
  qualify --state PATH                    Exercise recovery and isolation with a stopped demo job
  init --repo PATH --agent codex|pi|custom --check "npm ci && npm test"
  install                                 Build the isolated job image; the controller ships with the CLI
  doctor | up | status | stop              Inspect / operate your private installation
  serve                                   Foreground supervisor
  service [print]                         Print a systemd user-service definition
  service install|start|stop|restart       Manage a Linux user service (--state PATH)
                                          install accepts --group EXISTING_GROUP
  service status|logs|uninstall            Diagnose / remove service, preserve private state
  service update                          Update idle managed controllers, restore on failure
  service updates --auto on|off|status     Daily idle updates through a systemd timer
  service resume                          Release a reconciled maintenance reservation
  tunnel install|start|stop|status|logs|uninstall --host SSH_ALIAS --port PORT
                                          Persistent loopback SSH tunnel (macOS/Linux)
  run --file task.md | --issue URL         Submit one software vertical slice
  incident --file incident.json            Submit a private, read-only incident draft
  approve JOB_ID | cancel JOB_ID           Review gate / stop this attempt
  retry JOB_ID                            Prove stop; retain old checkout and retry
  revise JOB_ID --file feedback.md         New build/check/review after a stopped review
  version                                 Show the active CLI version
  update | update --check                 Update the npm CLI / inspect the latest release
  update --auto on|off                    Control automatic daily CLI updates

Runtime commands accept --state PATH. Default: ${DEFAULT_STATE}
Demo default: ${DEFAULT_DEMO_STATE}
The npm CLI keeps state outside the package; updates wait for stopped installations.
Dashboard binds only to loopback; use SSH for remote access.
Setup plan: ${join(ROOT, 'docs/setup.md')}
See docs/quickstart.md for task execution, evidence and recovery.`);
  else throw new Error(`Unknown command: ${command}`);
} catch(error) {console.error(`Factory: ${error.message}`);process.exitCode=1;}
