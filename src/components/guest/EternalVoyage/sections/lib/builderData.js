/**
 * Small, dependency-free helpers for pulling real content out of the
 * Builder `data` object defensively — several fields have grown more
 * than one shape over time (plain string vs. `{ text }` object, etc).
 *
 * Shared by Story / Prayer / Timeline / Venue / Footer only, so those
 * five sections don't each reimplement the same lookups. Hero.jsx is
 * intentionally left untouched and keeps its own local copy of
 * `resolveName` rather than importing this file.
 */

/** Returns the first non-empty trimmed string among the candidates. */
export function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

/** Resolves a name field that may be a plain string or a `{ name }` object. */
export function resolveName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return (value.name || value.fullName || '').trim();
  return '';
}
