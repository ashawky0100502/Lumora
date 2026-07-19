/**
 * COUPLE PORTAL API
 * Mirrors the shape of guestApi.js but for the private, couple-only side:
 * viewing RSVPs, reading/replying to every guest chat thread, and
 * reading/replying to the public guestbook. There's no Supabase Auth
 * session here — the 6-digit access_code generated at publish time IS the
 * credential, so every call below sends {slug, code} and every RPC on the
 * database re-checks that pair before returning anything (see
 * supabase/couple_portal.sql).
 */
import { supabaseClient } from './supabaseClient';

function sessionKey(slug) {
  return `lumora_couple_session_${slug}`;
}

export function getSavedCode(slug) {
  try {
    return sessionStorage.getItem(sessionKey(slug)) || '';
  } catch {
    return '';
  }
}

export function saveCode(slug, code) {
  try {
    sessionStorage.setItem(sessionKey(slug), code);
  } catch {
    /* private-browsing / storage disabled — session just won't persist */
  }
}

export function clearCode(slug) {
  try {
    sessionStorage.removeItem(sessionKey(slug));
  } catch {
    /* noop */
  }
}

// Returns the invitation's saved builder data on success, or null if the
// code is wrong/missing — never throws for a bad code, only for a network
// failure, so callers can tell "wrong PIN" apart from "offline".
export async function coupleLogin(slug, code) {
  const { data, error } = await supabaseClient.rpc('couple_login', {
    p_slug: slug,
    p_code: (code || '').trim(),
  });
  if (error) throw error;
  return data || null;
}

export async function getCoupleRsvps(slug, code) {
  const { data, error } = await supabaseClient.rpc('get_couple_rsvps', { p_slug: slug, p_code: code });
  if (error) throw error;
  return data || [];
}

export async function getCoupleThreads(slug, code) {
  const { data, error } = await supabaseClient.rpc('get_couple_threads', { p_slug: slug, p_code: code });
  if (error) throw error;
  return data || [];
}

export async function getCoupleThreadMessages(slug, code, guestToken) {
  const { data, error } = await supabaseClient.rpc('get_couple_thread_messages', {
    p_slug: slug,
    p_code: code,
    p_guest_token: guestToken,
  });
  if (error) throw error;
  return data || [];
}

export async function sendCoupleReply(slug, code, guestToken, text) {
  const { error } = await supabaseClient.rpc('send_couple_reply', {
    p_slug: slug,
    p_code: code,
    p_guest_token: guestToken,
    p_text: text,
  });
  if (error) throw error;
}

export async function getCoupleComments(slug, code) {
  const { data, error } = await supabaseClient.rpc('get_couple_comments', { p_slug: slug, p_code: code });
  if (error) throw error;
  return data || [];
}

export async function replyToComment(slug, code, commentId, reply) {
  const { error } = await supabaseClient.rpc('reply_to_comment', {
    p_slug: slug,
    p_code: code,
    p_comment_id: commentId,
    p_reply: reply,
  });
  if (error) throw error;
}

// ---- Reactions -----------------------------------------------------------

export async function toggleCoupleMessageReaction(slug, code, guestToken, messageId, emoji) {
  const { data, error } = await supabaseClient.rpc('couple_toggle_message_reaction', {
    p_slug: slug,
    p_code: code,
    p_guest_token: guestToken,
    p_message_id: messageId,
    p_emoji: emoji,
  });
  if (error) throw error;
  return data || {};
}

export async function toggleCoupleCommentReaction(slug, code, commentId, emoji) {
  const { data, error } = await supabaseClient.rpc('couple_toggle_comment_reaction', {
    p_slug: slug,
    p_code: code,
    p_comment_id: commentId,
    p_emoji: emoji,
  });
  if (error) throw error;
  return data || {};
}
