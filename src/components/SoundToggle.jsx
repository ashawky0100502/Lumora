import { useState } from 'react';
import { setSoundOn } from '../lib/sfx';

export default function SoundToggle() {
  const [on, setOn] = useState(true);

  function handleClick() {
    const next = !on;
    setOn(next);
    setSoundOn(next);
  }

  return (
    <button
      id="sound-toggle"
      aria-label="Toggle sound"
      onClick={handleClick}
      className="fixed top-7 right-8 z-[60] flex h-11 w-11 items-center justify-center rounded-full border transition-shadow duration-400 hover:shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:border-[var(--gold)]"
      style={{
        background: 'rgba(20,16,30,0.5)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {on ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="var(--gold-soft)">
          <path d="M3 10v4h4l5 5V5L7 10H3z" />
          <path d="M16 8.5a4.5 4.5 0 0 1 0 7" stroke="#f0d98c" strokeWidth="1.4" fill="none" />
          <path d="M18.5 6a8 8 0 0 1 0 12" stroke="#f0d98c" strokeWidth="1.2" fill="none" opacity="0.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="var(--gold-soft)">
          <path d="M3 10v4h4l5 5V5L7 10H3z" />
          <line x1="16" y1="9" x2="21" y2="15" stroke="#f0d98c" strokeWidth="1.5" />
          <line x1="21" y1="9" x2="16" y2="15" stroke="#f0d98c" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}
