/**
 * OWNER AUTH STORE
 * Single-admin credential store for the LUMORA staff login (see
 * LoginScreen.jsx). There's only ever one owner account — no per-couple
 * auth here (see ownerApi.js).
 *
 * This lives in localStorage for now so:
 *   1. "Forgot password" can actually reset the password today, with no
 *      backend in place yet.
 *   2. The future Settings panel can change the password the same way.
 *
 * When the real backend/Settings system is built, swap the two `read`/
 * `write` helpers below for a Supabase-backed call — everything else
 * (LoginScreen, the forgot-password flow, the future Settings page) keeps
 * calling the same exported functions and doesn't need to change.
 */
const STORAGE_KEY = 'lumora_owner_auth';

const DEFAULT_CREDENTIALS = {
  username: 'ashawky227',
  password: 'Ahmed227',
};

function readCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CREDENTIALS };
    const parsed = JSON.parse(raw);
    if (!parsed?.username || !parsed?.password) return { ...DEFAULT_CREDENTIALS };
    return parsed;
  } catch {
    return { ...DEFAULT_CREDENTIALS };
  }
}

function writeCredentials(creds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  } catch {
    // localStorage unavailable (private mode, etc.) — credentials just
    // won't persist across reloads, same as before this ever existed.
  }
}

export function getOwnerUsername() {
  return readCredentials().username;
}

export function verifyOwnerLogin(username, password) {
  const creds = readCredentials();
  return username.trim() === creds.username && password === creds.password;
}

// Powers today's self-serve "Forgot password" flow (username match only,
// since there's no email/backend yet). The future Settings page can reuse
// this same function once it wants a "reset" action instead of a "change"
// action.
export function resetOwnerPassword(username, newPassword) {
  const creds = readCredentials();
  if (username.trim() !== creds.username) {
    return { ok: false, error: 'no-match' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'too-short' };
  }
  writeCredentials({ ...creds, password: newPassword });
  return { ok: true };
}

// For the future Settings panel ("change my password" while already
// logged in — no username check needed there).
export function updateOwnerPassword(newPassword) {
  const creds = readCredentials();
  if (!newPassword || newPassword.length < 6) return { ok: false, error: 'too-short' };
  writeCredentials({ ...creds, password: newPassword });
  return { ok: true };
}

/**
 * OWNER SESSION
 * Separate from the credentials above — this just remembers "the owner is
 * currently logged in" across a page refresh, so App.jsx doesn't bounce
 * back to the login/cinematic sequence every time the tab reloads.
 * Cleared on explicit logout.
 */
const SESSION_KEY = 'lumora_owner_session';

export function createOwnerSession() {
  try {
    localStorage.setItem(SESSION_KEY, '1');
  } catch {
    // localStorage unavailable — session just won't survive a reload.
  }
}

export function hasOwnerSession() {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearOwnerSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}
