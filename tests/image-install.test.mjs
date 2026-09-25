import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, renameSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PINS, save } from '../factory/lib.mjs';
import {
  assertImageChangeSafe, assertInstalledJobImage, installCustomJobImage,
  installStandardJobImage, inspectImageInstallation,
} from '../factory/image-install.mjs';

const imageA = `sha256:${'a'.repeat(64)}`;
const imageB = `sha256:${'b'.repeat(64)}`;
const imageC = `sha256:${'c'.repeat(64)}`;
const scope = { project: 'test', service: 'app', environment: 'test', owner: 'operator' };
const cli = fileURLToPath(new URL('../bin/software-defence-factory.mjs', import.meta.url));

function installation(t, image = imageA) {
  const state = mkdtempSync(join(tmpdir(), 'sdf-image-install-'));
  t.after(() => rmSync(state, { recursive: true, force: true }));
  const config = { version: 1, repo: state, agent: 'mock', command: ['mock'], port: 7332,
    timeoutSeconds: 10, memoryMiB: 256, image, network: 'none', check: 'true', scope };
  save(join(state, 'factory.json'), config);
  save(join(state, 'engine.json'), { runtime: 'native-node', version: '0.4.3', image });
  return state;
}

function fakeRunner(images, calls = []) {
  return (command, args) => {
    calls.push([command, ...args]);
    if (command !== 'docker') throw new Error(`Unexpected command ${command}`);
    if (args[0] === 'ps') return '';
    if (args[0] === 'info') return 'fixture-docker';
    if (args[0] === 'image' && args[1] === 'inspect') {
      const reference = args.at(-1), id = images.get(reference);
      if (!id) throw new Error(`docker failed (1): Error: No such image: ${reference}`);
      return id;
    }
    if (args[0] === 'image' && args[1] === 'tag') {
      const [source, target] = args.slice(2), id = images.get(source) || source;
      if (!/^sha256:[a-f0-9]{64}$/.test(id) || !images.has(id)) throw new Error(`docker failed (1): No such image: ${source}`);
      images.set(target, id);
      return '';
    }
    throw new Error(`Unexpected docker command: ${args.join(' ')}`);
  };
}

test('custom selection pins the resolved ID, tolerates repeat selection and follows a moved tag only when selected again', t => {
  const state = installation(t), images = new Map([
    ['shared:dev', imageA], [imageA, imageA], [imageB, imageB], [imageC, imageC],
  ]), calls = [], runner = fakeRunner(images, calls);
  const sibling = installation(t, imageA), siblingConfig = readFileSync(join(sibling, 'factory.json'));

  const first = installCustomJobImage(state, 'shared:dev', { runner, version: '0.4.3' });
  const repeat = installCustomJobImage(state, 'shared:dev', { runner, version: '0.4.3' });
  assert.equal(first.image, imageA);
  assert.equal(repeat.image, imageA);
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageA);
  assert.equal(JSON.parse(readFileSync(join(state, 'engine.json'))).image, imageA);
  assert.equal(images.get(`software-defence-factory-retained:${imageA.slice(7)}`), imageA);

  images.set('shared:dev', imageB);
  assert.equal(assertInstalledJobImage(state, undefined, runner).image.id, imageA);
  assert.equal(JSON.parse(readFileSync(join(sibling, 'factory.json'))).image, imageA);
  installCustomJobImage(state, 'shared:dev', { runner, version: '0.4.3' });
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageB);
  assert.equal(JSON.parse(readFileSync(join(state, 'engine.json'))).image, imageB);
  assert.deepEqual(readFileSync(join(sibling, 'factory.json')), siblingConfig);
  assert.equal(images.get(`software-defence-factory-retained:${imageA.slice(7)}`), imageA);
  assert.equal(images.get(`software-defence-factory-retained:${imageB.slice(7)}`), imageB);
  assert.equal(calls.some(call => call.includes('build')), false);
});

