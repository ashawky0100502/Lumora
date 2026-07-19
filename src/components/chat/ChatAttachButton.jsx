import { useRef } from 'react';

const ICONS = {
  image: (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m4 17 5-5 3.5 3.5L17 11l4 4" />
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  ),
};

const ACCEPT = { image: 'image/*', audio: 'audio/*' };
const LABEL = { image: 'Attach image', audio: 'Attach audio' };

// `kind` is 'image' or 'audio' — controls the file picker's accept filter
// and icon. `onPick(file)` fires once a file is chosen; the caller owns
// upload/send + resetting any "sending" state.
export default function ChatAttachButton({ kind, onPick, disabled }) {
  const inputRef = useRef(null);

  return (
    <>
      <button
        type="button"
        title={LABEL[kind]}
        aria-label={LABEL[kind]}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.18)', color: 'rgba(246,244,239,0.75)' }}
      >
        {ICONS[kind]}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // allow picking the same file again later
          if (file) onPick(file);
        }}
      />
    </>
  );
}
