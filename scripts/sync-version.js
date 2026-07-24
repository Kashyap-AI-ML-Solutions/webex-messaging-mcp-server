#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

function replaceRequiredVersion(source, pattern, replacement, fileName) {
  if (!pattern.test(source)) {
    throw new Error(`Could not find the version declaration in ${fileName}`);
  }

  return source.replace(pattern, replacement);
}

export function syncVersionMetadata(projectRoot, version) {
  if (!SEMVER_PATTERN.test(version)) {
    throw new Error(`Invalid semantic version: ${version}`);
  }

  const packagePath = resolve(projectRoot, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  if (packageJson.version !== version) {
    throw new Error(
      `package.json is ${packageJson.version}; expected ${version} before synchronizing metadata`,
    );
  }

  const serverPath = resolve(projectRoot, "mcpServer.js");
  const serverSource = readFileSync(serverPath, "utf8");
  writeFileSync(
    serverPath,
    replaceRequiredVersion(
      serverSource,
      /^const SERVER_VERSION = "[^"]+";$/m,
      `const SERVER_VERSION = "${version}";`,
      "mcpServer.js",
    ),
  );

  const smitheryPath = resolve(projectRoot, "smithery.yaml");
  const smitherySource = readFileSync(smitheryPath, "utf8");
  writeFileSync(
    smitheryPath,
    replaceRequiredVersion(
      smitherySource,
      /^ {2}version: "[^"]+"$/m,
      `  version: "${version}"`,
      "smithery.yaml",
    ),
  );

  const manifestPath = resolve(projectRoot, "tools-manifest.json");
  const toolsManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  toolsManifest.version = version;
  writeFileSync(manifestPath, `${JSON.stringify(toolsManifest, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    syncVersionMetadata(process.cwd(), process.argv[2] ?? "");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
