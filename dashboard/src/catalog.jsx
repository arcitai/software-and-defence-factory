import { repositoryLabel } from "./project-identity.js";
import { Tabs } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Server, Bot, ShieldCheck, Code2, BookOpen, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeading, QuietState } from "@/components/ui/page-heading";

export function WorkersPage({ identity, workers, loaded, error }) {
  return <Page title="Workers" description="The host running this project’s controller and isolated jobs. Host capacity is separate from each job’s configured limits.">{error && <Failure value={error} />}{!loaded && !error ? <Loading description="Checking live worker status." /> : loaded && (workers.length ? <Card className="overflow-hidden">{workers.map((worker) => <article key={worker.instance_id} className="grid gap-4 border-b border-border p-4 last:border-b-0 sm:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_10rem] sm:items-center sm:px-5">
    <div className="min-w-0"><div className="flex items-center gap-2"><Server className="size-4 text-muted-foreground" /><h2 className="truncate text-sm font-medium">{worker.name}</h2></div><p className="mt-1 text-xs text-muted-foreground">{worker.machine ? `${worker.machine.hostname} · ${worker.machine.platform} ${worker.machine.architecture}` : worker.instance_id}</p>{worker.machine && <p className="mt-1 text-xs text-muted-foreground">{worker.machine.logicalCpus} logical CPUs · {Math.round(worker.machine.memoryMiB / 1024)} GiB host memory</p>}</div>
    <div className="flex flex-wrap gap-1.5">{worker.repositories?.length ? worker.repositories.map((repository) => <Badge key={repository} className="border-border bg-muted font-mono text-muted-foreground">{repositoryLabel(repository, identity)}</Badge>) : <span className="text-xs text-muted-foreground">No repositories</span>}</div>
    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end"><Badge className={worker.connected ? "gap-1.5 border-success/25 bg-success/10 text-success" : "gap-1.5 border-border bg-muted text-muted-foreground"}><span className="size-1.5 rounded-full bg-current" />{worker.connected ? "Connected" : "Disconnected"}</Badge><time className="text-xs text-muted-foreground sm:text-right" dateTime={worker.last_seen_at} title={new Date(worker.last_seen_at).toLocaleString()}>Last seen {relativeTime(worker.last_seen_at)}</time></div>
  </article>)}</Card> : <Empty value="No workers registered." description="Start a worker to register this machine with the control plane." />)}</Page>;
}

const displayName = name => String(name).replaceAll("_", " ").replaceAll("-", " ").replace(/^./, c => c.toUpperCase());

