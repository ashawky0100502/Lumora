import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, GuestInput, GuestButton } from '../../guest/shared/GuestUI';
import ReactionTray from '../../guest/shared/Reactions';
import EmojiPickerButton from '../../guest/shared/EmojiPickerButton';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';
import { replyToComment, toggleCoupleCommentReaction } from '../../../lib/coupleApi';

function CommentRow({ theme, t, lang, slug, code, comment, onReplied, onReacted }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

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

          <ReactionTray theme={theme} reactions={comment.reactions} viewerKey="couple" onToggle={handleReact} />

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
    </GuestCard>
  );
}

export default function CommentsTab({ theme, t, lang, slug, code, comments, onCommentsChange }) {
  const [visibleCount, setVisibleCount] = useState(20);

  function handleReplied(id, reply) {
    onCommentsChange((prev) => (prev || []).map((c) => (c.id === id ? { ...c, reply, replied_at: new Date().toISOString() } : c)));
  }

  function handleReacted(id, reactions) {
    onCommentsChange((prev) => (prev || []).map((c) => (c.id === id ? { ...c, reactions } : c)));
  }

  // All comments are still fetched (so unread badges/notifications stay
  // accurate — the couple should always know someone commented), but only
  // a window of them is mounted to the DOM at once. Comments are already
  // newest-first, so this always shows the most recent ones; tapping
  // "load more" grows the window from data already in memory, no extra
  // network round-trip.
  const visible = comments ? comments.slice(0, visibleCount) : [];

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
          <AnimatePresence initial={false}>
            {visible.map((c) => (
              <motion.div key={c.id ?? c.created_at} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                <CommentRow theme={theme} t={t} lang={lang} slug={slug} code={code} comment={c} onReplied={handleReplied} onReacted={handleReacted} />
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 20)}
              className="mx-auto mt-1 rounded-full px-5 py-2 text-[0.78rem]"
              style={{ background: `rgba(${theme.accentRgb},0.1)`, color: theme.accent, fontFamily: theme.uiFont }}
            >
              {t.comments.loadMore || 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
