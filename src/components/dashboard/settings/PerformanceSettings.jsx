import { useState } from 'react';
import { sfxClick, sfxSuccess } from '../../../lib/sfx';
import { clearAllCaches } from '../../../lib/perfCache';
import { SettingsCard, InlineNotice, StatPill } from './SettingsUI';

export default function PerformanceSettings() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function handleClearCache() {
    sfxClick();
    setBusy(true);
    setNotice(null);
    try {
      const result = await clearAllCaches();
      sfxSuccess();
      setNotice({
        tone: 'success',
        text: `Cache cleared — ${result.sessionKeysCleared} cached responses, ${result.cacheStoragesCleared} browser cache stores, ${result.serviceWorkersCleared} background workers removed.`,
      });
    } catch (err) {
      setNotice({ tone: 'error', text: err?.message || 'Something went wrong clearing the cache.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SettingsCard
        title="Speed & Cache"
        description="LUMORA keeps large lists (comments, gallery, invitations) fast automatically by loading them in small pages instead of all at once, and by briefly caching what was just fetched so switching tabs feels instant. If a page ever feels stuck on old data, clearing the cache forces a clean reload."
      >
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatPill label="Comments per page" value="15" />
          <StatPill label="Portal rows per page" value="20" />
          <StatPill label="Cache lifetime" value="20s" />
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          disabled={busy}
          className="btn-gold w-fit rounded-xl px-8 py-3 font-semibold disabled:opacity-60"
        >
          {busy ? 'Clearing…' : 'Clear cache & speed up'}
        </button>

        {notice && <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice>}
      </SettingsCard>

      <SettingsCard title="Why this matters" description="A short, honest note on what's actually happening behind the scenes.">
        <ul className="flex flex-col gap-3 text-[0.82rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.65)' }}>
          <li>
            <b style={{ color: 'var(--gold-soft)' }}>Photos</b> are automatically resized and compressed the moment
            they're uploaded — a phone photo that starts at several MB is served to guests as a lightweight image,
            and the gallery itself loads in pages instead of pulling every photo at once.
          </li>
          <li>
            <b style={{ color: 'var(--gold-soft)' }}>Comments &amp; the couple portal</b> load in pages instead of pulling
            every row at once — performance stays the same whether an invitation has 20 comments or 20,000.
          </li>
          <li>
            <b style={{ color: 'var(--gold-soft)' }}>The invitation page</b> only downloads the code it actually needs —
            a guest opening a link never loads the dashboard or the 3D background, so it stays light on mobile.
          </li>
          <li>
            <b style={{ color: 'var(--gold-soft)' }}>Messages</b> are untouched — the chat still works exactly as before.
          </li>
        </ul>
      </SettingsCard>
    </>
  );
}
