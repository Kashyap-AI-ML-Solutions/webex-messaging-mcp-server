import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { 
  getWebexBaseUrl, 
  getWebexToken, 
  getWebexHeaders, 
  getWebexJsonHeaders, 
  getWebexUrl,
  validateWebexConfig 
} from '../lib/webex-config.js';

describe('Webex Configuration Module', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getWebexBaseUrl', () => {
    it('should return default base URL when env var is not set', () => {
      delete process.env.WEBEX_API_BASE_URL;
      const baseUrl = getWebexBaseUrl();
      assert.strictEqual(baseUrl, 'https://webexapis.com/v1');
    });

    it('should return custom base URL when env var is set', () => {
      process.env.WEBEX_API_BASE_URL = 'https://custom.webex.com/v2';
      const baseUrl = getWebexBaseUrl();
      assert.strictEqual(baseUrl, 'https://custom.webex.com/v2');
    });
  });

  describe('getWebexToken', () => {
    it('should return token without Bearer prefix', () => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
      const token = getWebexToken();
      assert.strictEqual(token, 'test-token-123');
    });

    it('should remove Bearer prefix if present', () => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'Bearer test-token-123';
      const token = getWebexToken();
      assert.strictEqual(token, 'test-token-123');
    });

    it('should remove Bearer prefix with extra spaces', () => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'Bearer   test-token-123';
      const token = getWebexToken();
      assert.strictEqual(token, 'test-token-123');
    });

    it('should throw error when token is not set', () => {
      delete process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
      assert.throws(() => {
        getWebexToken();
      }, /WEBEX_PUBLIC_WORKSPACE_API_KEY environment variable is not set/);
    });
  });

  describe('getWebexHeaders', () => {
    beforeEach(() => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    });

    it('should return standard headers with Authorization', () => {
      const headers = getWebexHeaders();
      assert.deepStrictEqual(headers, {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token-123'
      });
    });

    it('should merge additional headers', () => {
      const headers = getWebexHeaders({ 'Custom-Header': 'custom-value' });
      assert.deepStrictEqual(headers, {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token-123',
        'Custom-Header': 'custom-value'
      });
    });

    it('should allow overriding default headers', () => {
      const headers = getWebexHeaders({ 'Accept': 'text/plain' });
      assert.deepStrictEqual(headers, {
        'Accept': 'text/plain',
        'Authorization': 'Bearer test-token-123'
      });
    });
  });

  describe('getWebexJsonHeaders', () => {
    beforeEach(() => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    });

    it('should return JSON headers with Content-Type', () => {
      const headers = getWebexJsonHeaders();
      assert.deepStrictEqual(headers, {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json'
      });
    });

    it('should merge additional headers with JSON headers', () => {
      const headers = getWebexJsonHeaders({ 'X-Custom': 'value' });
      assert.deepStrictEqual(headers, {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json',
        'X-Custom': 'value'
      });
    });
  });

  describe('getWebexUrl', () => {
    beforeEach(() => {
      process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
    });

    it('should construct URL with leading slash', () => {
      const url = getWebexUrl('/messages');
      assert.strictEqual(url, 'https://webexapis.com/v1/messages');
    });

    it('should construct URL without leading slash', () => {
      const url = getWebexUrl('messages');
      assert.strictEqual(url, 'https://webexapis.com/v1/messages');
    });

    it('should handle complex endpoints', () => {
      const url = getWebexUrl('/rooms/123/messages');
      assert.strictEqual(url, 'https://webexapis.com/v1/rooms/123/messages');
    });

    it('should work with custom base URL', () => {
      process.env.WEBEX_API_BASE_URL = 'https://custom.api.com/v2';
      const url = getWebexUrl('/test');
      assert.strictEqual(url, 'https://custom.api.com/v2/test');
    });
  });

  describe('validateWebexConfig', () => {
    it('should not throw when all required vars are set', () => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token';
      assert.doesNotThrow(() => {
        validateWebexConfig();
      });
    });

    it('should throw when required var is missing', () => {
      delete process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
      assert.throws(() => {
        validateWebexConfig();
      }, /Missing required environment variables: WEBEX_PUBLIC_WORKSPACE_API_KEY/);
    });

    it('should throw when required var is empty string', () => {
      process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = '';
      assert.throws(() => {
        validateWebexConfig();
      }, /Missing required environment variables: WEBEX_PUBLIC_WORKSPACE_API_KEY/);
    });
  });
});
