import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { configAt, stopContainers } from './lib.mjs';
import { createController } from './server.mjs';
export async function supervise(state) {
const config = configAt(state), lock = join(state, 'supervisor.json');
writeFileSync(lock, JSON.stringify({ pid: process.pid }), { flag: 'wx', mode: 0o600 });
let controller, stopping = false;
async function shutdown(code = 0) {
  if (stopping) return; stopping = true;
  try { if (controller) await controller.close(); stopContainers(state); }
  catch (error) { console.error(`Stop unconfirmed: ${error.message}`); process.exit(1); }
  rmSync(lock, { force: true }); process.exit(code);
}
process.on('SIGTERM', () => shutdown()); process.on('SIGINT', () => shutdown());
try {
  stopContainers(state);
  controller = createController(state);
  controller.server.on('error', error => { console.error(error.message); shutdown(1); });
  controller.server.listen(config.port, '127.0.0.1', () => console.log(`Factory controller ready on 127.0.0.1:${config.port}`));
} catch (error) { console.error(error.message); await shutdown(1); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await supervise(process.argv[2]);
