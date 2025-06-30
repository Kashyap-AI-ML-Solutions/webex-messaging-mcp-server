import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { discoverTools } from '../lib/tools.js';

describe('Integration Tests', () => {
  let originalEnv;
  let tools;

  beforeEach(async () => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set test environment variables
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
    
    // Load tools
    tools = await discoverTools();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('End-to-End Tool Discovery and Execution', () => {
    it('should discover and validate all tools', async () => {
      // Verify we have the expected number of tools
      assert.strictEqual(tools.length, 52, 'Should discover exactly 52 tools');
      
      // Verify each tool has the required structure
      tools.forEach((tool, index) => {
        assert.ok(tool.function, `Tool ${index} should have function`);
        assert.ok(tool.definition, `Tool ${index} should have definition`);
        assert.ok(tool.definition.function, `Tool ${index} should have function metadata`);
        assert.ok(tool.definition.function.name, `Tool ${index} should have name`);
        assert.ok(tool.definition.function.description, `Tool ${index} should have description`);
        assert.ok(tool.definition.function.parameters, `Tool ${index} should have parameters`);
      });
    });

    it('should have all expected tool categories', () => {
      const toolNames = tools.map(tool => tool.definition.function.name);
      
      // Message tools
      const messageTools = toolNames.filter(name => name.includes('message'));
      assert.ok(messageTools.length >= 5, 'Should have message tools');
      
      // Room tools
      const roomTools = toolNames.filter(name => name.includes('room'));
      assert.ok(roomTools.length >= 5, 'Should have room tools');
      
      // Team tools
      const teamTools = toolNames.filter(name => name.includes('team'));
      assert.ok(teamTools.length >= 5, 'Should have team tools');
      
      // People tools
      const peopleTools = toolNames.filter(name => name.includes('people') || name.includes('person'));
      assert.ok(peopleTools.length >= 3, 'Should have people tools');
      
      // Webhook tools
      const webhookTools = toolNames.filter(name => name.includes('webhook'));
      assert.ok(webhookTools.length >= 3, 'Should have webhook tools');
    });

    it('should execute tools without throwing errors', async () => {
      // Mock fetch to prevent actual API calls
      const originalFetch = global.fetch;
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, id: 'test-id' })
      });

      try {
        // Test a few key tools
        const testCases = [
          {
            name: 'get_my_own_details',
            params: {}
          },
          {
            name: 'list_rooms',
            params: {}
          },
          {
            name: 'list_messages',
            params: { roomId: 'test-room' }
          },
          {
            name: 'create_message',
            params: { roomId: 'test-room', text: 'test message' }
          }
        ];

        for (const testCase of testCases) {
          const tool = tools.find(t => t.definition.function.name === testCase.name);
          assert.ok(tool, `Should find ${testCase.name} tool`);
          
          // Execute tool - should not throw
          const result = await tool.function(testCase.params);
          assert.ok(result !== undefined, `${testCase.name} should return a result`);
        }
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Configuration Integration', () => {
    it('should work with different base URLs', async () => {
      process.env.WEBEX_API_BASE_URL = 'https://custom.webex.com/v2';
      
      const originalFetch = global.fetch;
      let capturedUrl;
      
      global.fetch = async (url, options) => {
        capturedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        };
      };

      try {
        const tool = tools.find(t => t.definition.function.name === 'get_my_own_details');
        await tool.function({});
        
        assert.ok(capturedUrl.startsWith('https://custom.webex.com/v2'), 
          'Should use custom base URL');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle token formatting correctly', async () => {
      // Test with Bearer prefix
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'Bearer test-token-with-prefix';
      
      const originalFetch = global.fetch;
      let capturedHeaders;
      
      global.fetch = async (url, options) => {
        capturedHeaders = options.headers;
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        };
      };

      try {
        const tool = tools.find(t => t.definition.function.name === 'get_my_own_details');
        await tool.function({});
        
        assert.strictEqual(
          capturedHeaders.Authorization,
          'Bearer test-token-with-prefix',
          'Should handle Bearer prefix correctly'
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully across all tools', async () => {
      const originalFetch = global.fetch;
      
      // Mock API error
      global.fetch = async () => ({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid token' })
      });

      try {
        // Test error handling on a few different tool types
        const testTools = [
          'get_my_own_details',
          'list_rooms',
          'create_message'
        ];

        for (const toolName of testTools) {
          const tool = tools.find(t => t.definition.function.name === toolName);
          if (!tool) continue;

          const params = toolName === 'create_message' 
            ? { roomId: 'test-room', text: 'test' }
            : toolName === 'list_messages'
            ? { roomId: 'test-room' }
            : {};

          // Should not throw, should return error information
          const result = await tool.function(params);
          assert.ok(result !== undefined, `${toolName} should return result on error`);
        }
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle network errors gracefully', async () => {
      const originalFetch = global.fetch;
      
      // Mock network error
      global.fetch = async () => {
        throw new Error('Network connection failed');
      };

      try {
        const tool = tools.find(t => t.definition.function.name === 'get_my_own_details');
        const result = await tool.function({});
        
        // Should handle network error gracefully
        assert.ok(result !== undefined, 'Should return result even on network error');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Performance and Scalability', () => {
    it('should load tools efficiently', async () => {
      const startTime = Date.now();
      const newTools = await discoverTools();
      const loadTime = Date.now() - startTime;
      
      assert.ok(loadTime < 5000, 'Tool discovery should complete within 5 seconds');
      assert.strictEqual(newTools.length, tools.length, 'Should consistently load same number of tools');
    });

    it('should handle concurrent tool execution', async () => {
      const originalFetch = global.fetch;
      let callCount = 0;
      
      global.fetch = async () => {
        callCount++;
        // Simulate some delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, callNumber: callCount })
        };
      };

      try {
        const tool = tools.find(t => t.definition.function.name === 'get_my_own_details');
        
        // Execute multiple calls concurrently
        const promises = Array(5).fill().map(() => tool.function({}));
        const results = await Promise.all(promises);
        
        assert.strictEqual(results.length, 5, 'Should handle concurrent execution');
        assert.strictEqual(callCount, 5, 'Should make all API calls');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
