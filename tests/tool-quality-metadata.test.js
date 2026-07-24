import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toolPaths } from "../tools/paths.js";
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
});
