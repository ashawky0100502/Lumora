/**
 * OWNER INBOX API
 * Wraps supabase/owner_inbox.sql. Two sides:
 *   - visitor* : called by anyone browsing pre-account (VisitorChat.jsx),
 *     scoped to their own thread via visitorIdentity.js's token.
 *   - owner*   : called from the dashboard (MessagesView.jsx / InboxSettings.jsx).
 * Mirrors the call shape used in coupleApi.js / guestApi.js.
 */
import { supabaseClient } from './supabaseClient';

/* --------------------------------- Visitor -------------------------------- */

export async function openVisitorConversation(visitorToken, { visitorName, visitorEmail, source, templateId, templateName } = {}) {
  const { data, error } = await supabaseClient.rpc('visitor_open_conversation', {
    p_visitor_token: visitorToken,
    p_visitor_name: visitorName || null,
    p_source: source || 'quick_order',
    p_template_id: templateId || null,
    p_template_name: templateName || null,
    p_visitor_email: visitorEmail || null,
  });
  if (error) throw error;
  return data;
}

export async function sendVisitorMessage(visitorToken, text) {
  const { error } = await supabaseClient.rpc('visitor_send_message', {
    p_visitor_token: visitorToken,
    p_text: text,
  });
  if (error) throw error;
}

// attachment: { kind: 'image'|'audio', url, path, name, size, mime }
export async function sendVisitorAttachment(visitorToken, attachment) {
  const { error } = await supabaseClient.rpc('visitor_send_attachment', {
    p_visitor_token: visitorToken,
    p_kind: attachment.kind,
    p_url: attachment.url,
    p_path: attachment.path,
    p_name: attachment.name || null,
    p_size: attachment.size || null,
    p_mime: attachment.mime || null,
  });
  if (error) throw error;
}

// Ownership-checked: only deletes a message that both belongs to this
// visitor's own conversation AND was sent by them (see chat_attachments.sql)
// — unlike ownerDeleteMessage below, which is dashboard-only and open.
export async function visitorDeleteMessage(visitorToken, messageId) {
  const { error } = await supabaseClient.rpc('visitor_delete_message', {
    p_visitor_token: visitorToken,
    p_message_id: messageId,
  });
  if (error) throw error;
}

export async function getVisitorThread(visitorToken) {
  const { data, error } = await supabaseClient.rpc('visitor_get_thread', { p_visitor_token: visitorToken });
  if (error) throw error;
  return data || [];
}

export async function getPublicOwnerStatus() {
  const { data, error } = await supabaseClient.rpc('get_public_owner_status');
  if (error) throw error;
  return !!data;
}

/* ---------------------------------- Owner ---------------------------------- */

export async function ownerListConversations() {
  const { data, error } = await supabaseClient.rpc('owner_list_conversations');
  if (error) throw error;
  return data || [];
}

export async function ownerGetConversationMessages(conversationId) {
  const { data, error } = await supabaseClient.rpc('owner_get_conversation_messages', {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
  return data || [];
}

export async function ownerSendReply(conversationId, text) {
  const { error } = await supabaseClient.rpc('owner_send_reply', {
    p_conversation_id: conversationId,
    p_text: text,
  });
  if (error) throw error;
}

// attachment: { kind: 'image'|'audio', url, path, name, size, mime }
export async function ownerSendAttachment(conversationId, attachment) {
  const { error } = await supabaseClient.rpc('owner_send_attachment', {
    p_conversation_id: conversationId,
    p_kind: attachment.kind,
    p_url: attachment.url,
    p_path: attachment.path,
    p_name: attachment.name || null,
    p_size: attachment.size || null,
    p_mime: attachment.mime || null,
  });
  if (error) throw error;
}

// Every attachment storage path in a conversation — used to wipe the
// actual files from the 'media' bucket before the conversation row (and
// its messages, via cascade) gets deleted. See chatAttachmentsApi.js.
export async function ownerGetConversationAttachmentPaths(conversationId) {
  const { data, error } = await supabaseClient.rpc('get_conversation_attachment_paths', {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
  return (data || []).map((r) => r.path).filter(Boolean);
}

export async function ownerGetSettings() {
  const { data, error } = await supabaseClient.rpc('owner_get_settings');
  if (error) throw error;
  return data;
}

export async function ownerSetOnline(isOnline) {
  const { error } = await supabaseClient.rpc('owner_set_online', { p_is_online: isOnline });
  if (error) throw error;
}

export async function ownerUpdateAutoReply(text) {
  const { error } = await supabaseClient.rpc('owner_update_auto_reply', { p_text: text });
  if (error) throw error;
}

export async function ownerUpdatePaymentMethods(methods) {
  const { error } = await supabaseClient.rpc('owner_update_payment_methods', { p_methods: methods });
  if (error) throw error;
}

export async function ownerDeleteMessage(messageId) {
  const { error } = await supabaseClient.rpc('owner_delete_message', { p_message_id: messageId });
  if (error) throw error;
}

export async function ownerDeleteConversation(conversationId) {
  const { error } = await supabaseClient.rpc('owner_delete_conversation', { p_conversation_id: conversationId });
  if (error) throw error;
}

export async function ownerSetArchived(conversationId, archived) {
  const { error } = await supabaseClient.rpc('owner_set_archived', { p_conversation_id: conversationId, p_archived: archived });
  if (error) throw error;
}

export async function ownerSetBlocked(conversationId, blocked) {
  const { error } = await supabaseClient.rpc('owner_set_blocked', { p_conversation_id: conversationId, p_blocked: blocked });
  if (error) throw error;
}

/* --------------------------------- Realtime --------------------------------- */

// Each subscriber gets its own channel name (rather than everyone sharing
// one fixed name) — without this, Sidebar's unread badge and the open
// Messages panel both trying to open "owner_conversations_all" at the same
// time collided: Supabase reuses a channel instance for a repeated topic
// name, and calling .on()/.subscribe() on one that's already subscribed
// throws "cannot add postgres_changes callbacks ... after subscribe()".
// React StrictMode's mount→unmount→mount in dev made this even more likely
// to hit, since the old channel's teardown could still be in flight.
let channelSeq = 0;
function uniqueChannelName(prefix) {
  channelSeq += 1;
  return `${prefix}_${Date.now()}_${channelSeq}`;
}

// Fires `onInsert` whenever a new row lands in owner_messages for this
// conversation — used by both the visitor chat panel and the owner's open
// thread so messages appear instantly on both sides, no polling needed.
export function subscribeToConversationMessages(conversationId, onInsert) {
  const channel = supabaseClient
    .channel(uniqueChannelName(`owner_messages_${conversationId}`))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'owner_messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabaseClient.removeChannel(channel);
}

// Used by the owner's inbox list to know when *any* conversation changed
// (new message, new visitor) without re-fetching everything on a timer.
export function subscribeToAllConversations(onChange) {
  const channel = supabaseClient
    .channel(uniqueChannelName('owner_conversations_all'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_conversations' }, onChange)
    .subscribe();
  return () => supabaseClient.removeChannel(channel);
}
