import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Import specific tool implementations for detailed testing
import { discoverTools } from '../lib/tools.js';

describe('Tool Implementation Details', () => {
  let originalEnv;
  let originalFetch;
  let tools;
  let mockResponses;

  beforeEach(async () => {
    // Save original environment and fetch
    originalEnv = { ...process.env };
    originalFetch = global.fetch;
    
    // Set test environment variables
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
    
    // Load tools
    tools = await discoverTools();
    
    // Setup mock responses
    mockResponses = new Map();
    
    // Mock fetch with configurable responses
    global.fetch = async (url, options) => {
      const key = `${options.method || 'GET'} ${url}`;
      if (mockResponses.has(key)) {
        return mockResponses.get(key);
      }
      
      // Default successful response
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, id: 'test-id' }),
        text: async () => '{"success":true,"id":"test-id"}'
      };
    };
  });

  afterEach(() => {
    // Restore original environment and fetch
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe('Message Tools', () => {
    describe('create_message', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'create_message');
      });

      it('should handle room messages correctly', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-123', roomId: 'room-123', text: 'Hello' })
          };
        };

        const result = await tool.function({
          roomId: 'room-123',
          text: 'Hello World'
        });

        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/messages');
        assert.strictEqual(capturedRequest.options.method, 'POST');
        
        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-123');
        assert.strictEqual(body.text, 'Hello World');
      });

      it('should handle direct messages correctly', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-124', toPersonEmail: 'user@example.com' })
          };
        };

        await tool.function({
          toPersonEmail: 'user@example.com',
          text: 'Direct message'
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.toPersonEmail, 'user@example.com');
        assert.strictEqual(body.text, 'Direct message');
      });

      it('should handle markdown messages', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-125' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          text: 'Plain text',
          markdown: '**Bold text**'
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.markdown, '**Bold text**');
      });

      it('should handle file attachments', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-126' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          text: 'Message with file',
          files: ['https://example.com/file.pdf']
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.deepStrictEqual(body.files, ['https://example.com/file.pdf']);
      });

      it('should use centralized webex config for URL and headers', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-127', roomId: 'room-123', text: 'Test' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          text: 'Test message'
        });

        // Verify URL uses centralized config
        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/messages');
        assert.strictEqual(capturedRequest.options.method, 'POST');

        // Verify headers use centralized config
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.ok(capturedRequest.options.headers.Authorization.startsWith('Bearer '), 'Should use Bearer token');
        assert.strictEqual(capturedRequest.options.headers['Content-Type'], 'application/json', 'Should set JSON content type');
        assert.strictEqual(capturedRequest.options.headers.Accept, 'application/json', 'Should accept JSON');
      });

      it('should handle conditional payload parameters', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-128' })
          };
        };

        // Test with minimal parameters
        await tool.function({
          roomId: 'room-123',
          text: 'Simple message'
        });

        let body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-123');
        assert.strictEqual(body.text, 'Simple message');
        assert.ok(!body.parentId, 'Should not include undefined parentId');
        assert.ok(!body.markdown, 'Should not include undefined markdown');
        assert.ok(!body.files, 'Should not include empty files array');

        // Test with all parameters
        await tool.function({
          roomId: 'room-456',
          parentId: 'parent-123',
          text: 'Reply message',
          markdown: '**Bold reply**',
          files: ['https://example.com/doc.pdf'],
          attachments: [{ type: 'card' }]
        });

        body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-456');
        assert.strictEqual(body.parentId, 'parent-123');
        assert.strictEqual(body.text, 'Reply message');
        assert.strictEqual(body.markdown, '**Bold reply**');
        assert.deepStrictEqual(body.files, ['https://example.com/doc.pdf']);
        assert.deepStrictEqual(body.attachments, [{ type: 'card' }]);
      });
    });

    describe('list_messages', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'list_messages');
      });

      it('should construct query parameters correctly', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          roomId: 'room-123',
          max: 25,
          mentionedPeople: 'me'
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('roomId'), 'room-123');
        assert.strictEqual(url.searchParams.get('max'), '25');
        assert.strictEqual(url.searchParams.get('mentionedPeople'), 'me');
      });

      it('should handle optional parameters', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          roomId: 'room-123'
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('roomId'), 'room-123');
        assert.ok(!url.searchParams.has('mentionedPeople'));
      });
    });

    describe('get_message_details', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'get_message_details');
      });

      it('should get message details with correct URL and headers', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-123', text: 'Test message', roomId: 'room-123' })
          };
        };

        await tool.function({
          messageId: 'msg-123'
        });

        // Verify URL construction with message ID
        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/messages/msg-123');
        assert.strictEqual(capturedRequest.options.method, 'GET');

        // Verify headers use centralized config
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.ok(capturedRequest.options.headers.Authorization.startsWith('Bearer '), 'Should use Bearer token');
        assert.strictEqual(capturedRequest.options.headers.Accept, 'application/json', 'Should accept JSON');
      });

      it('should handle URL encoding for message IDs', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-123', text: 'Test' })
          };
        };

        await tool.function({
          messageId: 'msg with spaces'
        });

        assert.ok(capturedUrl.includes('msg%20with%20spaces'));
      });

      it('should handle error responses gracefully', async () => {
        global.fetch = async () => ({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: async () => JSON.stringify({ message: 'Message not found' })
        });

        const result = await tool.function({ messageId: 'nonexistent' });
        assert.ok(result.error || result.message, 'Should return error information');
      });
    });

    describe('edit_message', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'edit_message');
      });

      it('should edit message with correct URL and payload', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-123', text: 'Updated message', roomId: 'room-123' })
          };
        };

        await tool.function({
          messageId: 'msg-123',
          roomId: 'room-123',
          text: 'Updated message'
        });

        // Verify URL construction
        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/messages/msg-123');
        assert.strictEqual(capturedRequest.options.method, 'PUT');

        // Verify payload
        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-123');
        assert.strictEqual(body.text, 'Updated message');

        // Verify headers
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.strictEqual(capturedRequest.options.headers['Content-Type'], 'application/json');
      });

      it('should handle markdown parameter', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'msg-123', markdown: '**Updated**', roomId: 'room-123' })
          };
        };

        await tool.function({
          messageId: 'msg-123',
          roomId: 'room-123',
          text: 'Updated message',
          markdown: '**Updated**'
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.markdown, '**Updated**');
      });
    });

    describe('delete_message', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'delete_message');
      });

      it('should delete message with correct URL and method', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 204
          };
        };

        await tool.function({
          messageId: 'msg-123'
        });

        // Verify URL construction
        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/messages/msg-123');
        assert.strictEqual(capturedRequest.options.method, 'DELETE');

        // Verify headers
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.strictEqual(capturedRequest.options.headers.Accept, 'application/json');
      });

      it('should handle URL encoding for message IDs', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 204
          };
        };

        await tool.function({
          messageId: 'msg with spaces'
        });

        assert.ok(capturedUrl.includes('msg%20with%20spaces'));
      });

      it('should return success message on 204 status', async () => {
        global.fetch = async () => ({
          ok: true,
          status: 204
        });

        const result = await tool.function({ messageId: 'msg-123' });
        assert.ok(result.message && result.message.includes('deleted'), 'Should return success message');
      });
    });
  });

  describe('Room Tools', () => {
    describe('create_room', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'create_room');
      });

      it('should create room with basic parameters', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'room-123', title: 'Test Room' })
          };
        };

        await tool.function({
          title: 'Test Room'
        });

        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/rooms');
        assert.strictEqual(capturedRequest.options.method, 'POST');

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.title, 'Test Room');
      });

      it('should handle team rooms', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'room-124', teamId: 'team-123' })
          };
        };

        await tool.function({
          title: 'Team Room',
          teamId: 'team-123'
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.teamId, 'team-123');
      });
    });

    describe('get_room_details', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'get_room_details');
      });

      it('should get room details with correct URL and headers', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: 'room-123',
              title: 'Test Room',
              type: 'group',
              isLocked: false,
              teamId: 'team-456'
            })
          };
        };

        const result = await tool.function({
          roomId: 'room-123'
        });

        // Verify URL construction using centralized config
        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/rooms/room-123');
        assert.strictEqual(capturedRequest.options.method, 'GET');

        // Verify headers include authorization
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.ok(capturedRequest.options.headers.Authorization.startsWith('Bearer '), 'Should use Bearer token');
        assert.strictEqual(capturedRequest.options.headers.Accept, 'application/json', 'Should accept JSON');

        // Verify response
        assert.strictEqual(result.id, 'room-123');
        assert.strictEqual(result.title, 'Test Room');
      });

      it('should handle URL encoding for room IDs', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'room-with-special-chars' })
          };
        };

        await tool.function({
          roomId: 'room with spaces & special chars'
        });

        // Verify URL encoding
        assert.strictEqual(
          capturedRequest.url,
          'https://webexapis.com/v1/rooms/room%20with%20spaces%20%26%20special%20chars'
        );
      });

      it('should handle error responses gracefully', async () => {
        global.fetch = async () => ({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: async () => JSON.stringify({ message: 'Room not found' })
        });

        const result = await tool.function({
          roomId: 'nonexistent-room'
        });

        assert.ok(result.error, 'Should return error information');
      });
    });

    describe('list_rooms', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'list_rooms');
      });

      it('should list rooms with teamId filter', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          teamId: 'team-123',
          max: 50
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('teamId'), 'team-123');
        assert.strictEqual(url.searchParams.get('max'), '50');
        assert.strictEqual(url.searchParams.get('sortBy'), 'id');
      });

      it('should list rooms without teamId (all accessible rooms)', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          max: 100
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('teamId'), null);
        assert.strictEqual(url.searchParams.get('max'), '100');
      });

      it('should use type parameter when provided (without orgPublicSpaces)', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          type: 'group',
          max: 50
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('type'), 'group');
        assert.strictEqual(url.searchParams.get('orgPublicSpaces'), null);
      });

      it('should use orgPublicSpaces parameter when provided (without type)', async () => {
        let capturedUrl;
        global.fetch = async (url, options) => {
          capturedUrl = url;
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          orgPublicSpaces: true,
          max: 50
        });

        const url = new URL(capturedUrl);
        assert.strictEqual(url.searchParams.get('orgPublicSpaces'), 'true');
        assert.strictEqual(url.searchParams.get('type'), null);
      });

      it('should use centralized webex config for URL and headers', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({});

        // Verify URL uses centralized config
        assert.ok(capturedRequest.url.startsWith('https://webexapis.com/v1/rooms'));
        assert.strictEqual(capturedRequest.options.method, 'GET');

        // Verify headers use centralized config
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.ok(capturedRequest.options.headers.Authorization.startsWith('Bearer '), 'Should use Bearer token');
        assert.strictEqual(capturedRequest.options.headers.Accept, 'application/json', 'Should accept JSON');
      });

      it('should handle error responses gracefully', async () => {
        global.fetch = async () => ({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          text: async () => JSON.stringify({ message: 'Access denied' })
        });

        const result = await tool.function({});
        assert.ok(result.error || result.message, 'Should return error information');
      });
    });

    describe('get_room_meeting_details', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'get_room_meeting_details');
      });

      it('should get room meeting details with correct URL and headers', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({
              roomId: 'room-123',
              meetingLink: 'https://cisco.webex.com/m/test-meeting',
              sipAddress: '123456789@cisco.webex.com',
              meetingNumber: '123456789'
            })
          };
        };

        const result = await tool.function({
          roomId: 'room-123'
        });

        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/rooms/room-123/meetingInfo');
        assert.strictEqual(capturedRequest.options.method, 'GET');
        assert.ok(capturedRequest.options.headers.Authorization, 'Should include Authorization header');
        assert.strictEqual(result.roomId, 'room-123');
        assert.ok(result.meetingLink, 'Should return meeting link');
      });

      it('should handle URL encoding for room IDs', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ roomId: 'room-with-special-chars' })
          };
        };

        await tool.function({
          roomId: 'room/with/special/chars'
        });

        assert.ok(capturedRequest.url.includes('room%2Fwith%2Fspecial%2Fchars'), 'Should URL encode room ID');
      });
    });

    describe('update_room', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'update_room');
      });

      it('should update room with correct URL and payload', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'room-123', title: 'Updated Room' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          title: 'Updated Room'
        });

        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/rooms/room-123');
        assert.strictEqual(capturedRequest.options.method, 'PUT');

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.title, 'Updated Room');
      });

      it('should handle URL encoding for room IDs', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'room-123' })
          };
        };

        await tool.function({
          roomId: 'room/with/special/chars',
          title: 'Test Room'
        });

        assert.ok(capturedRequest.url.includes('room%2Fwith%2Fspecial%2Fchars'), 'Should URL encode room ID');
      });
    });

    describe('delete_room', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'delete_room');
      });

      it('should delete room with correct URL and handle 204 response', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 204,
            json: async () => {
              throw new Error('No content');
            }
          };
        };

        const result = await tool.function({
          roomId: 'room-123'
        });

        assert.strictEqual(capturedRequest.url, 'https://webexapis.com/v1/rooms/room-123');
        assert.strictEqual(capturedRequest.options.method, 'DELETE');
        assert.ok(result.success, 'Should return success for 204 response');
        assert.ok(result.message, 'Should include success message');
      });

      it('should handle URL encoding for room IDs', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 204
          };
        };

        await tool.function({
          roomId: 'room/with/special/chars'
        });

        assert.ok(capturedRequest.url.includes('room%2Fwith%2Fspecial%2Fchars'), 'Should URL encode room ID');
      });

      it('should handle error responses gracefully', async () => {
        global.fetch = async () => ({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          text: async () => JSON.stringify({ message: 'Access denied' })
        });

        const result = await tool.function({
          roomId: 'room-123'
        });

        assert.ok(result.error, 'Should return error information');
      });
    });
  });

  describe('Membership Tools', () => {
    describe('create_membership', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'create_membership');
      });

      it('should create membership with personEmail only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'membership-123', personEmail: 'test@example.com' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          personEmail: 'test@example.com',
          isModerator: false
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-123');
        assert.strictEqual(body.personEmail, 'test@example.com');
        assert.strictEqual(body.isModerator, false);
        assert.strictEqual(body.personId, undefined, 'Should not include personId when using personEmail');
      });

      it('should create membership with personId only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'membership-123', personId: 'person-123' })
          };
        };

        await tool.function({
          roomId: 'room-123',
          personId: 'person-123',
          isModerator: true
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.roomId, 'room-123');
        assert.strictEqual(body.personId, 'person-123');
        assert.strictEqual(body.isModerator, true);
        assert.strictEqual(body.personEmail, undefined, 'Should not include personEmail when using personId');
      });
    });

    describe('create_team_membership', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'create_team_membership');
      });

      it('should create team membership with personEmail only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'team-membership-123', personEmail: 'test@example.com' })
          };
        };

        await tool.function({
          teamId: 'team-123',
          personEmail: 'test@example.com',
          isModerator: false
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.teamId, 'team-123');
        assert.strictEqual(body.personEmail, 'test@example.com');
        assert.strictEqual(body.isModerator, false);
        assert.strictEqual(body.personId, undefined, 'Should not include personId when using personEmail');
      });

      it('should create team membership with personId only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'team-membership-123', personId: 'person-123' })
          };
        };

        await tool.function({
          teamId: 'team-123',
          personId: 'person-123',
          isModerator: true
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.teamId, 'team-123');
        assert.strictEqual(body.personId, 'person-123');
        assert.strictEqual(body.isModerator, true);
        assert.strictEqual(body.personEmail, undefined, 'Should not include personEmail when using personId');
      });
    });

    describe('list_direct_messages', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'list_direct_messages');
      });

      it('should list direct messages with personEmail only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          parentId: 'parent-123',
          personEmail: 'test@example.com'
        });

        assert.ok(capturedRequest.url.includes('personEmail=test%40example.com'), 'Should include personEmail in URL');
        assert.ok(!capturedRequest.url.includes('personId='), 'Should not include personId when using personEmail');
      });

      it('should list direct messages with personId only', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [] })
          };
        };

        await tool.function({
          parentId: 'parent-123',
          personId: 'person-123'
        });

        assert.ok(capturedRequest.url.includes('personId=person-123'), 'Should include personId in URL');
        assert.ok(!capturedRequest.url.includes('personEmail='), 'Should not include personEmail when using personId');
      });
    });

    describe('update_person', () => {
      let tool;

      beforeEach(() => {
        tool = tools.find(t => t.definition.function.name === 'update_person');
      });

      it('should update person and filter out null avatar', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'person-123', displayName: 'Test User' })
          };
        };

        await tool.function({
          personId: 'person-123',
          personDetails: {
            displayName: 'Test User',
            avatar: null,
            title: 'Developer'
          }
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.displayName, 'Test User');
        assert.strictEqual(body.title, 'Developer');
        assert.strictEqual(body.avatar, undefined, 'Should filter out null avatar');
      });

      it('should update person and filter out undefined avatar', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'person-123', displayName: 'Test User' })
          };
        };

        await tool.function({
          personId: 'person-123',
          personDetails: {
            displayName: 'Test User',
            avatar: undefined,
            title: 'Developer'
          }
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.displayName, 'Test User');
        assert.strictEqual(body.title, 'Developer');
        assert.strictEqual(body.avatar, undefined, 'Should filter out undefined avatar');
      });

      it('should keep valid avatar URL', async () => {
        let capturedRequest;
        global.fetch = async (url, options) => {
          capturedRequest = { url, options };
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 'person-123', displayName: 'Test User' })
          };
        };

        await tool.function({
          personId: 'person-123',
          personDetails: {
            displayName: 'Test User',
            avatar: 'https://example.com/avatar.jpg',
            title: 'Developer'
          }
        });

        const body = JSON.parse(capturedRequest.options.body);
        assert.strictEqual(body.displayName, 'Test User');
        assert.strictEqual(body.title, 'Developer');
        assert.strictEqual(body.avatar, 'https://example.com/avatar.jpg', 'Should keep valid avatar URL');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors consistently', async () => {
      const testTools = ['create_message', 'list_rooms', 'get_my_own_details'];
      
      for (const toolName of testTools) {
        const tool = tools.find(t => t.definition.function.name === toolName);
        if (!tool) continue;

        global.fetch = async () => ({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ message: 'Resource not found' })
        });

        const params = toolName === 'create_message' 
          ? { roomId: 'room-123', text: 'test' }
          : toolName === 'list_rooms'
          ? {}
          : {};

        const result = await tool.function(params);
        
        // Should handle error gracefully
        assert.ok(result, `${toolName} should return result even on error`);
      }
    });

    it('should handle network timeouts', async () => {
      const tool = tools.find(t => t.definition.function.name === 'get_my_own_details');

      global.fetch = async () => {
        throw new Error('Network timeout');
      };

      const result = await tool.function({});
      
      // Should handle timeout gracefully
      assert.ok(result, 'Should handle network errors');
    });

    it('should handle malformed JSON responses', async () => {
      const tool = tools.find(t => t.definition.function.name === 'list_messages');

      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        text: async () => 'invalid json response'
      });

      const result = await tool.function({ roomId: 'room-123' });
      
      // Should handle JSON parsing errors
      assert.ok(result, 'Should handle malformed JSON');
    });
  });

  describe('Authentication', () => {
    it('should handle authentication errors', async () => {
      const tool = tools.find(t => t.definition.function.name === 'create_message');

      global.fetch = async () => ({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ 
          message: 'The request requires a valid access token.',
          errors: [{ description: 'The request requires a valid access token.' }]
        })
      });

      const result = await tool.function({
        roomId: 'room-123',
        text: 'test message'
      });

      // Should return error information
      assert.ok(result.error || result.message, 'Should indicate authentication error');
    });

    it('should include proper authorization headers', async () => {
      const testTools = ['create_message', 'list_rooms', 'create_webhook'];
      
      for (const toolName of testTools) {
        const tool = tools.find(t => t.definition.function.name === toolName);
        if (!tool) continue;

        let capturedHeaders;
        global.fetch = async (url, options) => {
          capturedHeaders = options.headers;
          return {
            ok: true,
            status: 200,
            json: async () => ({})
          };
        };

        const params = toolName === 'create_message' 
          ? { roomId: 'room-123', text: 'test' }
          : toolName === 'create_webhook'
          ? { name: 'test', targetUrl: 'https://example.com', resource: 'messages', event: 'created' }
          : {};

        await tool.function(params);

        assert.ok(capturedHeaders.Authorization, `${toolName} should include Authorization header`);
        assert.ok(capturedHeaders.Authorization.startsWith('Bearer '), `${toolName} should use Bearer token`);
      }
    });
  });
});
