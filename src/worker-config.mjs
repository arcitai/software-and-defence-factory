import { readFileSync, realpathSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, relative, sep, join } from "node:path";
import { requireThat } from "./domain.mjs";

export const configHash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function outside(path, root) {
  const rel = relative(root, path);
  return rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel);
}
export function privatePath(path, workspace, kind = "file") {
  requireThat(typeof path === "string" && isAbsolute(path), "Private stier skal være absolutte.");
  const canonical = realpathSync(path);
  requireThat(outside(canonical, realpathSync(workspace)), "Konfiguration og resultater skal ligge uden for checkout.");
  requireThat(kind === "directory" ? statSync(canonical).isDirectory() : statSync(canonical).isFile(), "Forkert type privat sti.");
  return canonical;
}
export function loadWorkerConfig(path, workspace, adapter) {
  const bytes = readFileSync(privatePath(path, workspace));
  requireThat(bytes.length <= 65536, "Worker-konfiguration er for stor.");
  const config = JSON.parse(bytes);
  const resources = [bytes.toString("utf8")];
  for (const field of ["provider", "model"])
    requireThat(typeof config[field] === "string" && /^[\w./:-]{1,200}$/.test(config[field]), `Worker ${field} skal vælges eksplicit.`);
  config.home = privatePath(config.home, workspace, "directory");
  const names = config.credentialEnv ?? [];
  requireThat(Array.isArray(names) && names.length <= 8 && names.every(name =>
    /^(?!FACTORY_|PI_|CODEX_HOME)[A-Z][A-Z0-9_]*(?:_KEY|_TOKEN)$/.test(name)), "credentialEnv må kun navngive afgrænsede API-nøgler/tokens.");
  if (adapter === "pi") {
    config.agentDir = privatePath(config.agentDir, workspace, "directory");
    config.policyFile = privatePath(config.policyFile, workspace);
    for (const path of [config.policyFile, join(config.agentDir, "settings.json"), join(config.agentDir, "models.json")])
      resources.push(existsSync(path) ? readFileSync(privatePath(path, workspace), "utf8") : null);
    requireThat(["off", "minimal", "low", "medium", "high", "xhigh"].includes(config.thinking ?? "off"), "Ugyldigt thinking-niveau.");
  } else {
    requireThat(config.pluginPath === undefined, "Security bruger kun SDK'ens medfølgende pluginmappe; ZIP-plugins er ikke understøttet.");
    if (config.codexHome) config.codexHome = privatePath(config.codexHome, workspace, "directory");
    requireThat(["auto", "chatgpt", "api-key"].includes(config.auth ?? "auto"), "Ugyldig security-auth.");
    requireThat(config.providers == null || (typeof config.providers === "object" && !Array.isArray(config.providers)), "Ugyldig provider-konfiguration.");
  }
  return { config, hash: configHash(JSON.stringify(resources)) };
}
export function workerEnvironment(config, parent = process.env) {
  const env = { PATH: parent.PATH, HOME: config.home, TMPDIR: parent.TMPDIR };
  for (const name of config.credentialEnv ?? []) {
    requireThat(typeof parent[name] === "string" && parent[name].length > 0, `Worker mangler credential: ${name}`);
    env[name] = parent[name];
  }
  if (config.codexHome) env.CODEX_HOME = config.codexHome;
  return env;
}
