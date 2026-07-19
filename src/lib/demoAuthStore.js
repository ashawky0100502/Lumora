/**
 * MEMBER (DEMO) SESSION
 * Completely separate from lumora_owner_session (authStore.js) — a member
 * who signed up with a license code has no relationship to the owner
 * account at all, on purpose (see demo_accounts.sql). Only one of the two
 * sessions can be active at a time; App.jsx checks the owner session
 * first, then this one.
 *
 * We cache the account's permissions (price/allowedTemplates/displayName)
 * alongside the id so the UI has something to render instantly on load,
 * but licenseApi.validateDemoSession() is always called on boot to catch
 * a license the owner disabled/deleted since the cache was written.
 */
const SESSION_KEY = 'lumora_demo_session';

export function createDemoSession(account) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(account));
  } catch {
    // localStorage unavailable — session just won't survive a reload.
  }
}

export function getDemoSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accountId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasDemoSession() {
  return !!getDemoSession();
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}
