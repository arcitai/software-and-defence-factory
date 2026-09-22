import { readFileSync } from "node:fs";
import { join } from "node:path";

export async function loadSecuritySDK() {
  try {
    return await import("../profiles/security/node_modules/@openai/codex-security/dist/index.js");
  } catch (error) {
    throw new Error("Security SDK unavailable. Run npm ci --prefix profiles/security --ignore-scripts on the worker.", { cause: error });
  }
}

export async function runSecurity({ config, workspace, prompt, outputDir, base, signal, mock = false, SDK }) {
  SDK ??= await loadSecuritySDK();
  // Keep the bundled directory path: custom ZIP plugins reach a dependency with open advisories.
  if (config.pluginPath !== undefined) throw new Error("Custom Security plugins are not supported.");
  const security = new SDK.CodexSecurity({ codexOverrides: {
    model: config.model, model_provider: config.provider,
    ...(config.providers ? { model_providers: config.providers } : {}),
  } });
  try {
    const result = await security.run(workspace, {
      mode: "standard", auth: config.auth ?? "auto", outputDir, signal, mock,
      // Preserve the vendor's scan workflow; the task is additional untrusted context.
      knowledgeBasePaths: [prompt],
    });
    const manifest = result.manifest;
    const revision = manifest.scan?.target?.revision ?? manifest.scan?.target?.headRevision;
    if (manifest.scan?.status !== "completed" || !manifest.scan?.sealedAt || revision !== base)
      throw new Error("Security scan did not seal a completed result for this commit.");
    if (!Array.isArray(result.findings?.findings)) throw new Error("Security findings contract missing.");
    for (const name of ["report.md", "scan-manifest.json", "coverage.json", "findings.json"])
      if (!readFileSync(join(result.scanDir, name)).length) throw new Error("Security artifact missing.");
    return { adapter: "security", provider: config.provider, model: config.model,
      synthetic: mock, scanId: manifest.scan.id, pluginVersion: result.pluginVersion,
      findingsCount: result.findings.findings.length,
      usage: result.turnResult.usage ?? null, reportedCost: result.cost ?? null,
      reportPath: result.reportPath, coveragePath: result.coveragePath };
  } finally { await security.close(); }
}
