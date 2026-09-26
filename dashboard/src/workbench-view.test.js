import test from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

test('modal imports one issue, requires preview before start, and keeps optional defaults secondary',async t=>{
  const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/#/runs'}),prior=new Map();
  dom.window.scrollTo=()=>{};dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  const jobs=[],created=[];let reads=0;
  const status={jobs,workers:[],commands:[],workflows:['software','defence'],repositories:['app'],triggers:[],repo:'/srv/project',agent:'pi',csrf_token:'fixture',project_links:{repository:'https://github.com/example/project',new_issue:'https://github.com/example/project/issues/new/choose'}};
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true,fetch:async(url,options)=>{
    if(url==='/api/v1/status')return {ok:true,json:async()=>status};
    if(url==='/api/v1/issues/preview'){reads++;assert.equal(options.headers['X-Factory-Session'],'fixture');return {ok:true,json:async()=>({title:'Scoped issue',url:JSON.parse(options.body).url,spec:'Issue acceptance criteria'})};}
    if(url==='/api/v1/jobs'){created.push(JSON.parse(options.body));return {ok:true,json:async()=>({id:'job_new'})};}
    return {ok:true,json:async()=>[]};
  }})){prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
  const server=await createServer({server:{middlewareMode:true,ws:false},appType:'custom'});let root;
  t.after(async()=>{await act(()=>root?.unmount());await server.close();dom.window.close();for(const[k,v]of prior){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
  await act(async()=>{root=(await server.ssrLoadModule('/src/main.jsx')).appRoot;});
  const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
  const click=async label=>act(()=>button(label).click());
  const input=async(value)=>act(()=>{const field=document.querySelector('.issue-intake input');Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(field,value);field.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  await click('Start work');assert(document.querySelector('dialog').open);assert.equal(document.querySelector('.work-options').open,false);
  await click('From GitHub issue');assert(button('Start task').disabled);
  await input('https://github.com/example/project/issues/42');await click('Load issue');
  assert.equal(reads,1);assert.equal(document.querySelector('textarea').value,'Issue acceptance criteria');assert.equal(created.length,0);
  await input('https://github.com/example/project/issues/43');assert(button('Start task').disabled,'edited URL invalidates the previous preview');
  await click('Load issue');await click('Start task');
  assert.equal(created.length,1);assert.equal(created[0].repository,'app');assert.equal(created[0].workflow,'software');assert.equal(created[0].title,'Scoped issue');assert.equal(created[0].source_url,'https://github.com/example/project/issues/43');assert.equal(created[0].model,'');assert.equal(document.querySelector('dialog'),null);
});
