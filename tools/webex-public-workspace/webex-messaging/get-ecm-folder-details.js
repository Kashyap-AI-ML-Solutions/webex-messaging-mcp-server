import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get details for a room ECM folder with the specified folder ID.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.id - The unique identifier for the folder (required).
 * @returns {Promise<Object>} - The details of the ECM folder.
 */
const executeFunction = async ({ id }) => {

  try {
    // Construct the URL with the folder ID
    const url = getWebexUrl('/room/linkedFolders/${id}');

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
    console.error('Error getting ECM folder details:', error);
    return { error: 'An error occurred while getting ECM folder details.' };
  }
};

/**
 * Tool configuration for getting ECM folder details.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_ecm_folder_details',
      description: 'Get details for a room ECM folder with the specified folder ID.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the folder.'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };