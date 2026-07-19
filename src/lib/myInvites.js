// Tracks invitations this browser has published (localStorage, no accounts
// needed) — ported 1:1 from the original Lumora build so the notification
// system keeps working the same way once the invitation wizard is wired up.
//
// IMPORTANT CAVEAT: this list lives only in this specific browser. It is
// not "how many invitations exist" — it's "how many this device remembers
// publishing". Two real consequences: (1) opening the dashboard on a
// different device/browser shows an empty list even though the invitations
// are all still live on the server, and (2) clearing browser data loses
// the list (not the invitations themselves — those are safe in Supabase).
// Fixing that properly means real owner accounts (an `owner_key` or user id
// column on `invitations`, queried from the server instead of localStorage)
// — a deliberate feature decision, not a performance tweak, so it hasn't
// been done here without being asked for explicitly.

const LS_MY_INVITES = 'lumora_my_invites';
const LS_NOTIF_SEEN = 'lumora_notif_seen';

export function getMyInvites() {
  try {
    return JSON.parse(localStorage.getItem(LS_MY_INVITES) || '[]');
  } catch (e) {
    return [];
  }
}

export function rememberInvite(inv) {
  const list = getMyInvites().filter((x) => x.slug !== inv.slug);
  list.unshift(inv);
  // This cap only limits how many invitations THIS browser keeps in its
  // local "My Invitations" list/stats — it has nothing to do with how many
  // invitations can exist or how fast any single one loads. Raised well
  // past any realistic usage; see the note in myInvites.js's header comment
  // for the bigger caveat this doesn't solve.
  localStorage.setItem(LS_MY_INVITES, JSON.stringify(list.slice(0, 300)));
}

// Removes a single invitation from this browser's tracked list — called
// after it's been deleted server-side, so it stops showing up anywhere
// (dashboard cards, notifications, "My Invitations" list).
export function forgetInvite(slug) {
  const list = getMyInvites().filter((x) => x.slug !== slug);
  localStorage.setItem(LS_MY_INVITES, JSON.stringify(list));
  const seen = getSeenMap();
  delete seen[slug];
  localStorage.setItem(LS_NOTIF_SEEN, JSON.stringify(seen));
}

// Wipes every invitation this browser has tracked — used by "Delete All
// Invitations". Does NOT touch the server by itself; the caller is
// responsible for deleting the server-side rows/storage first.
export function clearMyInvites() {
  localStorage.setItem(LS_MY_INVITES, '[]');
  localStorage.setItem(LS_NOTIF_SEEN, '{}');
}

export function getSeenMap() {
  try {
    return JSON.parse(localStorage.getItem(LS_NOTIF_SEEN) || '{}');
  } catch (e) {
    return {};
  }
}

export function markAllSeenNow() {
  const map = getSeenMap();
  const now = new Date().toISOString();
  getMyInvites().forEach((inv) => (map[inv.slug] = now));
  localStorage.setItem(LS_NOTIF_SEEN, JSON.stringify(map));
}
