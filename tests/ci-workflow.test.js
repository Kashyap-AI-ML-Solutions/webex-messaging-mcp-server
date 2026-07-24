import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);

test("registers QEMU before Buildx for the multi-platform Docker build", () => {
  const qemuSetup = workflow.indexOf("docker/setup-qemu-action@v4");
  const buildxSetup = workflow.indexOf("docker/setup-buildx-action@v3");

  assert.notEqual(qemuSetup, -1, "the Docker job should explicitly set up QEMU");
  assert.notEqual(buildxSetup, -1, "the Docker job should set up Buildx");
  assert.ok(qemuSetup < buildxSetup, "QEMU setup should run before Buildx setup");
});
