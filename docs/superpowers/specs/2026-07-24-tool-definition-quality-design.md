# Webex MCP Tool Definition Quality Design

**Status:** Proposed for maintainer review  
**Date:** 2026-07-24  
**Target release:** v0.2.1  
**Repository:** `Kashyap-AI-ML-Solutions/webex-messaging-mcp-server`

## 1. Objective

Raise Glama's Tool Definition Quality from C to A and the server's overall
quality tier from B to A without changing:

- tool purpose;
- tool names or count;
- input parameter names, schemas, defaults, or descriptions;
- execution behavior or Webex API requests; or
- the concise, front-loaded structure of the existing descriptions.

The work will target only the three weak dimensions identified by Glama:

1. Behavioral Transparency
2. Usage Guidelines
3. Contextual Completeness

The implementation must improve every registered tool, including the
lowest-scoring tool, because Glama gives the server's minimum per-tool score a
40% weight in the server-level Tool Definition Quality score.

## 2. Evidence and Current Baseline

### 2.1 Glama scoring baseline

The Glama score page currently reports Tool Definition Quality C with an
average of 2.9/5. The page header says 51 of 51 tools are scored, while the
same page renders 52 per-tool score cards and the repository registers 52
tools. The implementation will use the repository's `tools/list` output as
the source of truth and cover all 52 tools.

Current rendered dimension distribution:

| Dimension | Average | Distribution |
|---|---:|---|
| Behavioral Transparency | 2.00 | 52 tools at 2 |
| Usage Guidelines | 2.02 | 51 tools at 2; 1 tool at 3 |
| Contextual Completeness | 2.10 | 47 tools at 2; 5 tools at 3 |
| Purpose Clarity | 4.00 | 50 tools at 4; 1 at 3; 1 at 5 |
| Parameter Semantics | 3.02 | 51 tools at 3; 1 at 4 |
| Conciseness & Structure | 4.98 | 51 tools at 5; 1 at 4 |

The weakest per-tool score is `create_attachment_action` at 2.7. Forty-five
rendered tool cards are tier C and seven are tier B.

### 2.2 Why the current descriptions score poorly

The current descriptions are usually one short purpose sentence, for example:

> Create a room in Webex.

That sentence is excellent for conciseness and adequate for purpose, but it
does not tell an agent:

- when to choose the tool instead of a sibling;
- when not to use it;
- whether it reads or changes remote state;
- whether repeated calls can create duplicate effects;
- whether an operation is destructive or reversible;
- what kind of result is returned;
- how Webex authorization and rate-limit failures appear; or
- whether the server retries failed requests.

No tool annotations are currently passed to `McpServer.registerTool`, so Glama
must infer all behavior from the one-sentence description.

### 2.3 Scoring math

Glama weights the six dimensions as follows:

| Dimension | Weight |
|---|---:|
| Purpose Clarity | 25% |
| Usage Guidelines | 20% |
| Behavioral Transparency | 20% |
| Parameter Semantics | 15% |
| Conciseness & Structure | 10% |
| Contextual Completeness | 10% |

The server-level Tool Definition Quality score is:

```text
0.6 × mean(per-tool TDQS) + 0.4 × minimum(per-tool TDQS)
```

The overall server quality score is:

```text
0.7 × Tool Definition Quality + 0.3 × Server Coherence
```

For the weakest tool, preserving Purpose 3 and Parameters 3, allowing
Conciseness to remain at least 4, and targeting Usage 5, Behavior 4, and
Completeness 3 produces:

```text
3×0.25 + 5×0.20 + 4×0.20 + 3×0.15 + 4×0.10 + 3×0.10 = 3.70
```

That clears Glama's A threshold of 3.5 with a small buffer. Typical tools that
retain Purpose 4 should score about 3.95 under the same assumptions.

## 3. Scope

### 3.1 In scope

- Add MCP behavior annotations to every registered tool.
- Add compact usage guidance to every tool description.
- Add compact behavioral and result/error guidance to every description.
- Ensure the enhanced descriptions and annotations appear in `tools/list`.
- Add tests that make metadata coverage and the protected dimensions
  enforceable.
- Publish the metadata-only change as v0.2.1.
- Trigger a Glama sync and verify Tool Definition Quality A and overall A.

### 3.2 Explicit non-goals

