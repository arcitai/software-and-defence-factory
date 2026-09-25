import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement, act } from 'react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

test('failed review offers explicit revision, preserves denied/stale feedback, and labels recorded versus unknown history', async t => {
  const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'}), prior=new Map();
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true,fetch:async()=>({ok:true,json:async()=>[]})})) {
    prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  }
  const server=await createServer({server:{middlewareMode:true,ws:false},appType:'custom'});
  const {createRoot}=await import('react-dom/client');
  const root=createRoot(document.getElementById('root'));
  t.after(async()=>{await act(()=>root.unmount());await server.close();dom.window.close();for(const [key,descriptor]of prior){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  const {TaskDetail}=await server.ssrLoadModule('/src/task-detail.jsx');
  const runs=[{id:'run_a',command:'build',state:'failed',started_at:'2026-09-25T00:00:00Z',summary:'Old failed build'},
    {id:'run_b',command:'review',state:'failed',outcome:'blocked',review_verdict:'changes',started_at:'2026-09-25T01:00:00Z',summary:'Fix the concern',executor:'codex',model:'requested-model',worker_name:'fixture',execution:{runtimeVersion:'test-version',image:'sha256:fixture',policyHash:'policy-fixture'}}];
  const job={id:'job_fixture',state:'failed',repository:'app',task:{title:'Revision fixture'},workflow:{name:'software',steps:['build','verify','review','handoff'],current_step:2},runs,can_request_changes:true};
  let captured, denied=true;
  const render=async()=>act(()=>root.render(createElement(TaskDetail,{job,loaded:true,csrfToken:'fixture',onWorkflowAction:async(...args)=>{captured=args;/* parent retains job and exposes API error on rejection */if(!denied)job.state='queued';}})));
  await render();
  const button=name=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);
  assert(button('Request changes'));assert(![...document.querySelectorAll('button')].some(b=>b.textContent.startsWith('Approve')));
  await act(()=>button('Request changes').click());
  const area=document.querySelector('textarea');assert(area);
  const submit=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Send feedback'));
  assert(submit?.disabled,'empty feedback is rejected in the form');
  await act(()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value').set.call(area,'Address exact review concern');area.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  await act(()=>submit.click());assert.equal(captured[1],'request_changes');assert.equal(captured[3],'Address exact review concern');assert.equal(area.value,'Address exact review concern');assert.equal(job.state,'failed');
  await act(()=>button('Keep reviewing').click());
  await act(()=>document.querySelector('[role="tab"][id$="details"]').click());
  assert.match(document.body.textContent,/requested-model/);assert.match(document.body.textContent,/test-version/);assert.match(document.body.textContent,/policy-fixture/);
  await act(()=>document.querySelector('[role="tab"][id$="history"]').click());
  assert.match(document.body.textContent,/Not recorded \(legacy\/unknown\)/);
  job.can_request_changes=false;await render();
  await act(()=>document.querySelector('[role="tab"][id$="result"]').click());assert(!button('Request changes'));
});
