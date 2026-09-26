import test from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

async function composer(t, api, projectLinks={repository:'https://github.com/example/project'}, templates=[template], integration={}) {
  const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/#/runs'}),prior=new Map();
  dom.window.scrollTo=()=>{};dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  const created=[];
  const status={jobs:[],workers:[],commands:[],workflows:['software','defence'],repositories:['app'],repo:'/srv/project',harness:'pi',csrf_token:'fixture',project_links:projectLinks};
  const response=value=>({ok:true,json:async()=>value});
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true,fetch:async(url,options)=>{
    if(url==='/api/v1/status')return response(status);
    assert.equal(options.headers['X-Factory-Session'],'fixture');
    if(url==='/api/v1/issue-connection')return response({label:'GitHub',repository:'https://github.com/example/project',actor:'operator',available:true});
    if(url==='/api/v1/issue-submissions')return response(integration.submissions ? integration.submissions() : []);
    if(url==='/api/v1/issue-templates')return response({templates,contacts:[],warnings:[]});
    if(url==='/api/v1/jobs'){created.push(JSON.parse(options.body));return response({id:'job_new'});}
    return api(url,options,response);
  }})){prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
  const server=await createServer({server:{middlewareMode:true,ws:false},appType:'custom'});let root;
  t.after(async()=>{await act(()=>root?.unmount());await server.close();dom.window.close();for(const[k,v]of prior){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
  await act(async()=>{root=(await server.ssrLoadModule('/src/main.jsx')).appRoot;});
  const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
  const click=async label=>act(()=>{assert(button(label),label);button(label).click();});
  const input=async(selector,value)=>act(()=>{const field=document.querySelector(selector),proto=field.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(field,value);field.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  await click('New issue');
  return {created,button,click,input};
}
const template={id:'bug.yml',sha:'a'.repeat(40),name:'Bug report',description:'Report a problem',title:'[Bug] ',labels:[],fields:[{id:'problem',type:'textarea',label:'What happened?',value:'',required:true}]};
const suggestion={workflow:'defence',basis:'label',reason:'Labelled for security investigation.'};
const issue=number=>({number,title:`Scoped issue ${number}`,url:`https://github.com/example/project/issues/${number}`,labels:[{name:'track:security',color:'e0caca'}]});

test('issue picker retries, pages, searches and previews Defence before explicit, overridable admission',async t=>{
  let lists=0;
  const c=await composer(t,async(url,options,response)=>{
    if(url==='/api/v1/issues?page=1')return ++lists===1?{ok:false,json:async()=>({error:'GitHub access unavailable'})}:response({issues:[issue(42)],next_page:2});
    if(url==='/api/v1/issues?page=2')return response({issues:[issue(43)],next_page:null});
    if(url==='/api/v1/issues/preview')return response({title:'Scoped issue 43',url:JSON.parse(options.body).url,spec:'Investigate supplied incident evidence.',labels:[{name:'track:security',color:'e0caca'}],recommendation:suggestion});
    throw Error(url);
  });
  assert(document.querySelector('[aria-label="Issue templates"]'));assert.equal(document.querySelector('textarea'),null);
  assert.equal(document.querySelector('[aria-label="Work type"]'),null);
  await c.click('From GitHub issues');assert.match(document.body.textContent,/GitHub access unavailable/);
  await c.click('Retry');await c.click('Load more');assert.equal(document.querySelectorAll('.issue-choice').length,2);
  await c.input('.issue-picker input[type="search"]','43');assert.equal(document.querySelectorAll('.issue-choice').length,1);
  await act(()=>document.querySelector('.issue-choice').click());
  assert.equal(c.created.length,0);assert.equal(c.button('Defence').getAttribute('aria-pressed'),'true');
  assert.equal(document.querySelector('.work-options').open,false);
  assert.match(document.body.textContent,/private draft/);
  await c.click('Software');await c.click('Defence');await c.click('Start work');
  assert.equal(c.created.length,1);assert.equal(c.created[0].workflow,'defence');assert.equal(c.created[0].source_url,issue(43).url);assert.equal(c.created[0].title,'Scoped issue 43');assert.equal(document.querySelector('dialog'),null);
});

test('brief works without GitHub, recommends only on Continue and allows a software override',async t=>{
  let recommendations=0;
  const c=await composer(t,async(url,options,response)=>{
    assert.equal(url,'/api/v1/intake/recommend');recommendations++;assert.match(JSON.parse(options.body).spec,/Investigate/);return response(suggestion);
  },null);
  assert.equal(recommendations,0);
  await act(()=>document.querySelector('[data-blank-issue]').click());await c.input('input[name="issue-title"]','Investigate supplied logs');
  await c.input('textarea','Investigate an incident using supplied logs.');await c.click('Continue');
  assert.equal(recommendations,1);assert.equal(c.created.length,0);assert.equal(document.activeElement,document.querySelector('[data-review-heading]'));
  await c.click('Software');await c.input('textarea','Investigate another incident from supplied logs.');await c.click('Refresh suggestion');assert.equal(c.button('Software').getAttribute('aria-pressed'),'true');assert.equal(document.querySelector('input[name="issue-title"]').readOnly,true);await c.click('Create & start locally');assert.equal(c.created[0].workflow,'software');assert.equal(c.created[0].source_url,'');
});

test('a late issue preview cannot replace a brief after switching source',async t=>{
  let resolvePreview;
  const c=await composer(t,async(url,options,response)=>{
    if(url.includes('?page='))return response({issues:[issue(42)],next_page:null});
    return new Promise(resolve=>{resolvePreview=()=>resolve(response({spec:'Obsolete issue',title:'Old',url:issue(42).url,labels:[],recommendation:suggestion}));});
  });
  await c.click('From GitHub issues');await act(()=>document.querySelector('.issue-choice').click());
  await c.click('Create issue');await act(()=>document.querySelector('[data-blank-issue]').click());await c.input('textarea','My new brief');await act(()=>resolvePreview());
  assert.equal(document.querySelector('textarea').value,'My new brief');assert.equal(document.querySelector('#start-work-title').textContent,'New issue');assert.equal(c.created.length,0);
});


test('template chooser preserves required fields and compiles answers before review and start',async t=>{
  let drafts=0;
  const c=await composer(t,async(url,options,response)=>{
    assert.equal(url,'/api/v1/issue-templates/draft');const body=JSON.parse(options.body);drafts++;
    assert.equal(body.template,'bug.yml');assert.equal(body.sha,template.sha);assert.equal(body.answers.problem,'The board fails to open.');
    return response({title:body.title,spec:'# Fix board\n\n### What happened?\n\nThe board fails to open.',labels:[],recommendation:{workflow:'software',reason:'Project change',basis:'default'}});
  });
  await act(()=>[...document.querySelectorAll('.template-choice button')].find(button=>button.textContent.includes('Bug report')).click());
  assert.equal(document.querySelector('textarea').required,true);assert.equal(document.querySelector('input[name="issue-title"]').value,'[Bug] ');
  await c.click('Continue');assert.equal(drafts,0,'native required fields prevent an empty form');
  await c.input('input[name="issue-title"]','Fix board');await c.input('textarea','The board fails to open.');await c.click('Continue');
  assert.equal(drafts,1);assert.equal(c.created.length,0);await act(()=>{const field=document.querySelector('select');field.value='local';field.dispatchEvent(new window.Event('change',{bubbles:true}));});await c.click('Create & start locally');assert.equal(c.created[0].title,'Fix board');assert.match(c.created[0].spec,/What happened/);
});


test('a required multi-choice group reports its field error before requesting a draft',async t=>{
  let calls=0;
  const required={...template,fields:[{id:'scope',type:'checkboxes',label:'Scope',multiple:true,value:[],required:true,options:[{label:'Supplied logs',required:false}]}]};
  const c=await composer(t,async(url,options,response)=>{calls++;return response({title:'Investigate',spec:'Supplied logs',labels:[],recommendation:suggestion});},undefined,[required]);
  await act(()=>document.querySelector('.template-choice button').click());await c.click('Continue');
  assert.equal(calls,0);assert.match(document.querySelector('[role="alert"]').textContent,/Select at least one option for Scope/);
  await act(()=>document.querySelector('input[type="checkbox"]').click());await c.click('Continue');assert.equal(calls,1);
});


test('repository creation shows identity and creates no execution until a separate Start action',async t=>{
  let writes=0;
  const c=await composer(t,async(url,options,response)=>{
    if(url==='/api/v1/intake/recommend')return response({workflow:'software',reason:'Project change',basis:'default'});
    assert.equal(url,'/api/v1/issues');const body=JSON.parse(options.body);assert.equal(body.repository,'https://github.com/example/project');assert.equal(body.actor,'operator');assert.match(body.request_id,/^browser_[a-f0-9]{64}$/);writes++;
    return response({state:'created',issue:{number:91,url:'https://github.com/example/project/issues/91',missing_labels:[]}});
  });
  await act(()=>document.querySelector('[data-blank-issue]').click());await c.input('input[name="issue-title"]','Improve intake');await c.input('textarea','Implement the issue bridge.');await c.click('Continue');
  assert.match(document.body.textContent,/as operator/);assert.equal(c.button('Start work'),undefined);
  await c.click('Create issue on GitHub');assert.equal(writes,1);assert.equal(c.created.length,0);assert.match(document.body.textContent,/Issue #91 created/);
  await c.click('Start work');assert.equal(c.created.length,1);assert.equal(c.created[0].source_url,'https://github.com/example/project/issues/91');
});


test('lost browser responses reuse the same submission after closing and reopening the composer',async t=>{
  const receipts=new Map();let writes=0,posts=0,readsFail=false;
  const c=await composer(t,async(url,options,response)=>{
    if(url==='/api/v1/intake/recommend')return response({workflow:'software',reason:'Project change',basis:'default'});
    assert.equal(url,'/api/v1/issues');const body=JSON.parse(options.body);posts++;
    if(!receipts.has(body.request_id)){writes++;receipts.set(body.request_id,{request_id:body.request_id,state:'created',issue:{number:92,url:'https://github.com/example/project/issues/92',missing_labels:[]}});readsFail=true;throw Error('Response lost');}
    return response(receipts.get(body.request_id));
  },undefined,undefined,{submissions:()=>{if(readsFail)throw Error('Still offline');return [...receipts.values()];}});
  const fill=async()=>{await act(()=>document.querySelector('[data-blank-issue]').click());await c.input('input[name="issue-title"]','Retain issue identity');await c.input('textarea','Do not publish another copy after a lost response.');await c.click('Continue');};
  await fill();await c.click('Create issue on GitHub');assert.match(document.body.textContent,/Response lost/);assert.equal(writes,1);
  await act(()=>document.querySelector('[aria-label="Close start work form"]').click());readsFail=false;await c.click('New issue');await fill();await c.click('Create issue on GitHub');
  assert.equal(posts,2);assert.equal(writes,1);assert.match(document.body.textContent,/Issue #92 created/);assert.equal(c.created.length,0);assert.equal(c.button('Done').disabled,false);
});

test('a lost publication response immediately recovers its created receipt',async t=>{
  let saved=null;
  const c=await composer(t,async(url,options,response)=>{
    if(url==='/api/v1/intake/recommend')return response({workflow:'software',reason:'Project change',basis:'default'});
    const body=JSON.parse(options.body);saved={request_id:body.request_id,state:'created',issue:{number:93,url:'https://github.com/example/project/issues/93',missing_labels:[]}};throw Error('Response lost');
  },undefined,undefined,{submissions:()=>saved?[saved]:[]});
  await act(()=>document.querySelector('[data-blank-issue]').click());await c.input('input[name="issue-title"]','Recover created receipt');await c.input('textarea','Retain this identity.');await c.click('Continue');await c.click('Create issue on GitHub');
  assert.match(document.body.textContent,/Issue #93 created/);assert.equal(c.created.length,0);assert.equal(c.button('Done').disabled,false);
});