- Do not rename, add, remove, merge, or hide tools.
- Do not reduce the 52-tool surface even though Glama scores Tool Count 2/5.
- Do not rewrite the existing first purpose sentence.
- Do not change input schemas or parameter descriptions.
- Do not optimize Purpose, Parameters, or Conciseness scores.
- Do not change Webex request URLs, methods, bodies, headers, or response
  handling.
- Do not add output schemas in this iteration.
- Do not change authentication, retry, pagination, or error-handling behavior.
- Do not claim annotations are security controls; they are descriptive hints.

Output schemas are deliberately deferred. The MCP server currently returns
serialized text content rather than `structuredContent`. Adding output schemas
would require a separate response-contract design and is not needed to reach
tier A.

## 4. Approaches Considered

### 4.1 Recommended: structured annotations plus compact guidance

Add an explicit metadata catalog for all 52 tools. Each entry supplies:

- MCP behavior annotations;
- a one-sentence usage rule with a named alternative; and
- a one-sentence behavior/result rule.

A shared enhancer combines those fields with the existing purpose sentence.

Advantages:

- directly addresses all three weak dimensions;
- preserves the existing purpose and parameter schemas;
- uses the MCP standard instead of encoding every trait in prose;
- keeps descriptions dense and consistent;
- provides one auditable place to detect missing tools and contradictions; and
- changes every definition hash so Glama re-scores every tool.

Trade-off:

- introduces a centralized metadata catalog that must be kept in sync when
  tools are added or renamed.

### 4.2 Description-only edits in 52 implementation files

Append usage and behavior prose directly to every tool module.

Advantages:

- simple runtime path;
- each tool's documentation stays next to its implementation.

Disadvantages:

- still omits machine-readable MCP annotations;
- repeats the same safety traits in many files;
- is more likely to drift or contradict sibling descriptions; and
- requires touching 52 implementation files despite no execution change.

### 4.3 Full annotations plus output schemas

Add annotations, enhanced descriptions, output schemas, and structured output
for all tools.

Advantages:

- strongest possible completeness signal;
- machine-readable result contracts.

Disadvantages:

- materially expands scope;
- changes the MCP response contract;
- requires documenting many Webex response variants; and
- creates runtime regression risk unrelated to the immediate score gap.

### 4.4 Decision

Use approach 4.1. It is the smallest change that directly targets the three
weak dimensions while respecting the protected dimensions.

## 5. Architecture

### 5.1 Central metadata catalog

Add `lib/tool-quality-metadata.js` with an explicit entry for every registered
tool:

```js
export const toolQualityMetadata = {
  create_room: {
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    },
    usageGuidance:
      'Use for a new space; to change an existing room, use update_room instead.',
    behaviorSummary:
      'Requires Webex write access, creates immediately, and returns the room record or an API error without retrying rate limits.'
  }
};
```

The catalog must use explicit tool names rather than infer all behavior from a
name prefix. Explicit entries make special cases such as
`create_attachment_action`, `unlink_ecm_linked_folder`, and direct messages
reviewable.

### 5.2 Definition enhancer

The same module will export an enhancer that:

1. accepts a discovered tool;
2. looks up metadata by the tool's exact name;
3. preserves the original description as an exact prefix;
4. appends `usageGuidance` and `behaviorSummary`;
5. attaches the MCP annotations; and
6. returns a cloned tool without modifying the parameter schema.

Missing or orphaned metadata must be a test failure. Runtime startup should
also reject a discovered tool with no metadata instead of silently exposing a
low-quality definition.

### 5.3 Discovery integration

`lib/tools.js` will apply the enhancer during discovery. This ensures the same
enhanced definition is visible to:

- the MCP `tools/list` response;
- the CLI `tools` command;
- tests; and
- any future consumer of `discoverTools()`.

The individual tool modules retain their current purpose sentence and
parameter schema unchanged.

### 5.4 MCP registration

`mcpServer.js` will pass the enhanced metadata into
`McpServer.registerTool`:

```js
server.registerTool(definition.name, {
  title,
  description: definition.description,
  inputSchema,
  annotations: tool.annotations
}, callback);
```

The callback and all execution logic remain unchanged.

## 6. Annotation Policy

All tools interact with the remote Webex service and may receive dynamic,
user-generated content, so every tool uses `openWorldHint: true`.

