import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list rooms for the authenticated user in Webex.
 *
 * @param {Object} args - Arguments for the room listing.
 * @param {string} [args.teamId] - The ID of the team to list rooms for (optional).
 * @param {string} [args.type] - The type of rooms to list (e.g., group, direct). Cannot be used with orgPublicSpaces.
 * @param {boolean} [args.orgPublicSpaces] - Whether to show the org's public spaces. Cannot be used with type.
 * @param {string} [args.from] - Filters rooms made public after this time.
 * @param {string} [args.to] - Filters rooms made public before this time.
 * @param {string} [args.sortBy="id"] - The field to sort the results by.
 * @param {number} [args.max=100] - The maximum number of rooms to return.
 * @returns {Promise<Object>} - The result of the room listing.
 */
const executeFunction = async ({ teamId, type, orgPublicSpaces, from, to, sortBy = 'id', max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/rooms'));
    if (teamId) url.searchParams.append('teamId', teamId);

    // Note: 'type' and 'orgPublicSpaces' cannot be used together according to Webex API
    if (type) {
      url.searchParams.append('type', type);
    } else if (orgPublicSpaces !== undefined) {
      url.searchParams.append('orgPublicSpaces', orgPublicSpaces.toString());
    }

    if (from) url.searchParams.append('from', from);
    if (to) url.searchParams.append('to', to);
    url.searchParams.append('sortBy', sortBy);
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
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing rooms:', error);
    return { error: 'An error occurred while listing rooms.' };
  }
};

/**
 * Tool configuration for listing rooms in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_rooms',
      description: 'List rooms for the authenticated user in Webex.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'The ID of the team to list rooms for (optional - if not provided, lists all accessible rooms).'
          },
          type: {
            type: 'string',
            enum: ['group', 'direct'],
            description: 'The type of rooms to list. Cannot be used with orgPublicSpaces parameter.'
          },
          orgPublicSpaces: {
            type: 'boolean',
            description: 'Whether to show the org\'s public spaces. Cannot be used with type parameter.'
          },
          from: {
            type: 'string',
            description: 'Filters rooms made public after this time.'
          },
          to: {
            type: 'string',
            description: 'Filters rooms made public before this time.'
          },
          sortBy: {
            type: 'string',
            description: 'The field to sort the results by.'
          },
          max: {
            type: 'integer',
            description: 'The maximum number of rooms to return.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };