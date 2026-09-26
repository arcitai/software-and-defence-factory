import React, { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronUp, ChevronDown, Link2, X, FileText, GitBranch, Coins } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Artifacts, useTaskArtifacts } from "./artifacts.jsx";
import { taskPresentation } from "./task-presentation.js";
import { jobDisplayTitle } from "./runs-board.js";
import { formatDurationMillis, formatTokenUsage, formatRunTokenUsage, tokenUsageSummary, formatTaskTokenUsage, formatReportingCoverage, taskDurationMillis } from "./run-metrics.js";
import {
  State,
  friendlyName,
  stateLabel,
  formatTimestamp,
  TaskStateIcon,
} from "./task-display.jsx";

export function TaskDetail({
  identity,
  links,
  navigation = [],
  csrfToken,
  job,
  loaded,
  error,
  deleting,
  onDelete,
  onWorkflowAction,
}) {
  const artifacts = useTaskArtifacts(job, csrfToken);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    setCopyStatus("");
    const escape = event => {
      if (event.key === "Escape" && !event.target.closest?.("input, textarea, select")) window.location.hash = "#/runs";
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [job?.id]);
  async function copyLink() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/#/runs/${encodeURIComponent(job.id)}`); setCopyStatus("Link copied"); }
    catch { setCopyStatus("Unable to copy link"); }
  }
  if (!job)
    return (
      <div className="p-8">
        <a href="#/runs" className="text-sm underline">
          Back to inbox
        </a>
        <p className="mt-4">{!loaded ? "Loading issue…" : "Issue not found."}</p>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  const usage = tokenUsageSummary(job.runs || []);
  const terminal = ["succeeded", "failed", "cancelled"].includes(job.state);
  const latest = job.runs.at(-1);
  const lastCompleted = job.runs.findLast((run) => run.outcome === "complete");
  const { result, history, stages } = taskPresentation(job);
  const reviewing = job.state === "awaiting_approval";
  return (
    <div className="task-detail-layout">
      <div className="task-detail-main">
      <div className="detail-toolbar">
        <div className="detail-position"><span>{navigation.findIndex(item => item.id === job.id) >= 0 ? `${navigation.findIndex(item => item.id === job.id) + 1} / ${navigation.length}` : "Issue"}</span><div>
          {[-1, 1].map((delta) => {
            const index = navigation.findIndex(item => item.id === job.id);
            const adjacent = index >= 0 ? navigation[index + delta] : undefined;
            const Icon = delta < 0 ? ChevronUp : ChevronDown;
            const label = delta < 0 ? "Previous issue" : "Next issue";
            return adjacent ? <a key={delta} href={`#/runs/${encodeURIComponent(adjacent.id)}`} aria-label={label} title={adjacent.title}><Icon size={14} /></a> : <span key={delta} aria-label={`${label} unavailable`}><Icon size={14} /></span>;
          })}
        </div></div>
        <div className="detail-toolbar-actions"><span role="status" className="copy-status">{copyStatus}</span><button type="button" aria-label="Copy issue link" title="Copy issue link" onClick={copyLink}><Link2 size={16} /></button><a href="#/runs" aria-label="Close issue detail" title="Close issue detail (Esc)"><X size={18} /></a></div>
      </div>
      <header className="task-detail-heading">
        <TaskStateIcon value={job.state} /><h2>{jobDisplayTitle(job)}</h2>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </header>
      {stages.length > 1 && (
        <ol
          className="task-progress flex flex-wrap items-center gap-3 text-sm"
          aria-label="Issue progress"
        >
          {stages.map((stage, index) => (
            <li
              key={index}
              className="flex items-center gap-3"
              aria-current={stage.current ? "step" : undefined}
            >
              {index > 0 && (
                <ArrowRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "flex items-center gap-2 py-1",
                  stage.current
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {stage.complete ? (
                  <Check
                    className="size-4 text-success"
                    aria-label="Complete"
                  />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
                {friendlyName(stage.name)}
                {stage.current && (
                  <span className="text-xs text-muted-foreground">
                    {reviewing ? "Awaiting approval" : stateLabel(job.state)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
      <Tabs
        key={job.id}
        label="Issue sections"
        items={[
          {
            id: "result",
            label: "Result",
            content: (
              <Card
                className="task-result space-y-5 p-5 sm:p-6"
                aria-label="Current result"
              >
                <h2 className="text-lg font-semibold">
                  {resultTitle(job, result)}
                </h2>
                {result?.summary && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Run report</p>
                    <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                      {result.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">Agent-reported text. The workflow state and its evidence determine acceptance.</p>
                  </div>
                )}
                {result?.error && result.error !== result.summary && (
                  <p
                    role="alert"
                    className="whitespace-pre-wrap break-words text-sm text-danger"
                  >
                    {result.error}
                  </p>
                )}
                {result && job.task && (
                  <Artifacts
                    key={result.id}
                    artifacts={artifacts}
                    runID={result.id}
                    csrfToken={csrfToken}
                  />
                )}
                {job.workflow && (
                  <TaskActions
                    key={`${job.id}:${latest?.id}:${job.state}`}
                    job={job}
                    result={result}
                    onAction={onWorkflowAction}
                  />
                )}
              </Card>
            ),
          },
          ...(job.task && lastCompleted
            ? [
                {
                  id: "files",
                  label: "Files",
                  content: (
                    <Artifacts
                      artifacts={artifacts}
                      runID={lastCompleted.id}
                      csrfToken={csrfToken}
                    />
                  ),
                },
              ]
            : []),
          ...(history.length
            ? [
                {
                  id: "history",
                  label: "History",
                  content: (
                    <ol className="space-y-4">
                      {history.map((run) => (
                        <li
                          key={run.id}
                          className="space-y-3 border-l-2 border-border pl-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-medium">
                              {run.outcome === "changes_requested"
                                ? "Changes requested"
                                : friendlyName(run.command)}
                            </h3>
                            <State
                              value={
                                run.outcome === "complete"
                                  ? "succeeded"
                                  : run.outcome || run.state
                              }
                            />
                          </div>
                          {run.summary && (
                            <p className="whitespace-pre-wrap break-words leading-6">
                              {run.summary}
                            </p>
                          )}
                          {run.error && run.error !== run.summary && (
                            <p className="text-danger">{run.error}</p>
                          )}
                          {job.task && (
                            <Artifacts
                              artifacts={artifacts}
                              runID={run.id}
                              csrfToken={csrfToken}
                            />
                          )}
                          <ExecutionDetails run={run} />
                        </li>
                      ))}
                    </ol>
                  ),
                },
              ]
            : []),
          {
            id: "instructions",
            label: "Instructions",
            content: (
              <pre className="whitespace-pre-wrap break-words font-sans leading-6">
                {job.task
                  ? job.task.spec || "Use the linked source for requirements."
                  : job.prompt}
              </pre>
            ),
          },
          {
            id: "details",
            label: "Details",
            content: (
              <div className="space-y-6 text-sm">
                {result?.revision && (
                  <section>
                    <h2 className="mb-2 font-medium">Requested changes</h2>
                    <p className="whitespace-pre-wrap">
                      {result.revision.feedback}
                    </p>
                  </section>
                )}
                {result?.summary && (
                  <section>
                    <h2 className="mb-2 font-medium">Full summary</h2>
                    <p className="whitespace-pre-wrap break-words leading-6">
                      {result.summary}
                    </p>
                  </section>
                )}
                {result && <ExecutionDetails run={result} />}
                <section className="border-t border-border pt-4">
                  <dl className="my-4 grid gap-3 sm:grid-cols-3">
                    <RunMetric label="Issue ID" value={job.id} />
                    <RunMetric label="Repository" value={job.repository} />
                    <RunMetric
                      label="Created"
                      value={formatTimestamp(job.created_at)}
                    />
                    <RunMetric
                      label="Updated"
                      value={formatTimestamp(job.updated_at)}
                    />
                  </dl>
                  <Button
                    variant="outline"
                    disabled={!terminal || deleting}
                    onClick={() => onDelete(job)}
                  >
                    {deleting ? "Deleting…" : "Delete issue"}
                  </Button>
                </section>
              </div>
            ),
          },
        ]}
      />
      </div>
      <aside className="task-metadata" aria-label="Issue details">
        <h3><FileText size={15} />Metadata</h3>
        <dl>
          <div><dt>Status</dt><dd><State value={job.state} /></dd></div>
          <div><dt>Project</dt><dd>{identity?.name || job.repository}</dd></div>
          <div><dt>Workflow</dt><dd>{friendlyName(job.workflow?.name || job.command)}</dd></div>
          <div><dt>Created</dt><dd>{formatTimestamp(job.created_at)}</dd></div>
          <div><dt>Last activity</dt><dd>{formatTimestamp(job.updated_at)}</dd></div>
          <div><dt>Requested models</dt><dd>{[...new Set((job.runs || []).map(run => run.model || run.execution?.requestedModel).filter(Boolean))].join(", ") || job.model || "Not recorded"}</dd></div>
          <div><dt>Recorded duration</dt><dd>{formatDurationMillis(taskDurationMillis(job.runs || []))}</dd></div>
          <div className="task-usage"><dt><Coins size={13} />Reported tokens</dt><dd>{formatTaskTokenUsage(usage)}</dd><dd className="metadata-hint">{formatReportingCoverage(usage)}</dd></div>
          {usage.input !== undefined && <div><dt>Token breakdown</dt><dd>{formatTokenUsage(usage.input)} input<br />{formatTokenUsage(usage.output)} output<br />{formatTokenUsage(usage.cached)} cached input</dd><dd className="metadata-hint">Cached input is a subset of input.</dd></div>}
          <div><dt>Monetary cost</dt><dd>Not reported</dd><dd className="metadata-hint">Token counts are usage, not a charge.</dd></div>
          {links?.repository && <div><dt>Repository</dt><dd><a className="metadata-link" href={links.repository} target="_blank" rel="noreferrer"><GitBranch size={13} />View repo</a></dd></div>}
          {job.task?.source_url && /^https?:\/\//.test(job.task.source_url) && <div><dt>Source</dt><dd><a className="metadata-link" href={job.task.source_url} target="_blank" rel="noreferrer"><Link2 size={13} />Open source</a></dd></div>}
        </dl>
      </aside>
    </div>
  );
}

function ExecutionDetails({ run }) {
  const modelLabel = !run.execution ? "Not recorded"
    : run.execution.modelSelection === "not_applicable" || ["deterministic", "mock"].includes(run.executor) ? "Not applicable"
    : !["codex", "pi"].includes(run.executor) ? "Not recorded by custom executor"
    : run.model || "Provider default requested";
  return (
    <section
      aria-label="execution details"
      className="text-xs text-muted-foreground"
    >
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <RunMetric label="Started" value={formatTimestamp(run.started_at)} />
        <RunMetric
          label="Completed"
          value={formatTimestamp(run.completed_at)}
        />
        <RunMetric
          label="Exit code"
          value={
            run.exit_code === undefined ? "Unavailable" : String(run.exit_code)
          }
        />
        <RunMetric label="Run ID" value={run.id} mono />
        <RunMetric label="Executor" value={run.execution ? run.executor : run.started_at ? "Not recorded (legacy/unknown)" : "Not started"} />
        <RunMetric label="Host" value={run.host_name || run.worker_name || (run.started_at ? "Not recorded" : "Not assigned yet")} />
        <RunMetric
          label="Duration"
          value={
            Number.isSafeInteger(run.duration_millis)
              ? formatDurationMillis(run.duration_millis)
              : "Not available"
          }
        />
        <RunMetric label="Requested model" value={modelLabel} />
        <RunMetric label="Runtime version" value={run.execution?.runtimeVersion || "Not recorded"} />
        <RunMetric label="Job image" value={run.execution ? run.execution.image || "Not applicable" : "Not recorded"} mono />
        <RunMetric label="Policy hash" value={run.execution?.policyHash || "Not recorded"} mono />
        <RunMetric
          label="Tokens"
          value={formatRunTokenUsage(run) === "Unavailable" ? "Not reported" : formatRunTokenUsage(run)}
        />
      </dl>
    </section>
  );
}

function RunMetric({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn("mt-0.5 truncate text-sm", mono && "font-mono")}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function TaskActions({ job, result, onAction }) {
  const [stopped, setStopped] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const latest = job.runs.at(-1);
  const action = async (name) => {
    setBusy(true);
    try {
      await onAction(
        job,
        name,
        stopped,
        name === "request_changes" ? feedback : "",
      );
    } finally {
      setBusy(false);
    }
  };
  const retry = ["failed", "interrupted", "cancelled"].includes(
    job.state,
  );
  const canRevise = job.can_request_changes ?? (job.state === "awaiting_approval" && job.workflow?.name === "software");
  return (
    <div className="space-y-3">
      {(job.state === "awaiting_approval" || canRevise) && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {job.state === "awaiting_approval" && <Button
              disabled={busy || requesting}
              onClick={() => action("approve")}
            >
              Approve and start {friendlyName(latest?.command).toLowerCase()}
            </Button>}
            {canRevise && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setRequesting(true)}
              >
                Request changes
              </Button>
            )}
          </div>
          {requesting && (
            <div className="space-y-3">
              <label className="block">
                <span className="field-label">What needs to change?</span>
                <textarea
                  className="field-control min-h-24"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={4000}
                  placeholder="Explain what to revise in the previous stage’s result."
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Starts a new build with your feedback, followed by new checks and review. Previous attempts are retained.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !feedback.trim()}
                  onClick={() => action("request_changes")}
                >
                  {busy ? "Submitting…" : "Send feedback and revise"}
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setRequesting(false)}
                >
                  Keep reviewing
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {job.state === "blocked" && (
        <p className="text-sm text-muted-foreground">
          Resolve the blocker, then cancel this work to reconcile the worker before retrying.
        </p>
      )}
      {job.state === "timed_out" && <p className="text-sm text-muted-foreground">Inspect the timeout evidence and recovery options. This state cannot be retried directly.</p>}
      {["interrupted", "cancelled"].includes(job.state) && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={stopped}
            onChange={(event) => setStopped(event.target.checked)}
          />
          I have verified the previous worker process has stopped. Retrying will
          inspect existing work before continuing.
        </label>
      )}
      {["queued", "running", "awaiting_approval", "blocked", "interrupted"].includes(
        job.state,
      ) && (
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-danger"
          disabled={busy}
          onClick={() => action("cancel")}
        >
          Cancel work
        </Button>
      )}
      {retry && <p className="text-xs text-muted-foreground">Retry repeats the stopped {friendlyName(latest?.command).toLowerCase()} phase.{latest?.command === "review" && " It does not change the candidate."}{canRevise && " Request changes when the implementation needs revision."}</p>}
      {retry && (
        <Button
          disabled={
            busy || requesting ||
            (["interrupted", "cancelled"].includes(job.state) && !stopped)
          }
          onClick={() => action("retry")}
        >
          Retry {friendlyName(latest?.command).toLowerCase()}
        </Button>
      )}
    </div>
  );
}

function resultTitle(job, result) {
  const command = friendlyName(job.runs.at(-1)?.command);
  switch (job.state) {
    case "awaiting_approval":
      return result
        ? `${friendlyName(result.command)} ready for review`
        : `Ready to start ${command.toLowerCase()}`;
    case "running":
      return `${command} in progress`;
    case "queued":
      return `${command} queued`;
    case "succeeded":
      return "Issue complete";
    default:
      return `${command} · ${stateLabel(job.state)}`;
  }
}
