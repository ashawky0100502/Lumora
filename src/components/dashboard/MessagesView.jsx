import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ownerListConversations,
  ownerGetConversationMessages,
  ownerSendReply,
  ownerGetSettings,
  ownerSetOnline,
  ownerSetArchived,
  ownerSetBlocked,
  subscribeToConversationMessages,
  subscribeToAllConversations,
} from '../../lib/ownerInboxApi';
import { ownerSendImage, ownerSendAudio, deleteChatMessage, deleteConversationWithAttachments } from '../../lib/chatAttachmentsApi';
import { sfxClick, sfxSuccess, sfxError } from '../../lib/sfx';
import { useIsMobile } from '../../hooks/useIsMobile';
import MessageBubble from '../chat/MessageBubble';
import EmojiBar from '../chat/EmojiBar';
import ChatAttachButton from '../chat/ChatAttachButton';

function timeAgoShort(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Small "..." menu shared by both the conversation row and the thread
// header — same three moderation actions everywhere, just fed different
// callbacks/labels depending on the conversation's current state.
function ActionsMenu({ conv, onArchive, onBlock, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ color: 'rgba(246,244,239,0.5)' }}
        title="More actions"
      >
        <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-20 w-[190px] overflow-hidden rounded-[12px] border py-1 text-[0.8rem]"
          style={{ background: '#171310', borderColor: 'rgba(212,175,55,0.22)', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.6)' }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onArchive();
            }}
            className="block w-full px-4 py-2.5 text-left"
            style={{ color: 'rgba(246,244,239,0.85)' }}
          >
            {conv.is_archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onBlock();
            }}
            className="block w-full px-4 py-2.5 text-left"
            style={{ color: conv.is_blocked ? '#8ce0a8' : '#e0b06b' }}
          >
            {conv.is_blocked ? 'Remove block' : 'Block visitor'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-4 py-2.5 text-left"
            style={{ color: '#e08a8a' }}
          >
            Delete conversation
          </button>
        </div>
      )}
    </div>
  );
}

function ConversationRow({ conv, active, onClick, onArchive, onBlock, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-start gap-2.5 rounded-[14px] px-3.5 py-3 transition-colors"
      style={{ background: active ? 'rgba(212,175,55,0.14)' : 'transparent' }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.85rem]"
        style={{ background: 'rgba(212,175,55,0.14)', color: 'var(--gold-soft)' }}
      >
        {(conv.visitor_name || 'V')[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.92)' }}>
            {conv.visitor_name || `Visitor ${(conv.visitor_token || '').slice(2, 7) || '???'}`}
          </span>
          <span className="shrink-0 text-[0.65rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
            {timeAgoShort(conv.last_message_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {conv.is_blocked && (
            <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem]" style={{ background: 'rgba(224,138,138,0.16)', color: '#e08a8a' }}>
              Blocked
            </span>
          )}
          {conv.template_name && (
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem]"
              style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold-soft)' }}
            >
              {conv.template_name}
            </span>
          )}
          <span className="truncate text-[0.75rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
            {conv.last_sender === 'owner' ? 'You: ' : ''}
            {conv.last_text}
          </span>
        </div>
      </div>
      {conv.unread_by_owner && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: '#ff6767', boxShadow: '0 0 6px #ff6767' }} />
      )}
      <ActionsMenu conv={conv} onArchive={onArchive} onBlock={onBlock} onDelete={onDelete} />
    </div>
  );
}

