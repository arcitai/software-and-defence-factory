import assert from 'node:assert/strict';
import test from 'node:test';
import { act } from 'react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

test('workflow, model, badge and search compose; task navigation preserves the filtered list', async t => {
  const dom = new JSDOM('<div id="root"></div>', {url:'http://localhost/#/runs'});
  dom.window.scrollTo = () => {};
  const prior = new Map();
  const jobs = [
    {id:'job_alpha',state:'succeeded',workflow:{name:'software',steps:['build'],current_step:0},task:{title:'Alpha delivery'},runs:[{id:'a',command:'build',model:'model-a',state:'succeeded'}]},
    {id:'job_beta',state:'timed_out',workflow:{name:'software',steps:['build'],current_step:0},task:{title:'Beta timeout'},runs:[{id:'b',command:'build',model:'model-b',state:'failed'}]},
    {id:'job_gamma',state:'succeeded',workflow:{name:'defence',steps:['defence'],current_step:0},task:{title:'Gamma triage'},runs:[{id:'c',command:'defence',model:'model-a',state:'succeeded'}]},
  ].map(job=>({...job,repository:'app',created_at:'2026-09-25T10:00:00Z'}));
  const status={jobs,workers:[],commands:[],repositories:['app'],triggers:[],workflows:['software','defence'],repo:'/srv/actual-project',project_links:{repository:'https://github.com/example/actual-project',new_issue:'https://github.com/example/actual-project/issues/new'}};
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true,fetch:async url=>({ok:true,json:async()=>url==='/api/v1/status'?status:[]})})) {
    prior.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  }
  const server=await createServer({server:{middlewareMode:true,ws:false},appType:'custom'});
  let root;
  t.after(async()=>{await act(()=>root?.unmount());await server.close();dom.window.close();for(const [key,descriptor]of prior){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  await act(async()=>{root=(await server.ssrLoadModule('/src/main.jsx')).appRoot;});
  const rows=()=>[...document.querySelectorAll('.task-list a')].map(a=>a.textContent);
  const setSelect=async(label,value)=>{
    const names={'Filter by workflow':'Filter by work type','Filter by model':'Filter by models','Filter by badge':'Filter by statuses'};
    const values={software:'Software',succeeded:'Completed'};
    await act(()=>document.querySelector(`button[aria-label="${names[label]}"]`).click());
    await act(()=>[...document.querySelectorAll('.facet-options button')].find(item=>item.textContent === (values[value] || value)).click());
    await act(()=>document.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  };
  const click=async selector=>act(()=>document.querySelector(selector).click());
  const route=async hash=>act(async()=>{window.location.hash=hash;await new Promise(resolve=>setTimeout(resolve,10));});
  assert.equal(rows().length,3);
  assert.equal(document.querySelector('[aria-label="Factory home"]').getAttribute('href'),'#/runs');
  assert.equal(document.querySelector('.repo-action').href,status.project_links.repository);
  assert.equal(document.querySelectorAll('.repo-action')[1].textContent.trim(),'New issue');
  await setSelect('Filter by workflow','software');assert.equal(rows().length,2);
  await setSelect('Filter by model','model-a');assert.equal(rows().length,1);assert.match(rows()[0],/Alpha/);
  await route('#/runs/job_alpha');assert.match(document.querySelector('.detail-position').textContent,/1 \/ 1/);
  assert.equal(document.querySelector('a[aria-label="Next issue"]'),null);
  await route('#/runs');assert.equal(rows().length,1);assert.match(document.querySelector('[aria-label="Filter by work type"]').textContent,/1/);
  await click('.active-filters button');assert.equal(rows().length,3);
  // Multiple selections OR within a facet, while other facets/search intersect.
  await setSelect('Filter by workflow','software');
  await act(()=>document.querySelector('button[aria-label="Filter by work type"]').click());
  await act(()=>[...document.querySelectorAll('.facet-options button')].find(item=>item.textContent==='Defence').click());
  assert.equal(rows().length,3);
  await act(()=>document.querySelector('.facet-options button').dispatchEvent(new dom.window.FocusEvent('focusout',{bubbles:true,relatedTarget:null})));
  assert(document.querySelector('.facet-popover'),'window blur must not dismiss an active filter');
  assert.equal(document.querySelector('.facet-select-all').getAttribute('aria-checked'),'true');
  await act(()=>document.querySelector('.facet-popover-heading button').click());
  assert.equal(rows().length,3);assert.equal(document.querySelector('.facet-select-all').getAttribute('aria-checked'),'false');
  assert(document.querySelector('.facet-popover'),'Reset keeps the dropdown open');
  assert.equal(document.querySelector('.facet-popover-heading button').disabled,false,'Reset remains focusable after clearing');
  await act(()=>document.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  assert.equal(document.activeElement.getAttribute('aria-label'),'Filter by work type');
  await click('.filter-card-main');assert.equal(rows().length,0);
  await click('.filter-card-main');assert.equal(rows().length,3,'clicking the selected status clears it');

  await click('button[aria-label="Filter by Timed out badge"]');assert.equal(rows().length,1);assert.match(rows()[0],/Beta/);
  await click('.active-filters button');
  await setSelect('Filter by badge','succeeded');assert.equal(rows().length,2);
  await act(()=>{const search=document.querySelector('[aria-label="Search issues"]');Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(search,'Gamma');search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  assert.equal(rows().length,1);assert.match(rows()[0],/Gamma/);
  await route('#/runs/job_gamma');await act(()=>window.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape'})));await route('#/runs');assert.equal(rows().length,1);
  await click('.active-filters button');
  await route('#/runs/job_alpha');assert.equal(document.querySelector('a[aria-label="Next issue"]').getAttribute('href'),'#/runs/job_beta');
});
