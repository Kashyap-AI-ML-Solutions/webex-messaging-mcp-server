import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list people in an organization using the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.email] - List people with this email address. For non-admin requests, either this or `displayName` are required.
 * @param {string} [args.displayName] - List people whose name starts with this string. For non-admin requests, either this or email are required.
 * @param {string} [args.id] - List people by ID. Accepts up to 85 person IDs separated by commas.
 * @param {string} [args.orgId] - List people in this organization. Only admin users of another organization may use this parameter.
 * @param {string} [args.roles] - List of roleIds separated by commas.
 * @param {boolean} [args.callingData] - Include Webex Calling user details in the response.
 * @param {string} [args.locationId] - List people present in this location.
 * @param {number} [args.max=100] - Limit the maximum number of people in the response.
 * @returns {Promise<Object>} - The result of the people listing.
 */
const executeFunction = async ({ email, displayName, id, orgId, roles, callingData = true, locationId, max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/people'));
    if (email) url.searchParams.append('email', email);
    if (displayName) url.searchParams.append('displayName', displayName);
    if (id) url.searchParams.append('id', id);
    if (orgId) url.searchParams.append('orgId', orgId);
    if (roles) url.searchParams.append('roles', roles);
    if (locationId) url.searchParams.append('locationId', locationId);
    url.searchParams.append('callingData', callingData.toString());
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
    console.error('Error listing people:', error);
    return { error: 'An error occurred while listing people.' };
  }
};

/**
 * Tool configuration for listing people in an organization using the Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_people',
      description: 'List people in an organization using the Webex Messaging API.',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'List people with this email address. For non-admin requests, either this or displayName are required.'
          },
          displayName: {
            type: 'string',
            description: 'List people whose name starts with this string. For non-admin requests, either this or email are required.'
          },
          id: {
            type: 'string',
            description: 'List people by ID. Accepts up to 85 person IDs separated by commas.'
          },
          orgId: {
            type: 'string',
            description: 'List people in this organization. Only admin users of another organization may use this parameter.'
          },
          roles: {
            type: 'string',
            description: 'List of roleIds separated by commas.'
          },
          callingData: {
            type: 'boolean',
            description: 'Include Webex Calling user details in the response.'
          },
          locationId: {
            type: 'string',
            description: 'List people present in this location.'
          },
          max: {
            type: 'integer',
            description: 'Limit the maximum number of people in the response.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };