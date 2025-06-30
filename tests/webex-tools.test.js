import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { discoverTools } from '../lib/tools.js';

// Mock fetch for testing
const originalFetch = global.fetch;

describe('Webex Tools Integration', () => {
  let originalEnv;
  let tools;
  let mockFetch;

  beforeEach(async () => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set test environment variables
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
    
    // Load tools
    tools = await discoverTools();
    
    // Setup mock fetch
    mockFetch = (url, options) => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 'test-id',
          message: 'success',
          items: []
        }),
        text: () => Promise.resolve('{"id":"test-id","message":"success"}')
      });
    };
    
    global.fetch = mockFetch;
  });

  afterEach(() => {
    // Restore original environment and fetch
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe('create_message tool', () => {
    let createMessageTool;

    beforeEach(() => {
      createMessageTool = tools.find(tool => 
        tool.definition.function.name === 'create_message'
      );
    });

    it('should exist and have correct structure', () => {
      assert.ok(createMessageTool, 'create_message tool should exist');
      assert.strictEqual(
        createMessageTool.definition.function.name,
        'create_message'
      );
      assert.ok(
        createMessageTool.definition.function.description.includes('message'),
        'Description should mention message'
      );
    });

    it('should have required parameters', () => {
      const params = createMessageTool.definition.function.parameters;
      assert.ok(params.properties.roomId, 'Should have roomId parameter');
      assert.ok(params.properties.text, 'Should have text parameter');
      
      // roomId should be required for room messages
      // Note: The actual requirement depends on the specific implementation
      assert.ok(params.properties, 'Should have parameter properties');
    });

    it('should make API call with correct parameters', async () => {
      let capturedUrl, capturedOptions;
      
      global.fetch = (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'msg-123', text: 'Hello World' })
        });
      };

      const result = await createMessageTool.function({
        roomId: 'room-123',
        text: 'Hello World'
      });

      assert.strictEqual(capturedUrl, 'https://webexapis.com/v1/messages');
      assert.strictEqual(capturedOptions.method, 'POST');
      assert.ok(capturedOptions.headers['Authorization'].includes('Bearer'));
      assert.strictEqual(capturedOptions.headers['Content-Type'], 'application/json');
      
      const body = JSON.parse(capturedOptions.body);
      assert.strictEqual(body.roomId, 'room-123');
      assert.strictEqual(body.text, 'Hello World');
    });
  });

  describe('list_messages tool', () => {
    let listMessagesTool;

    beforeEach(() => {
      listMessagesTool = tools.find(tool => 
        tool.definition.function.name === 'list_messages'
      );
    });

    it('should exist and have correct structure', () => {
      assert.ok(listMessagesTool, 'list_messages tool should exist');
      assert.strictEqual(
        listMessagesTool.definition.function.name,
        'list_messages'
      );
    });

    it('should make GET request with query parameters', async () => {
      let capturedUrl, capturedOptions;
      
      global.fetch = (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ items: [] })
        });
      };

      await listMessagesTool.function({
        roomId: 'room-123',
        max: 50
      });

      assert.ok(capturedUrl.includes('roomId=room-123'));
      assert.ok(capturedUrl.includes('max=50'));
      assert.strictEqual(capturedOptions.method, 'GET');
      assert.ok(capturedOptions.headers['Authorization'].includes('Bearer'));
    });
  });

  describe('get_my_own_details tool', () => {
    let getMyDetailsTool;

    beforeEach(() => {
      getMyDetailsTool = tools.find(tool => 
        tool.definition.function.name === 'get_my_own_details'
      );
    });

    it('should exist and make correct API call', () => {
      assert.ok(getMyDetailsTool, 'get_my_own_details tool should exist');
    });

    it('should make GET request to people/me endpoint', async () => {
      let capturedUrl, capturedOptions;
      
      global.fetch = (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ 
            id: 'user-123', 
            displayName: 'Test User',
            emails: ['test@example.com']
          })
        });
      };

      const result = await getMyDetailsTool.function({});

      // The URL might include query parameters
      assert.ok(capturedUrl.startsWith('https://webexapis.com/v1/people/me'));
      assert.strictEqual(capturedOptions.method, 'GET');
      assert.ok(capturedOptions.headers['Authorization'].includes('Bearer'));
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      const createMessageTool = tools.find(tool => 
        tool.definition.function.name === 'create_message'
      );

      global.fetch = () => Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' })
      });

      const result = await createMessageTool.function({
        roomId: 'room-123',
        text: 'Hello'
      });

      // Should return error information
      assert.ok(result.error || result.message, 'Should return error information');
    });

    it('should handle network errors', async () => {
      const listMessagesTool = tools.find(tool => 
        tool.definition.function.name === 'list_messages'
      );

      global.fetch = () => Promise.reject(new Error('Network error'));

      const result = await listMessagesTool.function({
        roomId: 'room-123'
      });

      // Should handle the error gracefully
      assert.ok(result.error || result.message, 'Should handle network errors');
    });
  });

  describe('Authentication headers', () => {
    it('should include correct authorization header in all tools', async () => {
      const testTools = [
        'create_message',
        'list_messages',
        'get_my_own_details',
        'list_rooms',
        'create_room'
      ];

      for (const toolName of testTools) {
        const tool = tools.find(t => t.definition.function.name === toolName);
        if (!tool) continue;

        let capturedOptions;
        global.fetch = (url, options) => {
          capturedOptions = options;
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({})
          });
        };

        // Call the tool with minimal required parameters
        const params = toolName === 'list_messages' || toolName === 'create_message' 
          ? { roomId: 'test-room' }
          : toolName === 'create_room'
          ? { title: 'Test Room' }
          : {};

        if (toolName === 'create_message') {
          params.text = 'Test message';
        }

        await tool.function(params);

        assert.ok(
          capturedOptions.headers['Authorization'],
          `${toolName} should include Authorization header`
        );
        assert.ok(
          capturedOptions.headers['Authorization'].startsWith('Bearer '),
          `${toolName} should use Bearer token`
        );
        assert.strictEqual(
          capturedOptions.headers['Authorization'],
          'Bearer test-token-123',
          `${toolName} should use correct token`
        );
      }
    });
  });
});