test('custom-to-custom selection and missing image preserve the last working files', t => {
  const state = installation(t), images = new Map([['custom:one', imageA], ['custom:two', imageB], [imageA, imageA], [imageB, imageB]]), runner = fakeRunner(images);
  installCustomJobImage(state, 'custom:one', { runner });
  installCustomJobImage(state, 'custom:two', { runner });
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageB);
  const beforeConfig = readFileSync(join(state, 'factory.json'));
  const beforeEngine = readFileSync(join(state, 'engine.json'));
  assert.throws(() => installCustomJobImage(state, 'missing:local', { runner }), /not present locally/);
  assert.deepEqual(readFileSync(join(state, 'factory.json')), beforeConfig);
  assert.deepEqual(readFileSync(join(state, 'engine.json')), beforeEngine);
});

test('image change fails closed for live supervisors, active fences, and remaining labelled containers', t => {
  const state = installation(t), runner = fakeRunner(new Map());
  assertImageChangeSafe(state, { runner, isAlive: () => false });
  save(join(state, 'supervisor.json'), { pid: 101 });
  assert.throws(() => assertImageChangeSafe(state, { runner, isAlive: () => true }), /Stop the Factory/);
  rmSync(join(state, 'supervisor.json'));
  mkdirSync(join(state, 'jobs', 'job_fixture'), { recursive: true });
  writeFileSync(join(state, 'jobs', 'job_fixture', 'active.json'), '{}');
  assert.throws(() => assertImageChangeSafe(state, { runner, isAlive: () => false }), /active or unreconciled/);
  rmSync(join(state, 'jobs'), { recursive: true });
  const withContainer = (command, args) => args[0] === 'ps' ? 'fixture-container\n' : runner(command, args);
  assert.throws(() => assertImageChangeSafe(state, { runner: withContainer, isAlive: () => false }), /containers remain/);
});

test('failed metadata commit restores factory.json and keeps the previous engine marker', t => {
  const state = installation(t), images = new Map([['custom:new', imageB], [imageA, imageA], [imageB, imageB]]), runner = fakeRunner(images);
  const beforeConfig = readFileSync(join(state, 'factory.json'));
  const beforeEngine = readFileSync(join(state, 'engine.json'));
  const enginePath = join(state, 'engine.json');
  const filesystem = {
    readFileSync,
    writeFileSync,
    rmSync,
    renameSync(source, destination) {
      if (destination === enginePath && source.endsWith('.next')) throw new Error('simulated metadata rename failure');
      renameSync(source, destination);
    },
  };
  assert.throws(() => installCustomJobImage(state, 'custom:new', { runner, filesystem }), /simulated metadata rename failure/);
  assert.deepEqual(readFileSync(join(state, 'factory.json')), beforeConfig);
  assert.deepEqual(readFileSync(join(state, 'engine.json')), beforeEngine);
});

test('standard install still builds the standard image and doctor readiness requires matching metadata and a present image', async t => {
  const state = installation(t), images = new Map([[imageA, imageA]]), runner = fakeRunner(images);
  let buildArgs;
  const build = async (...args) => {
    buildArgs = args;
    images.set(PINS.jobImage, imageC);
    images.set(imageC, imageC);
  };
  await installStandardJobImage(state, { runner, build, version: '0.4.3' });
  assert.equal(buildArgs[0], 'docker');
  assert.deepEqual(buildArgs[1].slice(0, 3), ['build', '-t', PINS.jobImage]);
  assert.equal(buildArgs[1][3].endsWith('/factory/image'), true);
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageC);
  assert.equal(JSON.parse(readFileSync(join(state, 'engine.json'))).imageSource, 'standard');
  assert.equal(inspectImageInstallation(state, undefined, runner).installed, true);
  assert.equal(assertInstalledJobImage(state, undefined, runner).image.id, imageC);
  save(join(state, 'engine.json'), { runtime: 'native-node', version: '0.4.3', image: imageA });
  assert.equal(inspectImageInstallation(state, undefined, runner).installed, false);
  assert.throws(() => assertInstalledJobImage(state, undefined, runner), /does not match/);
});

