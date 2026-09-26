import { parseDocument } from 'yaml';
import { githubRead } from './issue-intake.mjs';
import { readProjectLinks } from './project-links.mjs';
import { recommendWork } from './intake.mjs';

const object = value => value && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' ? value : '';
const filename = name => typeof name === 'string' && /^[^/\\\x00-\x1f]{1,120}\.(?:md|ya?ml)$/i.test(name) && !/^config\.ya?ml$/i.test(name);
function yaml(source) {
  const doc = parseDocument(source, { schema:'core', uniqueKeys:true });
  if (doc.errors.length || doc.warnings.length) throw new Error('Invalid or unsupported template YAML.');
  return doc.toJS({ maxAliasCount:20 });
}
function names(value) {
  const result = typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : value || [];
  if (!Array.isArray(result) || result.length > 100 || result.some(s => typeof s !== 'string' || s.length > 100)) throw new Error('Invalid template labels.');
  return result;
}
export function parseTemplate(name, source, sha) {
  if (!filename(name) || typeof source !== 'string' || Buffer.byteLength(source) > 100000) throw new Error('Template is unsupported or exceeds 100 KB.');
  let data, fields;
  if (/\.md$/i.test(name)) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) throw new Error('Markdown template needs YAML front matter.');
    data = yaml(match[1]);
    fields = [{id:'body',type:'textarea',label:'Description',description:'Complete the sections from the repository template.',value:match[2].trim(),required:true}];
  } else {
    data = yaml(source);
    if (!Array.isArray(data?.body) || !data.body.length || data.body.length > 50) throw new Error('Template needs between 1 and 50 form fields.');
    fields = data.body.map((field,index) => {
      if (!object(field) || !['markdown','input','textarea','dropdown','checkboxes'].includes(field.type)) throw new Error(`Unsupported field type: ${text(field?.type) || 'unknown'}. Open this form on GitHub instead.`);
      const attrs = field.attributes;
      if (!object(attrs)) throw new Error('Template field attributes are missing.');
      if (field.type === 'markdown') return {id:`note-${index}`,type:'markdown',value:text(attrs.value)};
      const id = field.id ?? `field-${index}`;
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ['__proto__','constructor','prototype'].includes(id)) throw new Error('Invalid form field identifier.');
      if (!text(attrs.label).trim()) throw new Error('Template field label is missing.');
      const value = {id,type:field.type,label:attrs.label,description:text(attrs.description),placeholder:text(attrs.placeholder),value:text(attrs.value),required:field.validations?.required === true,render:text(attrs.render)};
      if (field.type === 'dropdown' || field.type === 'checkboxes') {
        if (!Array.isArray(attrs.options) || !attrs.options.length || attrs.options.length > 100) throw new Error('Invalid form choices.');
        value.options = attrs.options.map(option => {
          if (field.type === 'dropdown' && typeof option === 'string') return {label:option,required:false};
          if (field.type === 'checkboxes' && object(option) && text(option.label).trim()) return {label:option.label,required:option.required === true};
          throw new Error('Invalid form choice.');
        });
        if (new Set(value.options.map(option=>option.label)).size !== value.options.length) throw new Error('Duplicate form choices.');
        value.multiple = field.type === 'checkboxes' || attrs.multiple === true;
        value.value = value.multiple ? [] : '';
        if (field.type === 'dropdown' && attrs.default !== undefined) {
          if (!Number.isInteger(attrs.default) || !value.options[attrs.default]) throw new Error('Invalid default form choice.');
          value.value = value.multiple ? [value.options[attrs.default].label] : value.options[attrs.default].label;
        }
      }
      return value;
    });
  }
  if (!object(data) || !text(data.name).trim()) throw new Error('Template name is missing.');
  if (new Set(fields.map(field=>field.id)).size !== fields.length) throw new Error('Duplicate field identifiers.');
  return {id:name,sha,name:data.name,description:text(data.description || data.about),title:text(data.title),labels:names(data.labels),fields};
}
function project(repo) {
  const repository=readProjectLinks(repo)?.repository;
  if (!repository) throw new Error('This project has no configured GitHub origin.');
  return {repository,slug:repository.slice('https://github.com/'.length)};
}
async function contents(slug, name, read) {
  const value=await read(['api','--hostname','github.com',`repos/${slug}/contents/.github/ISSUE_TEMPLATE/${encodeURIComponent(name)}`]);
  if (value?.type !== 'file' || value.encoding !== 'base64' || typeof value.content !== 'string' || value.size > 100000 || value.content.length > 150000 || !/^[a-f0-9]{40,64}$/.test(value.sha || '')) throw new Error('Unexpected template file from GitHub.');
  return {source:Buffer.from(value.content,'base64').toString('utf8'),sha:value.sha};
}
export async function readTemplates(repo, read=githubRead) {
  const {repository,slug}=project(repo);
  let entries;
  try { entries=await read(['api','--hostname','github.com',`repos/${slug}/contents/.github/ISSUE_TEMPLATE`]); }
  catch(error) {
    if (error.status !== 404) throw error;
    // A private/inaccessible repository also returns 404; don't call that "no templates".
    await read(['api','--hostname','github.com',`repos/${slug}`]);
    return {repository,templates:[],contacts:[],warnings:[]};
  }
  if (!Array.isArray(entries)) throw new Error('Unexpected template directory from GitHub.');
  const files=entries.filter(entry=>entry.type==='file' && filename(entry.name));
  if (files.length > 20) throw new Error('This repository has more than 20 templates. Open its chooser on GitHub or use a blank local issue.');
  const templates=await Promise.all(files.map(async file=>{
    try { const {source,sha}=await contents(slug,file.name,read);return {...parseTemplate(file.name,source,sha),form_url:`${repository}/issues/new?template=${encodeURIComponent(file.name)}`}; }
    catch(error) { return {id:file.name,name:file.name,description:'',unavailable:error.message,form_url:`${repository}/issues/new?template=${encodeURIComponent(file.name)}`}; }
  }));
  const config=entries.find(entry=>entry.type==='file' && /^config\.ya?ml$/i.test(entry.name));
  const contacts=[],warnings=[];
  if(config) {
    try {
      const value=yaml((await contents(slug,config.name,read)).source);
      for(const link of Array.isArray(value?.contact_links)?value.contact_links:[]) {
        const url=new URL(link.url);
        if(url.protocol==='https:' && !url.username && !url.password && text(link.name).trim()) contacts.push({name:link.name,url:url.href,description:text(link.about)});
      }
    } catch { warnings.push('Repository contact links could not be loaded. Check the GitHub issue chooser for private reporting guidance.'); }
  }
  return {repository,templates,contacts,warnings};
}
export function compileTemplate(template, { title, answers }) {
  if (typeof title !== 'string' || !title.trim() || title.length > 160) throw new Error('Provide an issue title of 1–160 characters.');
  if (!object(answers)) throw new Error('Expected field answers.');
  const sections=[];
  for(const field of template.fields) {
    if(field.type==='markdown') continue;
    const answer=Object.hasOwn(answers,field.id) ? answers[field.id] : field.value;
    let rendered;
    if(field.multiple) {
      if(!Array.isArray(answer) || answer.some(v=>typeof v!=='string' || !field.options.some(o=>o.label===v)) || new Set(answer).size!==answer.length) throw new Error(`Choose valid options for ${field.label}.`);
      if(field.required&&!answer.length || field.options.some(option=>option.required&&!answer.includes(option.label))) throw new Error(`Complete the required choices in ${field.label}.`);
      rendered=field.type==='checkboxes' ? field.options.map(option=>`- [${answer.includes(option.label)?'x':' '}] ${option.label}`).join('\n') : answer.join(', ');
    } else {
      if(typeof answer!=='string' || Buffer.byteLength(answer)>240000) throw new Error(`Invalid answer for ${field.label}.`);
      if(field.required&&!answer.trim()) throw new Error(`${field.label} is required.`);
      if(field.type==='dropdown' && answer && !field.options.some(option=>option.label===answer)) throw new Error(`Choose a valid option for ${field.label}.`);
      rendered=answer.trim();
    }
    if(rendered) sections.push(`### ${field.label}\n\n${rendered}`);
  }
  const spec=`# ${title.trim()}\n\n${sections.join('\n\n')}`;
  const recommendation=recommendWork({spec,labels:template.labels});
  return {title:title.trim(),spec,labels:template.labels,template:{id:template.id,sha:template.sha},recommendation};
}
export async function draftFromTemplate(repo, input, read=githubRead) {
  if(!filename(input.template)) throw new Error('Choose a repository issue template.');
  const {slug}=project(repo), file=await contents(slug,input.template,read);
  if(typeof input.sha!=='string' || input.sha!==file.sha) throw new Error('The template changed. Reload templates and review the current fields.');
  return compileTemplate(parseTemplate(input.template,file.source,file.sha),input);
}
