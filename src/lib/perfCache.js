/**
 * PERF CACHE
 * A tiny namespaced wrapper around sessionStorage, used to avoid
 * re-fetching the same data (e.g. the first page of comments) every time
 * a component remounts within the same browser tab. Deliberately session-
 * scoped (not localStorage) — it should never serve genuinely stale data
 * across visits, only smooth out repeated fetches within one visit.
 */
const PREFIX = 'lumora_cache_v1:';

export function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { value, expires } = JSON.parse(raw);
    if (expires && Date.now() > expires) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function cacheSet(key, value, ttlMs = 60_000) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ value, expires: ttlMs ? Date.now() + ttlMs : null }));
  } catch {
    // Storage full or unavailable (private browsing) — caching is an
    // optimization, not a requirement, so just skip it silently.
  }
}

export function cacheInvalidate(prefix) {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX + prefix))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/**
 * Used by Settings → Performance → "Clear cache & speed up". Clears every
 * layer of caching the app could plausibly be holding on to: our own
 * sessionStorage cache, the browser's Cache Storage API, and any service
 * worker registrations (none are registered today, but this keeps the
 * button correct if one's ever added later). Returns a small summary so
 * the UI can report what actually happened.
 */
export async function clearAllCaches() {
  let sessionKeysCleared = 0;
  try {
    const keys = Object.keys(sessionStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => sessionStorage.removeItem(k));
    sessionKeysCleared = keys.length;
  } catch {
    /* ignore */
  }

  let cacheStoragesCleared = 0;
  try {
    if (window.caches) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      cacheStoragesCleared = names.length;
    }
  } catch {
    /* ignore */
  }

  let serviceWorkersCleared = 0;
  try {
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      serviceWorkersCleared = regs.length;
    }
  } catch {
    /* ignore */
  }

  return { sessionKeysCleared, cacheStoragesCleared, serviceWorkersCleared };
}
