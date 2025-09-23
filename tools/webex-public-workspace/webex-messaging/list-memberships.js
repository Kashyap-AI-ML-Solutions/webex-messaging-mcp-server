import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list memberships in a Webex room.
 *
 * @param {Object} args - Arguments for the membership listing.
 * @param {string} args.roomId - The ID of the room to list memberships for.
 * @param {string} [args.personId] - The ID of the person to filter memberships by.
 * @param {string} [args.personEmail] - The email address of the person to filter memberships by.
 * @param {number} [args.max=100] - The maximum number of memberships to return.
 * @returns {Promise<Object>} - The result of the memberships listing.
 */
const executeFunction = async ({ roomId, personId, personEmail, max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/memberships'));
    url.searchParams.append('roomId', roomId);
    if (personId) url.searchParams.append('personId', personId);
    if (personEmail) url.searchParams.append('personEmail', personEmail);
    url.searchParams.append('max', max.toString());

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
    console.error('Error listing memberships:', error);
    return { error: 'An error occurred while listing memberships.' };
  }
};

/**
 * Tool configuration for listing memberships in a Webex room.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_memberships',
      description: 'List memberships in a Webex room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room to list memberships for.'
          },
          personId: {
            type: 'string',
            description: 'The ID of the person to filter memberships by.'
          },
          personEmail: {
            type: 'string',
            description: 'The email address of the person to filter memberships by.'
          },
          max: {
            type: 'integer',
            description: 'The maximum number of memberships to return.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };