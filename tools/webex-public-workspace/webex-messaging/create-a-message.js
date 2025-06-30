import { getWebexUrl, getWebexJsonHeaders } from '../../../lib/webex-config.js';

/**
 * Function to create a message in a Webex room.
 *
 * @param {Object} args - Arguments for creating a message.
 * @param {string} args.roomId - The ID of the room where the message will be sent.
 * @param {string} [args.parentId] - The ID of the parent message (if this is a reply).
 * @param {string} [args.toPersonId] - The ID of the person to whom the message is directed.
 * @param {string} [args.toPersonEmail] - The email of the person to whom the message is directed.
 * @param {string} args.text - The plain text message to send.
 * @param {string} [args.markdown] - The message in markdown format.
 * @param {Array<string>} [args.files] - An array of file URLs to attach to the message.
 * @param {Array<Object>} [args.attachments] - An array of attachment objects.
 * @returns {Promise<Object>} - The response from the Webex API after creating the message.
 */
const executeFunction = async ({ roomId, parentId, toPersonId, toPersonEmail, text, markdown, files = [], attachments = [] }) => {

  try {
    // Construct the message payload (only include defined parameters)
    const payload = {};

    if (roomId) payload.roomId = roomId;
    if (parentId) payload.parentId = parentId;
    if (toPersonId) payload.toPersonId = toPersonId;
    if (toPersonEmail) payload.toPersonEmail = toPersonEmail;
    if (text) payload.text = text;
    if (markdown) payload.markdown = markdown;
    if (files && files.length > 0) payload.files = files;
    if (attachments && attachments.length > 0) payload.attachments = attachments;

    // Get the API URL and headers using the centralized config
    const url = getWebexUrl('/messages');
    const headers = getWebexJsonHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
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
    console.error('Error creating message:', error);
    return {
      error: error.message || 'An error occurred while creating the message.',
      details: error.stack
    };
  }
};

/**
 * Tool configuration for creating a message in a Webex room.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_message',
      description: 'Create a message in a Webex room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room where the message will be sent.'
          },
          parentId: {
            type: 'string',
            description: 'The ID of the parent message (if this is a reply).'
          },
          toPersonId: {
            type: 'string',
            description: 'The ID of the person to whom the message is directed.'
          },
          toPersonEmail: {
            type: 'string',
            description: 'The email of the person to whom the message is directed.'
          },
          text: {
            type: 'string',
            description: 'The plain text message to send.'
          },
          markdown: {
            type: 'string',
            description: 'The message in markdown format.'
          },
          files: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'An array of file URLs to attach to the message.'
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'An array of attachment objects.'
          }
        },
        required: ['roomId', 'text']
      }
    }
  }
};

export { apiTool };