import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, SectionHeading, GuestInput, GuestButton } from './GuestUI';
import Reveal from './Reveal';
import ReactionTray from './Reactions';
import EmojiPickerButton from './EmojiPickerButton';
import { loadComments, submitComment, toggleCommentReaction, getGuestToken } from '../../../lib/guestApi';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';

export default function CommentsBlock({ theme, slug, lang, t, coupleNames }) {
  const [comments, setComments] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setComments(null);
    loadComments(slug)
      .then(({ items, hasMore: more, nextBefore }) => {
        if (!alive) return;
        setComments(items);
        setHasMore(more);
        setCursor(nextBefore);
      })
      .catch(() => {
        if (!alive) return;
        setComments([]);
        setHasMore(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { items, hasMore: more, nextBefore } = await loadComments(slug, { before: cursor });
      setComments((prev) => [...(prev || []), ...items]);
      setHasMore(more);
      setCursor(nextBefore);
    } catch (err) {
      console.error('[CommentsBlock] loadComments (more) failed:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleReact(commentId, emoji) {
    if (!commentId) return; // the just-posted optimistic comment doesn't have a real id yet
    try {
      const reactions = await toggleCommentReaction(slug, commentId, emoji);
      setComments((prev) => (prev || []).map((c) => (c.id === commentId ? { ...c, reactions } : c)));
    } catch (err) {
      console.error('[CommentsBlock] toggleCommentReaction failed:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setBusy(true);
    setError('');
    const optimistic = { name: name.trim(), text: text.trim(), created_at: new Date().toISOString(), reply: null };
    try {
      await submitComment(slug, { name, text });
      setComments((prev) => [optimistic, ...(prev || [])]);
      setText('');
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-xl px-5">
      <GuestCard theme={theme}>
        <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />

        <form onSubmit={handleSubmit} className="mb-7 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)]">
            <GuestInput theme={theme} placeholder={t.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} required />
            <GuestInput
              theme={theme}
              as="textarea"
              rows={3}
              placeholder={t.textPlaceholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              style={{ resize: 'none' }}
            />
          </div>
          {error && <div className="text-[0.78rem]" style={{ color: '#c25a5a' }}>{error}</div>}
          <div className="flex items-center justify-between gap-3">
            <EmojiPickerButton theme={theme} onPick={(e) => setText((prev) => prev + e)} />
            <GuestButton theme={theme} type="submit" disabled={busy}>
              {busy ? t.sending : t.submit}
            </GuestButton>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {comments === null && (
            <div className="text-center text-[0.82rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
              {t.loading}
            </div>
          )}
          {comments && comments.length === 0 && (
            <div className="text-center text-[0.82rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
              {t.empty}
            </div>
          )}
          <AnimatePresence initial={false}>
            {comments?.map((c, i) => (
              <motion.div
                key={c.created_at + i}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: theme.ease }}
                className="flex items-start gap-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.7rem]"
                  style={{ background: `rgba(${theme.accentRgb},0.16)`, color: theme.accent, fontFamily: theme.uiFont }}
                >
                  {initialsOf(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.9rem] leading-relaxed" style={{ color: theme.ink, fontFamily: theme.uiFont }}>
                    <span className="mr-1.5 font-semibold" style={{ color: theme.accent }}>{c.name}</span>
                    {c.text}
                  </div>
                  <div className="mt-0.5 text-[0.68rem]" style={{ color: theme.inkSoft }}>{timeAgo(c.created_at, lang)}</div>
                  {c.id && (
                    <ReactionTray
                      theme={theme}
                      reactions={c.reactions}
                      viewerKey={getGuestToken(slug)}
                      onToggle={(emoji) => handleReact(c.id, emoji)}
                    />
                  )}
                  {c.reply && (
                    <div
                      className="mt-2 rounded-lg border-r-2 px-3 py-2 text-[0.82rem]"
                      style={{ borderColor: theme.accent, background: `rgba(${theme.accentRgb},0.08)`, color: theme.ink }}
                    >
                      <b style={{ color: theme.accent }}>{coupleNames}: </b>
                      {c.reply}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mx-auto mt-1 rounded-full px-5 py-2 text-[0.78rem] transition-opacity disabled:opacity-60"
              style={{ background: `rgba(${theme.accentRgb},0.1)`, color: theme.accent, fontFamily: theme.uiFont }}
            >
              {loadingMore ? t.loading : t.loadMore || 'Show more'}
            </button>
          )}
        </div>
      </GuestCard>
    </Reveal>
  );
}
