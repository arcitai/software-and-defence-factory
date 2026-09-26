import test from "node:test";
import assert from "node:assert/strict";
import { boardColumnForState, currentRun, groupJobsByBoardColumn } from "./runs-board.js";

test("a queued next workflow step replaces the previous completed step in the summary", () => {
 const runs = [{id: "triage", state: "succeeded"}, {id: "build", state: "queued"}];
 assert.equal(currentRun({workflow: {name: "deliver"}, runs}).id, "build");
});
