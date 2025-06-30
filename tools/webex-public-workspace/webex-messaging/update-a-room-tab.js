import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a Room Tab in Webex.
 *
 * @param {Object} args - Arguments for updating the Room Tab.
 * @param {string} args.id - The unique identifier for the Room Tab (path variable).
 * @param {string} args.roomId - The ID of the room to which the tab belongs.
 * @param {string} args.contentUrl - The new content URL for the tab.
 * @param {string} args.displayName - The display name for the tab.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const executeFunction = async ({ id, roomId, contentUrl, displayName }) => {

  try {
    // Construct the URL with the path variable
    const url = getWebexUrl(`/room/tabs/${encodeURIComponent(id)}`);

    // Prepare the request body
    const body = JSON.stringify({
      roomId,
      contentUrl,
      displayName
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
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating Room Tab:', error);
    return { error: 'An error occurred while updating the Room Tab.' };
  }
};

/**
 * Tool configuration for updating a Room Tab in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_room_tab',
      description: 'Update a Room Tab in Webex.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the Room Tab.'
          },
          roomId: {
            type: 'string',
            description: 'The ID of the room to which the tab belongs.'
          },
          contentUrl: {
            type: 'string',
            description: 'The new content URL for the tab.'
          },
          displayName: {
            type: 'string',
            description: 'The display name for the tab.'
          }
        },
        required: ['id', 'roomId', 'contentUrl', 'displayName']
      }
    }
  }
};

export { apiTool };