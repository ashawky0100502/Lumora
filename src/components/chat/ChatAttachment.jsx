import { useState } from 'react';
import { downloadAttachment, humanSize } from '../../lib/chatAttachmentsApi';

function DownloadButton({ url, name, light }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      title="Download"
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await downloadAttachment(url, name);
        } finally {
          setBusy(false);
        }
      }}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ background: light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.08)', color: light ? '#fff' : 'rgba(246,244,239,0.7)' }}
    >
      <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
      </svg>
    </button>
  );
}

// message.payload: { url, path, name, size, mime }
export default function ChatAttachment({ kind, payload }) {
  if (!payload?.url) return null;

  if (kind === 'image') {
    return (
      <div className="relative overflow-hidden rounded-2xl" style={{ maxWidth: 240 }}>
        <img
          src={payload.url}
          alt={payload.name || 'Photo'}
          onClick={() => window.open(payload.url, '_blank', 'noopener')}
          className="block max-h-[280px] w-full cursor-pointer object-cover"
          loading="lazy"
        />
        <div className="absolute right-2 top-2">
          <DownloadButton url={payload.url} name={payload.name} light />
        </div>
      </div>
    );
  }

  if (kind === 'audio') {
    return (
      <div
        className="flex min-w-[220px] max-w-[280px] items-center gap-2.5 rounded-2xl px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.16)' }}
      >
        <div className="min-w-0 flex-1">
          <audio controls src={payload.url} style={{ width: '100%', height: 32 }} />
          <div className="mt-1 truncate text-[0.66rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
            {payload.name} {payload.size ? `· ${humanSize(payload.size)}` : ''}
          </div>
        </div>
        <DownloadButton url={payload.url} name={payload.name} />
      </div>
    );
  }

  return null;
}
