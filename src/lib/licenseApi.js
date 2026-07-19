/**
 * LICENSE REDEMPTION + MEMBER (DEMO) ACCOUNTS
 * See supabase/license_codes.sql (code storage/validation) and
 * supabase/demo_accounts.sql (the account itself + owner-controlled
 * permissions: price, allowed templates).
 *
 * Flow: LicenseSignupForm first calls checkLicenseCode() (step 1, code
 * only) to fail fast on a bad code before showing the registration form,
 * then calls createDemoAccount() (step 2) which re-validates the code
 * server-side and atomically creates the account — so a code can't be
 * raced into being redeemed twice, and a code that got disabled between
 * step 1 and step 2 is caught too.
 */
import { supabaseClient } from './supabaseClient';

const REASON_MESSAGES = {
  'not-found': 'That license code doesn\u2019t match any active code. Please double-check and try again.',
  disabled: 'This license code has been disabled by the LUMORA team.',
  expired: 'This license code has expired.',
  'already-used': 'This license code has already been used to create an account.',
  'name-required': 'Please enter your name.',
  'username-too-short': 'Username must be at least 3 characters.',
  'username-taken': 'That username is already taken. Please choose another.',
  'password-too-short': 'Password must be at least 6 characters.',
};

function reasonMessage(reason) {
  return REASON_MESSAGES[reason] || 'Something went wrong. Please try again.';
}

// Step 1: just checks the code is redeemable, doesn't create anything yet.
export async function checkLicenseCode(code) {
  const normalized = (code || '').trim();
  if (!normalized) {
    return { ok: false, message: REASON_MESSAGES['not-found'] };
  }

  const { data, error } = await supabaseClient.rpc('redeem_license_code', { p_code: normalized });
  if (error) {
    return { ok: false, message: 'Something went wrong checking that code. Please try again.' };
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.ok) {
    return { ok: false, message: reasonMessage(result?.reason) };
  }
  return { ok: true };
}

function toAccount(row) {
  return {
    accountId: row.account_id,
    displayName: row.display_name,
    username: row.username,
    licenseCodeId: row.license_code_id,
    price: row.price,
    // null = every template is allowed (see demo_accounts.sql)
    allowedTemplates: row.allowed_templates,
  };
}

// Step 2: creates the actual member account tied to the license code.
export async function createDemoAccount({ code, displayName, username, password }) {
  const { data, error } = await supabaseClient.rpc('redeem_and_create_account', {
    p_code: (code || '').trim(),
    p_display_name: (displayName || '').trim(),
    p_username: (username || '').trim(),
    p_password: password || '',
  });
  if (error) {
    return { ok: false, message: 'Something went wrong creating your account. Please try again.' };
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.ok) {
    return { ok: false, message: reasonMessage(result?.reason) };
  }
  return { ok: true, account: toAccount(result) };
}

export async function demoLogin(username, password) {
  const { data, error } = await supabaseClient.rpc('demo_login', {
    p_username: (username || '').trim(),
    p_password: password || '',
  });
  if (error) {
    return { ok: false, message: 'Something went wrong signing you in. Please try again.' };
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.ok) {
    return { ok: false, message: 'Incorrect username or password, or this account is no longer active.' };
  }
  return { ok: true, account: toAccount(result) };
}

// Re-checks an existing member session against the live license state
// (disabled/expired/deleted) — called on app boot so a member whose
// license the owner just disabled/deleted gets signed out immediately
// instead of staying in with a stale local session.
export async function validateDemoSession(accountId) {
  const { data, error } = await supabaseClient.rpc('demo_validate_session', { p_account_id: accountId });
  if (error) return { ok: false };
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.ok) return { ok: false, reason: result?.reason };
  return {
    ok: true,
    account: {
      accountId,
      displayName: result.display_name,
      username: result.username,
      price: result.price,
      allowedTemplates: result.allowed_templates,
    },
  };
}
