/**
 * LICENSE CODES — Supabase-backed (see supabase/license_codes.sql)
 *
 * Replaces the old localStorage-only implementation. Codes generated here
 * from Settings > License Codes are stored in a real shared table, so any
 * visitor on any device can redeem them (see licenseApi.js / redeemLicenseCode
 * in that SQL file's redeem_license_code()) — not just the owner's own browser.
 */
import { supabaseClient } from './supabaseClient';

function toLicense(row) {
  const createdAt = new Date(row.created_at).getTime();
  const expiresAt = new Date(row.expires_at).getTime();
  let status = 'active';
  if (row.disabled) status = 'disabled';
  else if (expiresAt && expiresAt < Date.now()) status = 'expired';
  return {
    id: row.id,
    code: row.code,
    durationDays: row.duration_days,
    createdAt,
    expiresAt,
    disabled: row.disabled,
    status,
    price: row.price ?? null,
    // null = every template allowed (see demo_accounts.sql)
    allowedTemplates: row.allowed_templates ?? null,
    account: row.account_id
      ? { id: row.account_id, displayName: row.account_display_name, username: row.account_username }
      : null,
  };
}

export async function getLicenses() {
  const { data, error } = await supabaseClient.rpc('owner_list_licenses');
  if (error) throw error;
  return (data || []).map(toLicense);
}

export async function generateLicense(durationDays, { price = null, allowedTemplates = null } = {}) {
  const days = Number(durationDays);
  if (!days || days <= 0) return { ok: false, error: 'invalid-duration' };

  const { data, error } = await supabaseClient.rpc('owner_generate_license', {
    p_duration_days: days,
    p_price: price === '' || price === null ? null : Number(price),
    p_allowed_templates: allowedTemplates, // null = all templates, else array of template ids
  });
  if (error) return { ok: false, error: 'server' };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: 'server' };
  return { ok: true, license: toLicense(row) };
}

// Updates just the permissions (price + allowed templates) of an existing
// code — used by the "Edit permissions" panel in Settings > License Codes.
export async function updateLicensePermissions(id, { price = null, allowedTemplates = null } = {}) {
  const { data, error } = await supabaseClient.rpc('owner_update_license_permissions', {
    p_id: id,
    p_price: price === '' || price === null ? null : Number(price),
    p_allowed_templates: allowedTemplates,
  });
  if (error) return { ok: false, error: 'server' };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: 'server' };
  return { ok: true, license: toLicense(row) };
}

export async function toggleLicenseDisabled(id) {
  const { error } = await supabaseClient.rpc('owner_toggle_license', { p_id: id });
  return { ok: !error };
}

export async function deleteLicense(id) {
  const { error } = await supabaseClient.rpc('owner_delete_license', { p_id: id });
  return { ok: !error };
}
