import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readProjectFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("keeps published version metadata aligned with package.json", () => {
  const packageJson = JSON.parse(readProjectFile("package.json"));
  const packageLock = JSON.parse(readProjectFile("package-lock.json"));
  const toolsManifest = JSON.parse(readProjectFile("tools-manifest.json"));
  const smitheryConfig = readProjectFile("smithery.yaml");
  const serverSource = readProjectFile("mcpServer.js");

  const smitheryVersion = smitheryConfig.match(
    /^ {2}version:\s*"([^"]+)"$/m,
  )?.[1];
  const serverVersion = serverSource.match(
    /^const SERVER_VERSION = "([^"]+)";$/m,
  )?.[1];

  assert.deepEqual(
    {
      packageLock: packageLock.version,
      packageLockRoot: packageLock.packages[""].version,
      server: serverVersion,
      smithery: smitheryVersion,
      toolsManifest: toolsManifest.version,
    },
    {
      packageLock: packageJson.version,
      packageLockRoot: packageJson.version,
      server: packageJson.version,
      smithery: packageJson.version,
      toolsManifest: packageJson.version,
    },
  );
});
