import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("project view leads with identity and each control plane view keeps its page heading", async () => {
  const [main, analytics, catalog, triggers] = await Promise.all([
    readFile(new URL("./main.jsx", import.meta.url), "utf8"),
    readFile(new URL("./analytics.jsx", import.meta.url), "utf8"),
    readFile(new URL("./catalog.jsx", import.meta.url), "utf8"),
    readFile(new URL("./triggers.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(main, /<ProjectContext identity=\{identity\}/);
  assert.match(main, /<h2[^>]*>Tasks<\/h2>/);
  assert.match(main, /aria-label="Search tasks"/);
  assert.match(analytics, /<PageHeading title="Task analytics"/);
  assert.match(catalog, /<Page title="Workers"/);
  assert.match(catalog, /<Page title="Workflows"/);
  assert.match(triggers, /<PageHeading title=\{title\}/);
  assert.doesNotMatch([main, analytics, catalog, triggers].join("\n"), /Control plane \/|index="0[1-5]"/);
});

test("narrow navigation and status filters collapse into labelled controls", async () => {
  const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");

  assert.match(main, /className="mobile-nav"/);
  assert.match(main, /aria-label="Open navigation"/);
  assert.match(main, /aria-label="Filter tasks by status"/);
  assert.match(styles, /\.mobile-nav \{ position: relative; display: block;/);
  assert.match(styles, /\.mobile-filter \{ display: grid;/);
  assert.match(styles, /\.project-header h1 \{[^}]*font-size: 36px/);
  assert.match(styles, /grid-template-columns: 212px minmax\(0, 1fr\)/);
});
