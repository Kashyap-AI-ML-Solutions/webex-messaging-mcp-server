import { getWebexUrl, getWebexHeaders } from '../../../lib/webex-config.js';

/**
 * Function to list messages in a Webex room.
 *
 * @param {Object} args - Arguments for the message listing.
 * @param {string} args.roomId - The ID of the room to list messages from (required).
 * @param {string} [args.parentId] - The ID of the parent message to filter by.
 * @param {string} [args.mentionedPeople] - List messages with these people mentioned, by ID. Use `me` for the current API user.
 * @param {string} [args.before] - List messages sent before a specific date and time.
 * @param {string} [args.beforeMessage] - List messages sent before a specific message, by ID.
 * @param {number} [args.max=100] - Limit the maximum number of messages in the response (cannot exceed 100 if used with `mentionedPeople`).
 * @returns {Promise<Object>} - The result of the message listing.
 */
const executeFunction = async ({ roomId, parentId, mentionedPeople, before, beforeMessage, max = 100 }) => {
  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/messages'));
    url.searchParams.append('roomId', roomId);
    if (parentId) url.searchParams.append('parentId', parentId);
    if (mentionedPeople) url.searchParams.append('mentionedPeople', mentionedPeople);
    if (before) url.searchParams.append('before', before);
    if (beforeMessage) url.searchParams.append('beforeMessage', beforeMessage);
    url.searchParams.append('max', max.toString());

    // Get headers using centralized config
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing messages:', error);
    return {
      error: error.message || 'An error occurred while listing messages.',
      details: error.stack
    };
  }
};

/**
 * Tool configuration for listing messages in a Webex room.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_messages',
      description: 'List messages in a Webex room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room to list messages from.'
          },
          parentId: {
            type: 'string',
            description: 'The ID of the parent message to filter by.'
          },
          mentionedPeople: {
            type: 'string',
            description: 'List messages with these people mentioned, by ID.'
          },
          before: {
            type: 'string',
            description: 'List messages sent before a specific date and time.'
          },
          beforeMessage: {
            type: 'string',
            description: 'List messages sent before a specific message, by ID.'
          },
          max: {
            type: 'integer',
            description: 'Limit the maximum number of messages in the response.'
          }
        },
        required: ['roomId']
      }
    }
  }
};

export { apiTool };