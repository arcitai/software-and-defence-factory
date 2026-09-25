import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, renameSync, rmSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, configAt, run, json, save, stopContainers, sleep } from './lib.mjs';
import { withRequestedModel, executionProfile } from './execution-profile.mjs';

const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; } };
// Older queues did not retain the verdict. Only recover it from the exact
// attempt's controller-exported review, bound to its checked candidate/policy.
export function retainedReviewVerdict(state, job, attempt) {
  try {
    const folder = join(state, 'jobs', job.id);
    const read = path => { const stat = lstatSync(path); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) return null; return json(path); };
    const review = read(join(folder, 'artifacts', attempt.id, 'review.json'));
    const candidate = read(join(folder, 'candidate.json')), checks = read(join(folder, 'checks.json'));
    if (review?.head && review.policyHash && review.head === candidate?.head && checks?.passed === true
      && checks.head === review.head && checks.policyHash === review.policyHash) return review.verdict;
  } catch { /* Missing or malformed legacy evidence cannot grant a revision action. */ }
}
export function executors(state) {
  const children = new Map();
  function prepare(job, attempt) {
    const config = withRequestedModel(configAt(state), job.model);
    // Resolve tags before admission so the recorded image is the one actually run.
    config.image = run('docker', ['image', 'inspect', '--format', '{{.Id}}', config.image]);
    if (!/^sha256:[a-f0-9]{64}$/.test(config.image)) throw new Error('Expected an immutable Docker image ID');
    const profile = executionProfile(config, attempt.command), folder = join(state, 'jobs', job.id);
    save(join(folder, attempt.id, 'execution-config.json'), config);
    save(join(folder, 'artifacts', attempt.id, 'execution.json'), profile);
    return profile;
  }
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
    const config = json(join(state, 'jobs', job.id, attempt.id, 'execution-config.json')), output = join(state, 'jobs', job.id, 'artifacts', attempt.id);
    mkdirSync(output, { recursive: true, mode: 0o700 });
    const resultPath = join(output, 'result.json'), fd = openSync(join(output, 'executor.log'), 'a', 0o600);
    const child = spawn(process.execPath, [join(ROOT, 'factory/executor.mjs'), state, attempt.command], {
      detached: true, stdio: ['pipe', fd, fd], env: { ...process.env, SDF_JOB_ID: job.id, SDF_RUN_ID: attempt.id, SDF_OUTPUT_DIR: output, SDF_STEP_RESULT_PATH: resultPath },
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
    if (exit.code !== 0 || outcome.outcome !== 'complete') return { outcome: 'blocked', summary: outcome.summary || `Executor exited ${exit.code}`, review_verdict: outcome.review_verdict };
    return outcome;
  }
  return { prepare, execute, stop, reconcile, reviewVerdict: (job, attempt) => retainedReviewVerdict(state, job, attempt) };
}
