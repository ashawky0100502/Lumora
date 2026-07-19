import { useEffect, useState } from 'react';
import { ownerGetSettings, ownerUpdateAutoReply, ownerUpdatePaymentMethods, ownerSetOnline } from '../../../lib/ownerInboxApi';
import { sfxClick, sfxSuccess, sfxError } from '../../../lib/sfx';
import { SettingsCard, InlineNotice } from './SettingsUI';

// Feeds directly into VisitorChat.jsx (the auto-reply + payment-methods
// message every new visitor gets instantly) and MessagesView.jsx's
// online/offline toggle — same settings, just editable from here too.
export default function InboxSettings() {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [autoReply, setAutoReply] = useState('');
  const [methods, setMethods] = useState([]);
  const [savedNotice, setSavedNotice] = useState(null);

  useEffect(() => {
    ownerGetSettings()
      .then((s) => {
        setIsOnline(!!s?.is_online);
        setAutoReply(s?.auto_reply_text || '');
        setMethods(Array.isArray(s?.payment_methods) ? s.payment_methods : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleOnline() {
    sfxClick();
    const next = !isOnline;
    setIsOnline(next);
    await ownerSetOnline(next);
  }

  async function saveAutoReply() {
    sfxClick();
    if (!autoReply.trim()) {
      sfxError();
      return;
    }
    await ownerUpdateAutoReply(autoReply.trim());
    sfxSuccess();
    setSavedNotice('reply');
    setTimeout(() => setSavedNotice(null), 1600);
  }

  function updateMethod(id, patch) {
    setMethods((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function saveMethods() {
    sfxClick();
    await ownerUpdatePaymentMethods(methods);
    sfxSuccess();
    setSavedNotice('methods');
    setTimeout(() => setSavedNotice(null), 1600);
  }

  if (loading) {
    return (
      <SettingsCard title="Inbox">
        <div className="text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
          Loading…
        </div>
      </SettingsCard>
    );
  }

  return (
    <>
      <SettingsCard
        title="Availability"
        description="Visitors chatting with you see this status live, right in their chat header."
      >
        <button
          type="button"
          onClick={toggleOnline}
          className="flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[0.8rem]"
          style={{
            borderColor: isOnline ? 'rgba(140,224,168,0.35)' : 'rgba(212,175,55,0.22)',
            background: isOnline ? 'rgba(140,224,168,0.08)' : 'rgba(255,255,255,0.03)',
            color: isOnline ? '#8ce0a8' : 'rgba(246,244,239,0.6)',
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: isOnline ? '#8ce0a8' : '#9a9a9a', boxShadow: isOnline ? '0 0 6px #8ce0a8' : 'none' }}
          />
          {isOnline ? 'Online' : 'Offline'} — click to go {isOnline ? 'offline' : 'online'}
        </button>
      </SettingsCard>

      <SettingsCard
        title="Auto-Reply Message"
        description="Sent instantly the moment any new visitor sends their first message — before you've even seen it."
      >
        <textarea
          value={autoReply}
          onChange={(e) => setAutoReply(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-[0.85rem] leading-relaxed outline-none"
          style={{ borderColor: 'rgba(212,175,55,0.25)', color: 'var(--white)' }}
        />
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={saveAutoReply} className="btn-gold rounded-lg px-5 py-2.5 text-[0.8rem]">
            {savedNotice === 'reply' ? 'Saved ✓' : 'Save Message'}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Payment Methods"
        description="Shown right after the auto-reply, automatically. Only enabled methods with a value are sent to visitors — leave any off to hide them."
      >
        <div className="flex flex-col gap-3">
          {methods.map((m) => (
            <div key={m.id} className="glass-card flex flex-wrap items-center gap-3 rounded-2xl p-4">
              <button
                type="button"
                onClick={() => updateMethod(m.id, { enabled: !m.enabled })}
                className="flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors"
                style={{ background: m.enabled ? 'var(--gold)' : 'rgba(255,255,255,0.12)' }}
                aria-label={`Toggle ${m.label}`}
              >
                <span
                  className="h-5 w-5 rounded-full bg-white transition-transform"
                  style={{ transform: m.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
              <div className="w-[130px] shrink-0 text-[0.85rem]" style={{ color: m.enabled ? 'var(--gold-soft)' : 'rgba(246,244,239,0.5)' }}>
                {m.label}
                {m.note && <div className="text-[0.65rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>{m.note}</div>}
              </div>
              <input
                type="text"
                value={m.value || ''}
                onChange={(e) => updateMethod(m.id, { value: e.target.value })}
                placeholder={m.id === 'usdt' || m.id === 'binance_pay' ? 'Wallet address / Pay ID' : m.id === 'paypal' ? 'PayPal.me link or email' : 'Phone number'}
                className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-[0.82rem] outline-none"
                style={{ borderColor: 'rgba(212,175,55,0.2)', color: 'var(--white)' }}
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <button type="button" onClick={saveMethods} className="btn-gold rounded-lg px-5 py-2.5 text-[0.8rem]">
            {savedNotice === 'methods' ? 'Saved ✓' : 'Save Payment Methods'}
          </button>
        </div>
        <InlineNotice tone="neutral">
          Destinations only — this doesn&apos;t process payments, it just tells visitors where to send them.
        </InlineNotice>
      </SettingsCard>
    </>
  );
}
