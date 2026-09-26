import { hostname, platform, arch, cpus, totalmem, release } from 'node:os';
import { readFileSync } from 'node:fs';

// No subprocess, environment, serial number, network identity or credential data.
function hardwareModel() {
  if (platform() !== 'linux') return null;
  try {
    const value = readFileSync('/sys/devices/virtual/dmi/id/product_name', 'utf8').trim();
    return value && value.length <= 160 && !/[\x00-\x1f]/.test(value) && !/default string|to be filled|system product name/i.test(value) ? value : null;
  } catch { return null; }
}
export function machineInfo() {
  return { hostname: hostname(), hardware: hardwareModel(), platform: platform(), architecture: arch(), osRelease: release(),
    logicalCpus: cpus().length, memoryMiB: Math.round(totalmem() / 1024 / 1024) };
}
