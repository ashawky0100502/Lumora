import { useEffect, useRef, useState } from 'react';
import { REACTION_EMOJIS } from '../../../lib/emoji';

// Small "+" trigger that pops a single row of quick-reaction emojis.
// Deliberately a fixed-width flex row (not a shrink-to-fit CSS grid) —
// see EmojiBar.jsx for why that combination squashes on small containers.
function AddReactionButton({ theme, onPick, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Add reaction"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.68rem] transition-transform active:scale-90"
        style={{
          background: `rgba(${theme.accentRgb},0.08)`,
          color: theme.inkSoft,
          border: `1px dashed rgba(${theme.accentRgb},0.4)`,
        }}
      >
        +
      </button>
      {open && (
        <div
          className="absolute bottom-[calc(100%+6px)] z-20 flex w-[196px] max-w-[80vw] flex-wrap gap-1 rounded-full px-2 py-1.5"
          style={{
            [align]: 0,
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {REACTION_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.95rem] leading-none transition-transform hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Renders the existing reaction chips for one message/comment plus the
// "+" add-reaction trigger. `viewerKey` is what identifies *this* viewer
// inside the reactions map ('guest', 'couple', or a guest_token for the
// public comments wall) so their own reaction can be highlighted and
// tapping a chip they're already in removes it instead of adding again.
export default function ReactionTray({ theme, reactions, viewerKey, onToggle, align = 'left', className = '' }) {
  const entries = Object.entries(reactions || {}).filter(([, actors]) => Array.isArray(actors) && actors.length > 0);

  return (
    <div className={`mt-1.5 flex flex-wrap items-center gap-1 ${className}`}>
      {entries.map(([emoji, actors]) => {
        const mine = actors.includes(viewerKey);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.72rem] transition-transform active:scale-95"
            style={{
              background: mine ? `rgba(${theme.accentRgb},0.22)` : `rgba(${theme.accentRgb},0.08)`,
              border: `1px solid ${mine ? theme.accent : 'transparent'}`,
              color: theme.ink,
              fontFamily: theme.uiFont,
            }}
          >
            <span>{emoji}</span>
            <span style={{ color: theme.inkSoft }}>{actors.length}</span>
          </button>
        );
      })}
      <AddReactionButton theme={theme} onPick={onToggle} align={align} />
    </div>
  );
}
