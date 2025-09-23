import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a team in Webex.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.teamId - The unique identifier for the team.
 * @param {string} args.name - The new name for the team.
 * @param {string} args.description - The new description for the team.
 * @returns {Promise<Object>} - The result of the team update.
 */
const executeFunction = async ({ teamId, name, description }) => {

  try {
    // Construct the URL with the team ID
    const url = getWebexUrl(`/teams/${encodeURIComponent(teamId)}`);

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Prepare the body of the request
    const body = JSON.stringify({ name, description });

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
    console.error('Error updating the team:', error);
    return { error: 'An error occurred while updating the team.' };
  }
};

/**
 * Tool configuration for updating a team in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_team',
      description: 'Update a team in Webex.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The unique identifier for the team.'
          },
          name: {
            type: 'string',
            description: 'The new name for the team.'
          },
          description: {
            type: 'string',
            description: 'The new description for the team.'
          }
        },
        required: ['teamId', 'name']
      }
    }
  }
};

export { apiTool };