/**
 * GUEST API
 * All data access for the public guest-facing invitation page. Kept
 * separate from the dashboard/builder data layer on purpose — this is the
 * surface that runs on a stranger's phone, so every call here is scoped to
 * exactly what an anonymous visitor is allowed to read or write:
 *   - invitations: read-only, by slug
 *   - rsvps: insert-only
 *   - messages: a private per-guest thread with the couple, addressed by a
 *     random token kept in this browser's localStorage (no accounts)
 *   - comments: a public guestbook feed the couple can reply to
 */
import { supabaseClient } from './supabaseClient';
import { cacheGet, cacheSet, cacheInvalidate } from './perfCache';
import { normalizeInvitationData } from './invitationDataAdapter';

export async function fetchInvitationBySlug(slug) {
  const { data, error } = await supabaseClient
    .from('invitations')
    .select('data')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  if (!data?.data) return null;
  const normalized = normalizeInvitationData(data.data);
  return normalized;
}

export async function submitRsvp(slug, { name, status, guestCount }) {
  const { error } = await supabaseClient.from('rsvps').insert({
    slug,
    name: (name || '').trim(),
    status,
    guest_count: (guestCount || '').toString().trim(),
  });
  if (error) throw error;
}

// ---- Private guest <-> couple chat -----------------------------------

function tokenKey(slug) {
  return `lumora_guest_token_${slug}`;
}
function nameKey(slug) {
  return `lumora_guest_name_${slug}`;
}

export function getGuestToken(slug) {
  let t = localStorage.getItem(tokenKey(slug));
  if (!t) {
    t = window.crypto?.randomUUID
      ? crypto.randomUUID()
      : `g_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(tokenKey(slug), t);
  }
  return t;
}

export function getGuestName(slug) {
  return localStorage.getItem(nameKey(slug)) || '';
}

export function setGuestName(slug, name) {
  localStorage.setItem(nameKey(slug), name);
}

export async function loadGuestThread(slug) {
  const { data, error } = await supabaseClient.rpc('get_guest_thread', {
    p_slug: slug,
    p_guest_token: getGuestToken(slug),
  });
  if (error) throw error;
  return data || [];
}

export async function markThreadSeen(slug) {
  try {
    await supabaseClient.rpc('guest_mark_thread_seen', {
      p_slug: slug,
      p_guest_token: getGuestToken(slug),
    });
  } catch {
    // best-effort — not worth surfacing to the guest
  }
}

export async function sendGuestMessage(slug, text) {
  const { error } = await supabaseClient.from('messages').insert({
    slug,
    guest_token: getGuestToken(slug),
    sender: 'guest',
    name: getGuestName(slug),
    text,
  });
  if (error) throw error;
}

// Toggles a reaction (add if absent, remove if already there) on one of
// the guest's own thread messages. Returns the message's updated
// reactions map so the caller can update local state without a refetch.
export async function toggleGuestMessageReaction(slug, messageId, emoji) {
  const { data, error } = await supabaseClient.rpc('guest_toggle_message_reaction', {
    p_slug: slug,
    p_guest_token: getGuestToken(slug),
    p_message_id: messageId,
    p_emoji: emoji,
  });
  if (error) throw error;
  return data || {};
}

// ---- Public comments ---------------------------------------------------

const COMMENTS_PAGE_SIZE = 15;

// Keyset (cursor) pagination instead of "select every comment": each page
// asks for comments strictly older than the last one already shown, using
// the indexed (slug, created_at) pair — so the query stays equally fast on
// page 1 whether the invitation has 20 comments or 20,000. `before` is a
// created_at ISO string (the oldest comment currently on screen), omitted
// for the first page. Returns one extra row over the page size purely to
// know whether a "load more" is worth showing, without a separate count
// query.
export async function loadComments(slug, { before } = {}) {
  const cacheKey = `comments:${slug}:first`;
  if (!before) {
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
  }

  let query = supabaseClient
    .from('comments')
    .select('id,name,text,created_at,reply,replied_at,reactions,pinned_at,thank_you')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(COMMENTS_PAGE_SIZE + 1);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data || [];
  const hasMore = rows.length > COMMENTS_PAGE_SIZE;
  const items = hasMore ? rows.slice(0, COMMENTS_PAGE_SIZE) : rows;
  const result = { items, hasMore, nextBefore: items.length ? items[items.length - 1].created_at : null };

  // Only the first page is worth caching — it's the one every repeat
  // visit/remount re-fetches; short TTL since new comments should still
  // show up quickly.
  if (!before) cacheSet(cacheKey, result, 20_000);
  return result;
}

export async function submitComment(slug, { name, text }) {
  const { error } = await supabaseClient.from('comments').insert({
    slug,
    name: (name || '').trim(),
    text: (text || '').trim(),
  });
  if (error) throw error;
  cacheInvalidate(`comments:${slug}`);
}

// Any guest (identified by their own per-invitation guest_token, not just
// the ones who've opened the chat) can react to a comment on the public
// guestbook wall.
export async function toggleCommentReaction(slug, commentId, emoji) {
  const { data, error } = await supabaseClient.rpc('guest_toggle_comment_reaction', {
    p_slug: slug,
    p_guest_token: getGuestToken(slug),
    p_comment_id: commentId,
    p_emoji: emoji,
  });
  if (error) throw error;
  return data || {};
}
