import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a room tab in Webex.
 *
 * @param {Object} args - Arguments for creating a room tab.
 * @param {string} args.roomId - The ID of the room where the tab will be added.
 * @param {string} args.contentUrl - The URL to be displayed in the tab.
 * @param {string} args.displayName - The name to be displayed for the tab.
 * @returns {Promise<Object>} - The result of the room tab creation.
 */
const executeFunction = async ({ roomId, contentUrl, displayName }) => {

  try {
    // Construct the URL for the request
    const url = getWebexUrl('/room/tabs');

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Prepare the body of the request
    const body = JSON.stringify({
      roomId,
      contentUrl,
      displayName
    });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error creating room tab:', error);
    return { error: 'An error occurred while creating the room tab.' };
  }
};

/**
 * Tool configuration for creating a room tab in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_room_tab',
      description: 'Create a tab in a specified room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room where the tab will be added.'
          },
          contentUrl: {
            type: 'string',
            description: 'The URL to be displayed in the tab.'
          },
          displayName: {
            type: 'string',
            description: 'The name to be displayed for the tab.'
          }
        },
        required: ['roomId', 'contentUrl', 'displayName']
      }
    }
  }
};

export { apiTool };