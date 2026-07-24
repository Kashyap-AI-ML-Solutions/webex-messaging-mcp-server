const READ_ONLY = Object.freeze({
  readOnlyHint: true,
  openWorldHint: true,
});

const CREATE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
});

const MUTATE = Object.freeze({
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: true,
});

function metadata(annotations, usageGuidance, behaviorSummary) {
  return Object.freeze({
    annotations,
    usageGuidance,
    behaviorSummary,
  });
}

const createResult = (record) =>
  `Requires Webex write access, takes effect immediately, is non-idempotent, and returns ${record} or an error result without automatically retrying rate limits.`;

const readResult = (record) =>
  `Read-only; requires Webex access and returns ${record} or an error result without automatically retrying rate limits.`;

const updateResult = (record) =>
  `Requires Webex write access, changes existing state, is idempotent for identical input, and returns ${record} or an error result without automatically retrying rate limits.`;

const deleteResult = (resource) =>
  `Permanently removes ${resource} and is not reversible through this server; requires Webex write access and returns confirmation or an error result without automatically retrying rate limits.`;

export const toolQualityMetadata = Object.freeze({
  create_attachment_action: metadata(
    CREATE,
    "Use to submit an existing message attachment action; to send or change the message, use create_message or edit_message instead.",
    "Requires Webex write access, can trigger downstream application behavior, is non-idempotent, and returns the action record or an error result without automatically retrying rate limits.",
  ),
  create_ecm_folder: metadata(
    CREATE,
    "Use for a new room ECM folder link; to change or remove one, use update_ecm_linked_folder or unlink_ecm_linked_folder instead.",
    createResult("the folder configuration"),
  ),
  create_membership: metadata(
    CREATE,
    "Use to add an existing person to a room; to add someone to a team, use create_team_membership instead.",
    createResult("the membership record"),
  ),
  create_message: metadata(
    CREATE,
    "Use to send a new room message, direct message, or reply; to change an existing message, use edit_message instead.",
    "Requires Webex write access, sends immediately, is non-idempotent, and returns the message record or an error result without automatically retrying rate limits.",
  ),
  create_person: metadata(
    CREATE,
    "Use to provision a person in the organization; to grant room access to an existing person, use create_membership instead.",
    createResult("the person record"),
  ),
  create_room: metadata(
    CREATE,
    "Use for a new Webex space; to change an existing space, use update_room instead.",
    createResult("the room record"),
  ),
  create_room_tab: metadata(
    CREATE,
    "Use to add a web tab to an existing room; to change an existing tab, use update_room_tab instead.",
    createResult("the room tab record"),
  ),
  create_team: metadata(
    CREATE,
    "Use for a new team container; to create a conversation space, use create_room instead.",
    createResult("the team record"),
  ),
  create_team_membership: metadata(
    CREATE,
    "Use to add an existing person to a team; to add someone to one room, use create_membership instead.",
    createResult("the team membership record"),
  ),
  create_webhook: metadata(
    CREATE,
    "Use to register a new event subscription; to change an existing subscription, use update_webhook instead.",
    "Requires Webex write access, creates future requests to the configured target, is non-idempotent, and returns the webhook record or an error result without automatically retrying rate limits.",
  ),
  delete_membership: metadata(
    MUTATE,
    "Use only to permanently remove a room member; to change moderator state, use update_membership instead.",
    deleteResult("the room membership"),
  ),
  delete_message: metadata(
    MUTATE,
    "Use only to permanently remove a message; to correct its content, use edit_message instead.",
    deleteResult("the message"),
  ),
  delete_person: metadata(
    MUTATE,
    "Use only to deprovision a person; to remove access to one room, use delete_membership instead.",
    deleteResult("the person from the organization"),
  ),
  delete_room: metadata(
    MUTATE,
    "Use only to permanently remove a room; to change its metadata or settings, use update_room instead.",
    deleteResult("the room"),
  ),
  delete_room_tab: metadata(
    MUTATE,
    "Use only to permanently remove a room tab; to change its name or URL, use update_room_tab instead.",
    deleteResult("the room tab"),
  ),
  delete_team: metadata(
    MUTATE,
    "Use only to permanently remove a team; to change its metadata, use update_team instead.",
    deleteResult("the team"),
  ),
  delete_team_membership: metadata(
    MUTATE,
    "Use only to permanently remove a team member; to change moderator state, use update_team_membership instead.",
    deleteResult("the team membership"),
  ),
  delete_webhook: metadata(
    MUTATE,
    "Use only to remove a subscription; to change its target or filter, use update_webhook instead.",
    deleteResult("the webhook subscription"),
  ),
  edit_message: metadata(
    MUTATE,
    "Use to change an existing message; to send a new message, use create_message instead.",
    updateResult("the updated message record"),
  ),
  get_attachment_action_details: metadata(
    READ_ONLY,
    "Use when the attachment action ID is known; to submit a new action, use create_attachment_action instead.",
    readResult("the attachment action record"),
  ),
  get_ecm_folder_details: metadata(
    READ_ONLY,
    "Use when the ECM folder ID is known; to discover the folder linked to a room, use list_ecm_folder instead.",
    readResult("the folder record"),
  ),
  get_event_details: metadata(
    READ_ONLY,
    "Use when the event ID is known; to search organization events, use list_events instead.",
    readResult("the event record"),
  ),
  get_membership_details: metadata(
    READ_ONLY,
    "Use when the room membership ID is known; to discover room members, use list_memberships instead.",
    readResult("the membership record"),
  ),
  get_message_details: metadata(
    READ_ONLY,
    "Use when the message ID is known; to browse a room conversation, use list_messages instead.",
    readResult("the message record"),
  ),
  get_my_own_details: metadata(
    READ_ONLY,
    "Use for the authenticated user's profile; to retrieve another person, use get_person_details instead.",
    readResult("the authenticated person record"),
  ),
  get_person_details: metadata(
    READ_ONLY,
    "Use when another person's ID is known; to search the organization directory, use list_people instead.",
    readResult("the person record"),
  ),
  get_room_details: metadata(
    READ_ONLY,
    "Use when the room ID is known; to discover accessible rooms, use list_rooms instead.",
    readResult("the room record"),
  ),
  get_room_meeting_details: metadata(
    READ_ONLY,
    "Use for meeting information associated with a known room; for room metadata, use get_room_details instead.",
    readResult("the room meeting record"),
  ),
  get_room_tab_details: metadata(
    READ_ONLY,
    "Use when the room tab ID is known; to discover tabs in a room, use list_room_tabs instead.",
    readResult("the room tab record"),
  ),
  get_team_details: metadata(
    READ_ONLY,
    "Use when the team ID is known; to discover accessible teams, use list_teams instead.",
    readResult("the team record"),
  ),
  get_team_membership_details: metadata(
    READ_ONLY,
    "Use when the team membership ID is known; to discover team members, use list_team_memberships instead.",
    readResult("the team membership record"),
  ),
  get_webhook_details: metadata(
    READ_ONLY,
    "Use when the webhook ID is known; to discover subscriptions, use list_webhooks instead.",
    readResult("the webhook record"),
  ),
  list_direct_messages: metadata(
    READ_ONLY,
    "Use for a one-to-one conversation identified by person; for messages in a known room, use list_messages instead.",
    readResult("the direct-message collection response"),
  ),
  list_ecm_folder: metadata(
    READ_ONLY,
    "Use to discover the ECM folder linked to a known room; for a known folder ID, use get_ecm_folder_details instead.",
    readResult("the linked-folder response"),
  ),
  list_events: metadata(
    READ_ONLY,
    "Use to search or filter organization event history; for a known event ID, use get_event_details instead.",
    readResult("the event collection response"),
  ),
  list_memberships: metadata(
    READ_ONLY,
    "Use to discover or filter members of a room; for a known membership ID, use get_membership_details instead.",
    readResult("the membership collection response"),
  ),
  list_messages: metadata(
    READ_ONLY,
    "Use to browse messages from a known room; for a one-to-one conversation by person, use list_direct_messages instead.",
    readResult("the message collection response"),
  ),
  list_people: metadata(
    READ_ONLY,
    "Use to search the organization directory; for a known person ID, use get_person_details instead.",
    readResult("the people collection response"),
  ),
  list_room_tabs: metadata(
    READ_ONLY,
    "Use to discover tabs in a known room; for a known tab ID, use get_room_tab_details instead.",
    readResult("the room-tab collection response"),
  ),
  list_rooms: metadata(
    READ_ONLY,
    "Use to discover or filter accessible rooms; for one known room, use get_room_details instead.",
    readResult("the room collection response"),
  ),
  list_team_memberships: metadata(
    READ_ONLY,
    "Use to discover members of a known team; for a known membership ID, use get_team_membership_details instead.",
    readResult("the team-membership collection response"),
  ),
  list_teams: metadata(
    READ_ONLY,
    "Use to discover accessible teams; for one known team, use get_team_details instead.",
    readResult("the team collection response"),
  ),
  list_webhooks: metadata(
    READ_ONLY,
    "Use to discover organization webhook subscriptions; for one known webhook, use get_webhook_details instead.",
    readResult("the webhook collection response"),
  ),
  unlink_ecm_linked_folder: metadata(
    MUTATE,
    "Use to remove a room's ECM link while retaining the folder; to change the link, use update_ecm_linked_folder instead.",
    "Removes only the Webex link and preserves the external folder; requires Webex write access and returns confirmation or an error result without automatically retrying rate limits.",
  ),
  update_ecm_linked_folder: metadata(
    MUTATE,
    "Use to change an existing ECM folder link; to create or remove one, use create_ecm_folder or unlink_ecm_linked_folder instead.",
    updateResult("the updated folder-link record"),
  ),
  update_membership: metadata(
    MUTATE,
    "Use to change moderator state for a room member; to add or remove one, use create_membership or delete_membership instead.",
    updateResult("the updated membership record"),
  ),
  update_person: metadata(
    MUTATE,
    "Use to change an existing person's Webex profile; to provision a new person, use create_person instead.",
    updateResult("the updated person record"),
  ),
  update_room: metadata(
    MUTATE,
    "Use to change an existing room's metadata or settings; to create a new room, use create_room instead.",
    updateResult("the updated room record"),
  ),
  update_room_tab: metadata(
    MUTATE,
    "Use to change an existing room tab; to add a new tab, use create_room_tab instead.",
    updateResult("the updated room-tab record"),
  ),
  update_team: metadata(
    MUTATE,
    "Use to change an existing team's metadata; to create a new team, use create_team instead.",
    updateResult("the updated team record"),
  ),
  update_team_membership: metadata(
    MUTATE,
    "Use to change moderator state for a team member; to add or remove one, use create_team_membership or delete_team_membership instead.",
    updateResult("the updated team-membership record"),
  ),
  update_webhook: metadata(
    MUTATE,
    "Use to change an existing webhook; to register or remove one, use create_webhook or delete_webhook instead.",
    updateResult("the updated webhook record"),
  ),
});

export function enhanceToolDefinition(tool) {
  const definition = tool?.definition?.function;
  const metadataEntry = toolQualityMetadata[definition?.name];

  if (!metadataEntry) {
    throw new Error(
      `Missing tool quality metadata for ${definition?.name ?? "unknown tool"}`,
    );
  }

  return {
    ...tool,
    annotations: { ...metadataEntry.annotations },
    definition: {
      ...tool.definition,
      function: {
        ...definition,
        description: [
          definition.description,
          metadataEntry.usageGuidance,
          metadataEntry.behaviorSummary,
        ].join(" "),
      },
    },
  };
}
