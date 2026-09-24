import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PINS = JSON.parse(readFileSync(join(ROOT, 'factory/pins.json')));
export const DEFAULT_STATE = join(ROOT, '.factory/platform');
export const json = path => JSON.parse(readFileSync(path, 'utf8'));
export function save(path, value) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 }); renameSync(temp, path);
}
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${result.stderr || result.stdout || ''}`);
  return result.stdout?.trim() ?? '';
}
export function stream(command, args, options = {}) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', fail); child.on('exit', code => code === 0 ? ok() : fail(new Error(`${command} exited ${code}`)));
  });
}
export const digest = value => createHash('sha256').update(value).digest('hex');
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export function configAt(state) {
  const config = json(join(state, 'factory.json'));
  if (config.version !== 1 || !['mock','codex','pi','custom'].includes(config.agent)) throw new Error('Unsupported configuration');
  if (!Array.isArray(config.command) || !config.command.length || !config.command.every(v => typeof v === 'string' && v && !v.includes('\0'))) throw new Error('command must be an argument array');
  if (!Number.isInteger(config.port) || config.port < 1024 || config.port > 65535) throw new Error('Invalid port');
  if (!Number.isInteger(config.timeoutSeconds) || config.timeoutSeconds < 1 || config.timeoutSeconds > 7200) throw new Error('timeoutSeconds must be 1–7200');
  if (!Number.isInteger(config.memoryMiB) || config.memoryMiB < 256) throw new Error('Invalid memory limit');
  if (!['none','bridge'].includes(config.network)) throw new Error('network must be none or bridge; host networking is not supported');
  if (typeof config.image !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_./:@-]*$/.test(config.image)) throw new Error('Invalid container image');
  if (typeof config.repo !== 'string' || !isAbsolute(config.repo) || [config.repo,state,ROOT].some(p=>/[,\n\r]/.test(p))) throw new Error('Expected absolute paths without commas or line breaks');
  if (typeof config.check !== 'string' || !config.scope || !['project','service','environment','owner'].every(k=>typeof config.scope[k]==='string'&&config.scope[k].trim())) throw new Error('Missing check or installation scope');
  if (!existsSync(config.repo)) throw new Error('Configured repository is missing');
  return config;
}
export async function api(state, path, body, method) {
  const config = configAt(state);
  const response = await fetch(`http://127.0.0.1:${config.port}${path}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { Authorization: `Bearer ${readFileSync(join(state, 'worker.token'), 'utf8').trim()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(5000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Machinist ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}
export function instanceLabel(state) { return digest(resolve(state)).slice(0, 16); }
export function containers(state) {
  const ids = run('docker', ['ps', '-aq', '--filter', `label=arcitai.factory=${instanceLabel(state)}`]).split('\n').filter(Boolean);
  return ids.flatMap(id=>{
    const result=spawnSync('docker',['inspect',id],{encoding:'utf8'});
    if(result.error)throw result.error;
    // Normal completion can remove a container between list and inspect.
    if(result.status!==0) {
      if(/no such (object|container)/i.test(result.stderr))return [];
      throw new Error(`Cannot inspect job container: ${result.stderr}`);
    }
    return JSON.parse(result.stdout);
  });
}
export function stopContainers(state, jobId) {
  for (const item of containers(state)) {
    if (jobId && item.Config.Labels['arcitai.job'] !== jobId) continue;
    if (item.State.Running) {
      try {run('docker', ['stop', '--time', '2', item.Id]);}
      catch(error) {if(containers(state).some(c=>c.Id===item.Id&&c.State.Running))throw error;}
    }
    try { run('docker', ['rm', item.Id]); } catch (error) {
      if (containers(state).some(c => c.Id === item.Id)) throw error;
    }
  }
}
export function generate(state, config) {
  const q = JSON.stringify;
  const stages = ['build','verify','review','handoff','defence'];
  writeFileSync(join(state, 'machinist.toml'), `[server]\nlisten=${q(`127.0.0.1:${config.port}`)}\ndatabase=${q(join(state,'machinist.db'))}\nworker_token_file=${q(join(state,'worker.token'))}\nmax_concurrent_jobs=1\n\n` + stages.map(name => `[commands.${name}]\nexecutor=${q(name)}\ntimeout=${q(`${config.timeoutSeconds + 30}s`)}\n`).join('\n') + '\n[workflows.software]\nsteps=["build","verify","review",{command="handoff",approval="before"}]\n\n[workflows.defence]\nsteps=["defence"]\n', { mode: 0o600 });
  writeFileSync(join(state, 'worker.toml'), `name=${q(`arcitai-${instanceLabel(state)}`)}\ndata_directory=${q(join(state,'worker'))}\n[control_plane]\nurl=${q(`http://127.0.0.1:${config.port}`)}\ntoken_file=${q(join(state,'worker.token'))}\n[repositories.app]\npath=${q(config.repo)}\n\n` + stages.map(name => `[executors.${name}]\ncommand=${JSON.stringify([process.execPath,join(ROOT,'factory/executor.mjs'),state,name])}\n`).join('\n'), { mode: 0o600 });
}
