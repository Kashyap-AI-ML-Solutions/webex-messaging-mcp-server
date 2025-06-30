import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a Room Tab in Webex.
 *
 * @param {Object} args - Arguments for the deletion.
 * @param {string} args.id - The unique identifier for the Room Tab to delete.
 * @returns {Promise<Object>} - The result of the deletion operation.
 */
const executeFunction = async ({ id }) => {

  try {
    // Construct the URL with the path variable
    const url = getWebexUrl(`/room/tabs/${encodeURIComponent(id)}`);

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.error('Error deleting Room Tab:', error);
    return { error: 'An error occurred while deleting the Room Tab.' };
  }
};

/**
 * Tool configuration for deleting a Room Tab in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_room_tab',
      description: 'Delete a Room Tab in Webex.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the Room Tab to delete.'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };