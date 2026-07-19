import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateLicense,
  getLicenses,
  toggleLicenseDisabled,
  deleteLicense,
  updateLicensePermissions,
} from '../../../lib/licenseStore';
import { TEMPLATE_REGISTRY } from '../../../lib/templateRegistry';
import { sfxClick, sfxSuccess, sfxError } from '../../../lib/sfx';
import { SettingsCard, InlineNotice, StatPill } from './SettingsUI';

const STATUS_STYLE = {
  active: { bg: 'rgba(120,180,130,0.16)', color: '#5f9d6e', label: 'Active' },
  disabled: { bg: 'rgba(194,90,90,0.14)', color: '#c25a5a', label: 'Disabled' },
  expired: { bg: 'rgba(246,244,239,0.1)', color: 'rgba(246,244,239,0.5)', label: 'Expired' },
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'disabled', label: 'Disabled' },
  { id: 'expired', label: 'Expired' },
];

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

function templateLabel(allowedTemplates) {
  if (!allowedTemplates || allowedTemplates.length === 0) return 'All templates';
  if (allowedTemplates.length === TEMPLATE_REGISTRY.length) return 'All templates';
  return `${allowedTemplates.length} template${allowedTemplates.length === 1 ? '' : 's'}`;
}

// A checkbox grid of every template in TEMPLATE_REGISTRY — shared between
// the "generate new code" form and the "edit permissions" panel on an
// existing code, so both always offer exactly the same set.
function TemplatePicker({ mode, onModeChange, selected, onToggle }) {
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('all')}
          className="rounded-full px-4 py-1.5 text-[0.76rem] transition-colors duration-300"
          style={{
            background: mode === 'all' ? 'linear-gradient(120deg, var(--gold), var(--gold-soft))' : 'transparent',
            color: mode === 'all' ? '#1a1206' : 'rgba(246,244,239,0.6)',
            border: `1px solid ${mode === 'all' ? 'transparent' : 'rgba(212,175,55,0.2)'}`,
          }}
        >
          All Templates
        </button>
        <button
          type="button"
          onClick={() => onModeChange('selected')}
          className="rounded-full px-4 py-1.5 text-[0.76rem] transition-colors duration-300"
          style={{
            background: mode === 'selected' ? 'linear-gradient(120deg, var(--gold), var(--gold-soft))' : 'transparent',
            color: mode === 'selected' ? '#1a1206' : 'rgba(246,244,239,0.6)',
            border: `1px solid ${mode === 'selected' ? 'transparent' : 'rgba(212,175,55,0.2)'}`,
          }}
        >
          Choose Templates
        </button>
      </div>
      {mode === 'selected' && (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))' }}>
          {TEMPLATE_REGISTRY.map((t) => {
            const checked = selected.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem]"
                style={{
                  background: checked ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${checked ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.06)'}`,
                  color: 'rgba(246,244,239,0.8)',
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => onToggle(t.id)} className="accent-current" />
                {t.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// License codes are what power the "Create an account with a license
// code" flow on the login screen (see LicenseSignupForm.jsx /
// licenseApi.js) — a code generated here is redeemable there immediately.
export default function LicenseSettings() {
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState('');
  const [newMode, setNewMode] = useState('all');
  const [newSelected, setNewSelected] = useState([]);
  const [licenses, setLicenses] = useState(null); // null while loading, 'error' on failure
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMode, setEditMode] = useState('all');
  const [editSelected, setEditSelected] = useState([]);

  function refresh() {
    getLicenses()
      .then(setLicenses)
      .catch(() => setLicenses('error'));
  }

  useEffect(refresh, []);

  function toggleNewTemplate(id) {
    setNewSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (generating) return;
    if (newMode === 'selected' && newSelected.length === 0) {
      setNotice({ tone: 'error', text: 'Pick at least one template, or switch to "All Templates".' });
      return;
    }
    sfxClick();
    setGenerating(true);
    const result = await generateLicense(duration, {
      price: price === '' ? null : price,
      allowedTemplates: newMode === 'selected' ? newSelected : null,
    });
    setGenerating(false);
    if (!result.ok) {
      sfxError();
      setNotice({ tone: 'error', text: 'Enter a valid number of days first.' });
      return;
    }
    sfxSuccess();
    setNotice({ tone: 'success', text: `New code generated: ${result.license.code}` });
    setNewMode('all');
    setNewSelected([]);
    refresh();
  }

  async function handleToggle(id) {
    if (busyId) return;
    sfxClick();
    setBusyId(id);
    await toggleLicenseDisabled(id);
    setBusyId(null);
    refresh();
  }

  async function handleDelete(id) {
    if (busyId) return;
    if (!window.confirm('Delete this code permanently? If a member account was created with it, that account and its access will be deleted too — this can\u2019t be undone.')) {
      return;
    }
    sfxClick();
    setBusyId(id);
    await deleteLicense(id);
    setBusyId(null);
    refresh();
  }

  function startEdit(l) {
    setEditingId(l.id);
    setEditPrice(l.price ?? '');
    setEditMode(l.allowedTemplates && l.allowedTemplates.length > 0 ? 'selected' : 'all');
    setEditSelected(l.allowedTemplates || []);
  }

  async function handleSaveEdit(id) {
    if (editMode === 'selected' && editSelected.length === 0) {
      setNotice({ tone: 'error', text: 'Pick at least one template, or switch to "All Templates".' });
      return;
    }
    sfxClick();
    setBusyId(id);
    const result = await updateLicensePermissions(id, {
      price: editPrice === '' ? null : editPrice,
      allowedTemplates: editMode === 'selected' ? editSelected : null,
    });
    setBusyId(null);
    if (!result.ok) {
      sfxError();
      setNotice({ tone: 'error', text: 'Could not save permissions. Please try again.' });
      return;
    }
    sfxSuccess();
    setEditingId(null);
    refresh();
  }

  function handleCopy(codeStr, id) {
    navigator.clipboard
      ?.writeText(codeStr)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
      })
      .catch(() => {});
  }

  const loading = licenses === null;
  const loadError = licenses === 'error';
  const list = loading || loadError ? [] : licenses;

  const total = list.length;
  const activeCount = list.filter((l) => l.status === 'active').length;
  const disabledCount = list.filter((l) => l.status === 'disabled').length;
  const expiredCount = list.filter((l) => l.status === 'expired').length;

  const visible = filter === 'all' ? list : list.filter((l) => l.status === filter);

  return (
    <>
      <SettingsCard
        title="Generate a License Code"
        description={'Visitors redeem this on the login screen under \u201cCreate an account\u201d to activate their own member account. Set the price, which templates they can use, and how many days it stays valid.'}
      >
        <form onSubmit={handleGenerate}>
          <div className="mb-5 flex flex-wrap items-end gap-4">
            <div className="field relative" style={{ maxWidth: 180 }}>
              <input
                id="license-duration"
                type="number"
                min="1"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={`field-input ${duration ? 'filled' : ''}`}
                style={{ paddingLeft: 18 }}
              />
              <label htmlFor="license-duration" className="field-label" style={{ left: 18 }}>
                Valid for (days)
              </label>
            </div>
            <div className="field relative" style={{ maxWidth: 180 }}>
              <input
                id="license-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`field-input ${price ? 'filled' : ''}`}
                style={{ paddingLeft: 18 }}
              />
              <label htmlFor="license-price" className="field-label" style={{ left: 18 }}>
                Price (optional)
              </label>
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
              Templates included with this code
            </div>
            <TemplatePicker mode={newMode} onModeChange={setNewMode} selected={newSelected} onToggle={toggleNewTemplate} />
          </div>

          <button type="submit" disabled={generating} className="btn-gold rounded-xl px-8 py-[17px] font-semibold">
            {generating ? 'Generating…' : 'Generate Code'}
          </button>
        </form>
        {notice && <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice>}
      </SettingsCard>

      <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}>
        <StatPill label="Total Codes" value={total} />
        <StatPill label="Active" value={activeCount} />
        <StatPill label="Disabled" value={disabledCount} />
        <StatPill label="Expired" value={expiredCount} />
      </div>

      <SettingsCard title="All License Codes">
        <div className="mb-5 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="rounded-full px-4 py-1.5 text-[0.76rem] transition-colors duration-300"
              style={{
                background: filter === f.id ? 'linear-gradient(120deg, var(--gold), var(--gold-soft))' : 'transparent',
                color: filter === f.id ? '#1a1206' : 'rgba(246,244,239,0.6)',
                border: `1px solid ${filter === f.id ? 'transparent' : 'rgba(212,175,55,0.2)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-[0.85rem] italic" style={{ color: 'rgba(246,244,239,0.4)' }}>
            Loading license codes…
          </div>
        ) : loadError ? (
          <div className="py-8 text-center text-[0.85rem] italic" style={{ color: '#c25a5a' }}>
            Couldn't load license codes. Please refresh and try again.
          </div>
        ) : visible.length === 0 ? (
          <div className="py-8 text-center text-[0.85rem] italic" style={{ color: 'rgba(246,244,239,0.4)' }}>
            {total === 0 ? 'No license codes yet — generate your first one above.' : 'No codes match this filter.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {visible.map((l) => {
                const dLeft = daysLeft(l.expiresAt);
                const style = STATUS_STYLE[l.status];
                const isEditing = editingId === l.id;
                return (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass-card rounded-2xl p-4"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-display text-[0.95rem]"
                          style={{ color: 'var(--gold-soft)', letterSpacing: '0.06em' }}
                        >
                          {l.code}
                        </div>
                        <div className="mt-0.5 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                          {l.durationDays}-day code · created {new Date(l.createdAt).toLocaleDateString()}
                          {l.status === 'active' && dLeft !== null && ` · ${dLeft} day${dLeft === 1 ? '' : 's'} left`}
                          {' · '}
                          {templateLabel(l.allowedTemplates)}
                          {l.price != null && l.price !== '' && ` · $${l.price}`}
                        </div>
                        <div className="mt-1 text-[0.72rem]" style={{ color: l.account ? '#8ce0a8' : 'rgba(246,244,239,0.35)' }}>
                          {l.account
                            ? `Redeemed by ${l.account.displayName} (@${l.account.username})`
                            : 'Not yet redeemed'}
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full px-3 py-1 text-[0.72rem]" style={{ background: style.bg, color: style.color }}>
                        {style.label}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(l.code, l.id)}
                          className="btn-ghost rounded-lg px-3 py-1.5 text-[0.72rem]"
                        >
                          {copiedId === l.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(l))}
                          className="btn-ghost rounded-lg px-3 py-1.5 text-[0.72rem]"
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        {l.status !== 'expired' && (
                          <button
                            type="button"
                            disabled={busyId === l.id}
                            onClick={() => handleToggle(l.id)}
                            className="btn-ghost rounded-lg px-3 py-1.5 text-[0.72rem]"
                          >
                            {l.disabled ? 'Enable' : 'Disable'}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === l.id}
                          onClick={() => handleDelete(l.id)}
                          className="rounded-lg px-3 py-1.5 text-[0.72rem]"
                          style={{ color: '#c25a5a' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
                        <div className="mb-4 field relative" style={{ maxWidth: 180 }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className={`field-input ${editPrice ? 'filled' : ''}`}
                            style={{ paddingLeft: 18 }}
                          />
                          <label className="field-label" style={{ left: 18 }}>
                            Price
                          </label>
                        </div>
                        <TemplatePicker
                          mode={editMode}
                          onModeChange={setEditMode}
                          selected={editSelected}
                          onToggle={(id) =>
                            setEditSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
                          }
                        />
                        <button
                          type="button"
                          disabled={busyId === l.id}
                          onClick={() => handleSaveEdit(l.id)}
                          className="btn-gold mt-4 rounded-xl px-6 py-2.5 text-[0.82rem] font-semibold"
                        >
                          {busyId === l.id ? 'Saving…' : 'Save Permissions'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </SettingsCard>
    </>
  );
}
