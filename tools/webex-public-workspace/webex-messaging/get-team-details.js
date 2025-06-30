import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get team details from Webex.
 *
 * @param {Object} args - Arguments for the team details request.
 * @param {string} args.teamId - The unique identifier for the team.
 * @param {string} [args.description] - The team's description.
 * @returns {Promise<Object>} - The result of the team details request.
 */
const executeFunction = async ({ teamId, description }) => {

  try {
    // Construct the URL with the team ID and query parameters
    const url = new URL(getWebexUrl(`/teams/${encodeURIComponent(teamId)}`));
    if (description) {
      url.searchParams.append('description', description);
    }

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
    console.error('Error getting team details:', error);
    return { error: 'An error occurred while getting team details.' };
  }
};

/**
 * Tool configuration for getting team details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_team_details',
      description: 'Get details for a team by ID.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The unique identifier for the team.'
          },
          description: {
            type: 'string',
            description: 'The team\'s description.'
          }
        },
        required: ['teamId']
      }
    }
  }
};

export { apiTool };