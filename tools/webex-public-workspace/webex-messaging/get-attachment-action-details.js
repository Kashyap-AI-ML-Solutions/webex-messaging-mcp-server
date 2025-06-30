import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get attachment action details from Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.id - The unique identifier for the attachment action.
 * @returns {Promise<Object>} - The details of the attachment action.
 */
const executeFunction = async ({ id }) => {

  try {
    // Construct the URL with the provided ID
    const url = getWebexUrl('/attachment/actions/${encodeURIComponent(id)}');

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
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching attachment action details:', error);
    return { error: 'An error occurred while fetching attachment action details.' };
  }
};

/**
 * Tool configuration for getting attachment action details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_attachment_action_details',
      description: 'Get details for an attachment action by ID.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the attachment action.'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };