import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a webhook by its ID from the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the delete operation.
 * @param {string} args.webhookId - The unique identifier for the webhook to be deleted.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
const executeFunction = async ({ webhookId }) => {

  try {
    // Construct the URL for the delete request
    const url = getWebexUrl('/webhooks/${webhookId}');

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Return the response data
    return { status: response.status, message: 'Webhook deleted successfully.' };
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return { error: 'An error occurred while deleting the webhook.' };
  }
};

/**
 * Tool configuration for deleting a webhook from the Webex Messaging API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_webhook',
      description: 'Delete a webhook by its ID from the Webex Messaging API.',
      parameters: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'The unique identifier for the webhook to be deleted.'
          }
        },
        required: ['webhookId']
      }
    }
  }
};

export { apiTool };