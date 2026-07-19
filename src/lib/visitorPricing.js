/**
 * VISITOR-FACING TEMPLATE PRICING
 * Prices shown next to each template when someone continues as a Guest
 * (see VisitorTemplateGallery.jsx / VisitorContactPending.jsx).
 *
 * Backed by localStorage with sane defaults, and fully editable from
 * Settings > Template Pricing — no code changes needed to update a price.
 * Swap for a Supabase-backed table later; callers here don't need to change.
 */
const PRICING_KEY = 'lumora_template_pricing';

const DEFAULT_PRICES = {
  midnight: 350,
  silk: 300,
  velvet: 400,
  wax: 320,
  royale: 550,
};

export const CURRENCY = 'EGP';

function readOverrides() {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides) {
  try {
    localStorage.setItem(PRICING_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable — price edits just won't persist across reloads.
  }
}

export function getTemplatePrice(templateId) {
  const overrides = readOverrides();
  return overrides[templateId] ?? DEFAULT_PRICES[templateId] ?? 0;
}

// { templateId: price } for every known template, overrides merged over defaults.
export function getAllTemplatePrices() {
  const overrides = readOverrides();
  return { ...DEFAULT_PRICES, ...overrides };
}

export function setTemplatePrice(templateId, price) {
  const value = Number(price);
  if (Number.isNaN(value) || value < 0) return { ok: false, error: 'invalid-price' };
  writeOverrides({ ...readOverrides(), [templateId]: value });
  return { ok: true };
}

export function resetTemplatePrice(templateId) {
  const overrides = readOverrides();
  delete overrides[templateId];
  writeOverrides(overrides);
  return { ok: true };
}
