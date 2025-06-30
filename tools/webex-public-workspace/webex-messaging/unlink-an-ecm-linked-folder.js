import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to unlink an ECM linked folder from a space in Webex.
 *
 * @param {Object} args - Arguments for the unlink operation.
 * @param {string} args.id - The unique identifier for the folder to disassociate from the space.
 * @returns {Promise<Object>} - The result of the unlink operation.
 */
const executeFunction = async ({ id }) => {

  try {
    // Construct the URL with the folder ID
    const url = getWebexUrl('/room/linkedFolders/${encodeURIComponent(id)}');

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

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
    return { status: 'success', message: 'Folder unlinked successfully.' };
  } catch (error) {
    console.error('Error unlinking folder:', error);
    return { error: 'An error occurred while unlinking the folder.' };
  }
};

/**
 * Tool configuration for unlinking an ECM linked folder in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'unlink_ecm_linked_folder',
      description: 'Unlink an ECM linked folder from a space in Webex.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the folder to disassociate from the space.'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };