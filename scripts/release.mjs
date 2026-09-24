import { readFileSync, appendFileSync } from 'node:fs';
import { newer } from '../factory/updates.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.name !== 'software-defence-factory' || !/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('Unexpected release identity');
const registry = 'https://registry.npmjs.org/software-defence-factory';
const options = { signal: AbortSignal.timeout(15000) };
const exact = await fetch(`${registry}/${pkg.version}`, options);
let publish;
if (exact.ok) publish = false;
else if (exact.status !== 404) throw new Error(`Version lookup failed: HTTP ${exact.status}`);
else {
  const latest = await fetch(`${registry}/latest`, { signal: AbortSignal.timeout(15000) });
  if (latest.ok && !newer(pkg.version, (await latest.json()).version)) throw new Error('Release must increase the latest stable version');
  if (!latest.ok && latest.status !== 404) throw new Error(`Release lookup failed: HTTP ${latest.status}`);
  publish = true;
}
console.log(`${pkg.name}@${pkg.version}: ${publish ? 'ready to publish' : 'already published; skipping'}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `publish=${publish}\nversion=${pkg.version}\n`);
