import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get message details from Webex Messaging API.
 *
 * @param {Object} args - Arguments for the message details retrieval.
 * @param {string} args.messageId - The unique identifier for the message.
 * @returns {Promise<Object>} - The details of the message.
 */
const executeFunction = async ({ messageId }) => {

  try {
    // Construct the URL with the message ID
    const url = getWebexUrl(`/messages/${encodeURIComponent(messageId)}`);

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
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
    console.error('Error fetching message details:', error);
    return {
      error: error.message || 'An error occurred while fetching message details.',
      details: error.stack
    };
  }
};

/**
 * Tool configuration for getting message details from Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_message_details',
      description: 'Get details of a message by its ID.',
      parameters: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'The unique identifier for the message.'
          }
        },
        required: ['messageId']
      }
    }
  }
};

export { apiTool };