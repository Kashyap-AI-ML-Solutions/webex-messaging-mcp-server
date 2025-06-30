import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get team membership details from Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.membershipId - The unique identifier for the team membership.
 * @returns {Promise<Object>} - The details of the team membership.
 */
const executeFunction = async ({ membershipId }) => {

  try {
    // Construct the URL with the membership ID
    const url = getWebexUrl(`/team/memberships/${encodeURIComponent(membershipId)}`);

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
    console.error('Error fetching team membership details:', error);
    return { error: 'An error occurred while fetching team membership details.' };
  }
};

/**
 * Tool configuration for getting team membership details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_team_membership_details',
      description: 'Get details for a team membership by ID.',
      parameters: {
        type: 'object',
        properties: {
          membershipId: {
            type: 'string',
            description: 'The unique identifier for the team membership.'
          }
        },
        required: ['membershipId']
      }
    }
  }
};

export { apiTool };