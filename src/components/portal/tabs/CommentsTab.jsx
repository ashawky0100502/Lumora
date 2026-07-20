import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, GuestInput, GuestButton } from '../../guest/shared/GuestUI';
import ReactionTray from '../../guest/shared/Reactions';
import EmojiPickerButton from '../../guest/shared/EmojiPickerButton';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';
import { pinComment, replyToComment, saveCommentThankYou, toggleCoupleCommentReaction } from '../../../lib/coupleApi';
import { orderGuestbookComments } from '../../../lib/commentFeatures';

function CommentRow({ theme, t, lang, slug, code, comment, onReplied, onReacted, onPinned, onThankYouSaved }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [thankYouText, setThankYouText] = useState(comment.thank_you || '');
  const [savingThankYou, setSavingThankYou] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await replyToComment(slug, code, comment.id, text.trim());
      onReplied(comment.id, text.trim());
      setReplying(false);
      setText('');
    } catch {
      /* leave the composer open with the text so they can retry */
    } finally {
      setBusy(false);
    }
  }

  async function handleReact(emoji) {
    try {
      const reactions = await toggleCoupleCommentReaction(slug, code, comment.id, emoji);
      onReacted(comment.id, reactions);
    } catch (err) {
      console.warn('couple_toggle_comment_reaction failed:', err?.message || err);
    }
  }

  async function handlePin() {
    if (!comment.id || savingPin) return;
    setSavingPin(true);
    try {
      await pinComment(slug, code, comment.id);
      onPinned(comment.id);
    } catch (err) {
      console.warn('pin_comment failed:', err?.message || err);
    } finally {
      setSavingPin(false);
    }
  }

  async function handleSaveThankYou() {
    if (!comment.id || savingThankYou) return;
    setSavingThankYou(true);
    try {
      await saveCommentThankYou(slug, code, comment.id, thankYouText);
      onThankYouSaved(comment.id, thankYouText.trim() || null);
      setThankYouOpen(false);
    } catch (err) {
      console.warn('save_comment_thank_you failed:', err?.message || err);
    } finally {
      setSavingThankYou(false);
    }
  }

  return (
    <GuestCard theme={theme} className="!p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.7rem]"
          style={{ background: `rgba(${theme.accentRgb},0.16)`, color: theme.accent, fontFamily: theme.uiFont }}
        >
          {initialsOf(comment.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.9rem] leading-relaxed" style={{ color: theme.ink, fontFamily: theme.uiFont }}>
            <span className="mr-1.5 font-semibold rtl:ml-1.5 rtl:mr-0" style={{ color: theme.accent }}>{comment.name}</span>
            {comment.text}
          </div>
          <div className="mt-0.5 text-[0.68rem]" style={{ color: theme.inkSoft }}>{timeAgo(comment.created_at, lang)}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ReactionTray theme={theme} reactions={comment.reactions} viewerKey="couple" onToggle={handleReact} />
            <button
              type="button"
              onClick={handlePin}
              disabled={savingPin}
              className="rounded-full px-3 py-1.5 text-[0.72rem] transition-opacity disabled:opacity-60"
              style={{ background: `rgba(${theme.accentRgb},0.12)`, color: comment.pinned_at ? theme.accent : theme.inkSoft, fontFamily: theme.uiFont }}
            >
              {comment.pinned_at ? '📌 Pinned' : '📌 Pin'}
            </button>
            <button
              type="button"
              onClick={() => {
                setThankYouText(comment.thank_you || '');
                setThankYouOpen(true);
              }}
              className="rounded-full px-3 py-1.5 text-[0.72rem] transition-opacity"
              style={{ background: `rgba(${theme.accentRgb},0.12)`, color: comment.thank_you ? theme.accent : theme.inkSoft, fontFamily: theme.uiFont }}
            >
              {comment.thank_you ? '✏️ Edit Thank You' : '❤️ Thank'}
            </button>
          </div>

          {comment.reply ? (
            <div className="mt-2.5 rounded-lg border-r-2 px-3 py-2 text-[0.82rem] rtl:border-l-2 rtl:border-r-0" style={{ borderColor: theme.accent, background: `rgba(${theme.accentRgb},0.08)`, color: theme.ink }}>
              <b style={{ color: theme.accent }}>{t.comments.yourReply}: </b>
              {comment.reply}
            </div>
          ) : replying ? (
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
              <EmojiPickerButton theme={theme} onPick={(e) => setText((prev) => prev + e)} />
              <GuestInput theme={theme} as="textarea" rows={2} placeholder={t.comments.replyPlaceholder} value={text} onChange={(e) => setText(e.target.value)} style={{ resize: 'none' }} />
              <GuestButton theme={theme} onClick={handleSend} disabled={busy} style={{ whiteSpace: 'nowrap' }}>
                {busy ? t.comments.sending : t.comments.send}
              </GuestButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReplying(true)}
              className="mt-2 text-[0.76rem]"
              style={{ color: theme.accent, fontFamily: theme.uiFont }}
            >
              {t.comments.reply}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {thankYouOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
            onClick={() => setThankYouOpen(false)}
          >
            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-[24px] border px-5 py-5 shadow-2xl"
              style={{ background: theme.surface, borderColor: theme.surfaceBorder }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[0.78rem] uppercase tracking-[0.25em]" style={{ color: theme.accent, fontFamily: theme.uiFont }}>
                Thank You Message
              </div>
              <h3 className="mt-2 text-[1.05rem]" style={{ color: theme.ink, fontFamily: theme.displayFont }}>
                Write a heartfelt note for this guest
              </h3>
              <textarea
                rows={5}
                value={thankYouText}
                onChange={(e) => setThankYouText(e.target.value)}
                placeholder="A personal thank-you message for their kindness..."
                className="mt-4 w-full rounded-2xl border px-3 py-3 text-[0.9rem] outline-none"
                style={{ borderColor: theme.surfaceBorder, background: theme.surfaceAlt, color: theme.ink, fontFamily: theme.uiFont, resize: 'none' }}
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setThankYouOpen(false)} className="rounded-full px-3 py-2 text-[0.8rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveThankYou} disabled={savingThankYou} className="rounded-full px-4 py-2 text-[0.8rem]" style={{ background: `linear-gradient(120deg, ${theme.accent}, ${theme.accentSoft})`, color: theme.id === 'velvet' || theme.id === 'midnight' ? '#1a1206' : '#fff', fontFamily: theme.uiFont }}>
                  {savingThankYou ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GuestCard>
  );
}

export default function CommentsTab({ theme, t, lang, slug, code, comments, onCommentsChange }) {
  const commentsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('auto');

  function handleReplied(id, reply) {
    onCommentsChange((prev) => (prev || []).map((c) => (c.id === id ? { ...c, reply, replied_at: new Date().toISOString() } : c)));
  }

  function handleReacted(id, reactions) {
    onCommentsChange((prev) => (prev || []).map((c) => (c.id === id ? { ...c, reactions } : c)));
  }

  function handlePinned(id) {
    onCommentsChange((prev) => (prev || []).map((c) => ({ ...c, pinned_at: c.id === id ? new Date().toISOString() : null })));
  }

  function handleThankYouSaved(id, thankYou) {
    onCommentsChange((prev) => (prev || []).map((c) => (c.id === id ? { ...c, thank_you: thankYou } : c)));
  }

  // Measure and update container height whenever page changes
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.scrollHeight;
      setContainerHeight(height);
    }
  }, [currentPage]);

  // Group comments into parent comments with their replies
  // A comment is a "parent" if it appears in the original flat list
  // The "reply" field on each comment indicates the couple's response
  const rootComments = orderGuestbookComments(comments || []);
  const totalRootComments = rootComments.length;
  const totalPages = Math.ceil(totalRootComments / commentsPerPage) || 1;
  const startIdx = currentPage * commentsPerPage;
  const endIdx = startIdx + commentsPerPage;
  const visible = rootComments.slice(startIdx, endIdx);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  function handlePrevious() {
    if (!isFirstPage) setCurrentPage((p) => p - 1);
  }

  function handleNext() {
    if (!isLastPage) setCurrentPage((p) => p + 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>{t.comments.title}</h2>
        <p className="mt-2 text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.comments.sub}</p>
      </div>

      {comments === null ? (
        <div className="py-10 text-center text-[0.85rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>{t.comments.loading}</div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.comments.empty}</div>
      ) : (
        <div className="flex flex-col gap-3">
          <motion.div
            animate={{ height: containerHeight }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div ref={containerRef} className="flex flex-col gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3"
                >
                  {visible.map((c) => (
                    <motion.div key={c.id ?? c.created_at} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                      <CommentRow
                        theme={theme}
                        t={t}
                        lang={lang}
                        slug={slug}
                        code={code}
                        comment={c}
                        onReplied={handleReplied}
                        onReacted={handleReacted}
                        onPinned={handlePinned}
                        onThankYouSaved={handleThankYouSaved}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstPage}
                className="rounded-full px-4 py-2 text-[0.78rem] transition-opacity"
                style={{
                  background: `rgba(${theme.accentRgb},0.1)`,
                  color: isFirstPage ? theme.inkSoft : theme.accent,
                  opacity: isFirstPage ? 0.5 : 1,
                  cursor: isFirstPage ? 'not-allowed' : 'pointer',
                  fontFamily: theme.uiFont,
                }}
              >
                ← {t.comments.previous || 'Previous'}
              </button>

              <span className="text-[0.75rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
                {currentPage + 1} / {totalPages}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLastPage}
                className="rounded-full px-4 py-2 text-[0.78rem] transition-opacity"
                style={{
                  background: `rgba(${theme.accentRgb},0.1)`,
                  color: isLastPage ? theme.inkSoft : theme.accent,
                  opacity: isLastPage ? 0.5 : 1,
                  cursor: isLastPage ? 'not-allowed' : 'pointer',
                  fontFamily: theme.uiFont,
                }}
              >
                {t.comments.next || 'Next'} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
