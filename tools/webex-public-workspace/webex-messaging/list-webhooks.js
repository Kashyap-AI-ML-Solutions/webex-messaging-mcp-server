import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list all webhooks for the organization.
 *
 * @param {Object} args - Arguments for the webhook listing.
 * @param {number} [args.max=100] - Limit the maximum number of webhooks in the response.
 * @param {string} [args.ownedBy='org'] - Limit the result list to organization-wide webhooks.
 * @returns {Promise<Object>} - The result of the webhook listing.
 */
const executeFunction = async ({ max = 100, ownedBy = 'org' }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/webhooks'));
    url.searchParams.append('max', max.toString());
    url.searchParams.append('ownedBy', ownedBy);

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
    console.error('Error listing webhooks:', error);
    return { error: 'An error occurred while listing webhooks.' };
  }
};

/**
 * Tool configuration for listing webhooks on Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_webhooks',
      description: 'List all webhooks for the organization.',
      parameters: {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            description: 'Limit the maximum number of webhooks in the response.'
          },
          ownedBy: {
            type: 'string',
            enum: ['org'],
            description: 'Limit the result list to organization-wide webhooks.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };