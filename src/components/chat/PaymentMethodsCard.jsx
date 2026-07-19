// Renders an owner_messages row with kind === 'payment_methods'. `payload`
// is the jsonb array of {id,label,enabled,value,note} snapshotted at the
// moment the auto-reply fired — display only, nothing here is clickable
// beyond "copy", these are destinations to send payment to, not a
// checkout flow.
import { useState } from 'react';

const ICONS = {
  vodafone_cash: '📱',
  etisalat_cash: '📱',
  orange_cash: '📱',
  stc_pay: '🏦',
  usdt: '🪙',
  binance_pay: '🟡',
  paypal: '💳',
};

function CopyRow({ method }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(method.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable — the value is still selectable/readable
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.14)' }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[0.82rem]" style={{ color: 'var(--gold-soft)' }}>
          <span>{ICONS[method.id] || '💠'}</span>
          {method.label}
          {method.note && (
            <span className="text-[0.65rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
              ({method.note})
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.75)' }}>
          {method.value || '—'}
        </div>
      </div>
      {method.value && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[0.68rem]"
          style={{
            background: copied ? 'rgba(140,224,168,0.16)' : 'rgba(212,175,55,0.14)',
            color: copied ? '#8ce0a8' : 'var(--gold-soft)',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      )}
    </div>
  );
}

export default function PaymentMethodsCard({ methods }) {
  const list = Array.isArray(methods) ? methods.filter((m) => m.enabled) : [];

  if (list.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-3 text-[0.8rem]"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.14)', color: 'rgba(246,244,239,0.55)' }}
      >
        Payment methods aren&apos;t set up yet — the owner will share details directly.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.18)' }}
    >
      <div className="mb-2.5 text-[0.68rem] uppercase" style={{ color: 'rgba(212,175,55,0.75)', letterSpacing: '0.16em' }}>
        Available Payment Methods
      </div>
      <div className="flex flex-col gap-2">
        {list.map((m) => (
          <CopyRow key={m.id} method={m} />
        ))}
      </div>
    </div>
  );
}
