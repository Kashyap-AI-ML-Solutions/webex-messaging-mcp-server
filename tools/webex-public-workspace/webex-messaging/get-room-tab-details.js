import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get details for a Room Tab in Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.id - The unique identifier for the Room Tab.
 * @returns {Promise<Object>} - The details of the Room Tab.
 */
const executeFunction = async ({ id }) => {

  try {
    // Construct the URL with the room tab ID
    const url = getWebexUrl(`/room/tabs/${encodeURIComponent(id)}`);

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
    console.error('Error getting Room Tab details:', error);
    return { error: 'An error occurred while getting Room Tab details.' };
  }
};

/**
 * Tool configuration for getting Room Tab details in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_room_tab_details',
      description: 'Get details for a Room Tab in Webex.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the Room Tab.'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };