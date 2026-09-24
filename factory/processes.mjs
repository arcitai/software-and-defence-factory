import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, configAt, run, json, stopContainers, sleep } from './lib.mjs';

const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; } };
export function executors(state) {
  const children = new Map();
  async function stop(jobId) {
    const running = children.get(jobId);
    if (running) {
      try { process.kill(-running.child.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
      await Promise.race([running.done, sleep(2000)]);
      if (alive(-running.child.pid)) {
        try { process.kill(-running.child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
        await running.done;
      }
    }
    stopContainers(state, jobId);
    if (running && !alive(-running.child.pid)) rmSync(join(state, 'jobs', jobId, 'active.json'), { force: true });
  }
  async function reconcile(jobId, phase) {
    if (children.has(jobId)) throw new Error('Previous executor is still finishing');
    stopContainers(state, jobId);
    const folder = join(state, 'jobs', jobId), lock = join(folder, 'active.json');
    if (existsSync(lock)) {
      const previous = json(lock);
      if (!Number.isSafeInteger(previous.pid) || alive(previous.pid)) throw new Error('Previous executor is still present or unknown');
      if (!Number.isSafeInteger(previous.pgid) || run('ps', ['-axo', 'pgid=']).split('\n').map(Number).includes(previous.pgid))
        throw new Error('Previous process group is still present or unknown');
      rmSync(lock);
    }
    if (['build', 'defence'].includes(phase) && existsSync(join(folder, 'checkout')))
      renameSync(join(folder, 'checkout'), join(folder, `previous-checkout-${Date.now()}`));
  }
  async function execute(job, attempt) {
    const config = configAt(state), output = join(state, 'jobs', job.id, 'artifacts', attempt.id);
    mkdirSync(output, { recursive: true, mode: 0o700 });
    const resultPath = join(output, 'result.json'), fd = openSync(join(output, 'executor.log'), 'a', 0o600);
    const child = spawn(process.execPath, [join(ROOT, 'factory/executor.mjs'), state, attempt.command], {
      detached: true, stdio: ['pipe', fd, fd], env: { ...process.env, SDF_JOB_ID: job.id, SDF_RUN_ID: attempt.id, SDF_MODEL: job.model || '', SDF_OUTPUT_DIR: output, SDF_STEP_RESULT_PATH: resultPath },
    }); closeSync(fd);
    let finish;
    const done = new Promise(resolve => { finish = resolve; });
    children.set(job.id, { child, done });
    child.on('error', error => finish({ error }));
    child.on('close', code => finish({ code }));
    child.stdin.on('error', error => { if (error.code !== 'EPIPE') finish({ error }); }); child.stdin.end(job.prompt);
    const deadline = setTimeout(() => { stop(job.id).catch(error => console.error(error.message)); }, (config.timeoutSeconds + 30) * 1000);
    let exit;
    try { exit = await done; }
    finally { clearTimeout(deadline); children.delete(job.id); }
    if (exit.error) throw exit.error;
    if (!existsSync(resultPath)) throw new Error(`Executor exited ${exit.code} without a result`);
    const outcome = JSON.parse(readFileSync(resultPath, 'utf8'));
    if (exit.code !== 0 || outcome.outcome !== 'complete') return { outcome: 'blocked', summary: outcome.summary || `Executor exited ${exit.code}` };
    return outcome;
  }
  return { execute, stop, reconcile };
}