| Tool class | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|---|---:|---:|---:|---:|
| `get_*`, `list_*` | true | omitted | omitted | true |
| `create_*` | false | false | false | true |
| `edit_*`, `update_*` | false | true | true | true |
| `delete_*`, `unlink_*` | false | true | true | true |

Notes:

- `destructiveHint` and `idempotentHint` are omitted for read-only tools
  because the MCP specification says those fields are meaningful only when
  `readOnlyHint` is false.
- Creates are additive but non-idempotent because repeating a successful call
  can create another message, room, person, team, membership, webhook, or
  action.
- Updates are idempotent at the state level: repeating the same update produces
  no additional state change.
- Deletes and unlink operations are idempotent at the effect level: after the
  first success, repeating the request cannot remove the resource or link a
  second time, even if Webex returns not-found on the repeated request.
- `create_attachment_action` is additive and non-idempotent but must disclose
  that submitting an action can trigger downstream card or application
  behavior.

Annotations must never contradict the prose. A contradiction causes Glama to
set Behavioral Transparency to 1 and publish an Annotation Contradiction flag.

## 7. Description Contract

Every enhanced description will contain exactly three compact parts:

1. **Purpose:** the existing first sentence, unchanged.
2. **Usage:** when to use it, when not to use it, and a named sibling
   alternative.
3. **Behavior/completeness:** read/write/destructive effect, authorization
   prerequisite, result type, error-result behavior, and rate-limit retry
   behavior.

### 7.1 Protected first sentence

The implementation must preserve every current description byte-for-byte as
the first sentence. This makes Purpose Clarity a non-regression constraint
rather than a scoring target.

### 7.2 Usage sentence

The usage sentence must:

- begin with an explicit selection cue such as `Use when` or `Use for`;
- include an exclusion such as `do not use` or `instead`; and
- name the sibling tool to use for the excluded case.

This is designed to meet Glama's Usage Guidelines 5 anchor: explicit
when-to-use, when-not-to-use, and named alternative.

### 7.3 Behavior/completeness sentence

The final sentence must state, as applicable:

- read-only, additive, state-changing, or destructive behavior;
- whether the effect is immediate and/or reversible;
- the required level of Webex access without inventing OAuth scope names;
- whether repeated calls can create an additional effect;
- whether the result is a record, collection response, or confirmation;
- that rejected Webex requests are returned as error results; and
- that the server does not automatically retry Webex rate limits.

Descriptions must say `returns an error result`, not `throws`, because the tool
implementations catch Webex failures and return `{ error: ... }` objects.

### 7.4 Conciseness guard

- Keep each enhanced description at three sentences.
- Keep each description at or below 55 words.
- Do not repeat parameter names, types, defaults, or constraints already
  present in the input schema.
- Do not repeat annotation field names in prose.
- Put the existing purpose first, usage second, and behavioral detail last.
- Prefer one named alternative over a list of every sibling tool.

The acceptance target is Conciseness at least 4 for every tool and an average
of at least 4.8.

### 7.5 Representative examples

#### Create

```text
Create a room in Webex. Use for a new space; to change an existing room, use update_room instead. Requires Webex write access, creates immediately, and returns the room record or an API error without retrying rate limits.
```

#### Read

```text
Get details of a room by ID. Use when the room ID is known; to discover accessible rooms, use list_rooms instead. Read-only; requires Webex access and returns the room record or an API error without retrying rate limits.
```

#### List

```text
List messages in a Webex room. Use for a known room; for a 1:1 conversation identified by person, use list_direct_messages instead. Read-only; requires Webex access and returns the message collection response or an API error without retrying rate limits.
```

#### Destructive

```text
Delete a room in Webex by its ID. Use only for permanent removal; to retain the room and change its settings, use update_room instead. Destructive and irreversible; requires Webex write access and returns confirmation or an API error without retrying rate limits.
```

#### Special side effect

```text
Create a new attachment action in Webex. Use to submit an action for an existing message attachment; to send or change the message itself, use create_message or edit_message instead. Requires Webex write access, can trigger downstream application behavior, is non-idempotent, and returns the action record or an API error.
```

The final `create_attachment_action` wording may name two alternatives because
it is the lowest-scoring and most ambiguous tool. All other descriptions
should prefer one alternative.

