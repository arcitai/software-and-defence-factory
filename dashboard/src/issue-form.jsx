import React from 'react';

export function IssueFields({ template, answers, setAnswers }) {
  const set = (id,value) => setAnswers(previous => ({...previous,[id]:value}));
  return <div className="issue-form-fields">{template.fields.map(field => {
    if(field.type === 'markdown') return <p className="template-note" key={field.id}>{field.value}</p>;
    const value = answers[field.id] ?? field.value;
    const heading = <>{field.label}{field.required && <span aria-label="required"> *</span>}</>;
    if(field.multiple) return <fieldset className="issue-form-options" key={field.id}><legend className="field-label">{heading}</legend>{field.description && <p className="work-help">{field.description}</p>}{field.options.map(option => <label key={option.label}><input type="checkbox" checked={value.includes(option.label)} required={option.required} onChange={event => set(field.id,event.target.checked ? [...value,option.label] : value.filter(item=>item!==option.label))} /><span>{option.label}{option.required ? ' *' : ''}</span></label>)}</fieldset>;
    return <label key={field.id}><span className="field-label">{heading}</span>{field.description && <span className="work-help field-description">{field.description}</span>}{field.type === 'dropdown' ? <select className="field-control" value={value} required={field.required} onChange={event => set(field.id,event.target.value)}><option value="">Choose an option</option>{field.options.map(option => <option key={option.label} value={option.label}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea className="field-control issue-form-textarea" required={field.required} value={value} placeholder={field.placeholder} onChange={event => set(field.id,event.target.value)} /> : <input className="field-control" required={field.required} value={value} placeholder={field.placeholder} onChange={event => set(field.id,event.target.value)} />}</label>;
  })}</div>;
}
