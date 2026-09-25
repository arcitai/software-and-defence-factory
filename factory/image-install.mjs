import {
  existsSync, readFileSync, readdirSync, writeFileSync, renameSync, rmSync,
} from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { configAt, instanceLabel, json, PINS, ROOT, run, stream } from './lib.mjs';
import { VERSION } from './updates.mjs';

const imageIdPattern = /^sha256:[a-f0-9]{64}$/;
const imageReferencePattern = /^[a-zA-Z0-9][a-zA-Z0-9_./:@-]*$/;
const missingImage = error => /no such (image|object)/i.test(error.message);
const alive = pid => {
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
};

function docker(args, runner = run) { return runner('docker', args); }

export function inspectLocalImage(reference, runner = run) {
  if (typeof reference !== 'string' || !imageReferencePattern.test(reference))
    throw new Error('Invalid Docker image reference');
  let id;
  try { id = docker(['image', 'inspect', '--format', '{{.Id}}', reference], runner); }
  catch (error) {
    if (missingImage(error)) return null;
    throw error;
  }
  if (!imageIdPattern.test(id)) throw new Error('Docker returned an unexpected image identity');
  return id;
}

export function retainImage(image, runner = run) {
  if (!imageIdPattern.test(image || '')) throw new Error('Expected an immutable Docker image ID');
  // The shared build tag can move. Keep every selected image reachable by ID.
  docker(['image', 'tag', image, `software-defence-factory-retained:${image.slice(7)}`], runner);
  return image;
}

function retainIfPresent(reference, runner) {
  const image = inspectLocalImage(reference, runner);
  if (image) retainImage(image, runner);
  return image;
}

export function assertImageChangeSafe(state, { runner = run, isAlive = alive } = {}) {
  const supervisor = join(state, 'supervisor.json');
  if (existsSync(supervisor)) {
    let record;
    try { record = json(supervisor); }
    catch { throw new Error('Supervisor state is unreadable; reconcile the installation before changing its image'); }
    if (!Number.isSafeInteger(record.pid) || record.pid < 1)
      throw new Error('Supervisor state is unverified; reconcile the installation before changing its image');
    if (isAlive(record.pid)) throw new Error('Stop the Factory before changing its job image');
  }

  const jobs = join(state, 'jobs');
  if (existsSync(jobs)) {
    for (const job of readdirSync(jobs)) {
      if (existsSync(join(jobs, job, 'active.json')))
        throw new Error(`Job ${job} has active or unreconciled execution; reconcile it before changing the image`);
    }
  }

  const containers = docker(['ps', '-aq', '--filter', `label=sdf.factory=${instanceLabel(state)}`], runner)
    .split('\n').filter(Boolean);
  if (containers.length) throw new Error('Factory job containers remain; stop and reconcile them before changing the image');
}

function persistInstallation(state, config, metadata, filesystem = undefined) {
  const fs = filesystem || { readFileSync, writeFileSync, renameSync, rmSync };
  const configPath = join(state, 'factory.json'), enginePath = join(state, 'engine.json');
  const previousConfig = fs.readFileSync(configPath);
  const token = `${process.pid}.${randomBytes(8).toString('hex')}`;
  const configTemp = `${configPath}.${token}.next`, engineTemp = `${enginePath}.${token}.next`;
  let configReplaced = false;
  try {
    fs.writeFileSync(configTemp, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    fs.writeFileSync(engineTemp, `${JSON.stringify(metadata, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    fs.renameSync(configTemp, configPath);
    configReplaced = true;
    fs.renameSync(engineTemp, enginePath);
  } catch (error) {
    if (configReplaced) {
      const rollback = `${configPath}.${token}.rollback`;
      try {
        fs.writeFileSync(rollback, previousConfig, { flag: 'wx', mode: 0o600 });
        fs.renameSync(rollback, configPath);
      } catch (rollbackError) {
        throw new Error(`Image installation metadata could not be completed (${error.message}); restoring factory.json also failed (${rollbackError.message})`);
      } finally { fs.rmSync(rollback, { force: true }); }
    }
    throw error;
  } finally {
    fs.rmSync(configTemp, { force: true });
    fs.rmSync(engineTemp, { force: true });
  }
}

function metadataFor(image, source, reference, version) {
  return {
    runtime: 'native-node',
    version,
    image,
    imageSource: source,
    imageReference: reference,
  };
}

export function installCustomJobImage(state, reference, { runner = run, version = VERSION, isAlive = alive, filesystem } = {}) {
  const config = configAt(state);
  assertImageChangeSafe(state, { runner, isAlive });
  const image = inspectLocalImage(reference, runner);
  if (!image) throw new Error(`Docker image ${reference} is not present locally; build or pull it explicitly before selecting it`);
  retainImage(image, runner);
  const nextConfig = { ...config, image };
  const metadata = metadataFor(image, 'custom', reference, version);
  persistInstallation(state, nextConfig, metadata, filesystem);
  return { image, reference, config: nextConfig, metadata };
}

export async function installStandardJobImage(state, { runner = run, build = stream, version = VERSION, isAlive = alive, filesystem } = {}) {
  const config = configAt(state);
  assertImageChangeSafe(state, { runner, isAlive });
  docker(['info', '--format', '{{.ServerVersion}}'], runner);
  retainIfPresent(config.image, runner);
  retainIfPresent(PINS.jobImage, runner);
  await build('docker', ['build', '-t', PINS.jobImage, join(ROOT, 'factory/image')]);
  const image = inspectLocalImage(PINS.jobImage, runner);
  if (!image) throw new Error('Built job image is unavailable');
  retainImage(image, runner);
  const nextConfig = { ...config, image };
  const metadata = metadataFor(image, 'standard', PINS.jobImage, version);
  persistInstallation(state, nextConfig, metadata, filesystem);
  return { image, config: nextConfig, metadata };
}

function readMetadata(state) {
  const path = join(state, 'engine.json');
  if (!existsSync(path)) return null;
  try { return json(path); } catch { return null; }
}

export function inspectImageInstallation(state, config = configAt(state), runner = run) {
  const metadata = readMetadata(state);
  let image = null;
  image = inspectLocalImage(config.image, runner);

  const metadataValid = Boolean(metadata
    && metadata.runtime === 'native-node'
    && typeof metadata.version === 'string'
    && imageIdPattern.test(metadata.image || '')
    && (!metadata.imageSource || ['standard', 'custom'].includes(metadata.imageSource))
    && (!metadata.imageReference || imageReferencePattern.test(metadata.imageReference)));
  const imageAvailable = image !== null;
  const markerMatches = metadataValid && imageAvailable && metadata.image === image;
  const installed = Boolean(markerMatches);
  return {
    installed,
    image: {
      reference: config.image,
      id: image,
      available: imageAvailable,
      pinned: imageAvailable && config.image === image,
      markerImage: metadataValid ? metadata.image : null,
      source: metadataValid ? (metadata.imageSource || 'legacy') : null,
      referenceAtInstall: metadataValid ? (metadata.imageReference || null) : null,
      metadataValid,
      markerMatches: Boolean(markerMatches),
      error: imageAvailable ? null : `Selected image ${config.image} is not present locally`,
    },
  };
}

export function assertInstalledJobImage(state, config = configAt(state), runner = run) {
  const status = inspectImageInstallation(state, config, runner);
  if (!status.installed) {
    if (!status.image.available) throw new Error(`Selected job image ${config.image} is not present locally; run install with an available image`);
    if (!status.image.metadataValid) throw new Error('Runtime image metadata is missing or invalid; run install');
    throw new Error('Selected job image does not match the installed image metadata; run install');
  }
  return status;
}