## 8. Tool Usage Routing Matrix

This matrix defines the selection distinction each metadata entry must encode.
It does not replace the existing purpose sentence or parameter schema.

### 8.1 Create tools

| Tool | Use when | Do not use when / alternative |
|---|---|---|
| `create_attachment_action` | submitting a user's action from an existing message attachment | sending or changing the message; use `create_message` or `edit_message` |
| `create_ecm_folder` | creating a new ECM folder link/configuration for a room | changing or removing an existing link; use `update_ecm_linked_folder` or `unlink_ecm_linked_folder` |
| `create_membership` | adding an existing person to a Webex room | adding someone to a team; use `create_team_membership` |
| `create_message` | sending a new room message, direct message, or reply | changing an existing message; use `edit_message` |
| `create_person` | provisioning a new person in the Webex organization | granting an existing person room access; use `create_membership` |
| `create_room` | creating a new Webex space | changing an existing space; use `update_room` |
| `create_room_tab` | adding a new web tab to an existing room | changing an existing tab; use `update_room_tab` |
| `create_team` | creating a new team container | creating a conversation space; use `create_room` |
| `create_team_membership` | adding an existing person to a team | adding someone to one room; use `create_membership` |
| `create_webhook` | registering a new Webex event subscription | changing an existing subscription; use `update_webhook` |

### 8.2 Delete and unlink tools

| Tool | Use when | Do not use when / alternative |
|---|---|---|
| `delete_membership` | permanently removing a person's room membership | changing moderator state; use `update_membership` |
| `delete_message` | permanently removing an existing message | correcting its content; use `edit_message` |
| `delete_person` | deprovisioning a person from the Webex organization | removing access to only one room; use `delete_membership` |
| `delete_room` | permanently removing a Webex room | changing room metadata or settings; use `update_room` |
| `delete_room_tab` | permanently removing a room tab | changing its name or URL; use `update_room_tab` |
| `delete_team` | permanently removing a team | changing team metadata; use `update_team` |
| `delete_team_membership` | permanently removing a person from a team | changing team moderator state; use `update_team_membership` |
| `delete_webhook` | stopping and removing a webhook subscription | changing its target or filter; use `update_webhook` |
| `unlink_ecm_linked_folder` | removing a room's ECM link while preserving the external folder | changing the existing link; use `update_ecm_linked_folder` |

### 8.3 Update and edit tools

| Tool | Use when | Do not use when / alternative |
|---|---|---|
| `edit_message` | changing the content of an existing message | sending a new message; use `create_message` |
| `update_ecm_linked_folder` | changing an existing ECM folder link | creating or removing the link; use `create_ecm_folder` or `unlink_ecm_linked_folder` |
| `update_membership` | changing moderator state for an existing room membership | adding or removing the member; use `create_membership` or `delete_membership` |
| `update_person` | changing an existing person's Webex profile | provisioning a new person; use `create_person` |
| `update_room` | changing an existing room's metadata or settings | creating a new room; use `create_room` |
| `update_room_tab` | changing an existing room tab | adding a new tab; use `create_room_tab` |
| `update_team` | changing an existing team's metadata | creating a new team; use `create_team` |
| `update_team_membership` | changing moderator state for an existing team membership | adding or removing the member; use `create_team_membership` or `delete_team_membership` |
| `update_webhook` | changing an existing webhook's configuration | registering or removing a subscription; use `create_webhook` or `delete_webhook` |

### 8.4 Get tools

| Tool | Use when | Do not use when / alternative |
|---|---|---|
| `get_attachment_action_details` | the attachment action ID is already known | submitting a new action; use `create_attachment_action` |
| `get_ecm_folder_details` | the ECM folder ID is already known | discovering the folder linked to a room; use `list_ecm_folder` |
| `get_event_details` | the event ID is already known | searching organization events; use `list_events` |
| `get_membership_details` | the room membership ID is already known | discovering room members; use `list_memberships` |
| `get_message_details` | the message ID is already known | browsing a room conversation; use `list_messages` |
| `get_my_own_details` | retrieving the authenticated Webex user's profile | retrieving another person; use `get_person_details` |
| `get_person_details` | another person's ID is already known | searching the organization directory; use `list_people` |
| `get_room_details` | the room ID is already known | discovering accessible rooms; use `list_rooms` |
| `get_room_meeting_details` | retrieving meeting information associated with a known room | retrieving room metadata; use `get_room_details` |
| `get_room_tab_details` | the room tab ID is already known | discovering tabs in a room; use `list_room_tabs` |
| `get_team_details` | the team ID is already known | discovering accessible teams; use `list_teams` |
| `get_team_membership_details` | the team membership ID is already known | discovering team members; use `list_team_memberships` |
| `get_webhook_details` | the webhook ID is already known | discovering subscriptions; use `list_webhooks` |

