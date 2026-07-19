import PaymentMethodsCard from './PaymentMethodsCard';
import ChatAttachment from './ChatAttachment';

// `viewerRole` is 'visitor' or 'owner' — determines which side of the chat
// a message lands on. A message is "mine" when its sender matches the
// viewer, except 'system' messages (auto-reply + payment methods) which
// always render as if sent by the owner, since that's who they represent.
function timeLabel(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// `onDelete`, when passed, renders a small hover-visible trash icon. The
// owner can moderate any message in the thread; a visitor can only delete
// their own (system messages — the auto-reply and payment methods card —
// are never deletable by the visitor).
export default function MessageBubble({ message, viewerRole, onDelete }) {
  const effectiveSender = message.sender === 'system' ? 'owner' : message.sender;
  const mine = effectiveSender === viewerRole;
  const canDelete = typeof onDelete === 'function' && (viewerRole === 'owner' || (viewerRole === 'visitor' && mine));

  const trashBtn = (
    <button
      type="button"
      onClick={() => onDelete(message)}
      title="Delete message"
      className="shrink-0 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
      style={{ color: 'rgba(246,244,239,0.35)' }}
    >
      <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14Z" />
      </svg>
    </button>
  );

  return (
    <div className={`group flex items-center gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
      {canDelete && mine && trashBtn}
      <div className="max-w-[82%]">
        {message.kind === 'payment_methods' ? (
          <PaymentMethodsCard methods={message.payload} />
        ) : message.kind === 'image' || message.kind === 'audio' ? (
          <ChatAttachment kind={message.kind} payload={message.payload} />
        ) : (
          <div
            className="rounded-2xl px-4 py-2.5 text-[0.86rem] leading-relaxed break-words"
            style={
              mine
                ? { background: 'linear-gradient(120deg, var(--gold), var(--gold-soft))', color: '#1a1206', borderBottomRightRadius: 4 }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(212,175,55,0.16)',
                    color: 'rgba(246,244,239,0.9)',
                    borderBottomLeftRadius: 4,
                  }
            }
          >
            {message.text}
          </div>
        )}
        <div
          className={`mt-1 text-[0.62rem] ${mine ? 'text-right' : 'text-left'}`}
          style={{ color: 'rgba(246,244,239,0.35)' }}
        >
          {timeLabel(message.created_at)}
        </div>
      </div>
      {canDelete && !mine && trashBtn}
    </div>
  );
}