function fakeDocker(t, initialImages) {
  // /tmp is mounted noexec in the implementation container; command shims live
  // in a disposable workspace directory so the CLI can execute the fake binary.
  const root = mkdtempSync(join(process.cwd(), '.sdf-fake-docker-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, 'bin'); mkdirSync(bin);
  const imagesFile = join(root, 'images.json'), callsFile = join(root, 'calls.jsonl');
  writeFileSync(imagesFile, JSON.stringify(initialImages));
  const program = `#!/usr/bin/env node
import fs from 'node:fs';
const args = process.argv.slice(2);
const imagesFile = process.env.SDF_FAKE_IMAGES;
const images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
fs.appendFileSync(process.env.SDF_FAKE_CALLS, JSON.stringify(args) + '\\n');
if (args[0] === 'ps') process.exit(0);
if (args[0] === 'info') { process.stdout.write('fixture-docker\\n'); process.exit(0); }
if (args[0] === 'image' && args[1] === 'inspect') {
  const reference = args.at(-1), id = images[reference];
  if (!id) { process.stderr.write('Error: No such image: ' + reference); process.exit(1); }
  process.stdout.write(id + '\\n'); process.exit(0);
}
if (args[0] === 'image' && args[1] === 'tag') {
  const source = args[2], target = args[3], id = images[source] || source;
  if (!/^sha256:[a-f0-9]{64}$/.test(id) || !images[id]) { process.stderr.write('Error: No such image: ' + source); process.exit(1); }
  images[target] = id;
  fs.writeFileSync(imagesFile, JSON.stringify(images));
  process.exit(0);
}
if (args[0] === 'build') {
  const reference = args[2], id = process.env.SDF_FAKE_STANDARD_ID;
  images[reference] = id;
  images[id] = id;
  fs.writeFileSync(imagesFile, JSON.stringify(images));
  process.exit(0);
}
process.stderr.write('Unexpected fake Docker command: ' + args.join(' ')); process.exit(2);
`;
  const docker = join(bin, 'docker'); writeFileSync(docker, program, { mode: 0o700 });
  return { root, bin, imagesFile, callsFile };
}

function invokeCli(args, env) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
}

test('CLI install --image selects local IDs, keeps sibling state unchanged, and rejects failed selection', t => {
  const state = installation(t), sibling = installation(t, imageA), siblingBefore = readFileSync(join(sibling, 'factory.json'));
  const docker = fakeDocker(t, { 'shared:dev': imageA, [imageA]: imageA, [imageB]: imageB, [imageC]: imageC });
  const env = {
    PATH: `${docker.bin}:${process.env.PATH}`,
    XDG_STATE_HOME: join(docker.root, 'operator-state'),
    SDF_BOOTSTRAPPED: '1', SDF_FAKE_IMAGES: docker.imagesFile, SDF_FAKE_CALLS: docker.callsFile,
  };
  const first = invokeCli(['install', '--image', 'shared:dev', '--state', state], env);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageA);
  const repeat = invokeCli(['install', '--image', 'shared:dev', '--state', state], env);
  assert.equal(repeat.status, 0, repeat.stderr);
  const moved = JSON.parse(readFileSync(docker.imagesFile)); moved['shared:dev'] = imageB;
  writeFileSync(docker.imagesFile, JSON.stringify(moved));
  const repin = invokeCli(['install', '--image', 'shared:dev', '--state', state], env);
  assert.equal(repin.status, 0, repin.stderr);
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageB);
  assert.deepEqual(readFileSync(join(sibling, 'factory.json')), siblingBefore);
  const configBeforeFailure = readFileSync(join(state, 'factory.json'));
  const engineBeforeFailure = readFileSync(join(state, 'engine.json'));
  const failed = invokeCli(['install', '--image', 'missing:local', '--state', state], env);
  assert.notEqual(failed.status, 0);
  assert.deepEqual(readFileSync(join(state, 'factory.json')), configBeforeFailure);
  assert.deepEqual(readFileSync(join(state, 'engine.json')), engineBeforeFailure);
  const calls = readFileSync(docker.callsFile, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  assert.equal(calls.some(args => args[0] === 'build'), false);
});