### 8.5 List tools

| Tool | Use when | Do not use when / alternative |
|---|---|---|
| `list_direct_messages` | retrieving a 1:1 conversation identified by person | retrieving messages from a known room; use `list_messages` |
| `list_ecm_folder` | discovering the ECM folder linked to a known room | retrieving a known folder by ID; use `get_ecm_folder_details` |
| `list_events` | searching or filtering organization event history | retrieving a known event by ID; use `get_event_details` |
| `list_memberships` | discovering or filtering members of a room | retrieving a known membership by ID; use `get_membership_details` |
| `list_messages` | browsing messages from a known Webex room | retrieving a 1:1 conversation by person; use `list_direct_messages` |
| `list_people` | searching the organization directory | retrieving a known person by ID; use `get_person_details` |
| `list_room_tabs` | discovering tabs in a known room | retrieving a known tab by ID; use `get_room_tab_details` |
| `list_rooms` | discovering or filtering rooms accessible to the authenticated user | retrieving one known room; use `get_room_details` |
| `list_team_memberships` | discovering members of a known team | retrieving a known membership by ID; use `get_team_membership_details` |
| `list_teams` | discovering teams accessible to the authenticated user | retrieving one known team; use `get_team_details` |
| `list_webhooks` | discovering organization webhook subscriptions | retrieving one known webhook; use `get_webhook_details` |

## 9. Behavior and Result Rules

The final behavior sentence will be resource-specific but follow these factual
contracts:

| Tool class | Behavior language |
|---|---|
| Get | read-only; requires Webex access; returns one Webex record or an error result; no automatic rate-limit retry |
| List | read-only; requires Webex access; returns the Webex collection response or an error result; no automatic rate-limit retry |
| Create | additive write; takes effect immediately; non-idempotent; returns the created record or an error result; no automatic rate-limit retry |
| Edit/update | changes existing remote state; idempotent for identical input; returns the updated record or an error result; no automatic rate-limit retry |
| Delete | destructive and not reversible through this server; returns confirmation or an error result; no automatic rate-limit retry |
| Unlink | removes only the Webex link and preserves the external folder; returns confirmation or an error result; no automatic rate-limit retry |

Tool-specific exceptions must be explicit:

- `create_attachment_action` can trigger downstream application behavior.
- `create_message` sends the message immediately.
- `create_webhook` causes Webex to make future requests to the configured
  external target.
- `delete_person`, `delete_room`, and `delete_team` are high-impact destructive
  operations and must say what resource is permanently removed.
- `unlink_ecm_linked_folder` removes the association, not the external folder.
- `get_*` and `list_*` tools must not imply local caching or mutation.

## 10. Testing Strategy

Implementation will follow test-driven development.

### 10.1 Metadata coverage tests

- Discover exactly the repository's registered tool set.
- Assert the metadata catalog keys exactly equal the discovered tool names.
- Fail on missing metadata.
- Fail on orphaned metadata.
- Assert all annotation values are booleans when present.
- Assert read-only tools omit mutation-only hints.
- Assert every mutation tool declares all four applicable hints.

### 10.2 Protected-dimension tests

- Snapshot the 52 original purpose sentences and assert each enhanced
  description begins with its exact original sentence.
- Deep-compare every input parameter schema before and after enhancement.
- Assert tool names and count are unchanged.
- Assert every enhanced description is at most 55 words.
- Assert every enhanced description has the purpose, usage, and behavior
  sections in that order.
- Assert each usage section names at least one existing sibling tool.
- Assert descriptions do not contain annotation field names or restate full
  parameter lists.

### 10.3 Annotation contradiction tests

- `get_*` and `list_*` descriptions must say read-only and use
  `readOnlyHint: true`.
