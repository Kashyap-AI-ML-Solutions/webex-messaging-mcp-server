import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to edit a message in Webex.
 *
 * @param {Object} args - Arguments for editing the message.
 * @param {string} args.messageId - The unique identifier for the message to edit.
 * @param {string} args.roomId - The ID of the room where the message is located.
 * @param {string} args.text - The new text for the message.
 * @param {string} [args.markdown] - The new markdown for the message (optional).
 * @returns {Promise<Object>} - The result of the edit message operation.
 */
const executeFunction = async ({ messageId, roomId, text, markdown }) => {

  try {
    // Construct the URL for the PUT request
    const url = getWebexUrl(`/messages/${encodeURIComponent(messageId)}`);

    // Prepare the request body
    const body = JSON.stringify({
      roomId,
      text,
      ...(markdown && { markdown }) // Include markdown only if provided
    });

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body
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
    console.error('Error editing the message:', error);
    return {
      error: error.message || 'An error occurred while editing the message.',
      details: error.stack
    };
  }
};

/**
 * Tool configuration for editing a message in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'edit_message',
      description: 'Edit a message in Webex.',
      parameters: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'The unique identifier for the message to edit.'
          },
          roomId: {
            type: 'string',
            description: 'The ID of the room where the message is located.'
          },
          text: {
            type: 'string',
            description: 'The new text for the message.'
          },
          markdown: {
            type: 'string',
            description: 'The new markdown for the message (optional).'
          }
        },
        required: ['messageId', 'text']
      }
    }
  }
};

export { apiTool };