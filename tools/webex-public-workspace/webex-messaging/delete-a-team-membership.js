import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a team membership by ID in Webex.
 *
 * @param {Object} args - Arguments for the deletion.
 * @param {string} args.membershipId - The unique identifier for the team membership to be deleted.
 * @returns {Promise<Object>} - The result of the deletion request.
 */
const executeFunction = async ({ membershipId }) => {

  try {
    // Construct the URL for the request
    const url = getWebexUrl('/team/memberships/${membershipId}');

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
    return { status: response.status, message: 'Membership deleted successfully.' };
  } catch (error) {
    console.error('Error deleting team membership:', error);
    return { error: 'An error occurred while deleting the team membership.' };
  }
};

/**
 * Tool configuration for deleting a team membership in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_team_membership',
      description: 'Delete a team membership by ID in Webex.',
      parameters: {
        type: 'object',
        properties: {
          membershipId: {
            type: 'string',
            description: 'The unique identifier for the team membership to be deleted.'
          }
        },
        required: ['membershipId']
      }
    }
  }
};

export { apiTool };