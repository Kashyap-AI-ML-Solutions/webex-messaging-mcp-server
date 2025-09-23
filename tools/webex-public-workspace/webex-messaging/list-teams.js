import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list teams for the authenticated user in Webex.
 *
 * @param {Object} args - Arguments for the team listing.
 * @param {number} [args.max=100] - The maximum number of teams to return.
 * @returns {Promise<Object>} - The result of the team listing.
 */
const executeFunction = async ({ max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/teams'));
    url.searchParams.append('max', max.toString());

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
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing teams:', error);
    return { error: 'An error occurred while listing teams.' };
  }
};

/**
 * Tool configuration for listing teams in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_teams',
      description: 'List teams for the authenticated user in Webex.',
      parameters: {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            description: 'The maximum number of teams to return.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };