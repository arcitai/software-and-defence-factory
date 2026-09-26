import React, { useEffect, useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { repositoryLabel } from './project-identity.js';

export function RunComposer({ title, setTitle, sourceURL, setSourceURL, choices, identity, selection, setSelection, repository, prompt, setPrompt, model, setModel, submitting, submit, close, csrfToken, projectLinks, error }) {
  const dialog = useRef(null), mounted = useRef(true), pending = useRef(null);
  const [mode, setMode] = useState(projectLinks?.repository && selection !== 'workflow:defence' ? 'issue' : 'brief'), [issueURL, setIssueURL] = useState(''), [loading, setLoading] = useState(false), [importError, setImportError] = useState(''), [imported, setImported] = useState(false);
  const isDefence = selection === 'workflow:defence';
  useEffect(() => {
    const focus = document.activeElement;
    dialog.current.showModal();
    return () => { mounted.current = false; pending.current?.abort(); focus?.focus?.(); };
  }, []);
  function switchMode(next) {
    pending.current?.abort(); setLoading(false); setImportError(''); setMode(next); setImported(false);
    setPrompt(''); setTitle(''); setSourceURL('');
  }
  async function loadIssue() {
    setLoading(true); setImportError(''); setImported(false);
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    try {
      const response = await fetch('/api/v1/issues/preview', { method:'POST', headers:{'Content-Type':'application/json','X-Factory-Session':csrfToken}, body:JSON.stringify({url:issueURL.trim()}), signal:controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load the issue.');
      if (!mounted.current || controller.signal.aborted) return;
      setPrompt(result.spec); setTitle(result.title); setSourceURL(result.url); setImported(true);
    } catch (error) { if (mounted.current && !controller.signal.aborted) setImportError(error.message); }
    finally { if (mounted.current && !controller.signal.aborted) setLoading(false); }
  }
  return <dialog ref={dialog} className="work-dialog" aria-labelledby="start-work-title" aria-describedby="start-work-description" onCancel={event => { event.preventDefault(); if (!submitting) close(); }}>
    <header className="work-dialog-header"><div><h2 id="start-work-title">Start Factory work</h2><p id="start-work-description">{repositoryLabel(repository, identity)} · Uses your configured agent and model.</p></div><Button variant="ghost" size="icon" onClick={close} disabled={submitting} aria-label="Close start work form"><X size={18} /></Button></header>
    <form onSubmit={event => { if (mode === 'issue' && !imported || !prompt.trim() || submitting) { event.preventDefault(); return; } submit(event); }}>
      <fieldset disabled={submitting} className="work-dialog-body">
        <div className="workflow-choices" role="group" aria-label="Work type">{choices.map(choice => <button type="button" key={choice.value} aria-pressed={selection === choice.value} onClick={() => { setSelection(choice.value); if (choice.value === 'workflow:defence' && mode === 'issue') switchMode('brief'); }}>{choice.label}</button>)}</div>
        {isDefence ? <p className="work-help">Describe a scoped investigation using non-sensitive evidence. This produces a draft, not production recovery. For validated private incident intake use <code>incident --file</code> in the CLI.</p> : <div className="work-source" role="group" aria-label="Task source"><button type="button" aria-pressed={mode === 'issue'} onClick={() => switchMode('issue')}>From GitHub issue</button><button type="button" aria-pressed={mode === 'brief'} onClick={() => switchMode('brief')}>Write instructions</button></div>}
        {mode === 'issue' && !isDefence && <section className="issue-intake"><label><span className="field-label">Issue URL</span><input className="field-control" type="url" value={issueURL} onChange={event => { pending.current?.abort(); setLoading(false); setIssueURL(event.target.value); setImported(false); setImportError(''); }} placeholder={`${projectLinks?.repository || 'https://github.com/owner/project'}/issues/123`} /></label><Button type="button" variant="outline" onClick={loadIssue} disabled={loading || !issueURL.trim()}>{loading ? 'Loading…' : 'Load issue'}</Button><p className="work-help">Load an issue from this project, review its scope below, then start. {projectLinks?.new_issue && <a href={projectLinks.new_issue} target="_blank" rel="noreferrer">Create an issue on GitHub</a>}</p>{importError && <p role="alert" className="form-error">{importError}</p>}</section>}
        {(mode === 'brief' || imported) && <label><span className="field-label">{imported ? 'Review the issue and acceptance criteria' : 'What should Factory do?'}</span><textarea autoFocus={mode === 'brief'} className="field-control work-brief" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={isDefence ? 'Describe the incident, supplied evidence and investigation boundary…' : 'Describe the change, its boundaries and how we will know it works…'} required /></label>}
        <details className="work-options"><summary>Additional options</summary><div className="work-options-fields"><label><span className="field-label">Title · optional</span><input className="field-control" value={title} onChange={event => setTitle(event.target.value)} maxLength={160} placeholder="Taken from the issue or instructions" /></label>{mode === 'brief' && <label><span className="field-label">Reference link · optional</span><input type="url" className="field-control" value={sourceURL} onChange={event => setSourceURL(event.target.value)} placeholder="Context only; does not import instructions" /></label>}<label><span className="field-label">Model override · optional</span><input className="field-control" value={model} onChange={event => setModel(event.target.value)} maxLength={128} placeholder="Use the configured model" /></label></div></details>
      </fieldset>
      {error && <p role="alert" className="form-error">{error}</p>}
      <footer className="work-dialog-footer"><p>Starts a queued execution. GitHub issues and labels do not start work automatically.</p><Button disabled={submitting || loading || !prompt.trim() || mode === 'issue' && !imported || !selection || !repository}>{submitting ? 'Starting…' : 'Start task'}<Play size={14} /></Button></footer>
    </form>
  </dialog>;
}
