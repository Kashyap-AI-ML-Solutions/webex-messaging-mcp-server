/**
 * Webex API Configuration Module
 * Centralizes authentication and base URL configuration for all Webex tools
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Get the Webex API base URL
 * @returns {string} The base URL for Webex API
 */
export function getWebexBaseUrl() {
  return process.env.WEBEX_API_BASE_URL || 'https://webexapis.com/v1';
}

/**
 * Get the Webex API token (without Bearer prefix)
 * @returns {string} The API token
 */
export function getWebexToken() {
  const token = process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
  if (!token) {
    throw new Error('WEBEX_PUBLIC_WORKSPACE_API_KEY environment variable is not set');
  }
  
  // Remove 'Bearer ' prefix if it exists (since we'll add it in headers)
  return token.replace(/^Bearer\s+/, '');
}

/**
 * Get standard headers for Webex API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object for fetch requests
 */
export function getWebexHeaders(additionalHeaders = {}) {
  const token = getWebexToken();
  
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...additionalHeaders
  };
}

/**
 * Get headers for POST/PUT requests with JSON content
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object for JSON requests
 */
export function getWebexJsonHeaders(additionalHeaders = {}) {
  return getWebexHeaders({
    'Content-Type': 'application/json',
    ...additionalHeaders
  });
}

/**
 * Construct a full Webex API URL
 * @param {string} endpoint - The API endpoint (e.g., '/messages', '/rooms')
 * @returns {string} The complete URL
 */
export function getWebexUrl(endpoint) {
  const baseUrl = getWebexBaseUrl();
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required variables are missing
 */
export function validateWebexConfig() {
  const requiredVars = ['WEBEX_PUBLIC_WORKSPACE_API_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate configuration on module load
try {
  validateWebexConfig();
} catch (error) {
  console.warn(`[Webex Config Warning] ${error.message}`);
}
