import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { configAt, digest, json, save, sleep } from './lib.mjs';

const secret = /(?:sk-(?:proj-)?[a-zA-Z0-9_-]{16,}|gh[pousr]_[a-zA-Z0-9]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:authorization|password|api[_-]?key|secret)\s*[=:]\s*["']?(?!\[REDACTED\])[a-zA-Z0-9_+\/.=-]{8,})/i;
export function validateIncident(input,scope,now=Date.now()) {
  if(!scope||!['project','service','environment','owner'].every(k=>typeof scope[k]==='string'&&scope[k].trim()))throw new Error('A complete trusted installation scope is required');
  if(input.contract_version!==1||input.sanitized!==true)throw new Error('Expected contract_version:1 and operator-sanitized:true evidence');
  for(const k of ['project','service','environment'])if(input[k]!==scope[k])throw new Error(`Incident ${k} differs from the trusted installation scope`);
  for(const k of ['source','event_id','summary'])if(typeof input[k]!=='string'||!input[k].trim()||input[k].length>1000)throw new Error(`Invalid incident ${k}`);
  if(!Array.isArray(input.evidence)||input.evidence.length>20)throw new Error('Expected up to 20 bounded evidence entries');
  const clean={contract_version:1,project:scope.project,service:scope.service,environment:scope.environment,owner:scope.owner,source:input.source,event_id:input.event_id,summary:input.summary,evidence:[],gaps:[]};
  for(const e of input.evidence) {
    if(!['logs','metrics','revision'].includes(e.kind)||typeof e.text!=='string'||e.text.length>16000||!Number.isFinite(Date.parse(e.observed_at)))throw new Error('Invalid evidence kind, text or observed_at');
    const stale=now-Date.parse(e.observed_at)>3600000||Date.parse(e.observed_at)>now+60000;
    clean.evidence.push({kind:e.kind,text:e.text,observed_at:e.observed_at,stale,hash:digest(e.text)});
    if(stale)clean.gaps.push(`${e.kind}: outside the one-hour freshness window`);
  }
  for(const kind of ['logs','metrics','revision'])if(!clean.evidence.some(e=>e.kind===kind&&e.text.trim()))clean.gaps.push(`Missing ${kind}`);
  const serialized=JSON.stringify(clean);
  if(Buffer.byteLength(serialized)>64000)throw new Error('Evidence exceeds 64 KB');
  if(secret.test(serialized))throw new Error('Possible credential detected; remove it before submitting evidence');
  return clean;
}
export async function admitIncident(state,input,submit) {
  const clean=validateIncident(input,configAt(state).scope);
  // Stable input hash excludes time-dependent coverage judgments.
  const hash=digest(JSON.stringify({...clean,gaps:[],evidence:clean.evidence.map(({stale,...e})=>e)}));
  const key=digest(JSON.stringify([clean.project,clean.environment,clean.service,clean.source,clean.event_id]));
  const directory=join(state,'incidents');mkdirSync(directory,{recursive:true,mode:0o700});
  const path=join(directory,`${key}.json`);
  if(existsSync(path)) {
    const prior=json(path);
    if(prior.inputHash!==hash)throw new Error('Same incident identity with conflicting evidence; review it before creating a new episode');
    if(!prior.job)throw new Error('Admission outcome unknown; reconcile the existing case in the dashboard before retrying');
    return {id:prior.job,case_id:prior.case_id,deduplicated:true};
  }
  const entry={case_id:`case_${key.slice(0,16)}`,inputHash:hash,received_at:new Date().toISOString(),case_state:'open',input:clean};
  writeFileSync(path,JSON.stringify(entry,null,2),{mode:0o600,flag:'wx'});
  // Keeping a pending record on a network failure prevents a duplicate writer.
  const job=await submit('defence',`ARCITAI_INCIDENT_REF:${key}`);
  save(path,{...entry,job:job.id});return {...job,case_id:entry.case_id,deduplicated:false};
}
export async function incidentFor(state,prompt,job) {
  const match=prompt.trim().match(/^ARCITAI_INCIDENT_REF:([a-f0-9]{64})$/);
  if(!match)throw new Error('Submit incident evidence through the CLI incident command');
  const path=join(state,'incidents',`${match[1]}.json`);
  let entry=json(path);
  // Submission may return just after the worker claims its first step. Never let
  // the executor claim a pending admission itself: only the submitting controller binds it.
  for(let i=0;!entry.job&&i<30;i++){await sleep(100);entry=json(path);}
  if(!entry.job||entry.job!==job)throw new Error('Incident admission is not bound to this job; reconcile it instead of duplicating the case');
  // Recheck the trusted scope and freshness at execution time.
  const input=validateIncident({...entry.input,sanitized:true},configAt(state).scope);
  return {path,entry,input};
}
export function validateReport(report,incident) {
  const list=k=>Array.isArray(report[k])&&report[k].length<=50&&report[k].every(v=>typeof v==='string'&&v.length<=4000);
  if(!['needs_review','insufficient_evidence'].includes(report.status)||typeof report.summary!=='string'||!report.summary.trim()||report.summary.length>8000||report.production_action_taken!==false||!['hypotheses','recommended_actions','unknowns'].every(list))throw new Error('Invalid incident draft');
  const incomplete=report.status==='insufficient_evidence'||incident.input.gaps.length>0;
  // Model output cannot introduce authoritative recovery or verification fields.
  return {case_id:incident.entry.case_id,case_state:'open',draft:true,verification:'not_performed',status:incomplete?'insufficient_evidence':'needs_review',investigation:incomplete?'inconclusive':'triaged',
    summary:report.summary,hypotheses:report.hypotheses,recommended_actions:report.recommended_actions,unknowns:report.unknowns,evidence_gaps:incident.input.gaps,production_action_taken:false};
}
