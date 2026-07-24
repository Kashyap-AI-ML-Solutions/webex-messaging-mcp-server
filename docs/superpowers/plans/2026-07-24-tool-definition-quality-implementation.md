# Webex MCP Tool Definition Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Glama Tool Definition Quality from C to A by enriching all 52 MCP tool definitions with accurate usage guidance, behavioral detail, and standard annotations while preserving every tool's existing purpose, parameters, and execution behavior.

**Architecture:** A new `lib/tool-quality-metadata.js` module owns the explicit metadata contract for all 52 tools and exposes a pure `enhanceToolDefinition(tool)` function. `discoverTools()` applies that enhancer, so CLI discovery and MCP registration consume one definition source; `mcpServer.js` then forwards each tool's annotations through the SDK. Contract tests compare raw modules with enhanced discovery and an in-memory MCP client verifies the actual `tools/list` response.

**Tech Stack:** Node.js 18.20+, ECMAScript modules, Node test runner, `@modelcontextprotocol/sdk` 1.26, Zod 3, c8.

## Global Constraints

- Keep exactly 52 registered tools with all existing names unchanged.
- Preserve every current one-sentence purpose description byte-for-byte as the enhanced description prefix.
- Preserve every input parameter schema, property description, required list, default, and constraint.
- Do not change Webex request URLs, methods, headers, bodies, authentication, retries, response handling, or tool execution functions.
- Append exactly two compact sentences: usage guidance followed by behavior/completeness guidance.
- Keep every enhanced description at three sentences and no more than 55 words.
- Every usage sentence must state when to use the tool, when not to use it, and name an existing sibling alternative.
- Every behavior sentence must accurately state read/write/destructive behavior, Webex access, result shape, error-result behavior, and no automatic rate-limit retry.
- Set `openWorldHint: true` on every tool.
- Read tools expose only `readOnlyHint: true` and `openWorldHint: true`.
- Create tools expose `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint: false`, and `openWorldHint: true`.
- Update, edit, delete, and unlink tools expose `readOnlyHint: false`, `destructiveHint: true`, `idempotentHint: true`, and `openWorldHint: true`.
- Do not add output schemas or structured output in this release.
- Keep the existing scoped audit allowlist; the two moderate transitive advisories are outside this metadata-only change.
- Target release version is `0.2.1`.

## File Structure

- Create `lib/tool-quality-metadata.js`: annotation profiles, the exact 52-entry quality catalog, validation, and pure definition enrichment.
- Create `tests/tool-quality-metadata.test.js`: catalog coverage, protected-dimension, wording, annotation, and contradiction contracts.
- Modify `lib/tools.js`: enrich every raw tool during discovery.
- Modify `mcpServer.js`: export the server factory for tests, forward annotations, use v0.2.1 metadata, and start transports only when executed directly.
- Modify `tests/mcp-server.test.js`: exercise the real server over an in-memory SDK transport and assert `tools/list`.
- Modify `package.json`: bump the release version to 0.2.1.
- Modify `package-lock.json`: keep lockfile version metadata synchronized through `npm version --no-git-tag-version`.
- Modify `README.md`: document the new MCP annotations and three-part description contract without duplicating all tool prose.

---

### Task 1: Add the Complete Quality Metadata Contract

**Files:**
- Create: `tests/tool-quality-metadata.test.js`
- Create: `lib/tool-quality-metadata.js`

**Interfaces:**
- Consumes: raw `apiTool` objects with `definition.function.name`, `definition.function.description`, and `definition.function.parameters`.
- Produces: `toolQualityMetadata: Record<string, {annotations: object, usageGuidance: string, behaviorSummary: string}>`.
- Produces: `enhanceToolDefinition(tool): object`, returning an immutable-style copy with `annotations` and the appended description while retaining the function and schema references.

- [ ] **Step 1: Write failing catalog coverage and annotation tests**

Create `tests/tool-quality-metadata.test.js` with helpers that import every raw module from `toolPaths`, then assert:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toolPaths } from "../tools/paths.js";
import {
  enhanceToolDefinition,
  toolQualityMetadata,
} from "../lib/tool-quality-metadata.js";

async function loadRawTools() {
  return Promise.all(toolPaths.map(async (file) => {
    const module = await import(`../tools/${file}`);
    return { ...module.apiTool, path: file };
  }));
}

