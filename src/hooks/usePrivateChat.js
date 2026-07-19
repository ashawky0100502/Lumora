import { useEffect, useState, useRef } from 'react';
import { getGuestName, setGuestName, loadGuestThread, sendGuestMessage, toggleGuestMessageReaction, markThreadSeen, getGuestToken } from '../lib/guestApi';

const POLL_MS = 8000;

export default function usePrivateChat(slug) {
  const [nameKnown, setNameKnownState] = useState(() => Boolean(typeof window !== 'undefined' && getGuestName(slug)));
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!nameKnown) return undefined;
    let alive = true;
    async function refresh() {
      setLoading(true);
      try {
        const data = await loadGuestThread(slug);
        if (!alive) return;
        setThread(data || []);
        markThreadSeen(slug);
      } catch (err) {
        if (!alive) return;
        setThread((prev) => prev ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    }
    refresh();
    pollRef.current = setInterval(refresh, POLL_MS);
    return () => { alive = false; clearInterval(pollRef.current); };
  }, [nameKnown, slug]);

  function setName(name) {
    setGuestName(slug, name);
    setNameKnownState(true);
  }

  async function sendMessage(text) {
    if (!text || busy) throw new Error('message required');
    setBusy(true);
    setError('');
    const optimistic = { sender: 'guest', text: text.trim(), created_at: new Date().toISOString(), guest_token: getGuestToken(slug) };
    setThread((prev) => [...(prev || []), optimistic]);
    try {
      await sendGuestMessage(slug, text.trim());
    } catch (err) {
      setError(err?.message || 'Unable to send message');
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function reactToMessage(messageId, emoji) {
    try {
      const reactions = await toggleGuestMessageReaction(slug, messageId, emoji);
      setThread((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, reactions } : m)));
      return reactions;
    } catch (err) {
      console.error('[usePrivateChat] reactToMessage failed', err);
      throw err;
    }
  }

  return {
    nameKnown,
    setName,
    thread,
    loading,
    busy,
    error,
    sendMessage,
    reactToMessage,
  };
}
