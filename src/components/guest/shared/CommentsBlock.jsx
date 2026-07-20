import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, SectionHeading, GuestInput, GuestButton } from './GuestUI';
import Reveal from './Reveal';
import ReactionTray from './Reactions';
import EmojiPickerButton from './EmojiPickerButton';
import { loadComments, submitComment, toggleCommentReaction, getGuestToken } from '../../../lib/guestApi';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';

export default function CommentsBlock({ theme, slug, lang, t, coupleNames }) {
  const [comments, setComments] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setComments(null);
    setCurrentPage(0);
    loadComments(slug)
      .then(({ items }) => {
        if (!alive) return;
        setComments(items);
      })
      .catch(() => {
        if (!alive) return;
        setComments([]);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.scrollHeight);
    }
  }, [currentPage, comments]);

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

  const commentsPerPage = 3;
  const rootComments = comments || [];
  const totalPages = Math.ceil(rootComments.length / commentsPerPage) || 1;
  const startIdx = currentPage * commentsPerPage;
  const endIdx = startIdx + commentsPerPage;
  const visibleComments = rootComments.slice(startIdx, endIdx);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  function handlePrevious() {
    if (!isFirstPage) setCurrentPage((prev) => prev - 1);
  }

  function handleNext() {
    if (!isLastPage) setCurrentPage((prev) => prev + 1);
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
          <motion.div
            animate={{ height: containerHeight }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div ref={containerRef} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: theme.ease }}
                  className="flex flex-col gap-4"
                >
                  {visibleComments.map((c, i) => (
                    <motion.div
                      key={c.id ?? `${c.created_at}-${i}`}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {totalPages > 1 && (
            <div className="mt-1 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstPage}
                className="rounded-full px-4 py-2 text-[0.78rem] transition-opacity disabled:opacity-60"
                style={{ background: `rgba(${theme.accentRgb},0.1)`, color: isFirstPage ? theme.inkSoft : theme.accent, fontFamily: theme.uiFont }}
              >
                ← Previous
              </button>
              <span className="text-[0.75rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={isLastPage}
                className="rounded-full px-4 py-2 text-[0.78rem] transition-opacity disabled:opacity-60"
                style={{ background: `rgba(${theme.accentRgb},0.1)`, color: isLastPage ? theme.inkSoft : theme.accent, fontFamily: theme.uiFont }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </GuestCard>
    </Reveal>
  );
}
