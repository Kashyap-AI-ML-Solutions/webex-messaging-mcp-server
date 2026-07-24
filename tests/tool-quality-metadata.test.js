import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toolPaths } from "../tools/paths.js";
import { discoverTools } from "../lib/tools.js";
import {
  enhanceToolDefinition,
  toolQualityMetadata,
} from "../lib/tool-quality-metadata.js";

async function loadRawTools() {
  return Promise.all(
    toolPaths.map(async (file) => {
      const module = await import(`../tools/${file}`);
      return { ...module.apiTool, path: file };
    }),
  );
}

const expectedAnnotationProfiles = {
  read: {
    readOnlyHint: true,
    openWorldHint: true,
  },
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

function countWords(value) {
  return value.trim().split(/\s+/).length;
}

function sentenceCount(value) {
  return value
    .split(/[.!?](?:\s|$)/)
    .filter((part) => part.trim())
    .length;
}

describe("Tool Quality Metadata", () => {
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
        assert.deepEqual(
          annotations,
          expectedAnnotationProfiles.read,
          name,
        );
      } else if (/^create_/.test(name)) {
        assert.deepEqual(
          annotations,
          expectedAnnotationProfiles.create,
          name,
        );
      } else {
        assert.match(name, /^(edit|update|delete|unlink)_/);
        assert.deepEqual(
          annotations,
          expectedAnnotationProfiles.mutate,
          name,
        );
      }

      for (const value of Object.values(annotations)) {
        assert.equal(typeof value, "boolean", name);
      }
    }
  });

  it("rejects tools without quality metadata", () => {
    const unknownTool = {
      definition: {
        type: "function",
        function: {
          name: "unknown_tool",
          description: "Unknown tool.",
          parameters: { type: "object", properties: {} },
        },
      },
      function() {},
    };

    assert.throws(
      () => enhanceToolDefinition(unknownTool),
      /Missing tool quality metadata for unknown_tool/,
    );
  });

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
      const metadataEntry = toolQualityMetadata[name];

      assert.ok(
        countWords(description) <= 55,
        `${name}: ${countWords(description)} words`,
      );
      assert.equal(sentenceCount(description), 3, name);
      assert.ok(description.includes(metadataEntry.usageGuidance), name);
      assert.ok(description.endsWith(metadataEntry.behaviorSummary), name);
      assert.match(metadataEntry.usageGuidance, /^Use (when|for|only|to)\b/, name);
      assert.match(metadataEntry.usageGuidance, /\b(use|instead)\b/, name);
      assert.match(metadataEntry.behaviorSummary, /\berror result\b/, name);
      assert.match(
        metadataEntry.behaviorSummary,
        /\bwithout automatically retrying rate limits\b/,
        name,
      );

      const siblings = [
        ...metadataEntry.usageGuidance.matchAll(/\b[a-z]+_[a-z0-9_]+\b/g),
      ]
        .map((match) => match[0])
        .filter((candidate) => candidate !== name);

      assert.ok(
        siblings.some((candidate) => names.has(candidate)),
        `${name} must name an existing sibling`,
      );
      assert.doesNotMatch(
        description,
        /\b(?:readOnlyHint|destructiveHint|idempotentHint|openWorldHint)\b/,
        name,
      );
    }
  });

  it("keeps prose and annotations consistent", async () => {
    const enhancedTools = await discoverTools();

    for (const tool of enhancedTools) {
      const { name, description } = tool.definition.function;

      if (/^(get|list)_/.test(name)) {
        assert.match(description, /\bRead-only\b/, name);
        assert.equal(tool.annotations.readOnlyHint, true, name);
      }

      if (/^create_/.test(name)) {
        assert.match(description, /\bnon-idempotent\b/, name);
        assert.doesNotMatch(description, /\bdestructive\b/i, name);
      }

      if (/^(edit|update)_/.test(name)) {
        assert.match(description, /\bidempotent for identical input\b/, name);
      }

      if (/^delete_/.test(name)) {
        assert.match(description, /\bPermanently removes\b/, name);
      }
    }

    const descriptions = Object.fromEntries(
      enhancedTools.map((tool) => [
        tool.definition.function.name,
        tool.definition.function.description,
      ]),
    );

    assert.match(
      descriptions.create_attachment_action,
      /trigger downstream application behavior/,
    );
    assert.match(descriptions.create_message, /\bsends immediately\b/);
    assert.match(
      descriptions.create_webhook,
      /future requests to the configured target/,
    );
    assert.match(
      descriptions.unlink_ecm_linked_folder,
      /preserves the external folder/,
    );
    assert.match(
      descriptions.delete_person,
      /Permanently removes the person from the organization/,
    );
    assert.match(descriptions.delete_room, /Permanently removes the room/);
    assert.match(descriptions.delete_team, /Permanently removes the team/);
  });
});
