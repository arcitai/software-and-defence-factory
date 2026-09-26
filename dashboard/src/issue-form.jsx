import React, { useEffect, useRef, useState } from 'react';

export function IssueFields({ template, answers, setAnswers }) {
  const set = (id,value) => setAnswers(previous => ({...previous,[id]:value}));
  return <div className="issue-form-fields">{template.fields.map(field => {
    if(field.type === 'markdown') return <p className="template-note" key={field.id}>{field.value}</p>;
    const value = answers[field.id] ?? field.value;
    const heading = <>{field.label}{field.required && <span aria-label="required"> *</span>}</>;
    if(field.multiple) return <ChoiceGroup key={field.id} field={field} value={value} onChange={value => set(field.id,value)} />;
    return <label key={field.id}><span className="field-label">{heading}</span>{field.description && <span className="work-help field-description">{field.description}</span>}{field.type === 'dropdown' ? <select className="field-control" value={value} required={field.required} onChange={event => set(field.id,event.target.value)}><option value="">Choose an option</option>{field.options.map(option => <option key={option.label} value={option.label}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea className="field-control issue-form-textarea" required={field.required} value={value} placeholder={field.placeholder} onChange={event => set(field.id,event.target.value)} /> : <input className="field-control" required={field.required} value={value} placeholder={field.placeholder} onChange={event => set(field.id,event.target.value)} />}</label>;
  })}</div>;
}

function ChoiceGroup({field,value,onChange}) {
  const first=useRef(null),[invalid,setInvalid]=useState(false);
  const missing=field.required && !value.length;
  const message=`Select at least one option for ${field.label}.`;
  useEffect(() => { first.current?.setCustomValidity(missing ? message : ''); if(!missing)setInvalid(false); },[missing,message]);
  const hint=`choice-${field.id}-hint`;
  return <fieldset className="issue-form-options" aria-describedby={field.required ? hint : undefined}>
    <legend className="field-label">{field.label}{field.required ? ' *' : ''}</legend>
    {field.description && <p className="work-help">{field.description}</p>}
    {field.required && <p id={hint} className={invalid ? 'form-error' : 'work-help'} role={invalid ? 'alert' : undefined}>{invalid ? message : 'Choose at least one option.'}</p>}
    {field.options.map((option,index) => <label key={option.label}><input ref={index===0 ? first : undefined} type="checkbox" checked={value.includes(option.label)} required={option.required} onInvalid={() => { if(missing)setInvalid(true); }} onChange={event => onChange(event.target.checked ? [...value,option.label] : value.filter(item=>item!==option.label))} /><span>{option.label}{option.required ? ' *' : ''}</span></label>)}
  </fieldset>;
}
