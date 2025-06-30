import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a team membership in Webex.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.membershipId - The unique identifier for the team membership.
 * @param {boolean} args.isModerator - Indicates if the user is a moderator.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const executeFunction = async ({ membershipId, isModerator }) => {

  try {
    // Construct the URL with the membership ID
    const url = getWebexUrl(`/team/memberships/${encodeURIComponent(membershipId)}`);

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Prepare the request body
    const body = JSON.stringify({ isModerator });

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
    console.error('Error updating team membership:', error);
    return { error: 'An error occurred while updating the team membership.' };
  }
};

/**
 * Tool configuration for updating a team membership in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_team_membership',
      description: 'Update a team membership in Webex.',
      parameters: {
        type: 'object',
        properties: {
          membershipId: {
            type: 'string',
            description: 'The unique identifier for the team membership.'
          },
          isModerator: {
            type: 'boolean',
            description: 'Indicates if the user is a moderator.'
          }
        },
        required: ['membershipId', 'isModerator']
      }
    }
  }
};

export { apiTool };