import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get details of a webhook by its ID from the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the webhook details request.
 * @param {string} args.webhookId - The unique identifier for the webhook.
 * @returns {Promise<Object>} - The details of the webhook.
 */
const executeFunction = async ({ webhookId }) => {

  try {
    // Construct the URL with the webhook ID
    const url = getWebexUrl('/webhooks/${encodeURIComponent(webhookId)}');

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
    console.error('Error fetching webhook details:', error);
    return { error: 'An error occurred while fetching webhook details.' };
  }
};

/**
 * Tool configuration for getting webhook details from the Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_webhook_details',
      description: 'Get details of a webhook by its ID.',
      parameters: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The unique identifier for the webhook.'
          }
        },
        required: ['webhookId']
      }
    }
  }
};

export { apiTool };