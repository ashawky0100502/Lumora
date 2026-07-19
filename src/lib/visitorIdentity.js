/**
 * VISITOR IDENTITY
 * A visitor browsing before they have any account (picking a template as a
 * Guest, or hitting "Contact Owner" on the login screen) still needs a
 * stable identity so they always land back in the same private thread with
 * the owner — even after a refresh. Same idea as guest_token in
 * couple_portal.sql, just generated client-side and kept in localStorage
 * instead of being tied to one invitation.
 */
const STORAGE_KEY = 'lumora_visitor_token';

export function getVisitorToken() {
  try {
    let token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      token = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_KEY, token);
    }
    return token;
  } catch {
    // localStorage unavailable — fall back to a per-session token so the
    // chat still works, it just won't survive a refresh.
    return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// The visitor's real name, captured once by VisitorNameGate.jsx before they
// ever reach the gallery or the chat, then reused on every return visit
// (same browser) so they're never asked twice.
const NAME_STORAGE_KEY = 'lumora_visitor_name';

export function getVisitorName() {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setVisitorName(name) {
  try {
    localStorage.setItem(NAME_STORAGE_KEY, (name || '').trim());
  } catch {
    // localStorage unavailable — the gate will just ask again next time.
  }
}

// The visitor's email, captured alongside their name in VisitorNameGate.jsx
// so the owner has a real way to reach them outside the chat thread too.
const EMAIL_STORAGE_KEY = 'lumora_visitor_email';

export function getVisitorEmail() {
  try {
    return localStorage.getItem(EMAIL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setVisitorEmail(email) {
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, (email || '').trim().toLowerCase());
  } catch {
    // localStorage unavailable — the gate will just ask again next time.
  }
}
