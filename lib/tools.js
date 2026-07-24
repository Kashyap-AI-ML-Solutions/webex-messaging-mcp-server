import { toolPaths } from "../tools/paths.js";
import { enhanceToolDefinition } from "./tool-quality-metadata.js";

/**
 * Discovers and loads available tools from the tools directory
 * @returns {Promise<Array>} Array of tool objects
 */
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
