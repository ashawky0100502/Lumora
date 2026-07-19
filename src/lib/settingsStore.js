/**
 * SITE SETTINGS STORE
 * Central place for owner-controlled settings that used to be hardcoded
 * around the app: the dashboard's welcome name.
 *
 * License codes used to live here too (localStorage), but that meant a
 * code generated on the owner's browser was invisible to any visitor
 * redeeming it from a different device — see src/lib/licenseStore.js and
 * supabase/license_codes.sql for the real, shared replacement.
 *
 * Lives in localStorage for now — same pattern as authStore.js — so the
 * Settings page actually works today with no backend. Swap the read/write
 * helpers below for a Supabase-backed version later; every caller
 * (DashboardHome, SettingsView) keeps calling the same exported functions
 * and doesn't need to change.
 */
const SETTINGS_KEY = 'lumora_site_settings';

const DEFAULT_SETTINGS = {
  ownerName: 'Ahmed',
};

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private mode, etc.) — settings just won't
    // persist across reloads.
  }
}

/* ---------------------------- Owner profile ---------------------------- */

export function getOwnerName() {
  return readSettings().ownerName;
}

export function setOwnerName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return { ok: false, error: 'empty' };
  if (trimmed.length > 40) return { ok: false, error: 'too-long' };
  writeSettings({ ...readSettings(), ownerName: trimmed });
  return { ok: true };
}