export function CommandsPage() {
  const definitions = useDefinitions();
  const [selection, setSelection] = useState("software");
  const data = definitions.value, names = Object.keys(data.workflows || {});
  const selected = names.includes(selection) ? selection : names[0];
  const steps = data.workflows?.[selected] || [];
  const config = data.configuration;
  const skills = data.skills || [];
  return <Page title="Workflows" description="Factory coordinates the work. Skills guide the agent. You choose the agent and project checks.">
    {definitions.loading ? <Loading /> : definitions.error ? <Failure value={definitions.error} /> : names.length ? <div className="workflow-page">
      <div className="method-overview">
        <div><span className="method-eyebrow">01 · Define</span><h2>Issue</h2><p>The problem, scope and acceptance criteria. Creating an issue does not start execution.</p></div>
        <div><span className="method-eyebrow">02 · Execute</span><h2>Workflow</h2><p>The ordered steps, checks and approval gates. A task records an execution of this workflow.</p></div>
        <div><span className="method-eyebrow">03 · Guide</span><h2>Skills</h2><p>Reusable instructions used by the configured agent. A skill is not a separate agent or scheduler.</p></div>
      </div>
      <Tabs label="Factory method" items={[
        { id:"workflow", label:"Execution", content:<section className="space-y-5">
          <div className="workflow-choices" role="group" aria-label="Choose workflow">{names.map(name => <button type="button" key={name} aria-pressed={selected === name} onClick={() => setSelection(name)}>{name === "defence" ? <ShieldCheck size={16} /> : <Code2 size={16} />}<span>{displayName(name)}</span></button>)}</div>
          <div className="workflow-intro"><h2>{selected === "defence" ? "Investigate within a defined boundary" : "From accepted scope to reviewed delivery"}</h2><p>{selected === "defence" ? "The runtime produces a private investigation draft. Findings need validation; production recovery is a separate authorized action." : "Prepare the scope before starting. Factory then runs these steps in order, preserving the candidate and evidence."}</p></div>
          {config && <div className="workflow-profile"><Bot size={15} /><span>Configured agent <strong>{displayName(config.agent)}</strong></span><span>Model <strong>{config.model || "Executor default"}</strong></span><span>{config.cpus} CPUs · {config.memoryMiB} MiB per job</span></div>}
          <ol className="workflow-steps">{steps.map((step,index) => {
            const command = data.commands.find(command => command.name === step.name);
            return <li key={step.name}><span className="step-number">{index+1}</span><div className="step-body"><div className="step-heading"><h3>{command?.title || displayName(step.name)}</h3><Badge>{step.approval ? "Your approval + Factory" : command?.owner === "agent" ? "Configured agent" : "Factory check"}</Badge></div><p>{command?.description || command?.prompt}</p>
              {step.name === "verify" && config && <code className="workflow-check">{config.check || "No check configured — configure before software work"}</code>}
              {command?.skills?.length > 0 && <div className="step-skills"><BookOpen size={13} /><span>{command.skills.join(" · ")}</span></div>}
            </div></li>;
          })}</ol>
          <div className="method-note"><h3>Before and after execution</h3><p><strong>Triage &amp; specification</strong> prepare a bounded issue using factory-triage and factory-spec. <strong>Evaluation</strong> uses factory-evaluate for a separately scoped comparison. These are method activities, not hidden automatic steps.</p></div>
        </section> },
        { id:"skills", label:`Skills · ${skills.length}`, content:<section className="space-y-4"><div className="workflow-intro"><h2>The actual instructions available to agents</h2><p>{data.method?.instructions || "Skills are packaged with the CLI."} Expand a skill to read the installed file.</p></div><div className="skill-library">{skills.map(skill => <details key={skill.id} className="skill-card"><summary><BookOpen size={16} /><span><strong>{skill.id}</strong><small>{skill.purpose}</small></span></summary><div className="skill-instructions"><p>{skill.path}</p><pre tabIndex={0} aria-label={`${skill.id} instructions`}>{skill.content}</pre><small>Installed file SHA-256: {skill.sha256}</small></div></details>)}</div></section> },
        { id:"configuration", label:"Configuration", content:<section className="space-y-5"><div className="workflow-intro"><h2>One setup for CLI and dashboard</h2><p>{data.method?.customization || "The installation selects its agent and checks. The packaged workflow controls execution."}</p></div>
          {config && <dl className="workflow-settings">{[["Agent",displayName(config.agent)],["Model",config.model || "Executor default"],["Check command",config.check || "Not configured"],["Phase time limit",`${config.timeoutSeconds} seconds`],["Job resources",`${config.cpus} CPUs · ${config.memoryMiB} MiB`]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          <div className="method-note"><h3><Settings2 size={15} />Inspect the same catalog from the CLI</h3><code>software-defence-factory workflows --state PATH</code><p>Both interfaces use the installed workflow and skill files. This view is read-only; changing text here would not safely change the execution policy.</p></div>
        </section> },
      ]} />
    </div> : <Empty value="No workflows configured." />}
  </Page>;
}

function Page({ title, description, children }) { return <div className="secondary-page mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8"><PageHeading title={title} description={description} />{children}</div>; }
function Loading({ description = "Loading the latest configuration." }) { return <Card><QuietState title="Preparing the bench" description={description} role="status" /></Card>; }
function Empty({ value, description = "Configuration added on the control plane will appear here." }) { return <Card><QuietState title={value} description={description} /></Card>; }
function Failure({ value }) { return <div role="alert" className="rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{value}</div>; }

function useDefinitions() {
  const [result, setResult] = useState({ loading: true, error: "", value: { commands: [] } });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/definitions", { headers: { Accept: "application/json" }, signal: controller.signal }).then(async (response) => {
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || `Definitions request failed (${response.status})`); }
      return response.json();
    }).then((value) => setResult({ loading: false, error: "", value })).catch((error) => { if (error.name !== "AbortError") setResult((current) => ({ ...current, loading: false, error: error.message })); });
    return () => controller.abort();
  }, []);
  return result;
}

function relativeTime(value) { const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000)); if (seconds < 10) return "just now"; if (seconds < 60) return `${seconds}s ago`; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`; }
