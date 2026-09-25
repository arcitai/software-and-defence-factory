import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { systemdUnit, launchAgent, tunnelArguments, serviceId, groupArguments, runtimeLauncher } from '../factory/service-files.mjs';
import { JobQueue } from '../factory/queue.mjs';
import { createController } from '../factory/server.mjs';

const task = { workflow: 'software', repository: 'app', spec: 'Synthetic service fixture' };
const adapter = { execute: async () => ({ outcome: 'blocked', summary: 'synthetic' }), stop: async () => {}, reconcile: async () => {} };
function temp(t) { const path = mkdtempSync(join(tmpdir(), 'sdf-service-')); t.after(() => rmSync(path, { recursive: true, force: true })); return path; }
test('service definitions preserve argument boundaries and private restart behavior', t => {
  const spec = { id: serviceId('tunnel', 'host:7331'), description: 'Factory fixture', argv: ['/usr/bin/node', '/tmp/sp ace/$file%name.mjs', 'serve'], directory: '/tmp/sp ace', environment: { PATH: '/usr/bin:/bin' }, log: '/tmp/private<&.log' };
  const unit = systemdUnit(spec);
  assert.match(unit, /"\/tmp\/sp ace\/\$\$file%%name.mjs"/);
  assert.match(unit, /Restart=always/); assert.match(unit, /KillMode=control-group/); assert.match(unit, /UMask=0077/);
  assert.match(unit, /WorkingDirectory=\/tmp\/sp ace\n/);
  assert.throws(() => systemdUnit({ ...spec, argv: ['/usr/bin/node', 'bad\nExecStart=anything'] }), /control/);
  const plist = launchAgent(spec), path = join(temp(t), 'fixture.plist'); writeFileSync(path, plist);
  assert.match(plist, /private&lt;&amp;.log/);
  if (process.platform === 'darwin') assert.equal(spawnSync('/usr/bin/plutil', ['-lint', path]).status, 0);
  const args = tunnelArguments('fixture-host', 7345);
  assert.ok(args.includes('127.0.0.1:7345:127.0.0.1:7345'));
  for (const policy of ['BatchMode=yes', 'StrictHostKeyChecking=yes', 'ExitOnForwardFailure=yes']) assert.ok(args.includes(policy));
  assert.throws(() => tunnelArguments('-oProxyCommand=anything', 7345));
  assert.throws(() => tunnelArguments('fixture', 22));
  const argumentsWithQuotes = groupArguments(['/usr/bin/node', "/tmp/a'b $value.mjs"], 'docker', '/usr/bin/newgrp');
  assert.equal(argumentsWithQuotes[3], "exec '/usr/bin/node' '/tmp/a'\\''b $value.mjs'");
  assert.throws(() => groupArguments(['node'], 'group;id', '/usr/bin/newgrp'));
});
test('maintenance rejects queued or active work and survives controller replacement', async t => {
  const state = temp(t), first = new JobQueue(state, adapter);
  first.submit(task);
  assert.throws(() => first.setMaintenance(true), /busy/);
  while (first.pumping) await new Promise(resolve => setTimeout(resolve, 5));
  const before = first.all(); first.setMaintenance(true);
  assert.throws(() => first.submit(task), /maintenance/);
  await assert.rejects(first.action(before[0].id, 'retry', { run_id: before[0].runs.at(-1).id }), /maintenance/);
  await first.close();
  const next = new JobQueue(state, adapter); t.after(() => next.close());
  assert.equal(next.maintenance, true); assert.deepEqual(next.all(), before);
  assert.throws(() => next.submit(task), /maintenance/);
  next.setMaintenance(false); next.submit(task);
  assert.equal(next.all().length, 2);
});
test('maintenance uses the operator credential; browser sessions cannot reserve the controller', async t => {
  const state = temp(t);
  writeFileSync(join(state, 'factory.json'), JSON.stringify({ version: 1, repo: state, agent: 'mock', command: ['mock'], port: 7332, timeoutSeconds: 10, memoryMiB: 256, image: 'fixture:1', network: 'none', check: 'true', scope: { project: 'p', service: 's', environment: 'test', owner: 'fixture' } }));
  writeFileSync(join(state, 'worker.token'), 'synthetic-private-token');
  const controller = createController(state, adapter);
  await new Promise(resolve => controller.server.listen(0, '127.0.0.1', resolve)); t.after(() => controller.close());
  const origin = `http://127.0.0.1:${controller.server.address().port}`;
  const status = await (await fetch(origin + '/api/v1/status')).json();
  const reserve = headers => fetch(origin + '/api/v1/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: '{"enabled":true}' });
  assert.equal((await reserve({ 'X-Factory-Session': status.csrf_token })).status, 403);
  assert.equal((await reserve({ Authorization: 'Bearer synthetic-private-token' })).status, 200);
  assert.equal((await (await fetch(origin + '/api/v1/status')).json()).maintenance, true);
  const submit = await fetch(origin + '/api/v1/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Factory-Session': status.csrf_token }, body: JSON.stringify(task) });
  assert.equal(submit.status, 409); assert.equal(controller.queue.all().length, 0);
});
test('lifecycle operations and managed updates share one exclusive operation lock', t => {
  const state = temp(t);
  const module = new URL('../factory/services.mjs', import.meta.url).href;
  const program = `
    import assert from 'node:assert/strict';
    import { existsSync } from 'node:fs';
    import { withServiceOperation, manageService } from ${JSON.stringify(module)};
    await withServiceOperation('fixture update', async () => {
      await assert.rejects(withServiceOperation('second update', async () => {}), /Another service operation/);
      if (process.getuid() !== 0) for (const action of ['start','stop','restart','uninstall','install','resume'])
        await assert.rejects(manageService('controller', action, '/not-an-installation'), /Another service operation/);
    });
    assert.equal(existsSync(${JSON.stringify(join(state, 'software-defence-factory/service-update.lock'))}), false);
    assert.equal(await withServiceOperation('next operation', async () => 42), 42);
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', program], { encoding: 'utf8', env: { ...process.env, XDG_STATE_HOME: state } });
  assert.equal(result.status, 0, result.stderr);
});

test('managed launchers ignore ordinary CLI update selections, including while stopped', t => {
  const home = temp(t), runtime = join(home, 'retained'), dataHome = join(home, 'data');
  const fixture = (root, version) => {
    mkdirSync(join(root, 'bin'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'software-defence-factory', version }));
    writeFileSync(join(root, 'bin/software-defence-factory.mjs'), `console.log(${JSON.stringify(version)});`);
  };
  fixture(runtime, '0.4.0');
  for (const version of ['0.4.1', '0.4.2']) fixture(join(dataHome, 'releases', version, 'node_modules/software-defence-factory'), version);
  const launcher = join(home, 'launch.mjs');
  writeFileSync(launcher, runtimeLauncher({ runtime, stateHome: home, dataHome }));
  const selected = () => {
    const result = spawnSync(process.execPath, [launcher], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
  };
  writeFileSync(join(home, 'updates.json'), '{"version":"0.4.1"}');
  assert.equal(selected(), '0.4.0');
  writeFileSync(join(home, 'service-release.json'), '{"version":"0.4.1"}');
  assert.equal(selected(), '0.4.1');
  writeFileSync(join(home, 'updates.json'), '{"version":"0.4.2"}');
  assert.equal(selected(), '0.4.1');
  writeFileSync(join(home, 'service-release.json'), '{}');
  assert.equal(selected(), '0.4.0');
});
