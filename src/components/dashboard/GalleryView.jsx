import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { listGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto } from '../../lib/galleryApi';
import { sfxClick, sfxSuccess, sfxError } from '../../lib/sfx';

export default function GalleryView() {
  const [photos, setPhotos] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function refresh() {
    setLoading(true);
    return listGalleryPhotos()
      .then(({ items, hasMore: more, nextBefore }) => {
        setPhotos(items);
        setHasMore(more);
        setCursor(nextBefore);
      })
      .catch((e) => setError(e.message || 'حصل خطأ أثناء تحميل الجاليري'))
      .finally(() => setLoading(false));
  }

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

  useEffect(() => {
    refresh();
  }, []);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    setError('');
    setUploading(true);
    try {
      for (const file of files) {
        const row = await uploadGalleryPhoto(file);
        setPhotos((prev) => [row, ...prev]);
      }
      sfxSuccess();
    } catch (e) {
      sfxError();
      setError(e.message || 'حصل خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo) {
    sfxClick();
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    try {
      await deleteGalleryPhoto(photo);
    } catch (e) {
      sfxError();
      setError(e.message || 'حصل خطأ أثناء الحذف');
      refresh();
    }
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.4rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
            Gallery
          </h2>
          <p className="font-serif-alt mt-1.5 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '0.98rem' }}>
            مكتبة صورك الخاصة — ارفع هنا مرة واحدة، واستخدمها بعدين في أي دعوة وأي قالب.
          </p>
        </div>
        <button type="button" className="btn-gold" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'جاري الرفع...' : '+ رفع صور'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed transition-colors duration-300"
        style={{
          borderColor: dragOver ? 'var(--gold)' : 'rgba(212,175,55,0.18)',
          background: dragOver ? 'rgba(212,175,55,0.06)' : 'transparent',
          padding: photos.length || loading ? '18px' : '54px 18px',
        }}
      >
        {loading && (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl" style={{ background: 'rgba(212,175,55,0.08)' }} />
            ))}
          </div>
        )}

        {!loading && photos.length === 0 && (
          <div className="flex flex-col items-center gap-3 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-10 w-10" style={{ color: 'rgba(212,175,55,0.4)' }}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="m21 17-5-5-4 4-3-3-6 6" />
            </svg>
            <div className="font-display" style={{ color: 'var(--gold-soft)' }}>
              مفيش صور لسه
            </div>
            <p className="max-w-xs text-[0.8rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.45)' }}>
              اسحب وافلت الصور هنا، أو دوس على "رفع صور" — أول ما ترفعهم هتقدر تختارهم من أي دعوة بتعملها.
            </p>
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {photos.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border"
                style={{ borderColor: 'rgba(212,175,55,0.2)' }}
                onClick={() => setLightbox(p)}
              >
                <img src={p.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <button
                  type="button"
                  className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p);
                  }}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-xl px-6 py-2.5 text-[0.82rem] disabled:opacity-60"
              style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-soft)' }}
            >
              {loadingMore ? 'جاري التحميل...' : 'عرض المزيد'}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.url}
              alt=""
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
