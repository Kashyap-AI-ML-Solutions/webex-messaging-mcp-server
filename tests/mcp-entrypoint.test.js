import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("mcpServer can be imported from a virtual stdin entrypoint", () => {
  const moduleUrl = new URL("../mcpServer.js", import.meta.url).href;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-"],
    {
      encoding: "utf8",
      input: `await import(${JSON.stringify(moduleUrl)});`,
      timeout: 5000,
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.signal, null);
});
