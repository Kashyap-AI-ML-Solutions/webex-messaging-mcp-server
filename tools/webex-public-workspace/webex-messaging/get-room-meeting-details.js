import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get Webex room meeting details.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.roomId - The unique identifier for the room.
 * @returns {Promise<Object>} - The details of the meeting for the specified room.
 */
const executeFunction = async ({ roomId }) => {

  try {
    // Construct the URL with the roomId
    const url = getWebexUrl(`/rooms/${encodeURIComponent(roomId)}/meetingInfo`);

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
    console.error('Error fetching room meeting details:', error);
    return { error: 'An error occurred while fetching room meeting details.' };
  }
};

/**
 * Tool configuration for getting Webex room meeting details.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_room_meeting_details',
      description: 'Get details of a Webex meeting for a specific room.',
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