import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getTemplatePrices, CURRENCY } from '../lib/visitorPricing';
import { getVisitorToken, getVisitorName, getVisitorEmail } from '../lib/visitorIdentity';
import {
  openVisitorConversation,
  sendVisitorMessage,
  getVisitorThread,
  getPublicOwnerStatus,
  subscribeToConversationMessages,
} from '../lib/ownerInboxApi';
import { visitorSendImage, visitorSendAudio, deleteChatMessage } from '../lib/chatAttachmentsApi';
import { sfxClick, sfxSuccess, sfxError } from '../lib/sfx';
import MessageBubble from './chat/MessageBubble';
import EmojiBar from './chat/EmojiBar';
import ChatAttachButton from './chat/ChatAttachButton';

// The real private-messages thread with the owner. Reached two ways:
//   1. template != null  — after picking a template from the Guest gallery
//   2. template == null  — the short "Contact Owner" button on the login
//      screen (quick order, no template picked yet)
// Either way it's the same conversation for this browser (visitorIdentity.js),
// so a visitor who does both ends up in one continuous thread.
export default function VisitorChat({ template, onBack }) {
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(null);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const scrollRef = useRef(null);
  const visitorToken = useRef(getVisitorToken());

  async function refreshThread() {
    const thread = await getVisitorThread(visitorToken.current);
    setMessages(thread);
  }

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    (async () => {
      try {
        const conv = await openVisitorConversation(visitorToken.current, {
          visitorName: getVisitorName(),
          visitorEmail: getVisitorEmail(),
          source: template ? 'template' : 'quick_order',
          templateId: template?.id,
          templateName: template?.name,
        });
        if (cancelled) return;
        await refreshThread();
        if (cancelled) return;
        unsubscribe = subscribeToConversationMessages(conv.id, () => refreshThread());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    getPublicOwnerStatus().then(setIsOnline).catch(() => setIsOnline(null));
    const statusPoll = setInterval(() => {
      getPublicOwnerStatus().then(setIsOnline).catch(() => {});
    }, 20000);

    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(statusPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getTemplatePrices()
      .then((data) => {
        if (!cancelled) setPrices(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPrices(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e) {
    e?.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText('');
    try {
      await sendVisitorMessage(visitorToken.current, value);
      sfxSuccess();
      await refreshThread();
    } finally {
      setSending(false);
    }
  }

  async function handleAttach(kind, file) {
    if (uploading) return;
    setUploading(true);
    try {
      if (kind === 'image') await visitorSendImage(visitorToken.current, file);
      else await visitorSendAudio(visitorToken.current, file);
      sfxSuccess();
      await refreshThread();
    } catch (err) {
      sfxError();
      window.alert(err?.message || 'Could not send that file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteMessage(message) {
    if (!window.confirm('Delete this message? This can\u2019t be undone.')) return;
    try {
      await deleteChatMessage(message, { role: 'visitor', visitorToken: visitorToken.current });
      setMessages((list) => list.filter((m) => m.id !== message.id));
    } catch {
      sfxError();
    }
  }

  return (
    <motion.div
      className="glass-card flex w-[min(480px,94vw)] flex-col overflow-hidden rounded-[22px]"
      style={{ height: 'min(640px, 88vh)' }}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: 'rgba(212,175,55,0.16)' }}
      >
        <div>
          <div className="font-display text-[1rem] font-semibold" style={{ letterSpacing: '0.03em' }}>
            LUMORA Team
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: isOnline ? '#8ce0a8' : isOnline === false ? '#9a9a9a' : 'transparent',
                boxShadow: isOnline ? '0 0 6px #8ce0a8' : 'none',
              }}
            />
            {isOnline === null ? 'Direct Messages' : isOnline ? 'Online now' : 'Offline — will reply soon'}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[0.78rem]"
          style={{ color: 'rgba(246,244,239,0.45)' }}
        >
          ← Back
        </button>
      </div>

      {/* Template chip, if arriving from the gallery */}
      {template && (
        <div
          className="mx-5 mt-4 flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="font-display text-[0.85rem]" style={{ color: 'var(--gold-soft)' }}>
            {template.name}
          </span>
          <span className="font-display text-[0.8rem] font-semibold" style={{ color: 'rgba(246,244,239,0.85)' }}>
            {loadingPrices ? '...' : prices[template.id] ?? 0} {CURRENCY}
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {!ready && (
          <div className="pt-10 text-center text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
            Connecting…
          </div>
        )}
        {ready && messages.length === 0 && (
          <div className="pt-10 text-center text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
            {template
              ? `Say hi and let the team know you're interested in ${template.name} — you'll get an instant reply.`
              : "Tell the team what you'd like to order — you'll get an instant reply."}
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} viewerRole="visitor" onDelete={handleDeleteMessage} />
        ))}
      </div>

      {/* Composer */}
      {uploading && (
        <div className="px-5 pb-1 text-[0.7rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
          Sending file…
        </div>
      )}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t px-4 py-3.5" style={{ borderColor: 'rgba(212,175,55,0.16)' }}>
        <EmojiBar onPick={(e) => setText((t) => t + e)} />
        <ChatAttachButton kind="image" disabled={!ready || uploading} onPick={(file) => handleAttach('image', file)} />
        <ChatAttachButton kind="audio" disabled={!ready || uploading} onPick={(file) => handleAttach('audio', file)} />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          disabled={!ready}
          className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2.5 text-[0.85rem] outline-none"
          style={{ borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
        />
        <button
          type="submit"
          disabled={!ready || sending || !text.trim()}
          onClick={() => sfxClick()}
          className="btn-gold shrink-0 rounded-full px-5 py-2.5 text-[0.82rem]"
        >
          Send
        </button>
      </form>
    </motion.div>
  );
}
