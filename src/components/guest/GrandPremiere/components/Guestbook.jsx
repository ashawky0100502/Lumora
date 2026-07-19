import { useEffect, useState } from 'react';
import { guestCopy } from '../../../../lib/guestCopy';
import { loadComments, submitComment } from '../../../../lib/guestApi';
import { timeAgo } from '../../../../lib/guestFormat';
import useScrollReveal from '../hooks/useScrollReveal';

function GuestbookEntry({ entry, lang }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.15 });

  return (
    <li
      ref={ref}
      className={`gp-guestbook__entry gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
    >
      <p className="gp-guestbook__text">{entry.text}</p>
      <div className="gp-guestbook__meta">
        <span className="gp-guestbook__name">{entry.name}</span>
        {entry.created_at && (
          <>
            <span className="gp-guestbook__dot" aria-hidden="true">
              &middot;
            </span>
            <span className="gp-guestbook__time">{timeAgo(entry.created_at, lang)}</span>
          </>
        )}
      </div>
    </li>
  );
}

export default function Guestbook({ data, slug }) {
  const [entries, setEntries] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [frameRef, frameVisible] = useScrollReveal();

  useEffect(() => {
    if (!slug) return undefined;
    let alive = true;
    loadComments(slug)
      .then(({ items, hasMore: more, nextBefore }) => {
        if (!alive) return;
        setEntries(items);
        setHasMore(more);
        setCursor(nextBefore);
      })
      .catch(() => {
        if (!alive) return;
        setEntries([]);
        setHasMore(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (!slug) return null;

  const t = guestCopy(data?.language).comments;
  const isArabic = data?.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const loading = entries === null;

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { items, hasMore: more, nextBefore } = await loadComments(slug, { before: cursor });
      setEntries((prev) => [...(prev || []), ...items]);
      setHasMore(more);
      setCursor(nextBefore);
    } catch {
      // Quiet failure — the button simply stays available to try again.
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await submitComment(slug, { name, text });
      setEntries((prev) => [
        { name: name.trim(), text: text.trim(), created_at: new Date().toISOString() },
        ...(prev || []),
      ]);
      setName('');
      setText('');
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="gp-guestbook"
      id="guestbook"
      data-section="guestbook"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-guestbook__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-guestbook__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-guestbook__kicker">{t.kicker}</span>
        <span className="gp-guestbook__rule gp-guestbook__rule--top" aria-hidden="true" />

        <h2 className="gp-guestbook__title">{t.title}</h2>

        {loading && (
          <p className="gp-guestbook__status" aria-live="polite">
            {t.loading}
          </p>
        )}

        {!loading && entries.length > 0 && (
          <ul className="gp-guestbook__list">
            {entries.map((entry, i) => (
              <GuestbookEntry
                key={(entry.id || entry.created_at || i) + '-' + i}
                entry={entry}
                lang={lang}
              />
            ))}
          </ul>
        )}

        {!loading && hasMore && (
          <button
            type="button"
            className="gp-guestbook__more"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? t.loading : t.loadMore}
          </button>
        )}

        <span className="gp-guestbook__rule gp-guestbook__rule--mid" aria-hidden="true" />

        <form className="gp-guestbook__form" onSubmit={handleSubmit}>
          <label className="gp-guestbook__field">
            <span className="gp-guestbook__field-label">{t.namePlaceholder}</span>
            <input
              className="gp-guestbook__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="gp-guestbook__field">
            <span className="gp-guestbook__field-label">{t.textPlaceholder}</span>
            <textarea
              className="gp-guestbook__input gp-guestbook__input--text"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </label>

          {error && (
            <p key={error} className="gp-guestbook__notice" role="status">
              {error}
            </p>
          )}

          <button className="gp-guestbook__submit" type="submit" disabled={busy}>
            {busy ? t.sending : t.submit}
          </button>
        </form>

        <span className="gp-guestbook__rule gp-guestbook__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
