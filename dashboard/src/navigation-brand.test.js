import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("navigation brand uses the interlocking two-piece mark and wordmark", async () => {
  const source = await readFile(new URL("./main.jsx", import.meta.url), "utf8");

  assert.match(source, /<FactoryMark \/>/);
  assert.match(source, /className="brand-wordmark">Factory<\/span>/);
  assert.match(source, /function FactoryMark\(\)/);
  assert.match(source, /className="factory-mark-piece-a"/);
  assert.match(source, /className="factory-mark-piece-b"/);
  assert.doesNotMatch(source, /<circle/);
});
