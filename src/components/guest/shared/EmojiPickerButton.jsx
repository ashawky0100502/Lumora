import { useEffect, useRef, useState } from 'react';
import { QUICK_EMOJIS } from '../../../lib/emoji';

// The composer's emoji picker — inserts an emoji into the text being
// typed. Different from Reactions.jsx (that one reacts to an existing
// message/comment); this one feeds into the input itself. Kept as a fixed
// width flex-wrap panel for the same reason as EmojiBar.jsx and
// Reactions.jsx: an `absolute` + CSS-grid combo with no explicit width is
// what caused the original squished-emoji bug.
export default function EmojiPickerButton({ theme, onPick }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRadius = theme.ornament === 'brackets' || theme.ornament === 'seal' ? '4px' : '9999px';
  const panelRadius = theme.ornament === 'brackets' || theme.ornament === 'seal' ? '4px' : '16px';

  useEffect(() => {
    if (!open) return undefined;
    function onOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Emoji"
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center border text-[1.1rem] transition-transform active:scale-95"
        style={{
          borderRadius: btnRadius,
          background: 'rgba(0,0,0,0.04)',
          borderColor: `rgba(${theme.accentRgb},0.28)`,
        }}
      >
        🙂
      </button>
      {open && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-0 z-20 flex w-[236px] max-w-[86vw] flex-wrap gap-1 p-2"
          style={{
            borderRadius: panelRadius,
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[1.05rem] leading-none transition-transform hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
