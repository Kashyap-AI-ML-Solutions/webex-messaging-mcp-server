import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a team in Webex.
 *
 * @param {Object} args - Arguments for creating a team.
 * @param {string} args.name - The name of the team.
 * @param {string} args.description - A description of the team.
 * @returns {Promise<Object>} - The result of the team creation.
 */
const executeFunction = async ({ name, description }) => {

  try {
    // Construct the URL for the team creation
    const url = getWebexUrl('/teams');

    // Prepare the request body
    const body = JSON.stringify({ name, description });

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
    console.error('Error creating team:', error);
    return { error: 'An error occurred while creating the team.' };
  }
};

/**
 * Tool configuration for creating a team in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_team',
      description: 'Create a team in Webex.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the team.'
          },
          description: {
            type: 'string',
            description: 'A description of the team.'
          }
        },
        required: ['name', 'description']
      }
    }
  }
};

export { apiTool };