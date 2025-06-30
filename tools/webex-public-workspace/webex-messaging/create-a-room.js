import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a room in Webex.
 *
 * @param {Object} args - Arguments for creating a room.
 * @param {string} args.title - The title of the room.
 * @param {string} args.teamId - The ID of the team to which the room belongs.
 * @param {string} args.classificationId - The classification ID for the room.
 * @param {boolean} [args.isLocked=false] - Whether the room is locked.
 * @param {boolean} [args.isPublic=false] - Whether the room is public.
 * @param {string} [args.description=""] - The description of the room.
 * @param {boolean} [args.isAnnouncementOnly=false] - Whether the room is announcement only.
 * @returns {Promise<Object>} - The result of the room creation.
 */
const executeFunction = async ({ title, teamId, classificationId, isLocked = false, isPublic = false, description = "", isAnnouncementOnly = false }) => {

  try {
    // Construct the request body
    const body = JSON.stringify({
      title,
      teamId,
      classificationId,
      isLocked,
      isPublic,
      description,
      isAnnouncementOnly
    });

    // Set up headers for the request
    const headers = getWebexJsonHeaders();

    // Perform the fetch request
    const response = await fetch(getWebexUrl('/rooms'), {
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
    console.error('Error creating room:', error);
    return { error: 'An error occurred while creating the room.' };
  }
};

/**
 * Tool configuration for creating a room in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_room',
      description: 'Create a room in Webex.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the room.'
          },
          teamId: {
            type: 'string',
            description: 'The ID of the team to which the room belongs.'
          },
          classificationId: {
            type: 'string',
            description: 'The classification ID for the room.'
          },
          isLocked: {
            type: 'boolean',
            description: 'Whether the room is locked.'
          },
          isPublic: {
            type: 'boolean',
            description: 'Whether the room is public.'
          },
          description: {
            type: 'string',
            description: 'The description of the room.'
          },
          isAnnouncementOnly: {
            type: 'boolean',
            description: 'Whether the room is announcement only.'
          }
        },
        required: ['title', 'teamId', 'classificationId']
      }
    }
  }
};

export { apiTool };