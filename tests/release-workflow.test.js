import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { syncVersionMetadata } from "../scripts/sync-version.js";

const releaseScript = readFileSync(
  new URL("../scripts/release.sh", import.meta.url),
  "utf8",
);

test("synchronizes all version metadata before validating a release", () => {
  const npmVersion = releaseScript.indexOf(
    "npm version $VERSION --no-git-tag-version",
  );
  const metadataSync = releaseScript.indexOf(
    'node scripts/sync-version.js "$VERSION"',
  );
  const validation = releaseScript.indexOf("npm run validate");

  assert.notEqual(npmVersion, -1);
  assert.notEqual(metadataSync, -1);
  assert.notEqual(validation, -1);
  assert.ok(npmVersion < metadataSync);
  assert.ok(metadataSync < validation);
  assert.match(
    releaseScript,
    /git add package\.json package-lock\.json mcpServer\.js smithery\.yaml tools-manifest\.json/,
  );
});

test("updates every non-npm version declaration", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "webex-mcp-release-"));

  try {
    writeFileSync(
      join(projectRoot, "package.json"),
      JSON.stringify({ version: "9.8.7" }, null, 2),
    );
    writeFileSync(
      join(projectRoot, "mcpServer.js"),
      'const SERVER_VERSION = "0.1.0";\n',
    );
    writeFileSync(
      join(projectRoot, "smithery.yaml"),
      'metadata:\n  version: "0.1.0"\n',
    );
    writeFileSync(
      join(projectRoot, "tools-manifest.json"),
      `${JSON.stringify({ name: "test", version: "0.1.0" }, null, 2)}\n`,
    );

    syncVersionMetadata(projectRoot, "9.8.7");

    assert.match(
      readFileSync(join(projectRoot, "mcpServer.js"), "utf8"),
      /^const SERVER_VERSION = "9\.8\.7";$/m,
    );
    assert.match(
      readFileSync(join(projectRoot, "smithery.yaml"), "utf8"),
      /^ {2}version: "9\.8\.7"$/m,
    );
    assert.equal(
      JSON.parse(
        readFileSync(join(projectRoot, "tools-manifest.json"), "utf8"),
      ).version,
      "9.8.7",
    );
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});
