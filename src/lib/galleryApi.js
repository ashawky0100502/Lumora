/**
 * OWNER GALLERY API
 * A private photo library for the dashboard — upload once, then reuse the
 * same photos across any invitation and any template (current or future),
 * since every template renders its gallery through the one shared
 * GuestPageLayout → GalleryBlock, which just takes plain image URLs.
 *
 * No real accounts exist in this admin panel (see myInvites.js) — photos
 * are scoped to this browser via a random owner_key persisted in
 * localStorage, the same trust model already used for "my invitations".
 */
import { supabaseClient } from './supabaseClient';
import { compressImage } from './imageCompress';
import { generateStorageKey } from './storageKey';

const LS_OWNER_KEY = 'lumora_owner_key';
const BUCKET = 'media';
const PAGE_SIZE = 60;

export function getOwnerKey() {
  try {
    let key = localStorage.getItem(LS_OWNER_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(LS_OWNER_KEY, key);
    }
    return key;
  } catch {
    // Private browsing / storage disabled — fall back to a session-only key
    // so uploads still work, they just won't persist across reloads.
    return 'anon-session';
  }
}

function safeName(name) {
  return (name || 'photo').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60);
}

// Cursor pagination, same shape/reasoning as guestApi's loadComments: a
// growing photo library shouldn't make every gallery-open slower.
export async function listGalleryPhotos({ before } = {}) {
  let query = supabaseClient
    .from('gallery_photos')
    .select('id,url,path,created_at')
    .eq('owner_key', getOwnerKey())
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data || [];
  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  return { items, hasMore, nextBefore: items.length ? items[items.length - 1].created_at : null };
}

export async function countGalleryPhotos() {
  const { count, error } = await supabaseClient
    .from('gallery_photos')
    .select('id', { count: 'exact', head: true })
    .eq('owner_key', getOwnerKey());
  if (error) throw error;
  return count || 0;
}

export async function uploadGalleryPhoto(file) {
  const ownerKey = getOwnerKey();
  const optimized = await compressImage(file);
  const path = generateStorageKey(`gallery/${ownerKey}`, optimized);

  const { error: upErr } = await supabaseClient.storage
    .from(BUCKET)
    .upload(path, optimized, { upsert: true, contentType: optimized.type || 'image/jpeg' });
  if (upErr) throw new Error(`حصل خطأ أثناء رفع الصورة: ${upErr.message}`);

  const { data: pub } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);

  const { data, error: dbErr } = await supabaseClient
    .from('gallery_photos')
    .insert({ owner_key: ownerKey, url: pub.publicUrl, path })
    .select('id,url,path,created_at')
    .single();
  if (dbErr) throw new Error(`حصل خطأ أثناء حفظ الصورة: ${dbErr.message}`);

  return data;
}

export async function deleteGalleryPhoto(photo) {
  const { error: storageErr } = await supabaseClient.storage.from(BUCKET).remove([photo.path]);
  // A storage miss shouldn't block removing the row — the row is the
  // source of truth for what the UI shows.
  if (storageErr) console.warn('gallery storage remove failed:', storageErr.message);

  const { error: dbErr } = await supabaseClient.from('gallery_photos').delete().eq('id', photo.id).eq('owner_key', getOwnerKey());
  if (dbErr) throw new Error(`حصل خطأ أثناء حذف الصورة: ${dbErr.message}`);
}
