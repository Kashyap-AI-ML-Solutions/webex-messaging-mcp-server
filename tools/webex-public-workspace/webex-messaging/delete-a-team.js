import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a team by ID in Webex.
 *
 * @param {Object} args - Arguments for the delete operation.
 * @param {string} args.teamId - The unique identifier for the team to be deleted.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
const executeFunction = async ({ teamId }) => {

  try {
    // Construct the URL with the team ID
    const url = getWebexUrl(`/teams/${encodeURIComponent(teamId)}`);

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

    // Return the response status
    return { status: response.status, message: 'Team deleted successfully.' };
  } catch (error) {
    console.error('Error deleting team:', error);
    return { error: 'An error occurred while deleting the team.' };
  }
};

/**
 * Tool configuration for deleting a team in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_team',
      description: 'Delete a team by ID in Webex.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The unique identifier for the team to be deleted.'
          }
        },
        required: ['teamId']
      }
    }
  }
};

export { apiTool };