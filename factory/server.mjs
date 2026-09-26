import { harnessOf } from './lib.mjs';
import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, lstatSync, realpathSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { readIssue } from './issue-intake.mjs';
import { machineInfo } from './machine.mjs';
import { factoryDefinition } from './definition.mjs';
import { JobQueue, QueueError } from './queue.mjs';
import { executors } from './processes.mjs';
import { configAt, ROOT } from './lib.mjs';
import { VERSION } from './updates.mjs';
import { readProjectLinks } from './project-links.mjs';
import { attemptPresentation } from './execution-profile.mjs';

function equal(a, b) { return typeof a === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
async function body(request) {
  let text = '';
  for await (const part of request) { text += part; if (Buffer.byteLength(text) > 256000) throw new QueueError('Request too large', 413); }
  try { const value = JSON.parse(text); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; }
  catch { throw new QueueError('Expected a JSON object', 400); }
}
function artifacts(state, jobId) {
  const root = join(state, 'jobs', jobId, 'artifacts'); if (!existsSync(root)) return [];
  return readdirSync(root).filter(name => /^run_[a-f0-9]+$/.test(name)).flatMap(runId =>
    readdirSync(join(root, runId)).filter(name => /^[\w.-]+\.(?:md|json|patch|log)$/.test(name)).flatMap(name => {
      const stat = lstatSync(join(root, runId, name));
      return stat.isFile() && !stat.isSymbolicLink() ? [{ id: `${jobId}~${runId}~${name}`, run_id: runId, path: name, storagePath: `${runId}/${name}`, size: stat.size, bytes: stat.size, content_type: 'text/plain' }] : [];
    }));
}
export function createController(state, adapter = executors(state)) {
  const config = configAt(state), csrf = randomBytes(32).toString('hex');
  const token = readFileSync(join(state, 'worker.token'), 'utf8').trim();
  const queue = new JobQueue(state, adapter);
  const projectLinks = readProjectLinks(config.repo);
  const definitions = factoryDefinition(config), host = machineInfo();
  const server = http.createServer(async (request, response) => {
    const send = (status, value, type = 'application/json; charset=utf-8') => { response.writeHead(status, { 'Content-Type': type }); response.end(type.startsWith('application/json') ? JSON.stringify(value) : value); };
    response.setHeader('Cache-Control', 'no-store'); response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const port = server.address().port, hosts = [`localhost:${port}`, `127.0.0.1:${port}`];
      if (!hosts.includes(request.headers.host)) throw new QueueError('Host is not allowed', 403);
      if (request.headers.origin && !hosts.map(host => `http://${host}`).includes(request.headers.origin)) throw new QueueError('Origin is not allowed', 403);
      if (request.headers['sec-fetch-site'] === 'cross-site') throw new QueueError('Cross-site access is not allowed', 403);
      const url = new URL(request.url, `http://${request.headers.host}`);
      const authenticated = equal(request.headers.authorization, `Bearer ${token}`) || equal(request.headers['x-factory-session'], csrf);
      if (request.method === 'GET' && url.pathname === '/api/v1/status') {
        const jobs = queue.all().map(job => ({ ...job, can_request_changes: queue.canRequestChanges(job), runs: job.runs.map(attempt => attemptPresentation({ ...attempt,
          outcome: attempt.outcome || (attempt.state === 'succeeded' ? 'complete' : undefined) }, adapter.usage?.(job, attempt))) }));
        return send(200, { version: 1, runtime_version: VERSION, maintenance: queue.maintenance, workflows: Object.keys(definitions.workflows), commands: [], triggers: [], jobs, csrf_token: csrf,
          infrastructure: { host, controller: { connected: !queue.closing }, workers: [{ id: 'local-executor', name: 'Local worker', host: host.hostname, connected: !queue.closing }] },
          automations: [],
          workers: [{ name: 'Local worker', machine: host, instance_id: 'local-executor', repositories: ['app'], connected: !queue.closing, last_seen_at: new Date().toISOString() }], // v1 compatibility view
          repositories: ['app'], repo: config.repo, project_links: projectLinks, harness: harnessOf(config), agent: harnessOf(config) });
      }
      if (request.method === 'GET' && url.pathname === '/api/v1/definitions') {
        return send(200, definitions);
      }
      const content = url.pathname.match(/^\/api\/v1\/artifacts\/(job_[a-f0-9]+)~(run_[a-f0-9]+)~([\w.-]+)\/content$/);
      const artifactList = url.pathname.match(/^\/api\/v1\/jobs\/(job_[a-f0-9]+)\/artifacts$/);
      if (request.method === 'GET' && (artifactList || content)) {
        if (!authenticated) throw new QueueError('Session required', 403);
        const jobId = (artifactList || content)[1]; queue.get(jobId);
        const entries = artifacts(state, jobId), file = content ? `${content[2]}/${content[3]}` : url.searchParams.get('file');
        if (!file) return send(200, entries);
        if (!entries.some(item => item.storagePath === file && item.bytes <= 1024 * 1024)) throw new QueueError('Artifact not available', 404);
        const root = realpathSync(join(state, 'jobs', jobId, 'artifacts')), path = realpathSync(resolve(root, file));
        if (!path.startsWith(root + sep)) throw new QueueError('Artifact path rejected', 403);
        return send(200, readFileSync(path), 'text/plain; charset=utf-8');
      }
      if (request.method === 'POST') {
        if (!authenticated) throw new QueueError('Session required', 403);
        if (!(request.headers['content-type'] || '').startsWith('application/json')) throw new QueueError('Use application/json', 415);
        const input = await body(request);
        if (url.pathname === '/api/v1/maintenance') {
          if (!equal(request.headers.authorization, `Bearer ${token}`)) throw new QueueError('Operator token required for maintenance', 403);
          return send(200, queue.setMaintenance(input.enabled));
        }
        if (url.pathname === '/api/v1/issues/preview') {
          try { return send(200, await readIssue(config.repo, input.url)); }
          catch (error) { throw new QueueError(error.message, 400); }
        }
        if (url.pathname === '/api/v1/jobs') {
          if (input.model && input.model !== config.model && !['codex','pi'].includes(harnessOf(config))) throw new QueueError('Model overrides require a codex or pi executor', 400);
          return send(201, queue.submit(input));
        }
        const action = url.pathname.match(/^\/api\/v1\/jobs\/(job_[a-f0-9]+)\/(approve|cancel|retry|request_changes)$/);
        if (action) return send(200, await queue.action(action[1], action[2], input));
      }
      const removal = url.pathname.match(/^\/api\/v1\/jobs\/(job_[a-f0-9]+)$/);
      if (request.method === 'DELETE' && removal) {
        if (!authenticated) throw new QueueError('Session required', 403);
        return send(200, await queue.remove(removal[1]));
      }
      const asset = url.pathname.match(/^\/assets\/([\w.-]+\.(js|css|woff2))$/);
      if (request.method === 'GET' && (url.pathname === '/' || asset)) {
        const name = asset ? `assets/${asset[1]}` : 'index.html';
        const types = { js: 'text/javascript', css: 'text/css', woff2: 'font/woff2' };
        const path = join(ROOT, 'factory/ui', name);
        if (!existsSync(path)) throw new QueueError('Asset not found', 404);
        return send(200, readFileSync(path), asset ? types[asset[2]] : 'text/html; charset=utf-8');
      }
      throw new QueueError('Not found', 404);
    } catch (error) { if (!error.status) console.error(error); send(error.status || 500, { error: error.status ? error.message : 'Controller error; see private logs' }); }
  });
  server.requestTimeout = 20000; server.headersTimeout = 15000; server.on('listening', () => queue.schedule());
  return { server, queue, async close() { await queue.close(); await new Promise(resolve => server.close(resolve)); } };
}
