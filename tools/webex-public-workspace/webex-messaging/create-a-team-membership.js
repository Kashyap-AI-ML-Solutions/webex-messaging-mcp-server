import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a team membership in Webex.
 *
 * @param {Object} args - Arguments for the team membership creation.
 * @param {string} args.teamId - The ID of the team to which the person will be added.
 * @param {string} args.personId - The ID of the person to be added to the team.
 * @param {string} args.personEmail - The email address of the person to be added to the team.
 * @param {boolean} [args.isModerator=false] - Indicates if the person should be a moderator.
 * @returns {Promise<Object>} - The result of the team membership creation.
 */
const executeFunction = async ({ teamId, personId, personEmail, isModerator = false }) => {

  try {
    // Construct the URL for the API endpoint
    const url = getWebexUrl('/team/memberships');

    // Set up the request body - include either personId OR personEmail, not both
    const requestBody = {
      teamId,
      isModerator
    };

    if (personId) {
      requestBody.personId = personId;
    } else if (personEmail) {
      requestBody.personEmail = personEmail;
    }

    const body = JSON.stringify(requestBody);

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error creating team membership:', error);
    return { error: 'An error occurred while creating the team membership.' };
  }
};

/**
 * Tool configuration for creating a team membership in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_team_membership',
      description: 'Create a team membership in Webex.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The ID of the team to which the person will be added.'
          },
          personId: {
            type: 'string',
            description: 'The ID of the person to be added to the team.'
          },
          personEmail: {
            type: 'string',
            description: 'The email address of the person to be added to the team.'
          },
          isModerator: {
            type: 'boolean',
            description: 'Indicates if the person should be a moderator.'
          }
        },
        required: ['teamId', 'personEmail']
      }
    }
  }
};

export { apiTool };