export default function MessagesView() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const scrollRef = useRef(null);
  const isMobile = useIsMobile();

  async function refreshList() {
    try {
      const data = await ownerListConversations();
      setConversations(data);
      setLoaded(true);
      setLoadError('');
    } catch (e) {
      // Most likely cause: supabase/owner_inbox.sql hasn't been run on
      // this project yet, so the owner_list_conversations() RPC doesn't
      // exist — without this catch the panel just stayed blank forever
      // with no feedback, which read as "the section doesn't open".
      setLoaded(true);
      setLoadError(e?.message || 'Could not load conversations.');
    }
  }

  async function openThread(id) {
    setActiveId(id);
    try {
      const data = await ownerGetConversationMessages(id);
      setMessages(data);
      setLoadError('');
    } catch (e) {
      // Without this catch, a failed RPC call here threw an unhandled
      // promise rejection which crashed the whole panel to a black
      // screen instead of just showing an inline error.
      setMessages([]);
      setLoadError(e?.message || 'Could not load this conversation.');
    }
    refreshList(); // clears the unread dot for this thread in the list
  }

  useEffect(() => {
    refreshList();
    ownerGetSettings()
      .then((s) => setIsOnline(!!s?.is_online))
      .catch(() => {});
    const unsubList = subscribeToAllConversations(() => refreshList());
    return () => unsubList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const unsub = subscribeToConversationMessages(activeId, () => openThread(activeId));
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter((c) => !!c.is_archived === showArchived)
      .filter(
        (c) =>
          !q ||
          (c.visitor_name || '').toLowerCase().includes(q) ||
          (c.template_name || '').toLowerCase().includes(q) ||
          (c.last_text || '').toLowerCase().includes(q)
      );
  }, [conversations, search, showArchived]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const unreadTotal = conversations.filter((c) => c.unread_by_owner && !c.is_archived).length;

  async function toggleOnline() {
    sfxClick();
    const next = !isOnline;
    setIsOnline(next);
    await ownerSetOnline(next);
  }

  async function handleSend(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !activeId || sending) return;
    setSending(true);
    setText('');
    try {
      await ownerSendReply(activeId, value);
      sfxSuccess();
      await openThread(activeId);
    } catch (err) {
      setLoadError(err?.message || 'Could not send that reply.');
      setText(value); // give the message back so it isn't lost
    } finally {
      setSending(false);
    }
  }

  async function handleAttach(kind, file) {
    if (!activeId || uploading) return;
    setUploading(true);
    try {
      if (kind === 'image') await ownerSendImage(activeId, activeConv?.visitor_token, file);
      else await ownerSendAudio(activeId, activeConv?.visitor_token, file);
      sfxSuccess();
      await openThread(activeId);
    } catch (err) {
      sfxError();
      setLoadError(err?.message || 'Could not send that file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteMessage(message) {
    if (!window.confirm('Delete this message? This only removes it from the thread.')) return;
    try {
      await deleteChatMessage(message, { role: 'owner' });
      setMessages((list) => list.filter((m) => m.id !== message.id));
    } catch (err) {
      setLoadError(err?.message || 'Could not delete that message.');
    }
  }

  async function handleArchive(conv) {
    sfxClick();
    await ownerSetArchived(conv.id, !conv.is_archived);
    if (conv.id === activeId) setActiveId(null);
    refreshList();
  }

  async function handleBlock(conv) {
    sfxClick();
    await ownerSetBlocked(conv.id, !conv.is_blocked);
    refreshList();
  }

  async function handleDelete(conv) {
    if (!window.confirm(`Delete the whole conversation with ${conv.visitor_name || 'this visitor'}? This can't be undone.`)) return;
    await deleteConversationWithAttachments(conv.id);
    if (conv.id === activeId) {
      setActiveId(null);
      setMessages([]);
    }
    refreshList();
  }

  // On mobile, the list+thread two-column layout has no room to breathe —
  // this was the actual cause of the composer looking "missing": both
  // columns kept their desktop widths, squeezing the thread column (and
  // its Send button) down to almost nothing. Below the breakpoint we show
  // one panel at a time instead, master-detail style, same pattern already
  // used by Sidebar/Dashboard for mobile.
  const showList = !isMobile || !activeConv;
  const showThread = !isMobile || !!activeConv;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-[1.5rem]" style={{ letterSpacing: '0.02em' }}>
            Messages {unreadTotal > 0 && <span style={{ color: '#ff6767' }}>({unreadTotal})</span>}
          </div>
          <div className="font-serif-alt mt-1 italic" style={{ color: 'rgba(246,244,239,0.5)' }}>
            Every visitor who reaches out gets their own private thread with you.
          </div>
        </div>
        <button
          type="button"
          onClick={toggleOnline}
          className="flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[0.8rem]"
          style={{
            borderColor: isOnline ? 'rgba(140,224,168,0.35)' : 'rgba(212,175,55,0.22)',
            background: isOnline ? 'rgba(140,224,168,0.08)' : 'rgba(255,255,255,0.03)',
            color: isOnline ? '#8ce0a8' : 'rgba(246,244,239,0.6)',
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: isOnline ? '#8ce0a8' : '#9a9a9a', boxShadow: isOnline ? '0 0 6px #8ce0a8' : 'none' }}
          />
          {isOnline ? 'Online — visitors see you as available' : 'Offline — visitors see you as away'}
        </button>
      </div>

      <div
        className="lux-card grid overflow-hidden rounded-[20px] border"
        style={{
          background: 'var(--glass)',
          borderColor: 'rgba(212,175,55,0.16)',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,300px) 1fr',
          height: isMobile ? 'calc(100dvh - 230px)' : 620,
          minHeight: isMobile ? 420 : undefined,
        }}
      >
        {/* Conversation list */}
        {showList && (
          <div
            className="flex min-h-0 flex-col"
            style={!isMobile ? { borderRight: '1px solid rgba(212,175,55,0.14)' } : undefined}
          >
            <div className="flex shrink-0 items-center gap-2 p-3">
              <div
                className="flex flex-1 items-center gap-2 rounded-[10px] border px-3 py-2"
                style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(212,175,55,0.18)' }}
              >
                <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-transparent text-[0.8rem] outline-none"
                  style={{ color: 'var(--white)' }}
                />
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5 px-3 pb-2">
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                className="rounded-full px-3 py-1 text-[0.72rem]"
                style={{
                  background: !showArchived ? 'rgba(212,175,55,0.16)' : 'transparent',
                  color: !showArchived ? 'var(--gold-soft)' : 'rgba(246,244,239,0.45)',
                }}
              >
                Inbox
              </button>
              <button
                type="button"
                onClick={() => setShowArchived(true)}
                className="rounded-full px-3 py-1 text-[0.72rem]"
                style={{
                  background: showArchived ? 'rgba(212,175,55,0.16)' : 'transparent',
                  color: showArchived ? 'var(--gold-soft)' : 'rgba(246,244,239,0.45)',
                }}
              >
                Archived
              </button>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
              {loaded && loadError && (
                <div className="p-6 text-center text-[0.78rem]" style={{ color: '#e08a8a' }}>
                  Couldn't load conversations: {loadError}
                  <br />
                  <span style={{ color: 'rgba(246,244,239,0.4)' }}>
                    Make sure supabase/owner_inbox.sql has been run on your Supabase project.
                  </span>
                </div>
              )}
              {loaded && !loadError && filtered.length === 0 && (
                <div className="p-8 text-center text-[0.8rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
                  {showArchived ? 'No archived conversations.' : 'No conversations yet.'}
                </div>
              )}
              {filtered.map((c) => (
                <ConversationRow
                  key={c.id}
                  conv={c}
                  active={c.id === activeId}
                  onClick={() => openThread(c.id)}
                  onArchive={() => handleArchive(c)}
                  onBlock={() => handleBlock(c)}
                  onDelete={() => handleDelete(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Thread */}
        {showThread && (
          <div className="flex min-h-0 flex-col">
            {!activeConv ? (
              <div className="flex flex-1 items-center justify-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
                Select a conversation to view it
              </div>
            ) : (
              <>
                <div
                  className="flex shrink-0 items-center justify-between gap-2 border-b px-5 py-3.5"
                  style={{ borderColor: 'rgba(212,175,55,0.14)' }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setActiveId(null)}
                        className="shrink-0 rounded-full p-1"
                        style={{ color: 'rgba(246,244,239,0.6)' }}
                        aria-label="Back to conversations"
                      >
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </button>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-[0.9rem]" style={{ color: 'rgba(246,244,239,0.92)' }}>
                        {activeConv.visitor_name || `Visitor ${(activeConv.visitor_token || '').slice(2, 7) || '???'}`}
                        {activeConv.is_blocked && <span style={{ color: '#e08a8a' }}> · Blocked</span>}
                      </div>
                      <div className="mt-0.5 truncate text-[0.7rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                        {activeConv.source === 'template' ? `Interested in ${activeConv.template_name || 'a template'}` : 'Quick order request'}
                        {activeConv.visitor_email ? ` · ${activeConv.visitor_email}` : ''}
                      </div>
                    </div>
                  </div>
                  <ActionsMenu
                    conv={activeConv}
                    onArchive={() => handleArchive(activeConv)}
                    onBlock={() => handleBlock(activeConv)}
                    onDelete={() => handleDelete(activeConv)}
                  />
                </div>
                {loadError && (
                  <div className="px-5 py-3 text-[0.78rem]" style={{ color: '#e08a8a' }}>
                    Couldn't load this conversation: {loadError}
                  </div>
                )}
                <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} viewerRole="owner" onDelete={handleDeleteMessage} />
                  ))}
                </div>
                {activeConv.is_blocked && (
                  <div className="shrink-0 px-5 py-2 text-center text-[0.72rem]" style={{ color: '#e0b06b' }}>
                    This visitor is blocked and can't send new messages. You can still reply.
                  </div>
                )}
                <form
                  onSubmit={handleSend}
                  className="flex shrink-0 items-center gap-2 border-t px-4 py-3.5"
                  style={{ borderColor: 'rgba(212,175,55,0.14)' }}
                >
                  <EmojiBar onPick={(e) => setText((t) => t + e)} />
                  <ChatAttachButton kind="image" disabled={uploading} onPick={(file) => handleAttach('image', file)} />
                  <ChatAttachButton kind="audio" disabled={uploading} onPick={(file) => handleAttach('audio', file)} />
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Reply…"
                    className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2.5 text-[0.85rem] outline-none"
                    style={{ borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="btn-gold shrink-0 rounded-full px-5 py-2.5 text-[0.82rem]"
                  >
                    Send
                  </button>
                </form>
                {uploading && (
                  <div className="shrink-0 px-5 pb-2 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                    Sending file…
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
