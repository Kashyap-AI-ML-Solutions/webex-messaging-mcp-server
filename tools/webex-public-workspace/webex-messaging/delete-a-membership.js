import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to delete a membership by ID in Webex.
 *
 * @param {Object} args - Arguments for the delete operation.
 * @param {string} args.membershipId - The unique identifier for the membership to be deleted.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
const executeFunction = async ({ membershipId }) => {

  try {
    // Construct the URL with the membership ID
    const url = getWebexUrl(`/memberships/${encodeURIComponent(membershipId)}`);

    // Set up headers for the request
    const headers = getWebexHeaders();

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Return the response status
    return { status: response.status, message: 'Membership deleted successfully.' };
  } catch (error) {
    console.error('Error deleting membership:', error);
    return { error: 'An error occurred while deleting the membership.' };
  }
};

/**
 * Tool configuration for deleting a membership in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_membership',
      description: 'Delete a membership by ID in Webex.',
      parameters: {
        type: 'object',
        properties: {
          membershipId: {
            type: 'string',
            description: 'The unique identifier for the membership to be deleted.'
          }
        },
        required: ['membershipId']
      }
    }
  }
};

export { apiTool };