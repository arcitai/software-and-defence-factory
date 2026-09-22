// Optional integration probe against an already installed Pi. No installs, credentials,
// external inference, browser control or factory jobs. The local provider is synthetic.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, access, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const binary = process.argv[2] || 'pi';
const baseEnv = { PATH: process.env.PATH, PI_OFFLINE: '1', PI_TELEMETRY: '0' };
const version = spawnSync(binary, ['--version'], { env: baseEnv, encoding: 'utf8', timeout: 5000 });
if (version.error || version.status !== 0) throw new Error('An already installed Pi executable is required. Nothing was installed.');
const root = await mkdtemp(join(tmpdir(), 'arcitai-pi-probe-'));
const workspace = join(root, 'workspace');
const agentDir = join(root, 'agent');
const marker = join(workspace, 'ambient-extension-ran');
const events = [];
let child, requests = 0, sawReadResult = false, cancelledConnection = false, serverError;
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.method, 'POST');
    assert.equal(req.url, '/v1/chat/completions');
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 256_000) throw new Error('Request exceeded probe bound');
    }
    const payload = JSON.parse(body);
    assert.equal(payload.model, 'factory-probe');
    assert.deepEqual(payload.tools.map(t => t.function.name), ['read']);
    assert.equal(payload.stream, true);
    requests++;
    if (requests === 3) {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.flushHeaders();
      res.on('close', () => { cancelledConnection = true; });
      return; // A deliberately stalled model request for the abort check.
    }
    if (requests === 4) {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'Synthetic provider unavailable', type: 'server_error' } }));
      return;
    }
    assert.ok(requests <= 4);
    if (requests === 2) sawReadResult = payload.messages.some(m => m.role === 'tool' && JSON.stringify(m.content).includes('ARCITAI_PROBE_FIXTURE'));
    const tool = requests === 1;
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const chunk = (delta, finish = null, usage) => res.write(`data: ${JSON.stringify({
      id: 'synthetic-completion', object: 'chat.completion.chunk', created: 1, model: 'factory-probe',
      choices: [{ index: 0, delta, finish_reason: finish }], ...(usage ? { usage } : {})
    })}\n\n`);
    chunk({ role: 'assistant', ...(tool ? { tool_calls: [{ index: 0, id: 'fixture-read', type: 'function', function: { name: 'read', arguments: '{"path":"fixture.txt"}' } }] } : { content: 'PROBE_OK\u2028one JSON record' }) });
    chunk({}, tool ? 'tool_calls' : 'stop', { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 });
    res.end('data: [DONE]\n\n');
  } catch (error) {
    serverError = error;
    res.destroy();
  }
});
const pending = new Map();
let sequence = 0;
function command(type, data = {}) {
  const id = String(++sequence);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`RPC timeout: ${type}`)); }, 15_000);
    pending.set(id, { resolve: event => { clearTimeout(timer); resolve(event); }, reject: error => { clearTimeout(timer); reject(error); } });
    child.stdin.write(JSON.stringify({ id, type, ...data }) + '\n');
  });
}
async function until(predicate, label) {
  const end = Date.now() + 15_000;
  while (!predicate()) {
    if (serverError) throw serverError;
    if (Date.now() > end) throw new Error(`Timed out: ${label}`);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
try {
  await mkdir(join(workspace, '.pi', 'extensions'), { recursive: true });
  await mkdir(agentDir);
  await writeFile(join(workspace, 'fixture.txt'), 'ARCITAI_PROBE_FIXTURE\n');
  await writeFile(join(workspace, '.pi', 'extensions', 'ambient.ts'), `import { writeFileSync } from 'node:fs'; export default function () { writeFileSync(${JSON.stringify(marker)}, 'loaded'); }`);
  await writeFile(join(agentDir, 'settings.json'), JSON.stringify({
    defaultProjectTrust: 'never', enableInstallTelemetry: false, retry: { enabled: false }, compaction: { enabled: false }
  }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  await writeFile(join(agentDir, 'models.json'), JSON.stringify({ providers: { 'factory-probe': {
    baseUrl: `http://127.0.0.1:${server.address().port}/v1`, api: 'openai-completions', apiKey: 'not-a-real-key',
    models: [{ id: 'factory-probe', input: ['text'], reasoning: false, contextWindow: 32768, maxTokens: 2048,
      cost: { input: 1, output: 2, cacheRead: 0, cacheWrite: 0 } }]
  } } }));
  child = spawn(binary, [
    '--mode', 'rpc', '--offline', '--no-approve', '--no-extensions', '--no-skills',
    '--no-prompt-templates', '--no-themes', '--no-context-files', '--no-session',
    '--provider', 'factory-probe', '--model', 'factory-probe', '--thinking', 'off', '--tools', 'read'
  ], { cwd: workspace, env: { ...baseEnv, PI_CODING_AGENT_DIR: agentDir }, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '', bytes = 0;
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', text => {
    bytes += Buffer.byteLength(text);
    if (bytes > 1_000_000) { serverError = new Error('RPC output exceeded probe bound'); child.kill(); return; }
    buffer += text;
    // LF only: Unicode U+2028/U+2029 may legally occur inside a JSON string.
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, index).replace(/\r$/, '');
      buffer = buffer.slice(index + 1);
      if (!line) continue;
      try {
        const event = JSON.parse(line);
        events.push(event);
        if (event.type === 'response' && pending.has(event.id)) {
          pending.get(event.id).resolve(event); pending.delete(event.id);
        }
      } catch { serverError = new Error('Invalid RPC JSON record'); }
    }
  });
  child.stderr.on('data', () => {}); // Do not print paths or ambient process diagnostics.
  child.on('error', error => { serverError = error; });
  const state = await command('get_state');
  assert.equal(state.success, true);
  assert.equal(state.data.model.id, 'factory-probe');
  assert.equal((await command('prompt', { message: 'Read fixture.txt. This is a synthetic transport probe.' })).success, true);
  await until(() => events.some(e => e.type === 'agent_settled'), 'first completion');
  assert.equal(sawReadResult, true);
  assert.ok(events.some(e => e.type === 'tool_execution_end' && e.toolName === 'read' && !e.isError));
  assert.ok(events.some(e => e.type === 'message_end' && JSON.stringify(e.message).includes('PROBE_OK\u2028one JSON record')));
  const stats = await command('get_session_stats');
  assert.equal(stats.data.tokens.input, 200);
  assert.equal(stats.data.tokens.output, 20);
  assert.ok(Math.abs(stats.data.cost - 0.00024) < 1e-9);
  assert.equal((await command('prompt', { message: 'Start a cancellable synthetic request.' })).success, true);
  await until(() => requests === 3, 'stalled request');
  assert.equal((await command('clear_queue')).success, true);
  assert.equal((await command('abort')).success, true);
  await until(() => cancelledConnection, 'HTTP cancellation');
  assert.equal((await command('get_state')).data.isStreaming, false);
  const prior = events.length;
  assert.equal((await command('prompt', { message: 'Exercise a synthetic provider error.' })).success, true);
  await until(() => events.slice(prior).some(e => e.type === 'agent_settled'), 'provider error completion');
  assert.ok(events.slice(prior).some(e => e.type === 'message_end' && e.message?.stopReason === 'error'));
  assert.equal(requests, 4);
  await assert.rejects(access(marker));
  console.log(JSON.stringify({
    piVersion: version.stdout.trim(), result: 'passed', kind: 'synthetic-protocol-probe',
    checks: ['custom OpenAI-compatible provider', 'RPC prompt and real read-tool roundtrip',
      'LF framing with U+2028', 'synthetic usage and configured-cost accounting',
      'clear_queue + abort cancels stalled HTTP', 'accepted prompt can later fail', 'ambient extension excluded'],
    externalModelCalls: 0,
    limitations: ['No model-quality benchmark', 'No browser/desktop or OS-sandbox test',
      'No production worker, process-tree kill, provider billing or Kastanje compatibility proof']
  }, null, 2));
} finally {
  for (const item of pending.values()) item.reject(new Error('Probe stopped'));
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    const kill = setTimeout(() => child.kill('SIGKILL'), 1500);
    await exited;
    clearTimeout(kill);
  }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
