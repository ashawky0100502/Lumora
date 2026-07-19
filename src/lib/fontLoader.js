/**
 * SMART FONT LOADER
 * ------------------
 * The old approach loaded all ~13 typeface families (every weight/italic
 * combo) from a single <link> in index.html, on every single page — the
 * dashboard, the login screen, and every guest invitation — even though
 * each guest theme only ever uses 3 of those families (display/body/ui).
 *
 * This module loads *only* the families a given theme actually needs, the
 * moment that theme is about to render, and remembers what's already been
 * requested so switching between pages/themes never re-downloads a family
 * twice. It also works for a future template nobody has written yet: if a
 * theme references a family we don't have a curated weight-spec for, we
 * fall back to a sensible generic spec instead of silently doing nothing.
 *
 * Curated specs match exactly what the design previously shipped for each
 * family (same weights/italics), just requested individually instead of
 * all at once.
 */

const FONT_SPECS = {
  Cinzel: 'Cinzel:wght@400;500;600;700',
  'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600',
  Manrope: 'Manrope:wght@400;500;600;700;800',
  'Playfair Display': 'Playfair+Display:ital,wght@0,500;0,600;1,500',
  Lora: 'Lora:ital,wght@0,400;0,500;1,400',
  Jost: 'Jost:wght@400;500;600',
  'Bodoni Moda': 'Bodoni+Moda:ital,wght@0,500;0,700;1,500',
  'EB Garamond': 'EB+Garamond:ital,wght@0,400;0,500;1,400;1,500',
  Poppins: 'Poppins:wght@400;500;600',
  'IM Fell English': 'IM+Fell+English:ital@0;1',
  'Courier Prime': 'Courier+Prime:wght@400;700',
  Marcellus: 'Marcellus',
  Italiana: 'Italiana',
};

// Fallback for a family a future template introduces that isn't curated
// above yet — still only fetches that one family, just with a broader
// (safe) default weight range instead of every weight Google Fonts has.
function fallbackSpec(name) {
  return `${name.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;1,400;1,500`;
}

const requestedFamilies = new Set(); // families already injected this session
let preconnected = false;

function ensurePreconnect() {
  if (preconnected || typeof document === 'undefined') return;
  preconnected = true;
  if (document.querySelector('link[data-lumora-font-preconnect]')) return;
  ['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'].forEach((href, i) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (i === 1) link.crossOrigin = '';
    link.setAttribute('data-lumora-font-preconnect', '');
    document.head.appendChild(link);
  });
}

/** "'Cinzel', serif" -> "Cinzel" */
function extractFamilyName(cssFontFamilyValue) {
  if (!cssFontFamilyValue) return null;
  const first = cssFontFamilyValue.split(',')[0].trim();
  return first.replace(/^['"]|['"]$/g, '') || null;
}

/**
 * Loads only the families in `familyNames` that haven't been requested yet
 * this session. Safe to call as often as you like — already-loaded
 * families are skipped, and if every requested family is already loaded
 * this is a no-op (no network request at all).
 */
export function loadFontFamilies(familyNames) {
  if (typeof document === 'undefined') return; // SSR/build safety
  const unique = [...new Set((familyNames || []).filter(Boolean))];
  const missing = unique.filter((name) => !requestedFamilies.has(name));
  if (missing.length === 0) return;

  ensurePreconnect();
  missing.forEach((name) => requestedFamilies.add(name));

  const params = missing.map((name) => `family=${FONT_SPECS[name] || fallbackSpec(name)}`).join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Loads exactly the 3 families a guest/portal theme declares
 * (displayFont/bodyFont/uiFont) — nothing more. Any new theme added to
 * guestThemes.js in the future is picked up automatically the first time
 * it's rendered, with no changes needed here. If a new theme happens to
 * reuse a family another theme already loaded (e.g. Manrope), it's shared
 * for free — if it truly uses fonts from every other theme combined,
 * loadFontFamilies simply requests whatever isn't cached yet.
 */
export function loadThemeFonts(theme) {
  if (!theme) return;
  loadFontFamilies([theme.displayFont, theme.bodyFont, theme.uiFont].map(extractFamilyName));
}
