import { useState } from 'react';
import { TEMPLATE_REGISTRY } from '../../../lib/templateRegistry';
import { getAllTemplatePrices, setTemplatePrice, CURRENCY } from '../../../lib/visitorPricing';
import { sfxClick, sfxSuccess, sfxError } from '../../../lib/sfx';
import { SettingsCard } from './SettingsUI';

// Feeds directly into VisitorTemplateGallery.jsx / VisitorContactPending.jsx
// — a price saved here shows up for guests immediately, no code changes.
export default function PricingSettings() {
  const [prices, setPrices] = useState(() => getAllTemplatePrices());
  const [savedId, setSavedId] = useState(null);

  function handleChange(id, value) {
    setPrices((p) => ({ ...p, [id]: value }));
  }

  function handleSave(id) {
    sfxClick();
    const result = setTemplatePrice(id, prices[id]);
    if (!result.ok) {
      sfxError();
      return;
    }
    sfxSuccess();
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1500);
  }

  return (
    <SettingsCard
      title="Template Pricing"
      description="These prices show up when a visitor browses templates as a Guest — set them however you like."
    >
      <div className="flex flex-col gap-3">
        {TEMPLATE_REGISTRY.map((t) => (
          <div key={t.id} className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4">
            <div className="min-w-0 flex-1">
              <div className="text-[0.92rem]" style={{ color: 'var(--gold-soft)' }}>
                {t.name}
              </div>
              <div className="text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                {t.badge}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <input
                type="number"
                min="0"
                value={prices[t.id] ?? 0}
                onChange={(e) => handleChange(t.id, e.target.value)}
                className="rounded-lg border bg-transparent px-3 py-2 text-[0.85rem] outline-none"
                style={{ borderColor: 'rgba(212,175,55,0.25)', color: 'var(--white)', width: 100 }}
              />
              <span className="text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
                {CURRENCY}
              </span>
              <button
                type="button"
                onClick={() => handleSave(t.id)}
                className="btn-gold rounded-lg px-4 py-2 text-[0.75rem]"
              >
                {savedId === t.id ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
