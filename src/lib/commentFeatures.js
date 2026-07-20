const COMMENT_FEATURES_KEY = 'lumora_comment_features';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

function readFeatureOverrides() {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(COMMENT_FEATURES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFeatureOverrides(overrides) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(COMMENT_FEATURES_KEY, JSON.stringify(overrides));
  } catch {
    // ignore storage failures gracefully
  }
}

export function getCommentFeatureOverrides(commentId) {
  if (!commentId) return {};
  const overrides = readFeatureOverrides();
  return overrides[commentId] || {};
}

export function mergeCommentFeatures(comments = []) {
  const overrides = readFeatureOverrides();
  return (comments || []).map((comment) => {
    const featureOverrides = overrides[comment.id] || {};
    return {
      ...comment,
      ...featureOverrides,
    };
  });
}

export function setCommentFeatureOverride(commentId, updates) {
  if (!commentId) return null;
  const overrides = readFeatureOverrides();
  const next = {
    ...overrides,
    [commentId]: {
      ...(overrides[commentId] || {}),
      ...updates,
    },
  };
  writeFeatureOverrides(next);
  return next[commentId];
}

export function toggleCommentPin(comments = [], commentId, pinnedAt = null) {
  if (!commentId) return (comments || []).map((comment) => ({ ...comment, pinned_at: null }));

  const normalizedComments = (comments || []).map((comment) => ({ ...comment }));
  const currentPinned = normalizedComments.find((comment) => comment.id === commentId);
  const isCurrentlyPinned = Boolean(currentPinned?.pinned_at || getCommentFeatureOverrides(commentId).pinned_at);

  const nextPinnedAt = isCurrentlyPinned ? null : (pinnedAt || new Date().toISOString());
  const overrides = readFeatureOverrides();
  const nextOverrides = {};

  normalizedComments.forEach((comment) => {
    const isSelected = comment.id === commentId;
    if (isSelected) {
      const nextCommentOverrides = {
        ...(overrides[comment.id] || {}),
        pinned_at: nextPinnedAt,
      };
      if (!nextPinnedAt) {
        delete nextCommentOverrides.pinned_at;
      }
      nextOverrides[comment.id] = nextCommentOverrides;
      return;
    }

    const nextCommentOverrides = { ...(overrides[comment.id] || {}) };
    delete nextCommentOverrides.pinned_at;
    nextOverrides[comment.id] = nextCommentOverrides;
  });

  writeFeatureOverrides(nextOverrides);

  return normalizedComments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, pinned_at: nextPinnedAt };
    }
    return { ...comment, pinned_at: null };
  });
}

export function orderGuestbookComments(comments = []) {
  const merged = mergeCommentFeatures(comments);
  const sorted = [...merged].sort((a, b) => {
    const aPinned = Boolean(a.pinned_at || getCommentFeatureOverrides(a.id).pinned_at);
    const bPinned = Boolean(b.pinned_at || getCommentFeatureOverrides(b.id).pinned_at);

    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return sorted;
}
