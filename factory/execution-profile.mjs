import { hostname } from 'node:os';
import { digest } from './lib.mjs';
import { VERSION } from './updates.mjs';

export function withRequestedModel(configuration, requestedModel) {
  const config = structuredClone(configuration);
  if (requestedModel && requestedModel !== config.model) {
    if (!['codex', 'pi'].includes(config.agent)) throw new Error('Task model overrides require codex or pi');
    config.model = requestedModel;
    const index = config.command.indexOf('--model');
    if (index >= 0) config.command[index + 1] = requestedModel;
    else config.command.splice(config.agent === 'codex' ? config.command.length - 1 : config.command.length, 0, '--model', requestedModel);
  }
  return config;
}

// Public facts only. The complete admitted configuration stays in private state.
export function executionProfile(config, phase) {
  const deterministic = ['verify', 'handoff'].includes(phase);
  return {
    version: 1, phase, executor: deterministic ? 'deterministic' : config.agent,
    requestedModel: deterministic ? null : config.model || null,
    runtimeVersion: VERSION, image: phase === 'handoff' ? null : config.image,
    policyHash: digest(JSON.stringify(config)), workerName: hostname(),
  };
}

export function attemptPresentation(attempt) {
  const profile = attempt.execution;
  return {
    ...attempt, executor: profile?.executor ?? 'unknown',
    model: profile?.requestedModel ?? null, worker_name: profile?.workerName ?? null,
    provenance_status: profile ? 'recorded' : attempt.started_at ? 'unknown' : 'not_started',
  };
}
