import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a webhook in Webex.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.webhookId - The unique identifier for the webhook.
 * @param {string} args.name - The name of the webhook.
 * @param {string} args.targetUrl - The target URL for the webhook.
 * @param {string} args.secret - The secret for the webhook.
 * @param {string} args.status - The status of the webhook (e.g., active).
 * @returns {Promise<Object>} - The result of the webhook update.
 */
const executeFunction = async ({ webhookId, name, targetUrl, secret, status }) => {

  try {
    // Construct the URL with the webhook ID
    const url = getWebexUrl('/webhooks/${webhookId}');

    // Prepare the request body
    const body = JSON.stringify({
      name,
      targetUrl,
      secret,
      ownedBy: 'org',
      status
    });

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
    console.error('Error updating webhook:', error);
    return { error: 'An error occurred while updating the webhook.' };
  }
};

/**
 * Tool configuration for updating a webhook in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_webhook',
      description: 'Update a webhook in Webex.',
      parameters: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The unique identifier for the webhook.'
          },
          name: {
            type: 'string',
            description: 'The name of the webhook.'
          },
          targetUrl: {
            type: 'string',
            description: 'The target URL for the webhook.'
          },
          secret: {
            type: 'string',
            description: 'The secret for the webhook.'
          },
          status: {
            type: 'string',
            description: 'The status of the webhook (e.g., active).'
          }
        },
        required: ['webhookId', 'name', 'targetUrl', 'secret', 'status']
      }
    }
  }
};

export { apiTool };