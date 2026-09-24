import { spawnSync } from "node:child_process";
import { profiles } from "../src/domain.mjs";
const commands = ["git", "codex", "ollama", "agent", "pi"];
console.log(
  "Arcitai Software & Defence Factory preflight inventory (no models started, no credentials read)",
);
for (const c of commands) {
  const r = spawnSync(c, ["--version"], { encoding: "utf8", timeout: 5000 });
  console.log(`${c}: ${r.status === 0 ? "available" : "not detected"}`);
}
console.log(`Node: ${process.version}. Profiles: ${profiles.length}.`);
console.log(
  "Inventory is not a capability PASS. Test model tool calls, browser access, isolation and credentials on the selected worker. See docs/setup.md.",
);
