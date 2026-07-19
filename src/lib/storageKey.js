// Generate safe storage object keys for uploaded files.
// Never include the original filename in the key to avoid non-ASCII
// characters, emojis, spaces or other problematic glyphs.
export function generateStorageKey(prefix, file) {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);

  // Try to preserve a sensible extension. Prefer the filename's
  // extension when present, otherwise fall back to a content-type map.
  let ext = '';
  if (file && file.name) {
    const m = file.name.match(/\.([0-9A-Za-z]+)$/);
    if (m) ext = m[1].toLowerCase();
  }
  if (!ext && file && file.type) {
    const map = {
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/x-wav': 'wav',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
    };
    ext = map[file.type] || '';
  }
  if (!ext) ext = 'bin';

  // Ensure prefix has no trailing slash
  const cleanPrefix = (prefix || '').replace(/\/+$/g, '');
  return `${cleanPrefix}/${now}-${rand}.${ext}`;
}
