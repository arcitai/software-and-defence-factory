import React from "react";
import { ChevronDown, Layers, Tag, Cpu } from "lucide-react";
import { friendlyName } from "./task-display.jsx";

export function taskModels(job) {
  return [...new Set([job.model, ...(job.runs || []).map(run => run.model || run.execution?.requestedModel)].filter(Boolean))];
}
export function filterTaskFacets(jobs, workflow, model) {
  return jobs.filter(job => (!workflow || (job.workflow?.name || job.command) === workflow)
    && (!model || taskModels(job).includes(model)));
}
export function TaskFilters({ jobs, availableWorkflows = [], workflow, setWorkflow, model, setModel, filter, setFilter, options, disabled }) {
  const workflows = [...new Set([...availableWorkflows, ...jobs.map(job => job.workflow?.name || job.command)].filter(Boolean))].sort();
  const models = [...new Set(jobs.flatMap(taskModels))].sort();
  return <div className="task-facets" aria-label="Task filters">
    <Facet label="Workflow" placeholder="Workflows" value={workflow} change={setWorkflow} disabled={disabled} Icon={Layers}>
      {workflows.map(value => <option key={value} value={value}>{friendlyName(value)}</option>)}
    </Facet>
    <Facet label="Model" placeholder="Models" value={model} change={setModel} disabled={disabled} Icon={Cpu}>
      {models.map(value => <option key={value} value={value}>{value}</option>)}
    </Facet>
    <Facet label="Badge" placeholder="Badges" value={filter === "all" ? "" : filter} change={value => setFilter(value || "all")} disabled={disabled} Icon={Tag}>
      {options.filter(option => option.id !== "all").map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
    </Facet>
  </div>;
}
function Facet({ label, placeholder, value, change, disabled, Icon, children }) {
  return <label className={`task-facet${value ? " is-selected" : ""}`}>
    <Icon size={14} aria-hidden="true" />
    <select aria-label={`Filter by ${label.toLowerCase()}`} value={value} onChange={event => change(event.target.value)} disabled={disabled}>
      <option value="">{placeholder}</option>{children}
    </select>
    <ChevronDown size={12} aria-hidden="true" />
  </label>;
}
