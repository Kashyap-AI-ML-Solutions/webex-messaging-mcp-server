import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to update an ECM linked folder in Webex.
 *
 * @param {Object} args - Arguments for updating the linked folder.
 * @param {string} args.id - The unique identifier for the room folder.
 * @param {string} args.roomId - The room ID associated with the folder.
 * @param {string} args.contentUrl - The URL for the content.
 * @param {string} args.displayName - The display name for the folder.
 * @param {string} args.driveId - The ID of the drive.
 * @param {string} args.itemId - The ID of the item.
 * @param {boolean} [args.defaultFolder=false] - Whether this is the default folder.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const executeFunction = async ({ id, roomId, contentUrl, displayName, driveId, itemId, defaultFolder = false }) => {

  try {
    const url = getWebexUrl(`/room/linkedFolders/${encodeURIComponent(id)}`);
    const body = JSON.stringify({
      roomId,
      contentUrl,
      displayName,
      driveId,
      itemId,
      defaultFolder
    });

    const headers = getWebexJsonHeaders();

    const response = await fetch(url, {
      method: 'PUT',
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
    console.error('Error updating linked folder:', error);
    return { error: 'An error occurred while updating the linked folder.' };
  }
};

/**
 * Tool configuration for updating an ECM linked folder in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_ecm_linked_folder',
      description: 'Update an ECM linked folder in Webex.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique identifier for the room folder.'
          },
          roomId: {
            type: 'string',
            description: 'The room ID associated with the folder.'
          },
          contentUrl: {
            type: 'string',
            description: 'The URL for the content.'
          },
          displayName: {
            type: 'string',
            description: 'The display name for the folder.'
          },
          driveId: {
            type: 'string',
            description: 'The ID of the drive.'
          },
          itemId: {
            type: 'string',
            description: 'The ID of the item.'
          },
          defaultFolder: {
            type: 'boolean',
            description: 'Whether this is the default folder.'
          }
        },
        required: ['id', 'roomId', 'contentUrl', 'displayName', 'driveId', 'itemId']
      }
    }
  }
};

export { apiTool };