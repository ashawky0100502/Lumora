/**
 * OWNER MUSIC STUDIO API
 * A private track library — upload once, then reuse the same songs across
 * any invitation and any template, since the invitation builder only ever
 * needs a plain audioUrl (see StepMusic.jsx / StepReview.jsx).
 *
 * Same trust model as galleryApi.js: scoped to this browser via the
 * shared owner_key, not real per-user accounts.
 */
import { supabaseClient } from './supabaseClient';
import { getOwnerKey } from './galleryApi';
import { generateStorageKey } from './storageKey';

const BUCKET = 'media';

export async function listMusicTracks() {
  const { data, error } = await supabaseClient
    .from('music_tracks')
    .select('id,url,path,name,created_at')
    .eq('owner_key', getOwnerKey())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function countMusicTracks() {
  const { count, error } = await supabaseClient
    .from('music_tracks')
    .select('id', { count: 'exact', head: true })
    .eq('owner_key', getOwnerKey());
  if (error) throw error;
  return count || 0;
}

export async function uploadMusicTrack(file) {
  const ownerKey = getOwnerKey();
  // Use a generated, ASCII-only storage key. Keep the original filename
  // only for display in the DB.
  const path = generateStorageKey(`music-library/${ownerKey}`, file);

  const { error: upErr } = await supabaseClient.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || 'audio/mpeg' });
  if (upErr) throw new Error(`حصل خطأ أثناء رفع الأغنية: ${upErr.message}`);

  const { data: pub } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);

  const { data, error: dbErr } = await supabaseClient
    .from('music_tracks')
    .insert({ owner_key: ownerKey, url: pub.publicUrl, path, name: file.name || 'Untitled' })
    .select('id,url,path,name,created_at')
    .single();
  if (dbErr) throw new Error(`حصل خطأ أثناء حفظ الأغنية: ${dbErr.message}`);

  return data;
}

export async function deleteMusicTrack(track) {
  const { error: storageErr } = await supabaseClient.storage.from(BUCKET).remove([track.path]);
  if (storageErr) console.warn('music storage remove failed:', storageErr.message);

  const { error: dbErr } = await supabaseClient.from('music_tracks').delete().eq('id', track.id).eq('owner_key', getOwnerKey());
  if (dbErr) throw new Error(`حصل خطأ أثناء حذف الأغنية: ${dbErr.message}`);
}
