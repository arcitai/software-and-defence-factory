import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CircleDot, Search, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IssuePublish } from './issue-publish.jsx';
import { IssueFields } from './issue-form.jsx';
import { issueLabelTone } from './issue-labels.js';
import { repositoryLabel } from './project-identity.js';

export function RunComposer({ issueProvider, title, setTitle, sourceURL, setSourceURL, sourceRef, setSourceRef, sourceRefDefault, choices, identity, selection, setSelection, repository, prompt, setPrompt, model, setModel, submitting, submit, close, csrfToken, projectLinks, error }) {
  const dialog = useRef(null), mounted = useRef(true), pending = useRef(null), selectionOverride = useRef(false);
  const [mode, setMode] = useState('brief'), [step, setStep] = useState('source');
  const [loading, setLoading] = useState(false), [intakeError, setIntakeError] = useState('');
  const [issues, setIssues] = useState([]), [nextPage, setNextPage] = useState(null), [failedPage, setFailedPage] = useState(null), [listLoaded, setListLoaded] = useState(false), [search, setSearch] = useState('');
  const [labels, setLabels] = useState([]), [suggestion, setSuggestion] = useState(null), [suggestionStale, setSuggestionStale] = useState(false);
  const [catalog, setCatalog] = useState(null), [template, setTemplate] = useState(null), [answers, setAnswers] = useState({});
  const remoteSupported = issueProvider?.capabilities?.create ?? Boolean(projectLinks?.repository);
  const canReadIssues = issueProvider?.capabilities?.issues ?? Boolean(projectLinks?.repository);
  const canReadTemplates = issueProvider?.capabilities?.templates ?? Boolean(projectLinks?.repository);
  const providerLabel = issueProvider?.label || 'GitHub';
  const [destination,setDestination] = useState(remoteSupported ? 'remote' : 'local'), [publishing,setPublishing] = useState(false), [createdIssue,setCreatedIssue] = useState(null);
  const isDefence = selection === 'workflow:defence';
  useEffect(() => {
    const focus = document.activeElement;
    mounted.current = true;
    dialog.current.showModal();
    if (canReadTemplates) loadTemplates();
    dialog.current.querySelector('[data-blank-issue]')?.focus();
    return () => { mounted.current = false; pending.current?.abort(); focus?.focus?.(); };
  }, []);
  useEffect(() => {
    if (step === 'review') dialog.current.querySelector('[data-review-heading]')?.focus();
    else dialog.current.querySelector(step === 'fields' ? 'input[name="issue-title"]' : mode === 'brief' ? '[data-blank-issue]' : 'input[type="search"]')?.focus();
  }, [step, mode]);
  async function request(path, input, accept) {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setLoading(true); setIntakeError('');
    try {
      const response = await fetch(path, { method:input === undefined ? 'GET' : 'POST', headers:{'Content-Type':'application/json','X-Factory-Session':csrfToken}, ...(input === undefined ? {} : {body:JSON.stringify(input)}), signal:controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load this issue. Try again.');
      if (mounted.current && !controller.signal.aborted) accept(result);
    } catch (error) { if (mounted.current && !controller.signal.aborted) setIntakeError(error.message); }
    finally { if (mounted.current && !controller.signal.aborted) setLoading(false); }
  }
  function review(recommendation) {
    setSuggestion(recommendation); setSuggestionStale(false); if (!selectionOverride.current) setSelection(`workflow:${recommendation.workflow}`); setStep('review');
  }
  function loadTemplates() {
    return request('/api/v1/issue-templates', undefined, setCatalog);
  }
  function chooseTemplate(value) {
    pending.current?.abort(); setLoading(false); setIntakeError(''); setTemplate(value); setAnswers({}); selectionOverride.current = false;
    setTitle(value?.title || ''); setPrompt(''); setSourceURL(''); setLabels(value?.labels || []); setSuggestion(null); setStep('fields');
  }
  function loadIssues(page = 1) {
    setFailedPage(page);
    return request(`/api/v1/issues?page=${page}`, undefined, result => {
      setIssues(previous => page === 1 ? result.issues : [...new Map([...previous, ...result.issues].map(issue => [issue.url, issue])).values()]);
      setNextPage(result.next_page); setListLoaded(true); setFailedPage(null);
    });
  }
  function switchMode(next) {
    if (next === mode) return;
    pending.current?.abort(); setLoading(false); setIntakeError(''); setMode(next);
    setPrompt(''); setTitle(''); setSourceURL(''); setLabels([]); setSuggestion(null); selectionOverride.current = false;
    if (next === 'issue' && canReadIssues && !listLoaded) loadIssues();
    if (next === 'brief' && canReadTemplates && !catalog) loadTemplates();
  }
  function selectIssue(issue) {
    selectionOverride.current = false;
    return request('/api/v1/issues/preview', {url:issue.url}, result => {
      setPrompt(result.spec); setTitle(result.title); setSourceURL(result.url); setLabels(result.labels.map(label => label.name)); review(result.recommendation);
    });
  }
  function continueBrief(event) {
    event.preventDefault();
    if (step !== 'fields' || loading || submitting) return;
    if (template) request('/api/v1/issue-templates/draft', {template:template.id,sha:template.sha,title,answers}, result => { setTitle(result.title);setPrompt(result.spec);setLabels(result.labels);review(result.recommendation); });
    else if (prompt.trim()) request('/api/v1/intake/recommend', {spec:[title,prompt].join('\n'), labels}, review);
  }
  const filtered = issues.filter(issue => `${issue.number} ${issue.title} ${issue.labels.map(label => label.name).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <dialog ref={dialog} className="work-dialog" aria-labelledby="start-work-title" aria-describedby="start-work-description" onCancel={event => { event.preventDefault(); if (!submitting && !publishing) close(); }}>
    <header className="work-dialog-header"><div><h2 id="start-work-title">{step === 'review' ? 'Review issue' : 'New issue'}</h2><p id="start-work-description">{repositoryLabel(repository, identity)}</p></div><Button variant="ghost" size="icon" onClick={close} disabled={submitting || publishing} aria-label="Close start work form"><X size={18} /></Button></header>
    <form onSubmit={step !== 'review' ? continueBrief : event => { if (!prompt.trim() || submitting || loading) { event.preventDefault(); return; } if(mode === 'brief' && destination === 'remote' && !createdIssue){event.preventDefault();return;} submit(event); }}>
      <fieldset disabled={submitting || publishing || Boolean(createdIssue)} className="work-dialog-body">
        {step === 'source' && <>
          <div className="work-source" role="group" aria-label="Issue source"><button type="button" aria-pressed={mode === 'brief'} onClick={() => switchMode('brief')}>Create issue</button><button type="button" aria-pressed={mode === 'issue'} onClick={() => switchMode('issue')}>From {providerLabel} issues</button></div>
          {mode === 'brief' && <section className="template-chooser" aria-label="Issue templates">
            <p className="work-help">Choose a template for the issue.</p>
            {loading && <p role="status" className="work-help">Loading repository templates…</p>}
            {catalog?.templates.map(item => <div className="template-choice" key={item.id}>{item.unavailable ? <><strong>{item.name}</strong><p className="work-help">{item.unavailable}</p><a href={item.form_url} target="_blank" rel="noreferrer">Open on GitHub ↗</a></> : <button type="button" onClick={() => chooseTemplate(item)}><span><strong>{item.name}</strong><span>{item.description}</span></span><ArrowRight size={16} /></button>}</div>)}
            <div className="template-choice"><button type="button" data-blank-issue onClick={() => chooseTemplate(null)}><span><strong>Blank issue</strong><span>Write your own title, instructions and acceptance criteria.</span></span><ArrowRight size={16} /></button></div>
            {catalog?.contacts.map(contact => <a className="template-contact" key={contact.url} href={contact.url} target="_blank" rel="noreferrer"><strong>{contact.name} ↗</strong><span>{contact.description}</span></a>)}
            {catalog?.warnings.map(warning => <p className="work-help" key={warning}>{warning}</p>)}
            {!loading && canReadTemplates && <Button type="button" variant="ghost" size="sm" onClick={loadTemplates}>{intakeError ? 'Retry templates' : 'Refresh templates'}</Button>}
          </section>}
          {mode === 'issue' && <section className="issue-picker" aria-label="Project issues">
            {!canReadIssues ? <p className="work-help">Issue integration is unavailable for this remote. You can still run a local brief.</p> : <>
              <label className="issue-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search loaded issues</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search loaded issues by title, number or label" /></label>
              <div className="issue-list" aria-busy={loading}>
                {filtered.map(issue => <button type="button" className="issue-choice" key={issue.url} disabled={loading} onClick={() => selectIssue(issue)}><CircleDot size={16} className="issue-open-icon" aria-label="Open issue" /><span className="issue-choice-copy"><strong>{issue.title}</strong><span className="issue-choice-meta"><span className="issue-number">#{issue.number}</span>{issue.labels.map(label => <span key={label.name} className={`issue-label label-${issueLabelTone(label.color)}`}>{label.name}</span>)}</span></span><ArrowRight size={14} aria-hidden="true" /></button>)}
                {listLoaded && !filtered.length && <p className="work-help">{search ? 'No matching loaded issues.' : 'No open issues on this page.'}</p>}
                {loading && <p role="status" className="work-help">Loading issues…</p>}
              </div>
              <div className="issue-picker-actions">{nextPage && <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => loadIssues(nextPage)}>Load more</Button>}{!loading && <Button type="button" variant="ghost" size="sm" onClick={() => loadIssues(failedPage || 1)}>{intakeError && failedPage ? 'Retry' : 'Refresh issues'}</Button>}<span className="work-help">{issues.length} open issues loaded</span></div>
            </>}
          </section>}
        </>}
        {(step === 'fields' || step === 'review') && <label><span className="field-label">Title *</span><input name="issue-title" readOnly={step === 'review'} className="field-control" value={title} onChange={event => setTitle(event.target.value)} required maxLength={160} placeholder="A short, clear title" /></label>}
        {step === 'fields' && template && <><h3 className="template-form-name">{template.name}</h3><IssueFields template={template} answers={answers} setAnswers={setAnswers} /></>}
        {(step === 'fields' && !template || step === 'review') && <label><span className="field-label">{step === 'review' ? 'Instructions and acceptance criteria' : 'Description and acceptance criteria'}</span><textarea className="field-control work-brief" value={prompt} onChange={event => { pending.current?.abort(); setLoading(false); setPrompt(event.target.value); if (step === 'review') setSuggestionStale(true); }} placeholder="Describe the work, its boundaries and how we will know it is done…" required /></label>}
        {step === 'review' && <>
          {mode === 'brief' && !createdIssue && <label><span className="field-label">Destination</span><select className="field-control" value={destination} onChange={event=>setDestination(event.target.value)}>{remoteSupported && <option value="remote">{providerLabel} repository</option>}<option value="local">Local execution only</option></select></label>}
          <section className="work-recommendation"><h3 tabIndex={-1} data-review-heading>Suggested: {suggestion.workflow === 'defence' ? 'Defence' : 'Software'}</h3><p className="work-help">{suggestionStale ? "Instructions changed. Keep your chosen type or refresh the suggestion." : suggestion.reason}</p>{suggestionStale && <Button type="button" variant="outline" size="sm" disabled={loading || !prompt.trim()} onClick={() => request("/api/v1/intake/recommend", {spec:[title,prompt].join('\n'),labels}, review)}>Refresh suggestion</Button>}<div className="workflow-choices" role="group" aria-label="Work type">{choices.map(choice => <button type="button" key={choice.value} aria-pressed={selection === choice.value} onClick={() => { selectionOverride.current = true; setSelection(choice.value); }}>{choice.label}</button>)}</div><p className="work-help">{isDefence ? 'Investigates supplied, non-sensitive evidence and produces a private draft. For validated incident intake, use incident --file in the CLI.' : 'Implements the change, runs checks and requests an independent review.'}</p></section>
          {sourceURL && mode === 'issue' && <a className="work-help" href={sourceURL} target="_blank" rel="noreferrer">View selected issue on GitHub ↗</a>}
          <details className="work-options"><summary>Additional options</summary><div className="work-options-fields">{mode === 'brief' && <label><span className="field-label">Reference link · optional</span><input type="url" className="field-control" value={sourceURL} onChange={event => setSourceURL(event.target.value)} placeholder="Context only; does not import instructions" /></label>}<label><span className="field-label">Source ref · optional</span><input className="field-control" value={sourceRef} onChange={event => setSourceRef(event.target.value)} maxLength={256} placeholder={`Configured ref: ${sourceRefDefault}`} /><span className="work-help">Factory resolves this ref in the configured repository and retains that commit before admitting the job.</span></label><label><span className="field-label">Model override · optional</span><input className="field-control" value={model} onChange={event => setModel(event.target.value)} maxLength={128} placeholder="Use the configured model" /></label></div></details>
        </>}
      </fieldset>
      {step === 'review' && mode === 'brief' && destination === 'remote' && !createdIssue && <IssuePublish key={template?.id || 'blank'} title={title} spec={sourceURL ? `${prompt}\n\nReference: ${sourceURL}` : prompt} labels={labels} csrfToken={csrfToken} onBusy={setPublishing} onCreated={result=>{if(sourceURL)setPrompt(`${prompt}\n\nReference: ${sourceURL}`);setCreatedIssue(result);setSourceURL(result.issue.url);}} />}
      {createdIssue && <section className="issue-created" role="status"><strong>Issue #{createdIssue.issue.number} created</strong><p><a href={createdIssue.issue.url} target="_blank" rel="noreferrer">View on {providerLabel} ↗</a> · No execution has started.</p>{createdIssue.issue.missing_labels?.length>0 && <p>Labels not applied: {createdIssue.issue.missing_labels.join(', ')}</p>}</section>}
      {(intakeError || error) && <p role="alert" className="form-error">{intakeError || error}</p>}
      <footer className="work-dialog-footer">
        {step === 'review' ? <><Button type="button" variant="ghost" disabled={submitting || publishing} onClick={() => { if(createdIssue){close();return;} pending.current?.abort(); setLoading(false); setStep(mode === 'brief' ? 'fields' : 'source'); setIntakeError(''); }}><ArrowLeft size={14} />{createdIssue?'Done':'Back'}</Button>{(mode === 'issue' || destination === 'local' || createdIssue) && <Button disabled={submitting || publishing || loading || !prompt.trim() || !title.trim() || !selection || !repository}>{submitting ? 'Starting…' : mode === 'brief' && !createdIssue ? 'Create & start locally' : 'Start work'}<Play size={14} /></Button>}</> : step === 'fields' ? <><Button type="button" variant="ghost" onClick={() => { pending.current?.abort();setLoading(false);setIntakeError('');setStep('source'); }}><ArrowLeft size={14} />Templates</Button><Button disabled={loading || !title.trim() || !template && !prompt.trim()}>{loading ? 'Preparing…' : 'Continue'}<ArrowRight size={14} /></Button></> : <p>{mode === 'brief' ? 'Choose where to save the issue before creating it.' : 'Choose an issue to review. Nothing starts yet.'}</p>}
      </footer>
    </form>
  </dialog>;
}
