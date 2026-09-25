import assert from "node:assert/strict";
import test from "node:test";
import { projectIdentity, repositoryLabel } from "./project-identity.js";

test("project identity uses the final path component and keeps the configured path", () => {
  assert.deepEqual(projectIdentity("/srv/work/customer-project///"), {
    name: "customer-project",
    path: "/srv/work/customer-project///",
  });
  assert.deepEqual(projectIdentity("C:\\work\\customer-project\\"), {
    name: "customer-project",
    path: "C:\\work\\customer-project\\",
  });
});

test("project identity is unavailable for empty values and filesystem roots", () => {
  for (const value of [undefined, null, "", " / ", "C:\\"]) {
    assert.equal(projectIdentity(value), undefined);
  }
});

test("the app form label comes from project identity while other keys stay unchanged", () => {
  const identity = projectIdentity("/srv/work/customer-project/");
  assert.equal(repositoryLabel("app", identity), "customer-project");
  assert.equal(repositoryLabel("app", undefined), "Project identity unavailable");
  assert.equal(repositoryLabel("other", identity), "other");
});