const expectedAnnotationProfiles = {
  read: { readOnlyHint: true, openWorldHint: true },
  create: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  mutate: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

describe("tool quality metadata", () => {
  it("covers exactly every raw tool", async () => {
    const names = (await loadRawTools())
      .map((tool) => tool.definition.function.name)
      .sort();
    assert.deepEqual(Object.keys(toolQualityMetadata).sort(), names);
    assert.equal(names.length, 52);
  });

  it("uses the required annotation profile for every naming class", async () => {
    for (const tool of await loadRawTools()) {
      const name = tool.definition.function.name;
      const annotations = toolQualityMetadata[name].annotations;
      if (/^(get|list)_/.test(name)) {
        assert.deepEqual(annotations, expectedAnnotationProfiles.read, name);
      } else if (/^create_/.test(name)) {
        assert.deepEqual(annotations, expectedAnnotationProfiles.create, name);
      } else {
        assert.match(name, /^(edit|update|delete|unlink)_/);
        assert.deepEqual(annotations, expectedAnnotationProfiles.mutate, name);
      }
      for (const value of Object.values(annotations)) {
        assert.equal(typeof value, "boolean", name);
      }
    }
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the red state**

Run: `node --test tests/tool-quality-metadata.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/tool-quality-metadata.js`.

- [ ] **Step 3: Add annotation profiles and the explicit catalog**

Create `lib/tool-quality-metadata.js` with frozen profiles:

```js
const READ_ONLY = Object.freeze({
  readOnlyHint: true,
  openWorldHint: true,
});

const CREATE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
});

const MUTATE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: true,
});
```

Add one explicit entry for each of these 52 names:

```text
create_attachment_action create_ecm_folder create_membership create_message
create_person create_room create_room_tab create_team create_team_membership
create_webhook delete_membership delete_message delete_person delete_room
delete_room_tab delete_team delete_team_membership delete_webhook
edit_message get_attachment_action_details get_ecm_folder_details
get_event_details get_membership_details get_message_details
get_my_own_details get_person_details get_room_details
get_room_meeting_details get_room_tab_details get_team_details
get_team_membership_details get_webhook_details list_direct_messages
list_ecm_folder list_events list_memberships list_messages list_people
list_room_tabs list_rooms list_team_memberships list_teams list_webhooks
unlink_ecm_linked_folder update_ecm_linked_folder update_membership
update_person update_room update_room_tab update_team update_team_membership
update_webhook
```

Each entry must contain:

```js
{
  annotations: READ_ONLY,
  usageGuidance: "Use when the room ID is known; to discover accessible rooms, use list_rooms instead.",
  behaviorSummary: "Read-only; requires Webex access and returns the room record or an error result without automatically retrying rate limits.",
}
```

Use `CREATE` or `MUTATE` instead of `READ_ONLY` according to the Global Constraints. Encode the exact use/not-use pairing from Section 8 of `docs/superpowers/specs/2026-07-24-tool-definition-quality-design.md`, including these required special cases:

```text
create_attachment_action -> create_message or edit_message; can trigger downstream application behavior
create_message -> edit_message; sends immediately and is non-idempotent
create_webhook -> update_webhook; causes future requests to the configured target
delete_person -> delete_membership; permanently deprovisions the person
delete_room -> update_room; permanently removes the room
delete_team -> update_team; permanently removes the team
unlink_ecm_linked_folder -> update_ecm_linked_folder; preserves the external folder
```

Implement the pure enhancer:

```js
export function enhanceToolDefinition(tool) {
  const definition = tool?.definition?.function;
  const metadata = toolQualityMetadata[definition?.name];

  if (!metadata) {
    throw new Error(
      `Missing tool quality metadata for ${definition?.name ?? "unknown tool"}`,
    );
  }

  return {
    ...tool,
    annotations: { ...metadata.annotations },
    definition: {
      ...tool.definition,
      function: {
        ...definition,
        description: [
          definition.description,
          metadata.usageGuidance,
          metadata.behaviorSummary,
        ].join(" "),
      },
    },
  };
}
```

- [ ] **Step 4: Run catalog tests and confirm green**

Run: `node --test tests/tool-quality-metadata.test.js`

Expected: both tests PASS and catalog count is 52.

- [ ] **Step 5: Commit the metadata contract**

```bash
git add lib/tool-quality-metadata.js tests/tool-quality-metadata.test.js
git commit -m "feat: add Webex tool quality metadata"
```

### Task 2: Enforce Description and Schema Non-Regression During Discovery

**Files:**
- Modify: `tests/tool-quality-metadata.test.js`
- Modify: `lib/tools.js`
- Modify: `tests/tools.test.js`

**Interfaces:**
- Consumes: `enhanceToolDefinition(tool)` from Task 1.
- Produces: `discoverTools(): Promise<Array<object>>` whose returned tools include enhanced descriptions and annotations.

- [ ] **Step 1: Add failing protected-dimension and wording tests**

Extend `tests/tool-quality-metadata.test.js`:

```js
import { discoverTools } from "../lib/tools.js";

function countWords(value) {
  return value.trim().split(/\s+/).length;
}

function sentenceCount(value) {
  return value.split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length;
}

it("preserves purpose text, names, parameters, and executable functions", async () => {
  const rawTools = await loadRawTools();
  const enhancedTools = await discoverTools();
  const enhancedByName = new Map(
    enhancedTools.map((tool) => [tool.definition.function.name, tool]),
  );

  assert.equal(enhancedTools.length, rawTools.length);
  for (const raw of rawTools) {
    const name = raw.definition.function.name;
    const enhanced = enhancedByName.get(name);
    assert.ok(enhanced, name);
    assert.ok(
      enhanced.definition.function.description.startsWith(
        `${raw.definition.function.description} `,
      ),
      name,
    );
    assert.deepEqual(
      enhanced.definition.function.parameters,
      raw.definition.function.parameters,
      name,
    );
    assert.equal(enhanced.function, raw.function, name);
  }
});

it("keeps every description compact and structurally complete", async () => {
  const names = new Set(Object.keys(toolQualityMetadata));
  for (const tool of await discoverTools()) {
    const { name, description } = tool.definition.function;
    const metadata = toolQualityMetadata[name];
    assert.ok(countWords(description) <= 55, `${name}: ${countWords(description)}`);
    assert.equal(sentenceCount(description), 3, name);
    assert.ok(description.includes(metadata.usageGuidance), name);
    assert.ok(description.endsWith(metadata.behaviorSummary), name);
    assert.match(metadata.usageGuidance, /^Use (when|for|only|to)\b/, name);
    assert.match(metadata.usageGuidance, /\b(use|instead)\b/, name);
    const siblings = [...metadata.usageGuidance.matchAll(/\b[a-z]+_[a-z0-9_]+\b/g)]
      .map((match) => match[0])
      .filter((candidate) => candidate !== name);
    assert.ok(siblings.some((candidate) => names.has(candidate)), name);
    assert.doesNotMatch(
      description,
      /\b(?:readOnlyHint|destructiveHint|idempotentHint|openWorldHint)\b/,
      name,
    );
  }
});

it("keeps prose and annotations consistent", async () => {
  for (const tool of await discoverTools()) {
    const { name, description } = tool.definition.function;
    if (/^(get|list)_/.test(name)) {
      assert.match(description, /\bRead-only\b/, name);
      assert.equal(tool.annotations.readOnlyHint, true, name);
    }
    if (/^create_/.test(name)) {
      assert.match(description, /\bnon-idempotent\b/, name);
      assert.doesNotMatch(description, /\bdestructive\b/i, name);
    }
    if (/^(delete|unlink)_/.test(name)) {
      assert.match(description, /\b(?:Destructive|permanent|removes)\b/, name);
    }
  }
  const unlink = (await discoverTools()).find(
    (tool) => tool.definition.function.name === "unlink_ecm_linked_folder",
  );
  assert.match(unlink.definition.function.description, /preserves the external folder/);
});
```

- [ ] **Step 2: Run focused tests and confirm discovery is still raw**

Run: `node --test tests/tool-quality-metadata.test.js tests/tools.test.js`

Expected: FAIL because discovered tools do not yet include annotations or appended metadata.

- [ ] **Step 3: Apply enrichment in one discovery location**

Modify `lib/tools.js`:

```js
import { toolPaths } from "../tools/paths.js";
import { enhanceToolDefinition } from "./tool-quality-metadata.js";

export async function discoverTools() {
  const toolPromises = toolPaths.map(async (file) => {
    const module = await import(`../tools/${file}`);
    return enhanceToolDefinition({
      ...module.apiTool,
      path: file,
    });
  });
  return Promise.all(toolPromises);
}
```

Update `tests/tools.test.js` so its structure assertion also requires:

```js
assert.ok(tool.annotations, "Tool should have MCP annotations");
assert.equal(tool.annotations.openWorldHint, true);
```

- [ ] **Step 4: Run discovery and metadata tests**

Run: `node --test tests/tool-quality-metadata.test.js tests/tools.test.js`

Expected: all focused tests PASS for all 52 tools.

- [ ] **Step 5: Commit discovery enrichment**

```bash
git add lib/tools.js tests/tool-quality-metadata.test.js tests/tools.test.js
git commit -m "feat: enrich discovered Webex tool definitions"
```

### Task 3: Expose Metadata Through Real MCP tools/list

**Files:**
- Modify: `tests/mcp-server.test.js`
- Modify: `mcpServer.js`

**Interfaces:**
- Produces: exported `createMcpServer(): Promise<McpServer>`.
- Consumes: discovered `tool.annotations`.
- Preserves: direct CLI startup through `node mcpServer.js`.

- [ ] **Step 1: Add a failing in-memory protocol test**

Add SDK imports to `tests/mcp-server.test.js`:

```js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../mcpServer.js";
```

Add this test and close all protocol objects in `finally`:

```js
it("returns all enhanced descriptions and annotations from tools/list", async () => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const realServer = await createMcpServer();
  const client = new Client({ name: "quality-test", version: "1.0.0" });

  try {
    await realServer.connect(serverTransport);
    await client.connect(clientTransport);
    const response = await client.listTools();
    assert.equal(response.tools.length, 52);

    const toolsByName = new Map(response.tools.map((tool) => [tool.name, tool]));
    for (const name of [
      "create_attachment_action",
      "create_message",
      "get_room_details",
      "update_room",
      "delete_room",
      "unlink_ecm_linked_folder",
    ]) {
      const tool = toolsByName.get(name);
      assert.ok(tool, name);
      assert.ok(tool.description.split(" ").length <= 55, name);
      assert.equal(tool.annotations.openWorldHint, true, name);
      assert.equal(tool.inputSchema.type, "object", name);
    }
    assert.equal(toolsByName.get("get_room_details").annotations.readOnlyHint, true);
    assert.equal(toolsByName.get("create_message").annotations.idempotentHint, false);
    assert.equal(toolsByName.get("update_room").annotations.idempotentHint, true);
    assert.equal(toolsByName.get("delete_room").annotations.destructiveHint, true);
  } finally {
    await client.close();
    await realServer.close();
  }
});
```

- [ ] **Step 2: Run the MCP test and confirm the red state**

Run: `node --test tests/mcp-server.test.js`

Expected: FAIL because `createMcpServer` is not exported.

- [ ] **Step 3: Forward annotations and make the factory import-safe**

In `mcpServer.js`:

```js
const SERVER_VERSION = "0.2.1";

export async function createMcpServer() {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  }, {
    capabilities: { tools: {} },
  });
```

Add annotations to the existing registration options without changing the callback:

```js
{
  title: definition.name.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  description: definition.description,
  inputSchema: convertJsonSchemaToZod(
    definition.parameters?.properties || {},
    definition.parameters?.required || [],
  ),
  annotations: tool.annotations,
}
```

Use `SERVER_VERSION` in `/health`, then replace unconditional startup with:

```js
const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  run().catch(console.error);
}
```

- [ ] **Step 4: Run MCP and startup smoke tests**

Run: `node --test tests/mcp-server.test.js`

Expected: all MCP integration tests PASS.

Run: `node mcpServer.js --help </dev/null`

Expected: server reaches stdio startup without an import-time duplicate server and exits when stdin closes.

- [ ] **Step 5: Commit MCP propagation**

```bash
git add mcpServer.js tests/mcp-server.test.js
git commit -m "feat: expose quality metadata through MCP"
```

### Task 4: Prepare v0.2.1 Documentation and Package Metadata

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`

**Interfaces:**
- Publishes: npm/package metadata version 0.2.1.
- Documents: descriptions and annotations only; no new runtime API.

- [ ] **Step 1: Bump package metadata without creating a tag**

Run: `npm version 0.2.1 --no-git-tag-version`

Expected: `package.json` and `package-lock.json` both report `0.2.1`.

- [ ] **Step 2: Add concise documentation**

Add this subsection near the README tool-discovery documentation:

```markdown
### Tool selection and behavior metadata

All 52 tools publish MCP annotations plus compact selection and behavior
guidance through `tools/list`. The original purpose sentence and input schema
remain unchanged; the appended guidance identifies the closest sibling tool,
whether the operation reads or changes Webex state, and how API errors and
rate limits are returned.

Annotations are descriptive hints for MCP clients, not authorization controls.
The Webex access token and organization policies remain authoritative.
```

- [ ] **Step 3: Verify version and README assertions**

Run:

```bash
node -e "const p=require('./package.json'); if(p.version!=='0.2.1') process.exit(1)"
rg -n "Tool selection and behavior metadata|descriptive hints" README.md
```

Expected: version assertion exits 0 and both README phrases are found.

- [ ] **Step 4: Commit release metadata**

```bash
git add package.json package-lock.json README.md
git commit -m "chore: prepare tool quality release"
```

### Task 5: Run Full Verification and Review

**Files:**
- Verify all changed files.

**Interfaces:**
- Consumes: complete implementation from Tasks 1-4.
- Produces: reproducible evidence that tests, coverage, security gates, package integrity, Node 18 compatibility, and protected dimensions pass.

- [ ] **Step 1: Run clean-install and repository validation**

Run:

```bash
npm ci
npm run validate
```

Expected: syntax check passes and all Node test suites pass.

- [ ] **Step 2: Run coverage and package integrity**

Run:

```bash
npm run test:coverage
npm ls --all
```

Expected: all tests pass under c8 and dependency tree exits 0.

- [ ] **Step 3: Run both security gates**

Run:

```bash
npx --yes audit-ci@7.1.0 --config ./audit-ci.jsonc
npm audit --audit-level=high --dry-run
```

Expected: `audit-ci` passes with only the scoped active allowlist entry; npm reports no high or critical gate failure.

- [ ] **Step 4: Verify Node.js 18.20.8**

Run:

```bash
docker run --rm -v "$PWD":/app -w /app node:18.20.8-bookworm \
  sh -lc "npm ci && npm run validate"
```

Expected: clean install and all tests PASS on Node 18.20.8.

- [ ] **Step 5: Inspect protected code paths and diff hygiene**

Run:

```bash
git diff origin/main -- tools
git diff --check
git status --short
git diff --stat origin/main
```

Expected: no changes under `tools/`, no whitespace errors, and only the planned quality/test/docs/release files differ.

- [ ] **Step 6: Review the complete diff against the approved spec**

Confirm:

```text
52 metadata entries
52 tools/list results
0 renamed tools
0 parameter-schema changes
0 execution-function changes
all descriptions <=55 words
all descriptions exactly 3 sentences
all annotations match the naming-class contract
special side effects are explicit
```

- [ ] **Step 7: Commit any verification-only corrections**

If verification required a correction, stage only the planned files and use a focused commit:

```bash
git add lib/tool-quality-metadata.js lib/tools.js mcpServer.js \
  tests/tool-quality-metadata.test.js tests/tools.test.js \
  tests/mcp-server.test.js package.json package-lock.json README.md
git commit -m "test: harden tool quality contracts"
```

Expected: no commit is created when the tree already matches the plan.

### Task 6: Publish the Implementation PR

**Files:**
- No additional source changes.

**Interfaces:**
- Produces: pushed feature branch and PR targeting `main`.

- [ ] **Step 1: Rebase safety check**

Run:

```bash
git fetch origin
git log --oneline --left-right origin/main...HEAD
git status --short
```

Expected: only intentional feature commits are on the right; the working tree is clean.

- [ ] **Step 2: Push the feature branch**

Run: `git push -u origin docs/tool-definition-quality-spec`

Expected: branch is created or updated on `origin`.

- [ ] **Step 3: Open a PR to main**

Use a title such as:

```text
feat: raise Webex MCP tool definition quality
```

The body must include:

```markdown
## Summary
- adds explicit MCP annotations and compact selection/behavior guidance for all 52 tools
- preserves every original purpose sentence, input schema, and execution path
- exposes the enriched definitions through the real MCP `tools/list` response
- prepares the metadata-only v0.2.1 release

## Why
Glama currently rates Tool Definition Quality C because behavior,
completeness, and usage guidance are weak. This change targets only those
dimensions and leaves purpose, parameters, and conciseness protected by tests.

## Verification
- `npm run validate`
- `npm run test:coverage`
- Node.js 18.20.8 clean-install suite
- `audit-ci` moderate gate with the existing scoped allowlist
- npm high-severity audit gate
- `npm ls --all`
- `git diff --check`

## Post-merge
Publish v0.2.1, sync Glama, and verify Tool Definition Quality A, overall A,
and no Annotation Contradiction flags.
```

- [ ] **Step 4: Verify PR state**

Run: `gh pr checks --watch`

Expected: all required checks PASS. Do not merge until the user requests it or the repository's normal review process approves it.
