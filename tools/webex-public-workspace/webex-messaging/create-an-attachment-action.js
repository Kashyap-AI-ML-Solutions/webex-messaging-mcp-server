import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create an attachment action in Webex.
 *
 * @param {Object} args - Arguments for creating the attachment action.
 * @param {string} args.type - The type of the action (e.g., "submit").
 * @param {string} args.messageId - The ID of the message to which the attachment is related.
 * @param {Object} args.inputs - The inputs for the attachment action.
 * @param {string} args.inputs.Name - The name associated with the action.
 * @param {string} args.inputs.Url - The URL associated with the action.
 * @param {string} args.inputs.Email - The email associated with the action.
 * @param {string} args.inputs.Tel - The telephone number associated with the action.
 * @returns {Promise<Object>} - The result of the attachment action creation.
 */
const executeFunction = async ({ type, messageId, inputs }) => {

  try {
    // Construct the URL for the request
    const url = getWebexUrl('/attachment/actions');

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Create the body of the request
    const body = JSON.stringify({
      type,
      messageId,
      inputs
    });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error creating attachment action:', error);
    return { error: 'An error occurred while creating the attachment action.' };
  }
};

/**
 * Tool configuration for creating an attachment action in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_attachment_action',
      description: 'Create a new attachment action in Webex.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'The type of the action (e.g., "submit").'
          },
          messageId: {
            type: 'string',
            description: 'The ID of the message to which the attachment is related.'
          },
          inputs: {
            type: 'object',
            properties: {
              Name: {
                type: 'string',
                description: 'The name associated with the action.'
              },
              Url: {
                type: 'string',
                description: 'The URL associated with the action.'
              },
              Email: {
                type: 'string',
                description: 'The email associated with the action.'
              },
              Tel: {
                type: 'string',
                description: 'The telephone number associated with the action.'
              }
            },
            required: ['Name', 'Url', 'Email', 'Tel']
          }
        },
        required: ['messageId', 'inputs']
      }
    }
  }
};

export { apiTool };