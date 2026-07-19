import { fetchNotifications } from './notifications';

/**
 * SHARED NOTIFICATIONS STORE
 * ---------------------------
 * NotificationBell and NotificationToasts both used to call
 * fetchNotifications() on their own independent setInterval (45s and 20s).
 * fetchNotifications() itself does an invite x table query for every one
 * of the owner's invitations, so having two components polling it
 * separately meant that whole query set ran twice, on overlapping
 * timers, for the exact same data.
 *
 * This module polls once, on the shortest interval either consumer
 * needs, and fans the result out to every subscriber. A second
 * subscriber mounting doesn't add a second poll — it just joins the
 * existing one. When nobody's subscribed (e.g. between dashboard visits)
 * polling stops entirely.
 */

const POLL_MS = 20000; // matches the fastest previous consumer (Toasts)

let data = [];
let loaded = false;
let subscribers = new Set();
let pollId = null;
let inFlight = null;

async function refresh() {
  // If a refresh is already in flight (e.g. a manual "mark all read" click
  // lands right as the interval fires), reuse it instead of doubling up.
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      data = await fetchNotifications();
    } catch {
      data = data || [];
    } finally {
      loaded = true;
      inFlight = null;
      subscribers.forEach((cb) => cb(data));
    }
  })();
  return inFlight;
}

function ensurePolling() {
  if (pollId) return;
  pollId = setInterval(refresh, POLL_MS);
}

function stopPollingIfIdle() {
  if (subscribers.size === 0 && pollId) {
    clearInterval(pollId);
    pollId = null;
  }
}

/**
 * Subscribe to notification updates. `cb` is called with the latest data
 * immediately (from cache if we already have it, otherwise after the
 * first fetch resolves), and again every time fresh data arrives.
 * Returns an unsubscribe function.
 */
export function subscribeNotifications(cb) {
  subscribers.add(cb);
  ensurePolling();
  if (loaded) cb(data);
  else refresh();
  return () => {
    subscribers.delete(cb);
    stopPollingIfIdle();
  };
}

/** Force an immediate refresh (e.g. on bell open, or after "mark all read"). */
export function refreshNotificationsNow() {
  return refresh();
}

export function getNotificationsSnapshot() {
  return { data, loaded };
}
