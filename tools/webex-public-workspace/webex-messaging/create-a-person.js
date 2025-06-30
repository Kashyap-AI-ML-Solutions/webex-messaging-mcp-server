import { getWebexUrl, getWebexHeaders, getWebexJsonHeaders } from '../../../lib/webex-config.js';
/**
 * Function to create a new person in Webex.
 *
 * @param {Object} personData - The data for the person to be created.
 * @param {Array<string>} personData.emails - The email addresses associated with the person.
 * @param {Array<Object>} personData.phoneNumbers - The phone numbers associated with the person.
 * @param {string} personData.extension - The extension number for the person.
 * @param {string} personData.locationId - The location ID for the person.
 * @param {string} personData.displayName - The display name of the person.
 * @param {string} personData.firstName - The first name of the person.
 * @param {string} personData.lastName - The last name of the person.
 * @param {string} personData.avatar - The avatar URL for the person.
 * @param {string} personData.orgId - The organization ID for the person.
 * @param {Array<string>} personData.roles - The roles assigned to the person.
 * @param {Array<string>} personData.licenses - The licenses associated with the person.
 * @param {string} personData.department - The department of the person.
 * @param {string} personData.manager - The name of the manager for the person.
 * @param {string} personData.managerId - The manager ID for the person.
 * @param {string} personData.title - The title of the person.
 * @param {Array<Object>} personData.addresses - The addresses associated with the person.
 * @param {Array<string>} personData.siteUrls - The site URLs associated with the person.
 * @returns {Promise<Object>} - The result of the person creation.
 */
const executeFunction = async (personData) => {

  try {
    const url = getWebexUrl('/people?callingData=true&minResponse=true');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(personData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating person:', error);
    return { error: 'An error occurred while creating the person.' };
  }
};

/**
 * Tool configuration for creating a person in Webex.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_person',
      description: 'Create a new person in Webex.',
      parameters: {
        type: 'object',
        properties: {
          emails: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The email addresses associated with the person.'
          },
          phoneNumbers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                value: { type: 'string' }
              }
            },
            description: 'The phone numbers associated with the person.'
          },
          extension: { type: 'string', description: 'The extension number for the person.' },
          locationId: { type: 'string', description: 'The location ID for the person.' },
          displayName: { type: 'string', description: 'The display name of the person.' },
          firstName: { type: 'string', description: 'The first name of the person.' },
          lastName: { type: 'string', description: 'The last name of the person.' },
          avatar: { type: 'string', description: 'The avatar URL for the person.' },
          orgId: { type: 'string', description: 'The organization ID for the person.' },
          roles: {
            type: 'array',
            items: { type: 'string' },
            description: 'The roles assigned to the person.'
          },
          licenses: {
            type: 'array',
            items: { type: 'string' },
            description: 'The licenses associated with the person.'
          },
          department: { type: 'string', description: 'The department of the person.' },
          manager: { type: 'string', description: 'The name of the manager for the person.' },
          managerId: { type: 'string', description: 'The manager ID for the person.' },
          title: { type: 'string', description: 'The title of the person.' },
          addresses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                country: { type: 'string' },
                locality: { type: 'string' },
                region: { type: 'string' },
                streetAddress: { type: 'string' },
                postalCode: { type: 'string' }
              }
            },
            description: 'The addresses associated with the person.'
          },
          siteUrls: {
            type: 'array',
            items: { type: 'string' },
            description: 'The site URLs associated with the person.'
          }
        },
        required: ['emails', 'firstName', 'lastName']
      }
    }
  }
};

export { apiTool };