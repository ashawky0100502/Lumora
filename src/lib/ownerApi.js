/**
 * OWNER (LUMORA staff) DASHBOARD API — and, since Phase 4, member (demo)
 * accounts too.
 *
 * The owner path is unchanged: single-admin panel, the list of invitations
 * this browser has published (myInvites.js), RSVPs pulled across all of
 * them via get_owner_rsvps(text[]).
 *
 * A demo member's path is different on purpose: instead of trusting a
 * local browser list, it asks the server for exactly the invitations that
 * are actually tagged as theirs (member_list_invitations /
 * member_get_rsvps — see supabase/member_invitations.sql), so their "My
 * Invitations" and "Guests" screens work from any device and can never
 * show another member's (or the owner's) data.
 */
import { supabaseClient } from './supabaseClient';
import { getMyInvites } from './myInvites';

export async function getOwnerRsvps(session = { type: 'owner' }) {
  if (session.type === 'demo') {
    const accountId = session.account?.accountId;
    if (!accountId) return { invites: [], rsvps: [] };

    const { data: rows, error } = await supabaseClient.rpc('member_list_invitations', { p_account_id: accountId });
    if (error) throw error;
    const invites = (rows || []).map((r) => ({
      slug: r.slug,
      groom: r.data?.groom || '',
      bride: r.data?.bride || '',
      language: r.data?.language,
    }));
    if (!invites.length) return { invites: [], rsvps: [] };

    const { data: rsvps, error: rErr } = await supabaseClient.rpc('member_get_rsvps', { p_account_id: accountId });
    if (rErr) throw rErr;
    return { invites, rsvps: rsvps || [] };
  }

  const invites = getMyInvites();
  if (!invites.length) return { invites: [], rsvps: [] };

  const slugs = invites.map((i) => i.slug);
  const { data, error } = await supabaseClient.rpc('get_owner_rsvps', { p_slugs: slugs });
  if (error) throw error;

  return { invites, rsvps: data || [] };
}

// Comments (the public guestbook) are still openly readable — no RPC
// needed, a direct scoped select is enough for the analytics view.
export async function getOwnerComments(slugs) {
  if (!slugs.length) return [];
  const { data, error } = await supabaseClient
    .from('comments')
    .select('id,slug,name,created_at')
    .in('slug', slugs);
  if (error) throw error;
  return data || [];
}

// Headcount of guests who confirmed attendance (sums guest_count per
// response, same logic RsvpTab/OverviewTab already use on the couple side).
export function countConfirmedGuests(rsvps) {
  return (rsvps || [])
    .filter((r) => r.status === 'attending')
    .reduce((sum, r) => sum + (parseInt(r.guest_count, 10) || 1), 0);
}
