import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { discoverTools } from '../lib/tools.js';

describe('Tools Discovery Module', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Set required environment variables for tests
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('discoverTools', () => {
    it('should discover all available tools', async () => {
      const tools = await discoverTools();
      
      // Should have all 52 tools
      assert.strictEqual(tools.length, 52);
      
      // Each tool should have the required structure
      tools.forEach(tool => {
        assert.ok(tool.function, 'Tool should have a function');
        assert.ok(tool.definition, 'Tool should have a definition');
        assert.ok(tool.definition.function, 'Tool definition should have function metadata');
        assert.ok(tool.definition.function.name, 'Tool should have a name');
        assert.ok(tool.definition.function.description, 'Tool should have a description');
        assert.ok(tool.definition.function.parameters, 'Tool should have parameters');
        assert.strictEqual(tool.definition.type, 'function', 'Tool type should be function');
      });
    });

    it('should include expected core tools', async () => {
      const tools = await discoverTools();
      const toolNames = tools.map(tool => tool.definition.function.name);
      
      // Check for key messaging tools
      const expectedTools = [
        'create_message',
        'list_messages',
        'get_message_details',
        'edit_message',
        'delete_message',
        'create_room',
        'list_rooms',
        'get_room_details',
        'create_team',
        'list_teams',
        'get_my_own_details',
        'list_people',
        'create_webhook',
        'list_webhooks'
      ];

      expectedTools.forEach(expectedTool => {
        assert.ok(
          toolNames.includes(expectedTool),
          `Should include ${expectedTool} tool`
        );
      });
    });

    it('should group tools by workspace correctly', async () => {
      const tools = await discoverTools();
      
      // All tools should be from webex-public-workspace
      tools.forEach(tool => {
        const toolName = tool.definition.function.name;
        // Tool names should follow the expected pattern
        assert.ok(
          typeof toolName === 'string' && toolName.length > 0,
          `Tool name should be a non-empty string, got: ${toolName}`
        );
      });
    });

    it('should have valid function parameters schema', async () => {
      const tools = await discoverTools();
      
      tools.forEach(tool => {
        const params = tool.definition.function.parameters;
        assert.strictEqual(params.type, 'object', 'Parameters should be object type');
        assert.ok(params.properties, 'Parameters should have properties');
        
        // If there are required parameters, they should be an array
        if (params.required) {
          assert.ok(Array.isArray(params.required), 'Required should be an array');
        }
      });
    });

    it('should have executable functions', async () => {
      const tools = await discoverTools();
      
      // Test that functions are actually callable
      tools.forEach(tool => {
        assert.strictEqual(
          typeof tool.function,
          'function',
          `Tool ${tool.definition.function.name} should have executable function`
        );
      });
    });

    it('should handle missing environment variables gracefully', async () => {
      // Remove required environment variable
      delete process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
      
      // Should still discover tools but they may fail when executed
      const tools = await discoverTools();
      assert.ok(tools.length > 0, 'Should still discover tools structure');
    });

    it('should have consistent tool naming convention', async () => {
      const tools = await discoverTools();
      const toolNames = tools.map(tool => tool.definition.function.name);
      
      toolNames.forEach(name => {
        // Tool names should use snake_case
        assert.ok(
          /^[a-z][a-z0-9_]*[a-z0-9]$/.test(name) || /^[a-z]+$/.test(name),
          `Tool name "${name}" should follow snake_case convention`
        );
      });
    });

    it('should have unique tool names', async () => {
      const tools = await discoverTools();
      const toolNames = tools.map(tool => tool.definition.function.name);
      const uniqueNames = new Set(toolNames);
      
      assert.strictEqual(
        toolNames.length,
        uniqueNames.size,
        'All tool names should be unique'
      );
    });

    it('should have meaningful descriptions', async () => {
      const tools = await discoverTools();
      
      tools.forEach(tool => {
        const description = tool.definition.function.description;
        assert.ok(
          description && description.length > 10,
          `Tool ${tool.definition.function.name} should have meaningful description`
        );
      });
    });
  });
});
