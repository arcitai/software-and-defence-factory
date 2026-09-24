// Deliberately synthetic executor for installation qualification, never a model benchmark.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
let prompt = ''; for await (const chunk of process.stdin) prompt += chunk;
const mode = process.env.FACTORY_PHASE;
if (prompt.includes('SYNTHETIC_TIMEOUT')) await new Promise(resolve => setTimeout(resolve, 120000));
if (prompt.includes('SYNTHETIC_FAIL')) process.exit(7);
if (mode === 'build') {
  if (!existsSync('/workspace/value.txt')) throw new Error('Mock requires the documented sample fixture');
  writeFileSync('/workspace/value.txt', 'fixed\n');
} else if (mode === 'review') {
  writeFileSync('/output/review.json', JSON.stringify({ verdict: 'pass', summary: 'Synthetic fixture review; no model judgment.', findings: [] }));
} else if (mode === 'defence') {
  writeFileSync('/output/incident-report.json', JSON.stringify({ status: 'needs_review', summary: 'Synthetic read-only triage; verify supplied evidence.', hypotheses: [], recommended_actions: [], unknowns: ['No live telemetry connector'], production_action_taken: false }));
}
writeFileSync('/output/agent-report.md', `Synthetic ${mode} completed. No inference or actual cost measurement.\n`);
console.log(JSON.stringify({ synthetic: true, phase: mode }));