- Create descriptions must not say idempotent.
- Update/edit descriptions must not say additive-only.
- Delete descriptions must say destructive or permanent.
- `unlink_ecm_linked_folder` must say the external folder is preserved.
- Every description must agree with its `openWorldHint`.

### 10.4 MCP integration tests

Use an in-memory MCP client/server transport to call `tools/list` and assert:

- all 52 tools are present;
- enhanced descriptions are returned;
- annotations are present;
- input schemas are unchanged; and
- representative create, read, update, delete, and special-case tools expose
  the expected metadata.

### 10.5 Regression verification

Run:

- `npm ci`
- `npm run validate`
- `npm run test:coverage`
- Node.js 18.20.8 compatibility suite
- `npx --yes audit-ci@7.1.0 --config ./audit-ci.jsonc`
- `npm audit --audit-level=high --dry-run`
- `npm ls --all`
- `git diff --check`

The existing two permitted moderate transitive advisories are not part of this
metadata-only change.

## 11. Acceptance Criteria

### 11.1 Repository acceptance

- Every registered tool has explicit quality metadata.
- `tools/list` returns the enhanced descriptions and MCP annotations.
- The registered tool count remains 52.
- All original purpose sentences remain exact prefixes.
- All input schemas remain deeply equal to the pre-change schemas.
- No execution function changes.
- All local and GitHub CI checks pass.

### 11.2 Glama acceptance

After merge, v0.2.1 publication, and Glama sync:

- Tool Definition Quality is A (at least 3.5).
- Overall server quality is A (at least 3.5).
- Minimum per-tool TDQS is at least 3.5.
- Behavioral Transparency has no score below 3 and targets 4+.
- Usage Guidelines has no score below 3 and targets 5.
- Contextual Completeness has no score below 3 and targets 3+.
- Purpose Clarity average does not fall below 4.0.
- Parameter Semantics average does not fall below 3.0.
- Conciseness average is at least 4.8 and no tool is below 4.
- No tool has an Annotation Contradiction flag.
- Maintenance remains A.

Because Glama's per-dimension evaluation uses an LLM, exact scores cannot be
guaranteed solely by local tests. If the first rescore leaves any tool below
3.5, only that tool's usage or behavior sentences will be adjusted. Purpose
sentences and parameter schemas remain frozen during any score follow-up.

## 12. Rollout

1. Implement the metadata catalog, enhancer, and registration propagation on
   an isolated feature branch.
2. Add red/green tests for metadata coverage and `tools/list`.
3. Run the full local verification matrix.
4. Open a PR to `main` with the before/after definition examples and score
   projection.
5. Wait for all required CI checks.
6. Merge without changing branch-protection configuration.
7. Publish v0.2.1 and verify the Docker and GitHub Release workflows.
8. Trigger Glama `Sync Server`.
9. Wait for all definition hashes to be rescored.
10. Record the final server and per-tool scores in the PR or release notes.

## 13. Risks and Mitigations

### Risk: descriptions become verbose

Mitigation: three-sentence and 55-word hard limits, density checks, and a
Conciseness non-regression acceptance threshold.

### Risk: annotations contradict real behavior

Mitigation: explicit per-tool catalog, family tests, implementation review
against HTTP methods, and contradiction tests.

### Risk: a central catalog drifts when tools change

Mitigation: exact key-set equality between discovered tools and metadata makes
drift a test and startup failure.

### Risk: Glama scores only the average

Mitigation: cover every tool and explicitly target the current minimum,
`create_attachment_action`. The acceptance criterion uses minimum TDQS, not
only the mean.

### Risk: Glama continues to show 51 tools

Mitigation: verify the MCP `tools/list` response contains 52 tools and sync
Glama after v0.2.1. Treat the Glama header mismatch as an indexing issue if all
52 definitions are exposed and individually visible.

### Risk: metadata changes runtime behavior

Mitigation: do not change callbacks, Webex requests, input schemas, response
serialization, or error handling. Tests compare protected structures and run
the complete execution suite.

## 14. References

- [Current Glama score](https://glama.ai/mcp/servers/Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/score)
- [Glama TDQS framework](https://github.com/glama-ai/tool-definition-quality-score)
- [Glama TDQS overview](https://glama.ai/blog/2026-04-03-tool-definition-quality-score-tdqs)
- [MCP tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP tool annotations guidance](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)

