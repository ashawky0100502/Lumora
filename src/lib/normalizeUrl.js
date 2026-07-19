// Simple URL normalization helpers for external links.
export function normalizeExternalUrl(raw) {
  if (!raw) return '';
  const s = String(raw).trim();

  if (!s) return '';

  // Already absolute with protocol
  if (/^https?:\/\//i.test(s)) return s;

  // Protocol-relative (e.g. //maps.google.com/...) -> prefer https
  if (/^\/\//.test(s)) return `https:${s}`;

  // Otherwise, prepend https:// and strip leading slashes
  return `https://${s.replace(/^\/+/, '')}`;
}

export default normalizeExternalUrl;
