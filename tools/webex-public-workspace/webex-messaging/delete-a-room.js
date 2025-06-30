import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a room in Webex by its ID.
 *
 * @param {Object} args - Arguments for the delete operation.
 * @param {string} args.roomId - The unique identifier for the room to be deleted.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
const executeFunction = async ({ roomId }) => {

  try {
    // Construct the URL with the room ID
    const url = getWebexUrl(`/rooms/${encodeURIComponent(roomId)}`);

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
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

    // For DELETE requests, return success message (204 No Content has no body)
    if (response.status === 204) {
      return { success: true, message: 'Room deleted successfully' };
    }

    // Return the response data (if any)
    try {
      return await response.json();
    } catch (e) {
      // If no JSON body, return success
      return { success: true, message: 'Room deleted successfully' };
    }
  } catch (error) {
    console.error('Error deleting the room:', error);
    return { error: 'An error occurred while deleting the room.' };
  }
};

/**
 * Tool configuration for deleting a room in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_room',
      description: 'Delete a room in Webex by its ID.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The unique identifier for the room to be deleted.'
          }
        },
        required: ['roomId']
      }
    }
  }
};

export { apiTool };