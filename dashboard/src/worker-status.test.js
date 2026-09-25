import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("workers show connected and disconnected poll status", async () => {
  const catalog = await readFile(new URL("./catalog.jsx", import.meta.url), "utf8");
  const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
  const details = await readFile(new URL("./task-detail.jsx", import.meta.url), "utf8");

  assert.match(catalog, /worker\.connected \? "Connected" : "Disconnected"/);
  assert.match(catalog, /worker\.connected \? "[^"]*text-success"/);
  assert.match(catalog, /Last seen \{relativeTime\(worker\.last_seen_at\)\}/);
  assert.match(main, /link\("#\/workers", Server, "Workers"/);
  assert.match(main, /<WorkersPage workers=\{status\.workers\}/);
  assert.doesNotMatch(main, /connectedWorkers|No workers online|status\.workers\.filter/);
  assert.match(details, /function ExecutionDetails\(/);
});
