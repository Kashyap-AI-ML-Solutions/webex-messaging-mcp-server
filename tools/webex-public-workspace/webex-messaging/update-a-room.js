import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update a room in Webex.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.roomId - The unique identifier for the room (required).
 * @param {string} args.title - The title of the room.
 * @param {string} args.classificationId - The classification ID of the room.
 * @param {string} args.teamId - The team ID associated with the room.
 * @param {boolean} [args.isLocked=false] - Indicates if the room is locked.
 * @param {boolean} [args.isPublic=false] - Indicates if the room is public.
 * @param {string} [args.description] - The description of the room.
 * @param {boolean} [args.isAnnouncementOnly=false] - Indicates if the room is announcement only.
 * @param {boolean} [args.isReadOnly=false] - Indicates if the room is read-only.
 * @returns {Promise<Object>} - The result of the room update.
 */
const executeFunction = async ({ roomId, title, classificationId, teamId, isLocked = false, isPublic = false, description, isAnnouncementOnly = false, isReadOnly = false }) => {

  try {
    // Construct the URL
    const url = getWebexUrl(`/rooms/${encodeURIComponent(roomId)}`);

    // Prepare the request body
    const body = JSON.stringify({
      title,
      classificationId,
      teamId,
      isLocked,
      isPublic,
      description: description || ' ',
      isAnnouncementOnly,
      isReadOnly
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
    console.error('Error updating the room:', error);
    return { error: 'An error occurred while updating the room.' };
  }
};

/**
 * Tool configuration for updating a room in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_room',
      description: 'Update a room in Webex.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The unique identifier for the room.'
          },
          title: {
            type: 'string',
            description: 'The title of the room.'
          },
          classificationId: {
            type: 'string',
            description: 'The classification ID of the room.'
          },
          teamId: {
            type: 'string',
            description: 'The team ID associated with the room.'
          },
          isLocked: {
            type: 'boolean',
            description: 'Indicates if the room is locked.'
          },
          isPublic: {
            type: 'boolean',
            description: 'Indicates if the room is public.'
          },
          description: {
            type: 'string',
            description: 'The description of the room.'
          },
          isAnnouncementOnly: {
            type: 'boolean',
            description: 'Indicates if the room is announcement only.'
          },
          isReadOnly: {
            type: 'boolean',
            description: 'Indicates if the room is read-only.'
          }
        },
        required: ['roomId', 'title']
      }
    }
  }
};

export { apiTool };