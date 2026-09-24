import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_CHECKOUT = existsSync(join(ROOT, '.git'));
export const STATE_HOME = join(process.env.XDG_STATE_HOME || join(homedir(), '.local/state'), 'software-defence-factory');
export const DATA_HOME = join(process.env.XDG_DATA_HOME || join(homedir(), '.local/share'), 'software-defence-factory');
// Keep existing source-checkout installations compatible. npm installations never
// put private state in node_modules, an npm cache, or the caller's application.
export const DEFAULT_STATE = SOURCE_CHECKOUT ? join(ROOT, '.factory/platform') : join(STATE_HOME, 'platform');
export const DEFAULT_DEMO_STATE = SOURCE_CHECKOUT ? join(ROOT, '.factory/demo-platform') : join(STATE_HOME, 'demo-platform');
