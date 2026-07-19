import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { listGalleryPhotos } from '../../lib/galleryApi';
import { sfxClick } from '../../lib/sfx';

/**
 * Lets a wizard step pull photos from the owner's private Gallery instead
 * of re-uploading — works the same regardless of which template the
 * invitation uses, since every step just ends up writing plain URLs into
 * data.photoGroom / photoBride / engagementPhotos / outingPhotos.
 *
 * multiple=false  → tap a photo, it's picked immediately, modal closes.
 * multiple=true   → tap to toggle a checkmark, then confirm with a button.
 */
export default function GalleryPickerModal({ open, onClose, onPick, multiple = false }) {
  const [photos, setPhotos] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setLoading(true);
    setError('');
    listGalleryPhotos()
      .then(({ items, hasMore: more, nextBefore }) => {
        setPhotos(items);
        setHasMore(more);
        setCursor(nextBefore);
      })
      .catch((e) => setError(e.message || 'حصل خطأ أثناء تحميل الجاليري'))
      .finally(() => setLoading(false));
  }, [open]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { items, hasMore: more, nextBefore } = await listGalleryPhotos({ before: cursor });
      setPhotos((prev) => [...prev, ...items]);
      setHasMore(more);
      setCursor(nextBefore);
    } catch (e) {
      setError(e.message || 'حصل خطأ أثناء تحميل المزيد');
    } finally {
      setLoadingMore(false);
    }
  }

  function tap(url) {
    sfxClick();
    if (!multiple) {
      onPick(url);
      onClose();
      return;
    }
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));
  }

  function confirmMulti() {
    if (!selected.length) return;
    sfxClick();
    onPick(selected);
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
            className="glass-card w-full max-w-2xl rounded-2xl p-6"
            style={{ maxHeight: '82vh', overflowY: 'auto' }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-[1.05rem]" style={{ color: 'var(--gold-soft)' }}>
                  اختر من الجاليري
                </h3>
                <p className="mt-1 text-[0.76rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                  {multiple ? 'اضغط لاختيار أكتر من صورة' : 'اضغط على صورة لاختيارها'}
                </p>
              </div>
              <button type="button" className="btn-ghost !px-3 !py-2" onClick={onClose}>
                ✕
              </button>
            </div>

            {loading && (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg" style={{ background: 'rgba(212,175,55,0.08)' }} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border px-4 py-3 text-[0.8rem]" style={{ borderColor: 'rgba(220,90,90,0.4)', color: '#e08a8a', background: 'rgba(220,90,90,0.08)' }}>
                {error}
              </div>
            )}

            {!loading && !error && photos.length === 0 && (
              <div className="py-10 text-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                الجاليري فاضية لسه — ارفع صور من صفحة "Gallery" في القائمة الجانبية الأول.
              </div>
            )}

            {!loading && !error && photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {photos.map((p) => {
                  const isSelected = selected.includes(p.url);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => tap(p.url)}
                      className="group relative aspect-square overflow-hidden rounded-lg border transition-all duration-200"
                      style={{ borderColor: isSelected ? 'var(--gold)' : 'rgba(212,175,55,0.2)', boxShadow: isSelected ? '0 0 0 2px rgba(212,175,55,0.5)' : 'none' }}
                    >
                      <img src={p.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem]" style={{ background: 'var(--gold)', color: '#1a1305' }}>
                            ✓
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !error && hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl px-6 py-2.5 text-[0.8rem] disabled:opacity-60"
                  style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-soft)' }}
                >
                  {loadingMore ? 'جاري التحميل...' : 'عرض المزيد'}
                </button>
              </div>
            )}

            {multiple && (
              <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
                <span className="text-[0.76rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                  {selected.length} صورة متختارة
                </span>
                <button type="button" className="btn-gold" disabled={!selected.length} onClick={confirmMulti}>
                  إضافة المختار
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
