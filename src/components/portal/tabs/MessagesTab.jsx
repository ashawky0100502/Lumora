import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, GuestInput, GuestButton } from '../../guest/shared/GuestUI';
import ReactionTray from '../../guest/shared/Reactions';
import EmojiPickerButton from '../../guest/shared/EmojiPickerButton';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';
import { getCoupleThreadMessages, sendCoupleReply, toggleCoupleMessageReaction } from '../../../lib/coupleApi';

function ThreadRow({ theme, t, thread, active, onClick }) {
  const name = thread.guest_name || t.messages.guestFallback;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-300 rtl:text-right"
      style={{
        background: active ? `rgba(${theme.accentRgb},0.12)` : 'transparent',
        borderColor: active ? theme.accent : 'transparent',
      }}
    >
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.72rem]"
        style={{ background: `rgba(${theme.accentRgb},0.16)`, color: theme.accent, fontFamily: theme.uiFont }}
      >
        {initialsOf(name)}
        {Number(thread.unread_count) > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[0.55rem]" style={{ background: '#c25a5a', color: '#fff' }}>
            {thread.unread_count}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.86rem]" style={{ color: theme.ink, fontFamily: theme.uiFont }}>{name}</div>
        <div className="truncate text-[0.74rem]" style={{ color: theme.inkSoft }}>
          {thread.last_sender === 'couple' ? `${t.messages.you}: ` : ''}
          {thread.last_text}
        </div>
      </div>
      <div className="shrink-0 text-[0.65rem]" style={{ color: theme.inkSoft }}>{timeAgo(thread.last_at)}</div>
    </button>
  );
}

export default function MessagesTab({ theme, t, lang, slug, code, threads, onThreadsChange, loadError }) {
  const [selected, setSelected] = useState(null); // guest_token
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState(false);
  const listRef = useRef(null);

  const activeThread = (threads || []).find((th) => th.guest_token === selected);

  useEffect(() => {
    if (!selected) return;
    setSendError(false);
    let alive = true;
    getCoupleThreadMessages(slug, code, selected)
      .then((data) => {
        if (!alive) return;
        setMessages(data);
        onThreadsChange((prev) => (prev || []).map((th) => (th.guest_token === selected ? { ...th, unread_count: 0 } : th)));
      })
      .catch(() => alive && setMessages([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, slug, code]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function handleReact(messageId, emoji) {
    if (!messageId || !selected) return;
    try {
      const reactions = await toggleCoupleMessageReaction(slug, code, selected, messageId, emoji);
      setMessages((prev) => (prev || []).map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    } catch (err) {
      console.warn('couple_toggle_message_reaction failed:', err?.message || err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setBusy(true);
    setSendError(false);
    const optimistic = text.trim();
    setText('');
    try {
      await sendCoupleReply(slug, code, selected, optimistic);
      setMessages((prev) => [...(prev || []), { sender: 'couple', text: optimistic, created_at: new Date().toISOString() }]);
      onThreadsChange((prev) =>
        (prev || []).map((th) => (th.guest_token === selected ? { ...th, last_text: optimistic, last_sender: 'couple', last_at: new Date().toISOString() } : th))
      );
    } catch (err) {
      console.warn('send_couple_reply failed:', err?.message || err);
      setText(optimistic);
      setSendError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <h2 style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>{t.messages.title}</h2>
        <p className="mt-2 text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.messages.sub}</p>
      </div>

      <GuestCard theme={theme} className="!p-0 overflow-hidden" style={{ minHeight: 460 }}>
        <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr]">
          {/* Thread list — hidden on mobile once a thread is open */}
          <div
            className={`${selected ? 'hidden sm:block' : 'block'} border-b sm:border-b-0 sm:border-r rtl:sm:border-l rtl:sm:border-r-0`}
            style={{ borderColor: theme.surfaceBorder }}
          >
            <div className="max-h-[460px] overflow-y-auto p-2">
              {loadError && (
                <div className="p-4 text-center text-[0.76rem]" style={{ color: '#c25a5a' }}>
                  {loadError}
                </div>
              )}
              {!loadError && threads === null && (
                <div className="py-8 text-center text-[0.82rem]" style={{ color: theme.inkSoft }}>{t.messages.loading}</div>
              )}
              {!loadError && threads?.length === 0 && (
                <div className="py-8 text-center text-[0.82rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.messages.empty}</div>
              )}
              {threads?.map((th) => (
                <ThreadRow key={th.guest_token} theme={theme} t={t} thread={th} active={selected === th.guest_token} onClick={() => setSelected(th.guest_token)} />
              ))}
            </div>
          </div>

          {/* Conversation pane */}
          <div className={`${selected ? 'flex' : 'hidden sm:flex'} flex-col`} style={{ minHeight: 460 }}>
            {!selected ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
                {t.messages.selectThread}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b px-4 py-3 sm:hidden" style={{ borderColor: theme.surfaceBorder }}>
                  <button type="button" onClick={() => setSelected(null)} style={{ color: theme.accent, fontFamily: theme.uiFont }}>
                    ←
                  </button>
                  <div style={{ color: theme.ink, fontFamily: theme.uiFont }}>{activeThread?.guest_name || t.messages.guestFallback}</div>
                </div>

                <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: 380 }}>
                  {messages === null && (
                    <div className="py-8 text-center text-[0.82rem]" style={{ color: theme.inkSoft }}>{t.messages.loading}</div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages?.map((m, i) => {
                      const isCouple = m.sender === 'couple';
                      return (
                        <div key={(m.created_at || i) + i} className="max-w-[80%]" style={{ marginLeft: isCouple ? 'auto' : 0 }}>
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl px-4 py-2.5 text-[0.85rem] leading-relaxed"
                            style={{
                              background: isCouple
                                ? `linear-gradient(120deg, rgba(${theme.accentRgb},0.9), rgba(${theme.accentRgb},0.65))`
                                : `rgba(${theme.accentRgb},0.1)`,
                              color: isCouple ? '#fff' : theme.ink,
                              fontFamily: theme.uiFont,
                              borderBottomRightRadius: isCouple ? 4 : undefined,
                              borderBottomLeftRadius: isCouple ? undefined : 4,
                            }}
                          >
                            {m.text}
                            <div className="mt-1 text-[0.62rem] opacity-70">{timeAgo(m.created_at, lang)}</div>
                          </motion.div>
                          {m.id && (
                            <div className={isCouple ? 'flex justify-end' : ''}>
                              <ReactionTray
                                theme={theme}
                                reactions={m.reactions}
                                viewerKey="couple"
                                onToggle={(emoji) => handleReact(m.id, emoji)}
                                align={isCouple ? 'right' : 'left'}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleSend} className="flex flex-col gap-2 border-t p-3" style={{ borderColor: theme.surfaceBorder }}>
                  {sendError && (
                    <div className="text-[0.74rem]" style={{ color: '#c25a5a' }}>
                      {t.messages.error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <EmojiPickerButton theme={theme} onPick={(e) => setText((prev) => prev + e)} />
                    <GuestInput theme={theme} placeholder={t.messages.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
                    <GuestButton theme={theme} type="submit" disabled={busy} style={{ padding: '10px 20px' }}>
                      {t.messages.send}
                    </GuestButton>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </GuestCard>
    </div>
  );
}
