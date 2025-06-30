import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to get event details from Webex.
 *
 * @param {Object} args - Arguments for the event details request.
 * @param {string} args.eventId - The unique identifier for the event.
 * @returns {Promise<Object>} - The details of the event.
 */
const executeFunction = async ({ eventId }) => {

  try {
    // Construct the URL with the event ID
    const url = getWebexUrl('/events/${encodeURIComponent(eventId)}');

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
    console.error('Error fetching event details:', error);
    return { error: 'An error occurred while fetching event details.' };
  }
};

/**
 * Tool configuration for getting event details from Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_event_details',
      description: 'Get details for a specific event by event ID.',
      parameters: {
        type: 'object',
        properties: {
          eventId: {
            type: 'string',
            description: 'The unique identifier for the event.'
          }
        },
        required: ['eventId']
      }
    }
  }
};

export { apiTool };