import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to list events in an organization using the Webex Messaging API.
 *
 * @param {Object} args - Arguments for the event listing.
 * @param {string} args.resource - The resource type to filter events (default is "messages").
 * @param {string} args.type - The type of events to list (default is "created").
 * @param {string} args.actorId - The ID of the actor to filter events.
 * @param {string} args.from - The start date to filter events.
 * @param {string} args.to - The end date to filter events.
 * @param {number} args.max - The maximum number of events to return (default is 100).
 * @returns {Promise<Object>} - The result of the event listing.
 */
const executeFunction = async ({ resource = 'messages', type = 'created', actorId, from, to, max = 100 }) => {

  try {
    // Construct the URL with query parameters
    const url = new URL(getWebexUrl('/events'));
    url.searchParams.append('resource', resource);
    url.searchParams.append('type', type);
    url.searchParams.append('actorId', actorId);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
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
    console.error('Error listing events:', error);
    return { error: 'An error occurred while listing events.' };
  }
};

/**
 * Tool configuration for listing events in Webex Messaging.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_events',
      description: 'List events in your organization using the Webex Messaging API.',
      parameters: {
        type: 'object',
        properties: {
          resource: {
            type: 'string',
            description: 'The resource type to filter events.'
          },
          type: {
            type: 'string',
            description: 'The type of events to list.'
          },
          actorId: {
            type: 'string',
            description: 'The ID of the actor to filter events.'
          },
          from: {
            type: 'string',
            description: 'The start date to filter events.'
          },
          to: {
            type: 'string',
            description: 'The end date to filter events.'
          },
          max: {
            type: 'integer',
            description: 'The maximum number of events to return.'
          }
        },
        required: ['actorId', 'from', 'to']
      }
    }
  }
};

export { apiTool };