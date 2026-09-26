import { execFileSync } from 'node:child_process';
import { githubIssueProvider } from './providers/github.mjs';
import { readProjectLinks } from './project-links.mjs';
import { QueueError } from './queue.mjs';

// Selection is local and capability-based. Unknown hosts never receive a GitHub
// token or a guessed API request. Git checkout/execution does not need an adapter.
export function issueProvider(repo) {
  if (readProjectLinks(repo)) return githubIssueProvider(repo);
  let host = null;
  try {
    const remote = execFileSync('git', ['-c', 'core.fsmonitor=false', '-C', repo, 'config', '--local', '--get', 'remote.origin.url'], { encoding:'utf8', timeout:2000, maxBuffer:4096, stdio:['ignore','pipe','ignore'], env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'} }).trim();
    if (/^(https?|ssh):\/\//.test(remote)) host = new URL(remote).hostname;
    else host = remote.match(/^(?:[^@\s]+@)?([a-zA-Z0-9.-]+):[^/]/)?.[1] || null;
    if (!/^[a-zA-Z0-9.-]+$/.test(host || '')) host = null;
  } catch { /* No recognizable network origin; local execution remains available. */ }
  const unavailable = async () => { throw new QueueError('This repository has no supported issue provider. Use a local brief; no remote issue will be created.', 400); };
  return { id:'unsupported', label:'Repository host', repository:null, host, supported:false,
    capabilities:{issues:false,templates:false,create:false},
    context:unavailable, list:unavailable, preview:unavailable, templates:unavailable, draft:unavailable, publish:unavailable, recover:unavailable };
}
export function providerInfo(provider) {
  return {id:provider.id,label:provider.label,repository:provider.repository,host:provider.host || null,supported:provider.supported,capabilities:provider.capabilities};
}
