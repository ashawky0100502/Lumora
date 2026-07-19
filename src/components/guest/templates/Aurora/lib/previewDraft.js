function getStorage() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
}

export function resolvePreviewDraftData(storageLike = getStorage(), eventDetail = null, fallbackDraft = null) {
  const rawStorageDraft = storageLike?.getItem?.('lumora_wizard_draft');
  const parsedStorageDraft = rawStorageDraft ? safeParse(rawStorageDraft) : null;

  if (eventDetail && typeof eventDetail === 'object') {
    return eventDetail;
  }

  if (parsedStorageDraft && typeof parsedStorageDraft === 'object') {
    return parsedStorageDraft;
  }

  return fallbackDraft || {};
}

function safeParse(rawValue) {
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}
