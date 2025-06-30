import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list room tabs for a specified room in Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.roomId - The ID of the room for which to list room tabs.
 * @returns {Promise<Object>} - The result of the room tabs listing.
 */
const executeFunction = async ({ roomId }) => {

  try {
    // Construct the URL with the roomId query parameter
    const url = new URL(getWebexUrl('/room/tabs'));
    url.searchParams.append('roomId', roomId);

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
    console.error('Error listing room tabs:', error);
    return { error: 'An error occurred while listing room tabs.' };
  }
};

/**
 * Tool configuration for listing room tabs in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_room_tabs',
      description: 'List room tabs for a specified room in Webex.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room for which to list room tabs.'
          }
        },
        required: ['roomId']
      }
    }
  }
};

export { apiTool };