import { execFileSync } from 'node:child_process';

// Only a canonical public web URL is exposed. Git transports may contain
// credentials; never return the original remote or derive an owner from a path.
export function githubProjectLinks(remote) {
  if (typeof remote !== 'string' || remote.length > 2048) return undefined;
  const match = remote.trim().match(/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/);
  if (!match || ['.', '..'].includes(match[2])) return undefined;
  const repository = `https://github.com/${match[1]}/${match[2]}`;
  return { repository, new_issue: `${repository}/issues/new`, source: 'configured_git_origin' };
}
export function readProjectLinks(repo) {
  try {
    const remote = execFileSync('git', ['-c', 'core.fsmonitor=false', '-C', repo, 'config', '--local', '--get', 'remote.origin.url'], {
      encoding: 'utf8', timeout: 2000, maxBuffer: 4096, stdio: ['ignore', 'pipe', 'ignore'],
      env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' },
    });
    return githubProjectLinks(remote);
  } catch { return undefined; }
}
