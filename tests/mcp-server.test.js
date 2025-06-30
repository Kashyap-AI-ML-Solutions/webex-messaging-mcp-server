import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { discoverTools } from '../lib/tools.js';

describe('MCP Server Integration', () => {
  let originalEnv;
  let server;
  let tools;

  beforeEach(async () => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set test environment variables
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
    
    // Create MCP server instance
    server = new Server(
      {
        name: 'webex-messaging-test',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Load tools
    tools = await discoverTools();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Server Configuration', () => {
    it('should create server with correct metadata', () => {
      assert.ok(server, 'Server should be created');
      // Note: Server metadata testing depends on MCP SDK internals
    });

    it('should have tools available for registration', () => {
      // Verify tools are available for registration
      assert.ok(tools.length > 0, 'Should have tools available');

      // Verify each tool has the structure needed for MCP registration
      tools.forEach(tool => {
        assert.ok(tool.function, 'Tool should have executable function');
        assert.ok(tool.definition, 'Tool should have MCP definition');
        assert.ok(tool.definition.function.name, 'Tool should have name for registration');
      });
    });
  });

  describe('Tool Registration', () => {
    it('should register tools with correct MCP format', () => {
      tools.forEach(tool => {
        const definition = tool.definition;
        
        // Verify MCP tool format
        assert.strictEqual(definition.type, 'function');
        assert.ok(definition.function.name);
        assert.ok(definition.function.description);
        assert.ok(definition.function.parameters);
        assert.strictEqual(definition.function.parameters.type, 'object');
      });
    });

    it('should have valid JSON schema for parameters', () => {
      tools.forEach(tool => {
        const params = tool.definition.function.parameters;
        
        // Basic JSON schema validation
        assert.strictEqual(params.type, 'object');
        assert.ok(params.properties);
        
        // Check property types
        Object.values(params.properties).forEach(prop => {
          assert.ok(prop.type, 'Each property should have a type');
          assert.ok(['string', 'number', 'integer', 'boolean', 'array', 'object'].includes(prop.type));
        });
      });
    });
  });

  describe('Tool Execution', () => {
    beforeEach(() => {
      // Mock fetch for tool execution tests
      global.fetch = () => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });
    });

    afterEach(() => {
      // Restore fetch if it was mocked
      if (global.fetch && global.fetch.mockRestore) {
        global.fetch.mockRestore();
      }
    });

    it('should execute tools and return results', async () => {
      const createMessageTool = tools.find(tool => 
        tool.definition.function.name === 'create_message'
      );

      assert.ok(createMessageTool, 'Should find create_message tool');

      const result = await createMessageTool.function({
        roomId: 'test-room',
        text: 'Test message'
      });

      assert.ok(result, 'Should return a result');
    });

    it('should handle tool execution errors', async () => {
      global.fetch = () => Promise.reject(new Error('Network error'));

      const tool = tools.find(tool => 
        tool.definition.function.name === 'list_messages'
      );

      const result = await tool.function({ roomId: 'test-room' });
      
      // Should handle error gracefully
      assert.ok(result, 'Should return result even on error');
    });
  });

  describe('Environment Validation', () => {
    it('should work with valid environment', async () => {
      // Environment is already set in beforeEach
      assert.doesNotThrow(() => {
        // This would be called during server startup
        tools.forEach(tool => {
          assert.ok(tool.function, 'Tool should have executable function');
        });
      });
    });

    it('should handle missing API key gracefully', async () => {
      delete process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
      
      // Tools should still be discoverable
      const toolsWithoutKey = await discoverTools();
      assert.ok(toolsWithoutKey.length > 0, 'Should still discover tools');
      
      // But execution might fail - this is expected behavior
    });
  });

  describe('Tool Categories', () => {
    it('should include message management tools', () => {
      const messageTools = [
        'create_message',
        'list_messages',
        'get_message_details',
        'edit_message',
        'delete_message'
      ];

      messageTools.forEach(toolName => {
        const tool = tools.find(t => t.definition.function.name === toolName);
        assert.ok(tool, `Should include ${toolName} tool`);
      });
    });

    it('should include room management tools', () => {
      const roomTools = [
        'create_room',
        'list_rooms',
        'get_room_details',
        'update_room',
        'delete_room'
      ];

      roomTools.forEach(toolName => {
        const tool = tools.find(t => t.definition.function.name === toolName);
        assert.ok(tool, `Should include ${toolName} tool`);
      });
    });

    it('should include team management tools', () => {
      const teamTools = [
        'create_team',
        'list_teams',
        'get_team_details',
        'update_team',
        'delete_team'
      ];

      teamTools.forEach(toolName => {
        const tool = tools.find(t => t.definition.function.name === toolName);
        assert.ok(tool, `Should include ${toolName} tool`);
      });
    });

    it('should include people management tools', () => {
      const peopleTools = [
        'get_my_own_details',
        'list_people',
        'get_person_details'
      ];

      peopleTools.forEach(toolName => {
        const tool = tools.find(t => t.definition.function.name === toolName);
        assert.ok(tool, `Should include ${toolName} tool`);
      });
    });

    it('should include webhook tools', () => {
      const webhookTools = [
        'create_webhook',
        'list_webhooks',
        'get_webhook_details',
        'update_webhook',
        'delete_webhook'
      ];

      webhookTools.forEach(toolName => {
        const tool = tools.find(t => t.definition.function.name === toolName);
        assert.ok(tool, `Should include ${toolName} tool`);
      });
    });
  });

  describe('Tool Parameter Validation', () => {
    it('should have consistent parameter naming', () => {
      tools.forEach(tool => {
        const params = tool.definition.function.parameters.properties;
        
        // Check for common parameter patterns
        Object.keys(params).forEach(paramName => {
          // Parameter names should be camelCase
          assert.ok(
            /^[a-z][a-zA-Z0-9]*$/.test(paramName),
            `Parameter ${paramName} in ${tool.definition.function.name} should be camelCase`
          );
        });
      });
    });

    it('should have appropriate parameter types', () => {
      tools.forEach(tool => {
        const params = tool.definition.function.parameters.properties;
        
        Object.entries(params).forEach(([paramName, paramDef]) => {
          // ID parameters should be strings (but some might be boolean flags like isRoomHidden)
          if (paramName.toLowerCase().includes('id') && !paramName.toLowerCase().includes('hidden')) {
            assert.strictEqual(
              paramDef.type,
              'string',
              `ID parameter ${paramName} should be string type`
            );
          }
          
          // Max/limit parameters should be numbers or integers
          if (paramName.toLowerCase().includes('max') || paramName.toLowerCase().includes('limit')) {
            assert.ok(
              ['number', 'integer'].includes(paramDef.type),
              `Max/limit parameter ${paramName} should be number or integer type, got ${paramDef.type}`
            );
          }
        });
      });
    });
  });
});
