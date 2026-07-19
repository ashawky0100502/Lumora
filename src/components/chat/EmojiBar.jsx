import { useEffect, useRef, useState } from 'react';
import { QUICK_EMOJIS } from '../../lib/emoji';

// NOTE on the squish bug: this panel used to be `grid grid-cols-6` with no
// explicit width. Tailwind's grid-cols-N is `repeat(N, minmax(0, 1fr))`,
// and because the panel is `absolute` (so it sizes itself to fit its
// content, i.e. shrink-to-fit), browsers can't resolve `1fr` tracks against
// a real width — the columns collapse toward their `minmax(0, …)` floor
// instead of their content size, which is what made every emoji render
// squashed on top of the next one. Giving the panel a fixed width (so it's
// no longer shrink-to-fit) and switching to plain flex-wrap avoids the
// whole class of bug on any screen size.
export default function EmojiBar({ onPick }) {
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
        aria-label="Emoji"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[1rem]"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.18)' }}
      >
        🙂
      </button>
      {open && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-0 z-20 flex w-[224px] max-w-[88vw] flex-wrap gap-1 rounded-xl p-2"
          style={{ background: 'rgba(18,14,26,0.97)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[1.05rem] leading-none hover:bg-white/5"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
