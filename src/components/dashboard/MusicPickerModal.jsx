import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { listMusicTracks } from '../../lib/musicApi';
import { sfxClick } from '../../lib/sfx';

export default function MusicPickerModal({ open, onClose, onPick }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    listMusicTracks()
      .then(setTracks)
      .catch((e) => setError(e.message || 'حصل خطأ أثناء تحميل مكتبة الأغاني'))
      .finally(() => setLoading(false));
  }, [open]);

  function pick(track) {
    sfxClick();
    onPick(track);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card w-full max-w-lg rounded-2xl p-6"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[1.05rem]" style={{ color: 'var(--gold-soft)' }}>
                اختر من مكتبة الأغاني
              </h3>
              <button type="button" className="btn-ghost !px-3 !py-2" onClick={onClose}>
                ✕
              </button>
            </div>

            {loading && (
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: 'rgba(212,175,55,0.08)' }} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border px-4 py-3 text-[0.8rem]" style={{ borderColor: 'rgba(220,90,90,0.4)', color: '#e08a8a', background: 'rgba(220,90,90,0.08)' }}>
                {error}
              </div>
            )}

            {!loading && !error && tracks.length === 0 && (
              <div className="py-10 text-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                المكتبة فاضية لسه — ارفع أغاني من صفحة "Music Studio" في القائمة الجانبية الأول.
              </div>
            )}

            {!loading && !error && tracks.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
                    style={{ borderColor: 'rgba(212,175,55,0.18)', background: 'rgba(0,0,0,0.18)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(212,175,55,0.14)', color: 'var(--gold-soft)' }}
                    >
                      {previewId === t.id ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <rect x="6" y="5" width="4" height="14" />
                          <rect x="14" y="5" width="4" height="14" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M7 5v14l12-7z" />
                        </svg>
                      )}
                    </button>
                    <span className="min-w-0 flex-1 truncate text-[0.85rem]" style={{ color: 'var(--white)' }}>
                      {t.name}
                    </span>
                    {previewId === t.id && <audio src={t.url} autoPlay onEnded={() => setPreviewId(null)} className="hidden" />}
                    <button type="button" className="btn-gold !px-3.5 !py-2 !text-[0.72rem]" onClick={() => pick(t)}>
                      اختيار
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
