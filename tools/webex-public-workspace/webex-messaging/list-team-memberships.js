import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list team memberships for a given team in Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.teamId - The ID of the team to list memberships for.
 * @param {number} [args.max=100] - The maximum number of team memberships to return.
 * @returns {Promise<Object>} - The result of the team memberships listing.
 */
const executeFunction = async ({ teamId, max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/team/memberships'));
    url.searchParams.append('teamId', teamId);
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
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing team memberships:', error);
    return { error: 'An error occurred while listing team memberships.' };
  }
};

/**
 * Tool configuration for listing team memberships in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_team_memberships',
      description: 'List team memberships for a given team in Webex.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The ID of the team to list memberships for.'
          },
          max: {
            type: 'integer',
            description: 'The maximum number of team memberships to return.'
          }
        },
        required: ['teamId']
      }
    }
  }
};

export { apiTool };