import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get the authenticated user's profile details from Webex.
 *
 * @param {Object} args - Arguments for the request.
 * @param {boolean} [args.callingData=true] - Include Webex Calling user details in the response.
 * @returns {Promise<Object>} - The profile details of the authenticated user.
 */
const executeFunction = async ({ callingData = true }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/people/me'));
    url.searchParams.append('callingData', callingData.toString());

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
    console.error('Error fetching user details:', error);
    return { error: 'An error occurred while fetching user details.' };
  }
};

/**
 * Tool configuration for getting user details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_my_own_details',
      description: 'Get profile details for the authenticated user.',
      parameters: {
        type: 'object',
        properties: {
          callingData: {
            type: 'boolean',
            description: 'Include Webex Calling user details in the response.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };