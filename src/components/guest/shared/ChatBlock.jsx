import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, SectionHeading, GuestInput, GuestButton } from './GuestUI';
import Reveal from './Reveal';
import ReactionTray from './Reactions';
import EmojiPickerButton from './EmojiPickerButton';
import {
  getGuestName,
  setGuestName,
  loadGuestThread,
  markThreadSeen,
  sendGuestMessage,
  toggleGuestMessageReaction,
} from '../../../lib/guestApi';
import { timeAgo } from '../../../lib/guestFormat';

const POLL_MS = 8000;

export default function ChatBlock({ theme, slug, lang, t, coupleNames }) {
  const [nameKnown, setNameKnown] = useState(() => Boolean(getGuestName(slug)));
  const [nameInput, setNameInput] = useState('');
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (!nameKnown) return undefined;
    let alive = true;
    async function refresh() {
      try {
        const data = await loadGuestThread(slug);
        if (alive) setThread(data);
        markThreadSeen(slug);
      } catch {
        if (alive) setThread((prev) => prev ?? []);
      }
    }
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [nameKnown, slug]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [thread]);

  async function handleReact(messageId, emoji) {
    if (!messageId) return; // optimistic messages before the next refresh don't have a real id yet
    try {
      const reactions = await toggleGuestMessageReaction(slug, messageId, emoji);
      setThread((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    } catch (err) {
      console.error('[ChatBlock] toggleGuestMessageReaction failed:', err);
    }
  }

  function handleNameContinue(e) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setGuestName(slug, nameInput.trim());
    setNameKnown(true);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setSendError('');
    const optimisticText = text.trim();
    setText('');
    try {
      await sendGuestMessage(slug, optimisticText);
      setThread((prev) => [
        ...(prev || []),
        { sender: 'guest', text: optimisticText, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      // Previously this failed silently — the guest's text just came back
      // in the input with no explanation, so a blocked insert (e.g. an RLS
      // policy mismatch) looked exactly like "nothing happened". Now the
      // real reason is logged and shown, so it's obvious it didn't send.
      console.error('[ChatBlock] sendGuestMessage failed:', err);
      setSendError(err?.message || 'Message failed to send — please try again.');
      setText(optimisticText);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <GuestCard theme={theme} className="flex flex-col" style={{ maxHeight: 560 }}>
        <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />

        <AnimatePresence mode="wait">
          {!nameKnown ? (
            <motion.form
              key="gate"
              onSubmit={handleNameContinue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[0.85rem]" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont, fontStyle: 'italic' }}>
                {t.intro}
              </p>
              <GuestInput theme={theme} placeholder={t.namePlaceholder} value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
              <GuestButton theme={theme} type="submit">{t.continue}</GuestButton>
            </motion.form>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-0 flex-1 flex-col">
              <div ref={listRef} className="mb-4 flex-1 space-y-2.5 overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
                {thread === null && (
                  <div className="py-6 text-center text-[0.8rem]" style={{ color: theme.inkSoft }}>{t.loading}</div>
                )}
                {thread?.length === 0 && (
                  <div className="py-6 text-center text-[0.82rem]" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont, fontStyle: 'italic' }}>
                    {t.empty}
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {thread?.map((m, i) => {
                    const isCouple = m.sender === 'couple';
                    return (
                      <div key={(m.created_at || i) + i} className="max-w-[80%]" style={{ marginLeft: isCouple ? 0 : 'auto' }}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="rounded-2xl px-4 py-2.5 text-[0.85rem] leading-relaxed"
                          style={{
                            background: isCouple ? `rgba(${theme.accentRgb},0.12)` : `linear-gradient(120deg, rgba(${theme.accentRgb},0.9), rgba(${theme.accentRgb},0.65))`,
                            color: isCouple ? theme.ink : '#fff',
                            fontFamily: theme.uiFont,
                            borderBottomLeftRadius: isCouple ? 4 : undefined,
                            borderBottomRightRadius: isCouple ? undefined : 4,
                          }}
                        >
                          {isCouple && (
                            <div className="mb-0.5 text-[0.68rem] font-semibold" style={{ color: theme.accent }}>{coupleNames}</div>
                          )}
                          {m.text}
                          <div className="mt-1 text-[0.62rem] opacity-70">{timeAgo(m.created_at, lang)}</div>
                        </motion.div>
                        {m.id && (
                          <div className={isCouple ? '' : 'flex justify-end'}>
                            <ReactionTray
                              theme={theme}
                              reactions={m.reactions}
                              viewerKey="guest"
                              onToggle={(emoji) => handleReact(m.id, emoji)}
                              align={isCouple ? 'left' : 'right'}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSend} className="flex gap-2">
                <EmojiPickerButton theme={theme} onPick={(e) => setText((prev) => prev + e)} />
                <GuestInput theme={theme} placeholder={t.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
                <GuestButton theme={theme} type="submit" disabled={busy} style={{ padding: '10px 20px' }}>
                  {t.send}
                </GuestButton>
              </form>
              {sendError && (
                <div className="mt-2 text-[0.72rem]" style={{ color: '#c25a5a' }}>
                  {sendError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GuestCard>
    </Reveal>
  );
}