test('ordinary CLI install still builds and records the standard image', t => {
  const state = installation(t), docker = fakeDocker(t, { [imageA]: imageA });
  const env = {
    PATH: `${docker.bin}:${process.env.PATH}`,
    XDG_STATE_HOME: join(docker.root, 'operator-state'),
    SDF_BOOTSTRAPPED: '1', SDF_FAKE_IMAGES: docker.imagesFile, SDF_FAKE_CALLS: docker.callsFile,
    SDF_FAKE_STANDARD_ID: imageC,
  };
  const result = invokeCli(['install', '--state', state], env);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(join(state, 'factory.json'))).image, imageC);
  assert.equal(JSON.parse(readFileSync(join(state, 'engine.json'))).imageSource, 'standard');
  const calls = readFileSync(docker.callsFile, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  assert.equal(calls.some(args => args[0] === 'build' && args[2] === PINS.jobImage), true);
});

test('CLI doctor checks both Docker image presence and engine metadata, keeping qualification separate', t => {
  const state = installation(t), docker = fakeDocker(t, { [imageA]: imageA });
  const env = {
    PATH: `${docker.bin}:${process.env.PATH}`,
    XDG_STATE_HOME: join(docker.root, 'operator-state'),
    SDF_BOOTSTRAPPED: '1', SDF_FAKE_IMAGES: docker.imagesFile, SDF_FAKE_CALLS: docker.callsFile,
  };
  const ready = invokeCli(['doctor', '--state', state], env);
  assert.equal(ready.status, 0, ready.stderr);
  const details = JSON.parse(ready.stdout);
  assert.equal(details.engineInstalled, true);
  assert.equal(details.image.id, imageA);
  assert.deepEqual(details.qualification, { model: 'not assessed', toolchain: 'not assessed' });
  rmSync(join(state, 'engine.json'));
  const noMarker = invokeCli(['doctor', '--state', state], env);
  assert.equal(noMarker.status, 1);
  assert.equal(JSON.parse(noMarker.stdout).image.available, true);
  assert.equal(JSON.parse(noMarker.stdout).engineInstalled, false);
  save(join(state, 'engine.json'), { runtime: 'native-node', version: '0.4.3', image: imageB });
  const mismatch = invokeCli(['doctor', '--state', state], env);
  assert.equal(mismatch.status, 1);
  assert.equal(JSON.parse(mismatch.stdout).engineInstalled, false);
  const images = JSON.parse(readFileSync(docker.imagesFile)); delete images[imageA];
  writeFileSync(docker.imagesFile, JSON.stringify(images));
  const missing = invokeCli(['doctor', '--state', state], env);
  assert.equal(missing.status, 1);
  assert.equal(JSON.parse(missing.stdout).image.available, false);
});

test('CLI up refuses a missing image or absent installation metadata before starting a controller', t => {
  const state = installation(t), docker = fakeDocker(t, { [imageA]: imageA });
  const env = {
    PATH: `${docker.bin}:${process.env.PATH}`,
    XDG_STATE_HOME: join(docker.root, 'operator-state'),
    SDF_BOOTSTRAPPED: '1', SDF_FAKE_IMAGES: docker.imagesFile, SDF_FAKE_CALLS: docker.callsFile,
  };
  rmSync(join(state, 'engine.json'));
  const noMarker = invokeCli(['up', '--state', state], env);
  assert.notEqual(noMarker.status, 0);
  assert.match(noMarker.stderr, /Runtime image metadata is missing/);
  assert.equal(readFileSync(docker.callsFile, 'utf8').includes('build'), false);
  save(join(state, 'engine.json'), { runtime: 'native-node', version: '0.4.3', image: imageA });
  const images = JSON.parse(readFileSync(docker.imagesFile)); delete images[imageA];
  writeFileSync(docker.imagesFile, JSON.stringify(images));
  const missing = invokeCli(['up', '--state', state], env);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /not present locally/);
  assert.equal(readFileSync(docker.callsFile, 'utf8').includes('build'), false);
});
