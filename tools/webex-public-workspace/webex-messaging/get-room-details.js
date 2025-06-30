import { getWebexUrl, getWebexHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get room details from Webex.
 *
 * @param {Object} args - Arguments for the room details request.
 * @param {string} args.roomId - The unique identifier for the room.
 * @returns {Promise<Object>} - The details of the room.
 */
const executeFunction = async ({ roomId }) => {

  try {
    // Construct the URL with the roomId
    const url = getWebexUrl(`/rooms/${encodeURIComponent(roomId)}`);

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting room details:', error);
    return { error: 'An error occurred while getting room details.' };
  }
};

/**
 * Tool configuration for getting room details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_room_details',
      description: 'Get details of a room by ID.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The unique identifier for the room.'
          }
        },
        required: ['roomId']
      }
    }
  }
};

export { apiTool };