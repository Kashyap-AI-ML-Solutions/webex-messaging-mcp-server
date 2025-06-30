import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list direct messages in a 1:1 room using the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the message listing.
 * @param {string} args.parentId - The parent ID to filter messages.
 * @param {string} args.personId - The person ID to filter messages in a 1:1 room.
 * @param {string} args.personEmail - The person email to filter messages in a 1:1 room.
 * @returns {Promise<Object>} - The result of the message listing.
 */
const executeFunction = async ({ parentId, personId, personEmail }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/messages/direct'));
    url.searchParams.append('parentId', parentId);

    // Add either personId OR personEmail, not both
    if (personId) {
      url.searchParams.append('personId', personId);
    } else if (personEmail) {
      url.searchParams.append('personEmail', personEmail);
    }

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing direct messages:', error);
    return {
      error: error.message || 'An error occurred while listing direct messages.',
      details: error.stack
    };
  }
};

/**
 * Tool configuration for listing direct messages in a 1:1 room using the Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_direct_messages',
      description: 'List all messages in a 1:1 room.',
      parameters: {
        type: 'object',
        properties: {
          parentId: {
            type: 'string',
            description: 'The parent ID to filter messages.'
          },
          personId: {
            type: 'string',
            description: 'The person ID to filter messages in a 1:1 room.'
          },
          personEmail: {
            type: 'string',
            description: 'The person email to filter messages in a 1:1 room.'
          }
        },
        required: ['parentId', 'personId', 'personEmail']
      }
    }
  }
};

export { apiTool };