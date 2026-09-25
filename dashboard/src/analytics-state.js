import { completedRunsForTasks, taskAnalytics } from "./run-metrics.js";

export function analyticsState({ jobs, days, loaded, error, now, workflow = "" }) {
  if (error) return { kind: "error", message: error };
  if (!loaded) return { kind: "loading" };

  const metrics = taskAnalytics(workflow ? jobs.filter(job => (job.workflow?.name || job.command) === workflow) : jobs, days, now);
  const runs = completedRunsForTasks(metrics.tasks);
  return metrics.totalTasks ? { kind: "ready", metrics, runs } : { kind: "empty", metrics, runs };
}
