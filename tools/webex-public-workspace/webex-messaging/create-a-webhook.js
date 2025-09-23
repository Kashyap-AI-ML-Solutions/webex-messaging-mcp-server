import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a webhook in Webex.
 *
 * @param {Object} args - Arguments for creating the webhook.
 * @param {string} args.name - The name of the webhook.
 * @param {string} args.targetUrl - The target URL for the webhook.
 * @param {string} args.resource - The resource to monitor (e.g., messages).
 * @param {string} args.event - The event to trigger the webhook (e.g., created).
 * @param {string} args.filter - The filter for the webhook.
 * @param {string} args.secret - The secret for the webhook.
 * @param {string} args.ownedBy - The owner of the webhook.
 * @returns {Promise<Object>} - The result of the webhook creation.
 */
const executeFunction = async ({ name, targetUrl, resource, event, filter, secret, ownedBy }) => {

  const data = {
    name,
    targetUrl,
    resource,
    event,
    filter,
    secret,
    ownedBy
  };

  try {
    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Perform the fetch request
    const response = await fetch(getWebexUrl('/webhooks'), {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error creating webhook:', error);
    return { error: 'An error occurred while creating the webhook.' };
  }
};

/**
 * Tool configuration for creating a webhook in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_webhook',
      description: 'Create a webhook in Webex.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the webhook.'
          },
          targetUrl: {
            type: 'string',
            description: 'The target URL for the webhook.'
          },
          resource: {
            type: 'string',
            description: 'The resource to monitor (e.g., messages).'
          },
          event: {
            type: 'string',
            description: 'The event to trigger the webhook (e.g., created).'
          },
          filter: {
            type: 'string',
            description: 'The filter for the webhook.'
          },
          secret: {
            type: 'string',
            description: 'The secret for the webhook.'
          },
          ownedBy: {
            type: 'string',
            description: 'The owner of the webhook.'
          }
        },
        required: ['name', 'resource', 'event', 'targetUrl', 'roomId']
      }
    }
  }
};

export { apiTool };