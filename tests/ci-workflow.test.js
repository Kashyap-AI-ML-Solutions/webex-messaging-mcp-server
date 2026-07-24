import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
const dockerfile = readFileSync(
  new URL("../Dockerfile", import.meta.url),
  "utf8",
);

test("registers QEMU before Buildx for the multi-platform Docker build", () => {
  const qemuSetup = workflow.indexOf("docker/setup-qemu-action@v4");
  const buildxSetup = workflow.indexOf("docker/setup-buildx-action@v3");

  assert.notEqual(qemuSetup, -1, "the Docker job should explicitly set up QEMU");
  assert.notEqual(buildxSetup, -1, "the Docker job should set up Buildx");
  assert.ok(qemuSetup < buildxSetup, "QEMU setup should run before Buildx setup");
});

test("installs JavaScript dependencies on the native build platform", () => {
  const builderStage = dockerfile.match(
    /^FROM --platform=\$BUILDPLATFORM node:[^\s]+ AS builder$(?<body>[\s\S]*?)(?=^FROM )/m,
  );
  const productionStage = dockerfile.match(
    /^FROM node:[^\s]+ AS production$(?<body>[\s\S]*)/m,
  );

  assert.ok(
    builderStage,
    "the npm install stage should not run Node under target-platform emulation",
  );
  assert.ok(
    productionStage,
    "the production stage should still use the requested target platform",
  );
  assert.match(builderStage.groups.body, /\bnpm ci\b/);
  assert.doesNotMatch(productionStage.groups.body, /\bnpm ci\b/);
});
