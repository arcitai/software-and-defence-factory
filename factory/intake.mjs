// Suggestions never authorize execution or replace the operator's chosen scope.
export function recommendWork({ spec, labels = [] }) {
  if (typeof spec !== 'string' || !spec.trim() || Buffer.byteLength(spec) > 240000) throw new Error('Provide a brief between 1 and 240 KB.');
  if (!Array.isArray(labels) || labels.length > 100 || labels.some(label => typeof label !== 'string' || label.length > 100)) throw new Error('Expected issue label names.');
  const names = labels.map(label => label.toLowerCase());
  const software = names.includes('track:software');
  const defence = names.some(label => ['track:security', 'track:defence', 'track:defense'].includes(label));
  if (software !== defence) return { workflow: defence ? 'defence' : 'software', basis: 'label', reason: `The issue is labelled for ${defence ? 'security investigation' : 'software delivery'}.` };
  if (software && defence) return { workflow: 'software', basis: 'conflicting_labels', reason: 'Both tracks are labelled. Choose whether this task should deliver code or investigate evidence.' };
  // Deliberately narrow: fixing a vulnerability or building security features is software work.
  if (/\b(?:investigat(?:e|ion|ing)|triage|analys[ei][rs]?|analy[sz]e|undersøg|undersøge)\b[\s\S]{0,100}\b(?:incident|intrusion|breach|malware|compromise|suspicious|security logs|hændelse|angreb)\b/i.test(spec)) {
    return { workflow: 'defence', basis: 'brief', reason: 'The brief describes investigating a security incident or supplied evidence.' };
  }
  return { workflow: 'software', basis: 'default', reason: 'Software is the default for changes to this project. Choose Defence for a scoped security investigation.' };
}
