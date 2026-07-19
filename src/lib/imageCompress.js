/**
 * IMAGE COMPRESSION
 * Photos are almost always the single heaviest thing a guest's phone has
 * to download — a phone camera photo straight off the device is routinely
 * 4-10MB. Resizing to a sane display size and re-encoding as JPEG before
 * it ever reaches storage means every guest who opens the invitation
 * downloads a ~150-400KB image instead, regardless of how many photos get
 * added to the gallery over time.
 */

const MAX_DIMENSION = 1600; // plenty for a full-bleed hero on any phone/desktop
const QUALITY = 0.82;

export async function compressImage(file, opts = {}) {
  const maxDimension = opts.maxDimension || MAX_DIMENSION;
  const quality = opts.quality || QUALITY;

  // Animated GIFs and SVGs would break (or lose their animation/vector
  // nature) if we flattened them onto a canvas — pass those through as-is.
  if (!file.type || !file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Decoding failed (corrupt file, unsupported format, older browser) —
    // don't block the upload over an optimization, just use the original.
    return file;
  }

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    // Only swap in the compressed version if it's actually smaller — an
    // already-tiny icon-sized PNG shouldn't get replaced by a bigger file.
    if (blob.size >= file.size) return file;

    const baseName = (file.name || 'photo').replace(/\.[^./\\]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    bitmap.close?.();
  }
}
