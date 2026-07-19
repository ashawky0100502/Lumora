import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { listMusicTracks, uploadMusicTrack, deleteMusicTrack } from '../../lib/musicApi';
import { sfxClick, sfxSuccess, sfxError } from '../../lib/sfx';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function MusicStudioView() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  function refresh() {
    setLoading(true);
    return listMusicTracks()
      .then(setTracks)
      .catch((e) => setError(e.message || 'حصل خطأ أثناء تحميل الأغاني'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    return () => audioRef.current?.pause();
  }, []);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('audio/'));
    if (!files.length) return;

    setError('');
    setUploading(true);
    try {
      for (const file of files) {
        const row = await uploadMusicTrack(file);
        setTracks((prev) => [row, ...prev]);
      }
      sfxSuccess();
    } catch (e) {
      sfxError();
      setError(e.message || 'حصل خطأ أثناء رفع الأغاني');
    } finally {
      setUploading(false);
    }
  }

  function togglePlay(track) {
    sfxClick();
    const el = audioRef.current;
    if (!el) return;
    if (playingId === track.id) {
      el.pause();
      setPlayingId(null);
      return;
    }
    el.src = track.url;
    el.play();
    setPlayingId(track.id);
  }

  async function handleDelete(track) {
    sfxClick();
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    setTracks((prev) => prev.filter((t) => t.id !== track.id));
    try {
      await deleteMusicTrack(track);
    } catch (e) {
      sfxError();
      setError(e.message || 'حصل خطأ أثناء الحذف');
      refresh();
    }
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.4rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
            Music Studio
          </h2>
          <p className="font-serif-alt mt-1.5 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '0.98rem' }}>
            مكتبة أغانيك الخاصة — ارفع هنا مرة واحدة، واستخدمها بعدين في أي دعوة وأي قالب.
          </p>
        </div>
        <button type="button" className="btn-gold" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'جاري الرفع...' : '+ رفع أغنية'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border px-4 py-3 text-[0.82rem]" style={{ borderColor: 'rgba(220,90,90,0.4)', color: '#e08a8a', background: 'rgba(220,90,90,0.08)' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: 'rgba(212,175,55,0.08)' }} />
          ))}
        </div>
      )}

      {!loading && tracks.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-14 text-center"
          style={{ borderColor: 'rgba(212,175,55,0.18)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-10 w-10" style={{ color: 'rgba(212,175,55,0.4)' }}>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <div className="font-display" style={{ color: 'var(--gold-soft)' }}>
            مفيش أغاني لسه
          </div>
          <p className="max-w-xs text-[0.8rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.45)' }}>
            دوس على "رفع أغنية" — أول ما ترفعها هتقدر تختارها من أي دعوة بتعملها.
          </p>
        </div>
      )}

      {!loading && tracks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {tracks.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 rounded-xl border px-4 py-3.5"
              style={{ borderColor: 'rgba(212,175,55,0.18)', background: 'rgba(0,0,0,0.18)' }}
            >
              <button
                type="button"
                onClick={() => togglePlay(t)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(212,175,55,0.14)', color: 'var(--gold-soft)' }}
              >
                {playingId === t.id ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M7 5v14l12-7z" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.88rem]" style={{ color: 'var(--white)' }}>
                  {t.name}
                </div>
                <div className="text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
                  {formatDate(t.created_at)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(t)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs transition-colors"
                style={{ color: 'rgba(246,244,239,0.5)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e08a8a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(246,244,239,0.5)')}
                title="حذف"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
