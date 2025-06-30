import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create an ECM folder configuration in Webex.
 *
 * @param {Object} args - Arguments for the folder configuration.
 * @param {string} args.roomId - The ID of the room where the folder will be linked.
 * @param {string} args.contentUrl - The URL of the content associated with the folder.
 * @param {string} args.displayName - The display name for the folder.
 * @param {string} args.driveId - The ID of the drive where the folder is located.
 * @param {string} args.itemId - The ID of the item (folder) to be linked.
 * @param {boolean} [args.defaultFolder=false] - Whether this folder is the default folder.
 * @returns {Promise<Object>} - The result of the folder creation request.
 */
const executeFunction = async ({ roomId, contentUrl, displayName, driveId, itemId, defaultFolder = false }) => {

  const url = getWebexUrl('/room/linkedFolders');

  const headers = getWebexJsonHeaders();

  const body = JSON.stringify({
    roomId,
    contentUrl,
    displayName,
    driveId,
    itemId,
    defaultFolder
  });

  try {
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
    console.error('Error creating ECM folder configuration:', error);
    return { error: 'An error occurred while creating the ECM folder configuration.' };
  }
};

/**
 * Tool configuration for creating an ECM folder configuration in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_ecm_folder',
      description: 'Create an ECM folder configuration in Webex.',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'string',
            description: 'The ID of the room where the folder will be linked.'
          },
          contentUrl: {
            type: 'string',
            description: 'The URL of the content associated with the folder.'
          },
          displayName: {
            type: 'string',
            description: 'The display name for the folder.'
          },
          driveId: {
            type: 'string',
            description: 'The ID of the drive where the folder is located.'
          },
          itemId: {
            type: 'string',
            description: 'The ID of the item (folder) to be linked.'
          },
          defaultFolder: {
            type: 'boolean',
            description: 'Whether this folder is the default folder.'
          }
        },
        required: ['roomId', 'contentUrl', 'displayName', 'driveId', 'itemId']
      }
    }
  }
};

export { apiTool };