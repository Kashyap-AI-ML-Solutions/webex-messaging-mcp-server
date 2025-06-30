import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a membership in Webex.
 *
 * @param {Object} args - Arguments for the membership update.
 * @param {string} args.membershipId - The unique identifier for the membership.
 * @param {boolean} args.isModerator - Indicates if the user is a moderator.
 * @param {boolean} args.isRoomHidden - Indicates if the room is hidden.
 * @returns {Promise<Object>} - The result of the membership update.
 */
const executeFunction = async ({ membershipId, isModerator, isRoomHidden }) => {

  try {
    // Construct the URL for the membership update
    const url = getWebexUrl(`/memberships/${encodeURIComponent(membershipId)}`);

    // Prepare the request body
    const body = JSON.stringify({
      isModerator,
      isRoomHidden
    });

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

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
    console.error('Error updating membership:', error);
    return { error: 'An error occurred while updating the membership.' };
  }
};

/**
 * Tool configuration for updating a membership in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_membership',
      description: 'Update a membership in Webex.',
      parameters: {
        type: 'object',
        properties: {
          membershipId: {
            type: 'string',
            description: 'The unique identifier for the membership.'
          },
          isModerator: {
            type: 'boolean',
            description: 'Indicates if the user is a moderator.'
          },
          isRoomHidden: {
            type: 'boolean',
            description: 'Indicates if the room is hidden.'
          }
        },
        required: ['membershipId', 'isModerator', 'isRoomHidden']
      }
    }
  }
};

export { apiTool };