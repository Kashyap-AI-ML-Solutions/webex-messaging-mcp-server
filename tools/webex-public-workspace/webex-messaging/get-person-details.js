import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get details of a person by their ID from the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.personId - The unique identifier for the person.
 * @param {boolean} [args.callingData=true] - Include Webex Calling user details in the response.
 * @returns {Promise<Object>} - The details of the person.
 */
const executeFunction = async ({ personId, callingData = true }) => {

  try {
    // Construct the URL with the personId and query parameters
    const url = new URL(getWebexUrl(`/people/${encodeURIComponent(personId)}`));
    url.searchParams.append('callingData', callingData);

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
    console.error('Error fetching person details:', error);
    return { error: 'An error occurred while fetching person details.' };
  }
};

/**
 * Tool configuration for getting person details from Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_person_details',
      description: 'Get details of a person by their ID from Webex Messaging API.',
      parameters: {
        type: 'object',
        properties: {
          personId: {
            type: 'string',
            description: 'The unique identifier for the person.'
          },
          callingData: {
            type: 'boolean',
            description: 'Include Webex Calling user details in the response.'
          }
        },
        required: ['personId']
      }
    }
  }
};

export { apiTool };