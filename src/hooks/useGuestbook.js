import { useEffect, useState } from 'react';
import { loadComments, submitComment, toggleCommentReaction } from '../lib/guestApi';

export default function useGuestbook(slug) {
  const [comments, setComments] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setComments(null);
    setError('');
    loadComments(slug)
      .then(({ items, hasMore: more, nextBefore }) => {
        if (!alive) return;
        setComments(items);
        setHasMore(Boolean(more));
        setCursor(nextBefore || null);
      })
      .catch((err) => {
        if (!alive) return;
        setComments([]);
        setError(err?.message || 'Unable to load comments');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { items, hasMore: more, nextBefore } = await loadComments(slug, { before: cursor });
      setComments((prev) => [...(prev || []), ...items]);
      setHasMore(Boolean(more));
      setCursor(nextBefore || null);
    } catch (err) {
      console.error('[useGuestbook] loadMore failed', err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function postComment({ name, text }) {
    if (!name || !text) {
      throw new Error('name and text required');
    }
    setError('');
    const optimistic = { name: name.trim(), text: text.trim(), created_at: new Date().toISOString() };
    setComments((prev) => [optimistic, ...(prev || [])]);
    try {
      await submitComment(slug, { name: name.trim(), text: text.trim() });
    } catch (err) {
      setError(err?.message || 'Unable to post comment');
      // rollback optimistic insert by reloading first page
      try { const { items, hasMore: more, nextBefore } = await loadComments(slug); setComments(items); setHasMore(Boolean(more)); setCursor(nextBefore || null); } catch (e) { /* ignore */ }
      throw err;
    }
  }

  async function reactToComment(commentId, emoji) {
    try {
      const reactions = await toggleCommentReaction(slug, commentId, emoji);
      setComments((prev) => (prev || []).map((c) => (c.id === commentId ? { ...c, reactions } : c)));
      return reactions;
    } catch (err) {
      console.error('[useGuestbook] reactToComment failed', err);
      throw err;
    }
  }

  return {
    comments,
    loading,
    hasMore,
    loadingMore,
    error,
    loadMore,
    postComment,
    reactToComment,
  };
}
