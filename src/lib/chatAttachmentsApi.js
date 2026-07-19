/**
 * CHAT ATTACHMENTS
 * Uploading/removing the actual files behind an 'image' or 'audio' chat
 * message (supabase/chat_attachments.sql handles the message rows
 * themselves). Reuses the same 'media' storage bucket already used by the
 * gallery and music uploads (galleryApi.js, musicApi.js) — public-read,
 * anon upload allowed, no new bucket/policy needed.
 *
 * Storage is finite, so every delete path here removes the actual file,
 * not just the DB row — same principle as invitationsManageApi.js's
 * "permanently delete" cleanup.
 */
import { supabaseClient } from './supabaseClient';
import { compressImage } from './imageCompress';
import {
  sendVisitorAttachment,
  ownerSendAttachment,
  visitorDeleteMessage,
  ownerDeleteMessage,
  ownerGetConversationAttachmentPaths,
  ownerDeleteConversation,
} from './ownerInboxApi';

const BUCKET = 'media';
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB — plenty for a voice note/song clip, not a whole album

import { generateStorageKey } from './storageKey';

function safeName(name) {
  return (name || 'file').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60);
}

function humanSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadToMedia(scopeKey, file, subfolder) {
  const prefix = `chat/${scopeKey}/${subfolder}`;
  const path = generateStorageKey(prefix, file);
  const { error: upErr } = await supabaseClient.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || 'application/octet-stream' });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const { data: pub } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path, name: file.name, size: file.size, mime: file.type };
}

// visitorToken doubles as the storage "folder key" for a conversation —
// both the visitor and the owner upload under it, so every attachment in
// one thread lives together and get_conversation_attachment_paths (in
// chat_attachments.sql) can find them all by conversation, not by uploader.
export async function uploadChatImage(visitorToken, file) {
  if (!file.type || !file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const optimized = await compressImage(file, { maxDimension: 1280 });
  return uploadToMedia(visitorToken, optimized, 'images');
}

export async function uploadChatAudio(visitorToken, file) {
  if (!file.type || !file.type.startsWith('audio/')) throw new Error('Please choose an audio file.');
  if (file.size > MAX_AUDIO_BYTES) throw new Error('Audio files are limited to 15MB.');
  return uploadToMedia(visitorToken, file, 'audio');
}

export { humanSize };

/* ------------------------------- Sending ------------------------------- */

export async function visitorSendImage(visitorToken, file) {
  const attachment = await uploadChatImage(visitorToken, file);
  await sendVisitorAttachment(visitorToken, { kind: 'image', ...attachment });
}

export async function visitorSendAudio(visitorToken, file) {
  const attachment = await uploadChatAudio(visitorToken, file);
  await sendVisitorAttachment(visitorToken, { kind: 'audio', ...attachment });
}

// The owner uploads into the same conversation's folder (its visitor_token)
// so cleanup-by-conversation still finds these files too.
export async function ownerSendImage(conversationId, visitorToken, file) {
  const attachment = await uploadChatImage(visitorToken, file);
  await ownerSendAttachment(conversationId, { kind: 'image', ...attachment });
}

export async function ownerSendAudio(conversationId, visitorToken, file) {
  const attachment = await uploadChatAudio(visitorToken, file);
  await ownerSendAttachment(conversationId, { kind: 'audio', ...attachment });
}

/* ------------------------------- Deleting ------------------------------- */

async function removePaths(paths) {
  const clean = (paths || []).filter(Boolean);
  if (!clean.length) return;
  const { error } = await supabaseClient.storage.from(BUCKET).remove(clean);
  // Non-fatal — worst case a stray file stays in storage, but the message
  // (the part the person actually sees) still gets deleted either way.
  if (error) console.warn('Chat attachment storage remove failed:', error.message);
}

// Deletes one message and, if it carried an image/audio file, the actual
// file behind it too. `role` is 'visitor' or 'owner' — determines which
// ownership-checked RPC gets called.
export async function deleteChatMessage(message, { role, visitorToken }) {
  if (message.payload?.path) await removePaths([message.payload.path]);
  if (role === 'owner') {
    await ownerDeleteMessage(message.id);
  } else {
    await visitorDeleteMessage(visitorToken, message.id);
  }
}

// Wipes every attachment file in a conversation before the conversation
// row (and its messages, via cascade) is deleted — cascade only clears
// the database rows, not the uploaded files sitting in storage.
export async function deleteConversationWithAttachments(conversationId) {
  let paths = [];
  try {
    paths = await ownerGetConversationAttachmentPaths(conversationId);
  } catch (e) {
    console.warn('Could not look up conversation attachments before delete:', e.message);
  }
  await removePaths(paths);
  await ownerDeleteConversation(conversationId);
}

/* ------------------------------ Downloading ------------------------------ */

// A plain <a href download> often just opens same-origin-blocked media
// inline instead of saving it (browser/host dependent) — fetching the
// bytes ourselves and forcing a blob download works everywhere the file
// is publicly reachable, which every chat attachment here is.
export async function downloadAttachment(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch {
    // CORS or network hiccup — fall back to just opening it, so the person
    // can still save it manually instead of the button doing nothing.
    window.open(url, '_blank', 'noopener');
  }
}
