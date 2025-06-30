import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a membership in a Webex room.
 *
 * @param {Object} args - Arguments for creating a membership.
 * @param {string} args.roomId - The ID of the room to which the member is being added.
 * @param {string} args.personId - The ID of the person to be added to the room.
 * @param {string} args.personEmail - The email of the person to be added to the room.
 * @param {boolean} [args.isModerator=false] - Whether the person should be a moderator in the room.
 * @returns {Promise<Object>} - The result of the membership creation.
 */
const executeFunction = async ({ roomId, personId, personEmail, isModerator = false }) => {

  try {
    const url = getWebexUrl('/memberships');

    // Build request body - include either personId OR personEmail, not both
    const requestBody = {
      roomId,
      isModerator
    };

    if (personId) {
      requestBody.personId = personId;
    } else if (personEmail) {
      requestBody.personEmail = personEmail;
    }

    const body = JSON.stringify(requestBody);

    const headers = getWebexJsonHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating membership:', error);
    return { error: 'An error occurred while creating the membership.' };
  }
};

/**
 * Tool configuration for creating a membership in a Webex room.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_membership',
      description: 'Create a membership in a Webex room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room to which the member is being added.'
          },
          personId: {
            type: 'string',
            description: 'The ID of the person to be added to the room.'
          },
          personEmail: {
            type: 'string',
            description: 'The email of the person to be added to the room.'
          },
          isModerator: {
            type: 'boolean',
            description: 'Whether the person should be a moderator in the room.'
          }
        },
        required: ['roomId', 'personId', 'personEmail']
      }
    }
  }
};

export { apiTool };