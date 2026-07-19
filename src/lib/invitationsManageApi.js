/**
 * MANAGE INVITATIONS API
 * Wraps supabase/manage_invitations.sql.
 *
 * IMPORTANT — two very different actions live here, on purpose:
 *
 * 1. "Remove from my list" (removeFromMyList / removeAllFromMyList): only
 *    touches THIS browser's local "My Invitations" list (myInvites.js). It
 *    never calls the server. The invitation itself, its RSVPs/comments/
 *    messages, its guest link, and the couple's own portal keep working
 *    exactly as before — this just declutters the owner's own dashboard.
 *    This is the DEFAULT action in the UI.
 *
 * 2. "Permanently delete" (permanentlyDeleteInvitation /
 *    permanentlyDeleteAllInvitations): the real, irreversible cleanup —
 *    deletes the invitation row plus every RSVP/comment/message tied to
 *    it, its couple-portal access code, and (if it has one) its uploaded
 *    song, to actually free up storage. This also kills the guest link and
 *    the couple's portal for good, so the UI gates it behind its own,
 *    more serious confirmation.
 *
 * "Smart" bulk delete means: one query to collect every audio path, one
 * storage.remove() call for all of them, and one RPC call that cascades
 * the DB cleanup for every slug — instead of doing all of that N times
 * over, once per invitation.
 */
import { supabaseClient } from './supabaseClient';
import { getMyInvites, forgetInvite, clearMyInvites } from './myInvites';

const BUCKET = 'media';

async function removeAudioForSlugs(slugs) {
  if (!slugs.length) return;
  const { data, error } = await supabaseClient.rpc('get_invitation_audio_paths', { p_slugs: slugs });
  if (error) {
    // Non-fatal — worst case a stray audio file stays in storage, but the
    // invitation itself (the part taking up real space) still gets deleted.
    console.warn('Could not look up audio paths before delete:', error.message);
    return;
  }
  const paths = (data || []).map((r) => r.audio_path).filter(Boolean);
  if (paths.length) {
    const { error: rmErr } = await supabaseClient.storage.from(BUCKET).remove(paths);
    if (rmErr) console.warn('Audio storage cleanup failed:', rmErr.message);
  }
}

// Safe default: only forgets this one slug from the browser's local list.
// The invitation itself is completely untouched on the server — the guest
// link and the couple's portal keep working normally.
export function removeFromMyList(slug) {
  forgetInvite(slug);
}

// Safe default (bulk): clears the local "My Invitations" list only.
// Nothing is deleted on the server.
export function removeAllFromMyList() {
  clearMyInvites();
}

// REAL, IRREVERSIBLE delete: its own row, every RSVP/comment/message tied
// to it, its couple-portal access code, and (if it has one) its uploaded
// song. After this the guest link and couple portal both stop working.
export async function permanentlyDeleteInvitation(slug) {
  await removeAudioForSlugs([slug]);
  const { error } = await supabaseClient.rpc('delete_invitations_cascade', { p_slugs: [slug] });
  if (error) throw new Error(error.message || 'Could not delete this invitation.');
  forgetInvite(slug);
}

// REAL, IRREVERSIBLE delete for every invitation this browser has
// published — same cleanup as above, batched into as few requests as
// possible.
export async function permanentlyDeleteAllInvitations() {
  const slugs = getMyInvites().map((i) => i.slug);
  if (!slugs.length) return;
  await removeAudioForSlugs(slugs);
  const { error } = await supabaseClient.rpc('delete_invitations_cascade', { p_slugs: slugs });
  if (error) throw new Error(error.message || 'Could not delete your invitations.');
  clearMyInvites();
}

/**
 * MEMBER (DEMO ACCOUNT) VERSIONS
 * A member's invitations live in the server (owner_account_id — see
 * supabase/member_invitations.sql), not in this browser's local list, so
 * there's no "remove from my list vs. delete forever" split here like the
 * owner has — a member only ever sees their own invitations, so deleting
 * one is always the real, final action. member_delete_invitation /
 * member_delete_all_invitations both re-check server-side that the
 * invitation(s) actually belong to this account before touching anything.
 */
export async function permanentlyDeleteMemberInvitation(accountId, slug) {
  await removeAudioForSlugs([slug]);
  const { error } = await supabaseClient.rpc('member_delete_invitation', { p_account_id: accountId, p_slug: slug });
  if (error) throw new Error(error.message || 'Could not delete this invitation.');
}

export async function permanentlyDeleteAllMemberInvitations(accountId, slugs) {
  if (!slugs.length) return;
  await removeAudioForSlugs(slugs);
  const { error } = await supabaseClient.rpc('member_delete_all_invitations', { p_account_id: accountId });
  if (error) throw new Error(error.message || 'Could not delete your invitations.');
}
