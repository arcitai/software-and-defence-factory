import { spawn } from "node:child_process";

// One isolated Pi session per attempt. The parent owns the process group and deadline.
export async function runPi({ config, workspace, prompt, onEvent = () => {}, signal, executable = "pi" }) {
  const child = spawn(executable, [
    "--mode", "rpc", "--offline", "--no-approve", "--no-extensions",
    "--no-context-files", "--no-skills", "--no-prompt-templates", "--no-themes", "--no-session",
    "--provider", config.provider, "--model", config.model, "--thinking", config.thinking ?? "off",
    "--tools", "read,write,edit,bash", "--append-system-prompt", config.policyFile,
  ], {
    cwd: workspace, env: { ...process.env, PI_CODING_AGENT_DIR: config.agentDir, PI_TELEMETRY: "0", PI_OFFLINE: "1" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const pending = new Map();
  let sequence = 0, buffer = "", bytes = 0, finishing = false, prompted = false, failure;
  let settle, rejectSettled;
  const settled = new Promise((resolve, reject) => { settle = resolve; rejectSettled = reject; });
  settled.catch(() => {});
  const closed = new Promise(resolve => child.once("close", resolve));
  const fail = (error) => {
    failure ??= error;
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    rejectSettled(error);
  };
  const command = (type, data = {}) => new Promise((resolve, reject) => {
    if (failure) return reject(failure);
    const id = String(++sequence);
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Pi RPC timeout: ${type}`)); }, 15000);
    pending.set(id, {
      resolve: event => { clearTimeout(timer); event.success ? resolve(event.data) : reject(new Error(`Pi rejected ${type}`)); },
      reject: error => { clearTimeout(timer); reject(error); },
    });
    child.stdin.write(JSON.stringify({ id, type, ...data }) + "\n");
  });
  child.on("error", fail);
  child.stdin.on("error", error => { if (!finishing) fail(error); });
  child.once("close", () => { if (!finishing) fail(new Error("Pi exited before the job settled.")); });
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", chunk => {
    bytes += Buffer.byteLength(chunk);
    if (bytes > 4 * 1024 * 1024) { fail(new Error("Pi output limit exceeded.")); return; }
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, end).replace(/\r$/, "");
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      try {
        const event = JSON.parse(line);
        onEvent(event);
        if (event.type === "response" && pending.has(event.id)) {
          pending.get(event.id).resolve(event); pending.delete(event.id);
        }
        if (prompted && event.type === "message_end" && ["error", "aborted"].includes(event.message?.stopReason))
          fail(new Error(`Pi model turn ${event.message.stopReason}.`));
        if (prompted && event.type === "agent_settled") settle();
      } catch (error) { fail(error); }
    }
  });
  child.stderr.on("data", chunk => { bytes += chunk.length; if (bytes > 4 * 1024 * 1024) fail(new Error("Pi output limit exceeded.")); });
  const abort = () => {
    child.stdin.write(JSON.stringify({ type: "abort" }) + "\n");
    fail(new Error("Pi cancelled."));
  };
  signal?.addEventListener("abort", abort, { once: true });
  try {
    if (signal?.aborted) throw new Error("Pi cancelled.");
    const state = await command("get_state");
    if (state.model?.id !== config.model || state.model?.provider !== config.provider)
      throw new Error("Pi selected a different provider/model than configured.");
    prompted = true;
    await command("prompt", { message: prompt });
    await settled;
    if (failure) throw failure;
    const stats = await command("get_session_stats");
    return { adapter: "pi", provider: config.provider, model: config.model, usage: stats.tokens ?? null,
      // Pi can report 0 when prices are absent. Keep this separate from billing/EUR.
      reportedCost: Number.isFinite(stats.cost) ? { amount: stats.cost, currency: "USD", basis: "harness-config-unverified" } : null };
  } finally {
    finishing = true;
    signal?.removeEventListener("abort", abort);
    fail(new Error("Pi session closed."));
    child.stdin.end();
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
    const timer = setTimeout(() => child.kill("SIGKILL"), 1500);
    await closed;
    clearTimeout(timer);
  }
}
