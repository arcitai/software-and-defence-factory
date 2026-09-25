import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Per installation: managed boot bypasses the CLI's global service-operation
// lock. Hold this fence until image metadata is complete or the supervisor PID
// is visible, before any queued work can snapshot an execution profile.
export function acquireInstallationLock(state, action) {
  const path = join(state, 'installation.lock');
  try { writeFileSync(path, JSON.stringify({ pid: process.pid, action }), { flag: 'wx', mode: 0o600 }); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Another installation operation may own ${path}; reconcile its PID before removing the lock`);
    throw error;
  }
  return () => rmSync(path);
}
